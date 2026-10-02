import { getDb, nowIso } from '../db';
import { notify } from '../events';
import type { TherapyGroup } from '@/therapy/types';

/**
 * Therapy home-practice tracking.
 *
 * COUNTS ONLY. A row records that an activity was practised and roughly how long it took. It says
 * nothing about how the child moved, how far, how well, or whether it was "right" — because none of
 * that is measured, and an app that appeared to measure it would be making a clinical claim it has
 * no basis for. `therapy_sessions` therefore has no quality column, no range column, no correctness
 * column and no notes about the child, exactly like the speech and voice practice tables.
 *
 * Nothing returned here may be shown as a score, a level, a norm, a percentage of ability, or any
 * kind of assessment. The numbers answer "what have we been practising lately?" — a question about
 * the family's week, not about the child's body.
 */

/** Local midnight as a timestamp, so "today" means the family's day rather than UTC's. */
function startOfToday(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString();
}

/** Local midnight seven days ago — "this week" as a rolling window, not a calendar week. */
function startOfWeek(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  return start.toISOString();
}

export const therapyPracticeRepo = {
  /** Records one practice. Never fails loudly: a lost count must not interrupt a child. */
  async record(activityId: string, group: TherapyGroup, durationMs: number): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO therapy_sessions (activity_id, group_id, duration_ms, created_at) VALUES (?, ?, ?, ?)',
      activityId,
      group,
      Math.max(0, Math.round(durationMs)),
      nowIso(),
    );
    notify('therapy');
  },

  /**
   * The activity ids practised TODAY.
   *
   * Distinct ids rather than a count, because My Therapy Day marks each activity done or not — and
   * counting sessions would let one activity repeated five times read as five steps finished.
   */
  async doneToday(): Promise<string[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ activity_id: string }>(
      'SELECT DISTINCT activity_id FROM therapy_sessions WHERE created_at >= ?',
      startOfToday(),
    );
    return rows.map((r) => r.activity_id);
  },

  /** How many practices happened in the last seven days, per activity. */
  async weekCounts(): Promise<Record<string, number>> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ activity_id: string; n: number }>(
      'SELECT activity_id, COUNT(*) AS n FROM therapy_sessions WHERE created_at >= ? GROUP BY activity_id',
      startOfWeek(),
    );
    return Object.fromEntries(rows.map((r) => [r.activity_id, r.n]));
  },

  /** Total practices in the last seven days. */
  async weekTotal(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM therapy_sessions WHERE created_at >= ?',
      startOfWeek(),
    );
    return row?.n ?? 0;
  },

  /**
   * Clears the practice history.
   *
   * Offered because this is a family's own record of a private thing, and they should be able to
   * remove it without uninstalling the app.
   */
  async clearHistory(): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM therapy_sessions');
    notify('therapy');
  },
};
