import { getDb, nowIso } from '../db';
import { notify } from '../events';
import type { SoundAttemptInput, SoundPracticeStats } from '@/soundpractice/types';

/**
 * Sound Practice tracking.
 *
 * Counts and minutes only — how much practice happened, never how well it went. No score, no
 * accuracy, no audio: a row records that an attempt was made, nothing about how it sounded.
 * That is deliberate, and the reason the table has no "correct" column (see AGENTS.md).
 */

interface Row {
  sound_id: string;
  attempts: number;
  duration_ms: number;
}

/** Local midnight as a UTC timestamp, so "today" matches the child's day, not UTC's. */
function startOfToday(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString();
}

export const soundPracticeRepo = {
  async recordAttempt(input: SoundAttemptInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO sound_practice_attempts (sound_id, level, item, duration_ms, created_at) VALUES (?, ?, ?, ?, ?)',
      input.soundId, input.level, input.item.slice(0, 80), Math.max(0, Math.round(input.durationMs)), nowIso(),
    );
    notify('soundPractice');
  },

  /** "Today's practice": distinct sounds, total attempts and total time spent attempting. */
  async todayStats(): Promise<SoundPracticeStats> {
    const db = await getDb();
    const rows = await db.getAllAsync<Row>(
      `SELECT sound_id, COUNT(*) AS attempts, SUM(duration_ms) AS duration_ms
         FROM sound_practice_attempts
        WHERE created_at >= ?
        GROUP BY sound_id`,
      startOfToday(),
    );
    return {
      soundsPracticed: rows.length,
      attempts: rows.reduce((n, r) => n + r.attempts, 0),
      practiceMs: rows.reduce((n, r) => n + (r.duration_ms ?? 0), 0),
    };
  },

  /** How many attempts this sound has had today — used for gentle encouragement only. */
  async attemptsToday(soundId: string): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM sound_practice_attempts WHERE sound_id = ? AND created_at >= ?',
      soundId, startOfToday(),
    );
    return row?.n ?? 0;
  },
};
