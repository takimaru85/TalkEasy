import { getDb, nowIso } from '../db';
import { notify } from '../events';
import type { Difficulty, LearningActivityConfig, LearningProgressEntry, LearningSubjectStats } from '@/types/models';

interface ConfigRow {
  activity_key: string;
  is_enabled: number;
  difficulty: string | null;
}

interface ProgressRow {
  id: number;
  activity_key: string;
  subject_key: string;
  difficulty: string;
  correct: number;
  total: number;
  played_at: string;
}

const toConfig = (r: ConfigRow): LearningActivityConfig => ({
  activityKey: r.activity_key,
  isEnabled: r.is_enabled === 1,
  difficulty: (r.difficulty as Difficulty) || null,
});

const toProgress = (r: ProgressRow): LearningProgressEntry => ({
  id: r.id,
  activityKey: r.activity_key,
  subjectKey: r.subject_key,
  difficulty: r.difficulty as Difficulty,
  correct: r.correct,
  total: r.total,
  playedAt: r.played_at,
});

/**
 * Parent configuration per learning activity (enabled / difficulty override) and the
 * practice history. Content itself lives in src/learning/content.
 */
export const learningRepo = {
  async getConfigs(): Promise<Map<string, LearningActivityConfig>> {
    const db = await getDb();
    const rows = await db.getAllAsync<ConfigRow>('SELECT * FROM learning_activities');
    return new Map(rows.map((r) => [r.activity_key, toConfig(r)]));
  },

  async setEnabled(activityKey: string, enabled: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO learning_activities (activity_key, is_enabled, difficulty) VALUES (?, ?, NULL)
       ON CONFLICT(activity_key) DO UPDATE SET is_enabled = excluded.is_enabled`,
      activityKey, enabled ? 1 : 0,
    );
    notify('learning');
  },

  async setDifficulty(activityKey: string, difficulty: Difficulty | null): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO learning_activities (activity_key, is_enabled, difficulty) VALUES (?, 1, ?)
       ON CONFLICT(activity_key) DO UPDATE SET difficulty = excluded.difficulty`,
      activityKey, difficulty,
    );
    notify('learning');
  },

  async recordSession(entry: { activityKey: string; subjectKey: string; difficulty: Difficulty; correct: number; total: number }): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO learning_progress (activity_key, subject_key, difficulty, correct, total, played_at) VALUES (?, ?, ?, ?, ?, ?)',
      entry.activityKey, entry.subjectKey, entry.difficulty, entry.correct, entry.total, nowIso(),
    );
    notify('learning');
  },

  async getRecent(limit = 30): Promise<LearningProgressEntry[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProgressRow>(
      'SELECT * FROM learning_progress ORDER BY played_at DESC LIMIT ?', limit,
    );
    return rows.map(toProgress);
  },

  async getSubjectStats(): Promise<LearningSubjectStats[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ subject_key: string; sessions: number; correct: number; total: number; last: string | null }>(
      `SELECT subject_key, COUNT(*) AS sessions, SUM(correct) AS correct, SUM(total) AS total, MAX(played_at) AS last
       FROM learning_progress GROUP BY subject_key`,
    );
    return rows.map((r) => ({
      subjectKey: r.subject_key,
      sessions: r.sessions,
      correct: r.correct,
      total: r.total,
      lastPlayedAt: r.last,
    }));
  },

  /** Best accuracy per activity (used to show stars on the activity picker). */
  async getActivityBest(): Promise<Map<string, number>> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ activity_key: string; best: number }>(
      `SELECT activity_key, MAX(CAST(correct AS REAL) / CASE WHEN total = 0 THEN 1 ELSE total END) AS best
       FROM learning_progress GROUP BY activity_key`,
    );
    return new Map(rows.map((r) => [r.activity_key, r.best]));
  },
};
