import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { moveRow } from '../reorder';
import type { Reward, StarEvent, StarSource, StarSummary } from '@/types/models';

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
    const today = await db.getFirstAsync<{ t: number | null }>(
      'SELECT SUM(amount) AS t FROM star_events WHERE amount > 0 AND created_at >= ?',
      startOfTodayIso(),
    );
    const balance = total?.t ?? 0;
    const rewards = await rewardsRepo.getRewards();
    const nextReward = rewards.find((r) => r.starsRequired > balance) ?? rewards[rewards.length - 1] ?? null;
    return { total: balance, earnedToday: today?.t ?? 0, nextReward };
  },

  async getHistory(limit = 30): Promise<StarEvent[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<StarRow>('SELECT * FROM star_events ORDER BY created_at DESC, id DESC LIMIT ?', limit);
    return rows.map(toEvent);
  },
};
