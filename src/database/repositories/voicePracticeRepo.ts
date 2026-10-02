import { getDb, nowIso } from '../db';
import { notify } from '../events';
import type { PracticeAreaId, PracticeEventInput } from '@/practice/types';

/**
 * Voice & Communication tracking.
 *
 * Counts and minutes only — how much practice happened, never how well it went. A row records
 * that an exercise was worked through; it says nothing about the child's voice, because nothing
 * about their voice is ever measured. That is why `voice_practice_events` has no correctness
 * column and no audio, exactly like `sound_practice_attempts` and `speech_practice_events`.
 *
 * Nothing this repository returns may be presented as a score, a level, a norm or an assessment.
 * The numbers answer "what have we been practising?" — a question about the app's use, not about
 * the child.
 */

/** Local midnight as a UTC timestamp, so "today" matches the child's day, not UTC's. */
function startOfToday(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString();
}

export interface VoiceAreaRow {
  category: PracticeAreaId;
  /** Exercises worked through in this area, all time. */
  practised: number;
  /** Distinct activities touched in this area. */
  activities: number;
}

export interface VoiceTodayRow {
  category: PracticeAreaId;
  activityId: string;
  practised: number;
  practiceMs: number;
}

export const voicePracticeRepo = {
  async record(input: PracticeEventInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO voice_practice_events (activity_id, category, kind, item, duration_ms, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      input.activityId,
      input.category,
      input.kind,
      input.item.slice(0, 80),
      Math.max(0, Math.round(input.durationMs)),
      nowIso(),
    );
    notify('voicePractice');
  },

  /**
   * All-time totals per area, for the practice bars. Counting rows rather than storing a total
   * means a bar can never disagree with the practice that actually happened.
   */
  async byArea(): Promise<VoiceAreaRow[]> {
    const db = await getDb();
    return db.getAllAsync<VoiceAreaRow>(
      `SELECT category,
              COUNT(*)                   AS practised,
              COUNT(DISTINCT activity_id) AS activities
         FROM voice_practice_events
        GROUP BY category`,
    );
  },

  /** What was practised today, per activity — the Parent Mode summary's source. */
  async today(): Promise<VoiceTodayRow[]> {
    const db = await getDb();
    return db.getAllAsync<VoiceTodayRow>(
      `SELECT category,
              activity_id      AS activityId,
              COUNT(*)         AS practised,
              SUM(duration_ms) AS practiceMs
         FROM voice_practice_events
        WHERE created_at >= ?
        GROUP BY category, activity_id
        ORDER BY MAX(created_at) DESC`,
      startOfToday(),
    );
  },

  /** Lifetime totals, for badges and the progress screen. */
  async lifetime(): Promise<{ practised: number; areas: number; activities: number }> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ practised: number; areas: number; activities: number }>(
      `SELECT COUNT(*)                    AS practised,
              COUNT(DISTINCT category)    AS areas,
              COUNT(DISTINCT activity_id) AS activities
         FROM voice_practice_events`,
    );
    return { practised: row?.practised ?? 0, areas: row?.areas ?? 0, activities: row?.activities ?? 0 };
  },
};
