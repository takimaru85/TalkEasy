/**
 * Star CLAIMS: how a completed task becomes stars, exactly once. Free of expo-sqlite so `check:db` runs
 * the real SQL.
 *
 * EVERY STAR A CHILD EARNS FROM A TASK GOES THROUGH HERE. A claim is one row in `reward_claims` with a
 * UNIQUE key, and the star event it creates carries that same key in `star_events.claim_key`, which is
 * ALSO unique. So a repeated Done tap, a reopened screen, a restart, or the same completion arriving twice
 * hits the key and does nothing. There are two independent guards (the claim row and the ledger row), so a
 * bug in one still cannot credit twice. The amount is passed in by the repository from the grown-up's own
 * settings; a screen cannot supply one.
 *
 * `awaiting_parent` claims hold NO star until `confirmClaim` credits them in Parent Mode.
 *
 * LIMIT, honestly: this is a local app with no server. These rules stop a child pressing buttons; they do
 * not stop someone editing the device's database. Real tamper resistance needs a trusted backend.
 */
export interface ClaimDb {
  getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null>;
  runAsync(sql: string, ...params: unknown[]): Promise<unknown>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export interface ClaimInput {
  key: string;
  kind: string;
  /** Ledger source: 'learning' | 'routine' | 'activity' | 'assignment'. */
  source: string;
  reason: string;
  amount: number;
  requiresParent: boolean;
}

/** 'credited' / 'awaiting_parent' = this call created the claim; 'duplicate' = the key already existed. */
export type ClaimResult = { outcome: 'credited' | 'awaiting_parent'; amount: number } | { outcome: 'duplicate'; status: string; amount: number };

export async function claimReward(db: ClaimDb, input: ClaimInput, nowIso: string): Promise<ClaimResult> {
  if (!input.key) throw new Error('A reward claim needs a key.');
  let result: ClaimResult = { outcome: 'duplicate', status: 'credited', amount: 0 };
  await db.withTransactionAsync(async () => {
    const existing = await db.getFirstAsync<{ status: string; amount: number }>('SELECT status, amount FROM reward_claims WHERE claim_key = ?', input.key);
    if (existing?.status === 'declined' && input.requiresParent) {
      // "Not this time" is not a verdict on the child: doing the task again simply asks again.
      await db.runAsync("UPDATE reward_claims SET status = 'awaiting_parent', resolved_at = NULL, created_at = ? WHERE claim_key = ? AND status = 'declined'", nowIso, input.key);
      result = { outcome: 'awaiting_parent', amount: existing.amount };
      return;
    }
    if (existing) {
      result = { outcome: 'duplicate', status: existing.status, amount: existing.amount };
      return;
    }
    const amount = Math.max(0, Math.round(input.amount));
    if (amount === 0) {
      // Nothing to award (the grown-up switched this kind off). Still record the completion so it is not re-evaluated.
      await db.runAsync("INSERT INTO reward_claims (claim_key, kind, reason, amount, status, created_at, resolved_at) VALUES (?, ?, ?, 0, 'credited', ?, ?)", input.key, input.kind, input.reason, nowIso, nowIso);
      result = { outcome: 'credited', amount: 0 };
      return;
    }
    if (input.requiresParent) {
      await db.runAsync("INSERT INTO reward_claims (claim_key, kind, reason, amount, status, created_at, resolved_at) VALUES (?, ?, ?, ?, 'awaiting_parent', ?, NULL)", input.key, input.kind, input.reason, amount, nowIso);
      result = { outcome: 'awaiting_parent', amount };
      return;
    }
    await db.runAsync("INSERT INTO reward_claims (claim_key, kind, reason, amount, status, created_at, resolved_at) VALUES (?, ?, ?, ?, 'credited', ?, ?)", input.key, input.kind, input.reason, amount, nowIso, nowIso);
    await db.runAsync('INSERT INTO star_events (amount, reason, source, created_at, claim_key) VALUES (?, ?, ?, ?, ?)', amount, input.reason, input.source, nowIso, input.key);
    result = { outcome: 'credited', amount };
  });
  return result;
}

export type ConfirmResult = 'credited' | 'already' | 'declined' | 'missing';

/** A grown-up confirms an awaiting claim: credit it, once. Repeating it credits nothing more. */
export async function confirmClaim(db: ClaimDb, key: string, source: string, nowIso: string): Promise<ConfirmResult> {
  let result: ConfirmResult = 'missing';
  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<{ status: string; amount: number; reason: string }>('SELECT status, amount, reason FROM reward_claims WHERE claim_key = ?', key);
    if (!row) return;
    if (row.status === 'credited') return void (result = 'already');
    if (row.status === 'declined') return void (result = 'declined');
    await db.runAsync("UPDATE reward_claims SET status = 'credited', resolved_at = ? WHERE claim_key = ? AND status = 'awaiting_parent'", nowIso, key);
    await db.runAsync('INSERT INTO star_events (amount, reason, source, created_at, claim_key) VALUES (?, ?, ?, ?, ?)', row.amount, row.reason, source, nowIso, key);
    result = 'credited';
  });
  return result;
}

/** A grown-up says "not this time". No stars, no penalty, and the child can simply do it again later. */
export async function declineClaim(db: ClaimDb, key: string, nowIso: string): Promise<'declined' | 'already' | 'missing'> {
  const row = await db.getFirstAsync<{ status: string }>('SELECT status FROM reward_claims WHERE claim_key = ?', key);
  if (!row) return 'missing';
  if (row.status !== 'awaiting_parent') return 'already';
  await db.runAsync("UPDATE reward_claims SET status = 'declined', resolved_at = ? WHERE claim_key = ? AND status = 'awaiting_parent'", nowIso, key);
  return 'declined';
}

/** The child un-ticks a task that was awaiting a grown-up: the pending claim goes away (a credited one never does). */
export async function withdrawClaim(db: ClaimDb, key: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ status: string }>('SELECT status FROM reward_claims WHERE claim_key = ?', key);
  if (!row || row.status !== 'awaiting_parent') return false;
  await db.runAsync("DELETE FROM reward_claims WHERE claim_key = ? AND status = 'awaiting_parent'", key);
  return true;
}
