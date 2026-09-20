import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { moveRow } from '../reorder';
import type { ActivityCategory, ActivityFrequency, ActivityLog, TherapyActivity, TherapyActivityInput } from '@/types/models';

interface TherapyRow {
  id: number;
  name: string;
  icon: string;
  instructions: string;
  duration_minutes: number;
  frequency: string;
  category: string;
  image_uri: string | null;
  is_completed: number;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
}

interface LogRow {
  id: number;
  therapy_activity_id: number;
  completed_at: string;
  note: string;
}

const toModel = (r: TherapyRow): TherapyActivity => ({
  id: r.id,
  name: r.name,
  icon: r.icon,
  instructions: r.instructions,
  durationMinutes: r.duration_minutes,
  frequency: (r.frequency as ActivityFrequency) || 'daily',
  category: (r.category as ActivityCategory) || 'therapy',
  imageUri: r.image_uri,
  isCompleted: r.is_completed === 1,
  completedAt: r.completed_at,
  sortOrder: r.sort_order,
  createdAt: r.created_at,
});

const toLog = (r: LogRow): ActivityLog => ({
  id: r.id,
  therapyActivityId: r.therapy_activity_id,
  completedAt: r.completed_at,
  note: r.note,
});

/** Therapy / activity cards plus their completion log. */
export const therapyRepo = {
  async getAll(): Promise<TherapyActivity[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TherapyRow>('SELECT * FROM therapy_activities ORDER BY sort_order, id');
    return rows.map(toModel);
  },

  async getById(id: number): Promise<TherapyActivity | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<TherapyRow>('SELECT * FROM therapy_activities WHERE id = ?', id);
    return row ? toModel(row) : null;
  },

  async create(input: TherapyActivityInput): Promise<number> {
    const db = await getDb();
    const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM therapy_activities');
    const res = await db.runAsync(
      `INSERT INTO therapy_activities
         (name, icon, instructions, duration_minutes, frequency, category, image_uri, is_completed, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      input.name.trim(), input.icon, input.instructions.trim(), input.durationMinutes, input.frequency, input.category,
      input.imageUri, (max?.m ?? -1) + 1, nowIso(),
    );
    notify('exercises');
    return res.lastInsertRowId;
  },

  async update(id: number, input: TherapyActivityInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE therapy_activities
       SET name = ?, icon = ?, instructions = ?, duration_minutes = ?, frequency = ?, category = ?, image_uri = ?
       WHERE id = ?`,
      input.name.trim(), input.icon, input.instructions.trim(), input.durationMinutes, input.frequency, input.category,
      input.imageUri, id,
    );
    notify('exercises');
  },

  /** Marks done/undone. Marking done also writes an activity_logs row for progress. */
  async setCompleted(id: number, completed: boolean, note = ''): Promise<void> {
    const db = await getDb();
    const now = nowIso();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'UPDATE therapy_activities SET is_completed = ?, completed_at = ? WHERE id = ?',
        completed ? 1 : 0, completed ? now : null, id,
      );
      if (completed) {
        await db.runAsync(
          'INSERT INTO activity_logs (therapy_activity_id, completed_at, note) VALUES (?, ?, ?)',
          id, now, note,
        );
      }
    });
    notify('exercises');
  },

  /** Un-ticks every card (a new day). The log keeps history. */
  async resetAll(): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE therapy_activities SET is_completed = 0, completed_at = NULL');
    notify('exercises');
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM therapy_activities WHERE id = ?', id);
    notify('exercises');
  },

  async move(id: number, direction: -1 | 1): Promise<void> {
    const db = await getDb();
    await moveRow(db, 'therapy_activities', id, direction);
    notify('exercises');
  },

  async getLogs(limit = 50): Promise<(ActivityLog & { activityName: string })[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<LogRow & { activity_name: string }>(
      `SELECT l.*, t.name AS activity_name FROM activity_logs l
       JOIN therapy_activities t ON t.id = l.therapy_activity_id
       ORDER BY l.completed_at DESC LIMIT ?`,
      limit,
    );
    return rows.map((r) => ({ ...toLog(r), activityName: r.activity_name }));
  },

  /** Completions per day for the last `days` days (for the progress screen). */
  async getCompletionCounts(days = 14): Promise<{ date: string; count: number }[]> {
    const db = await getDb();
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await db.getAllAsync<{ date: string; count: number }>(
      `SELECT substr(completed_at, 1, 10) AS date, COUNT(*) AS count
       FROM activity_logs WHERE completed_at >= ?
       GROUP BY date ORDER BY date`,
      since.toISOString(),
    );
    return rows;
  },
};
