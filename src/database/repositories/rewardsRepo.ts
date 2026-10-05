import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { moveRow } from '../reorder';
import type { Reward, StarEvent, StarSource, StarSummary } from '@/types/models';
import { claimReward, confirmClaim, declineClaim, withdrawClaim, type ClaimResult } from '../rewardClaim';
import { CLAIM_POLICY, type ClaimKind, type ClaimStatus } from '@/rewards/verification';

interface RewardRow {
  id: number;
  title: string;
  icon: string;
  stars_required: number;
  sort_order: number;
  created_at: string;
}

interface StarRow {
  id: number;
  amount: number;
  reason: string;
  source: string;
  created_at: string;
}

const toReward = (r: RewardRow): Reward => ({
  id: r.id,
  title: r.title,
  icon: r.icon,
  starsRequired: r.stars_required,
  sortOrder: r.sort_order,
  createdAt: r.created_at,
});

const toEvent = (r: StarRow): StarEvent => ({
  id: r.id,
  amount: r.amount,
  reason: r.reason,
  source: r.source as StarSource,
  createdAt: r.created_at,
});

/** UTC ISO timestamp of local midnight, matching how created_at is stored (toISOString). */
function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Rewards defined by the parent and the star ledger (earned / spent). */
export const rewardsRepo = {
  async getRewards(): Promise<Reward[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<RewardRow>('SELECT * FROM rewards ORDER BY stars_required, sort_order, id');
    return rows.map(toReward);
  },

  async createReward(title: string, icon: string, starsRequired: number): Promise<number> {
    const db = await getDb();
    const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM rewards');
    const res = await db.runAsync(
      'INSERT INTO rewards (title, icon, stars_required, sort_order, created_at) VALUES (?, ?, ?, ?, ?)',
      title.trim(), icon, Math.max(1, starsRequired), (max?.m ?? -1) + 1, nowIso(),
    );
    notify('rewards');
    return res.lastInsertRowId;
  },

  async updateReward(id: number, title: string, icon: string, starsRequired: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE rewards SET title = ?, icon = ?, stars_required = ? WHERE id = ?', title.trim(), icon, Math.max(1, starsRequired), id);
    notify('rewards');
  },

  async removeReward(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM rewards WHERE id = ?', id);
    notify('rewards');
  },

  async moveReward(id: number, direction: -1 | 1): Promise<void> {
    const db = await getDb();
    await moveRow(db, 'rewards', id, direction);
    notify('rewards');
  },

  // ---- stars --------------------------------------------------------------

  async addStars(amount: number, reason: string, source: StarSource): Promise<void> {
    if (amount === 0) return;
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO star_events (amount, reason, source, created_at) VALUES (?, ?, ?, ?)',
      Math.round(amount), reason, source, nowIso(),
    );
    notify('rewards');
  },

  // ---- verified claims ------------------------------------------------------

  /**
   * Claims the stars for ONE task completion. The amount is NOT a parameter: the caller passes the amount
   * its settings give (`starsFor`), and the claim key makes a repeat a no-op. Tasks that cannot be verified
   * wait for a grown-up (`awaiting_parent`) and credit nothing yet.
   */
  async claim(kind: ClaimKind, key: string, reason: string, amount: number): Promise<ClaimResult> {
    const db = await getDb();
    const policy = CLAIM_POLICY[kind];
    const result = await claimReward(db, { key, kind, source: policy.source, reason, amount, requiresParent: policy.requiresParent }, nowIso());
    if (result.outcome === 'credited') notify('rewards');
    notify('claims');
    return result;
  },

  /** How many tasks of each kind were CREDITED (verified, and confirmed where a grown-up had to). */
  async getCreditedClaimCounts(): Promise<Record<string, number>> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ kind: string; n: number }>("SELECT kind, COUNT(*) AS n FROM reward_claims WHERE status = 'credited' GROUP BY kind");
    return Object.fromEntries(rows.map((r) => [r.kind, r.n]));
  },

  async getClaimStatus(key: string): Promise<ClaimStatus | null> {
    const db = await getDb();
    const r = await db.getFirstAsync<{ status: ClaimStatus }>('SELECT status FROM reward_claims WHERE claim_key = ?', key);
    return r?.status ?? null;
  },

  /** Tasks waiting for a grown-up, oldest first. */
  async getAwaitingClaims(): Promise<{ key: string; kind: string; reason: string; amount: number; createdAt: string }[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ claim_key: string; kind: string; reason: string; amount: number; created_at: string }>("SELECT claim_key, kind, reason, amount, created_at FROM reward_claims WHERE status = 'awaiting_parent' ORDER BY created_at");
    return rows.map((r) => ({ key: r.claim_key, kind: r.kind, reason: r.reason, amount: r.amount, createdAt: r.created_at }));
  },

  /** Parent Mode: credit an awaiting claim. Confirming twice credits once. */
  async confirmClaim(key: string): Promise<'credited' | 'already' | 'declined' | 'missing'> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ kind: string }>('SELECT kind FROM reward_claims WHERE claim_key = ?', key);
    const source = row ? CLAIM_POLICY[row.kind as ClaimKind]?.source ?? 'activity' : 'activity';
    const r = await confirmClaim(db, key, source, nowIso());
    if (r === 'credited') notify('rewards');
    notify('claims');
    return r;
  },

  async declineClaim(key: string): Promise<'declined' | 'already' | 'missing'> {
    const db = await getDb();
    const r = await declineClaim(db, key, nowIso());
    notify('claims');
    return r;
  },

  /** The child un-ticks a task that was still waiting for a grown-up. */
  async withdrawClaim(key: string): Promise<boolean> {
    const db = await getDb();
    const r = await withdrawClaim(db, key);
    notify('claims');
    return r;
  },

  /** Spends stars on a reward. Returns false if the balance is too low. */
  async redeem(reward: Reward): Promise<boolean> {
    const summary = await rewardsRepo.getSummary();
    if (summary.total < reward.starsRequired) return false;
    await rewardsRepo.addStars(-reward.starsRequired, `Reward: ${reward.title}`, 'reward');
    return true;
  },

  async getSummary(): Promise<StarSummary> {
    const db = await getDb();
    const total = await db.getFirstAsync<{ t: number | null }>('SELECT SUM(amount) AS t FROM star_events');
    const earned = await db.getFirstAsync<{ t: number | null }>('SELECT SUM(amount) AS t FROM star_events WHERE amount > 0');
    const today = await db.getFirstAsync<{ t: number | null }>(
      'SELECT SUM(amount) AS t FROM star_events WHERE amount > 0 AND created_at >= ?',
      startOfTodayIso(),
    );
    const balance = total?.t ?? 0;
    const rewards = await rewardsRepo.getRewards();
    const nextReward = rewards.find((r) => r.starsRequired > balance) ?? rewards[rewards.length - 1] ?? null;
    return { total: balance, lifetime: earned?.t ?? 0, earnedToday: today?.t ?? 0, nextReward };
  },

  /**
   * The local dates (YYYY-MM-DD) on which the child earned a star, newest first. The daily
   * streak is counted from these, so it reflects real practice rather than a stored number that
   * could drift. Converted to LOCAL dates in JS because created_at is UTC and a streak is about
   * the child's day, not the clock in Greenwich.
   */
  async getEarnedDates(days = 90): Promise<string[]> {
    const db = await getDb();
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await db.getAllAsync<{ created_at: string }>(
      'SELECT created_at FROM star_events WHERE amount > 0 AND created_at >= ? ORDER BY created_at DESC',
      since.toISOString(),
    );
    const seen = new Set<string>();
    for (const r of rows) {
      const d = new Date(r.created_at);
      seen.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    return [...seen].sort().reverse();
  },

  async getHistory(limit = 30): Promise<StarEvent[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<StarRow>('SELECT * FROM star_events ORDER BY created_at DESC, id DESC LIMIT ?', limit);
    return rows.map(toEvent);
  },
};
