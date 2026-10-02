import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { moveRow } from '../reorder';
import { ROUTINE_LINKS, type Routine, type RoutineItem, type RoutineLink, type RoutineSegment } from '@/types/models';

/** Local 'YYYY-MM-DD'. */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const asLink = (v: string | null | undefined): RoutineLink | null => (v && (ROUTINE_LINKS as string[]).includes(v) ? (v as RoutineLink) : null);

interface RoutineRow {
  id: number;
  name: string;
  is_active: number;
  created_at: string;
}

interface RoutineItemRow {
  id: number;
  routine_id: number;
  label: string;
  icon: string;
  sort_order: number;
  is_done: number;
  start_time: string | null;
  segment: string;
  notes: string;
  end_time: string | null;
  linked_activity: string | null;
  /** Today's day-log status, joined in getItems. */
  log_status?: string | null;
}

const toRoutine = (r: RoutineRow): Routine => ({
  id: r.id,
  name: r.name,
  isActive: r.is_active === 1,
  createdAt: r.created_at,
});

const toItem = (r: RoutineItemRow): RoutineItem => ({
  id: r.id,
  routineId: r.routine_id,
  label: r.label,
  icon: r.icon,
  sortOrder: r.sort_order,
  isDone: r.is_done === 1,
  startTime: r.start_time,
  segment: (r.segment as RoutineSegment) || 'morning',
  notes: r.notes ?? '',
  endTime: r.end_time ?? null,
  linkedActivity: asLink(r.linked_activity),
  isSkipped: r.log_status === 'skipped',
});

export const routinesRepo = {
  async getAll(): Promise<Routine[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<RoutineRow>('SELECT * FROM routines ORDER BY id');
    return rows.map(toRoutine);
  },

  /** The routine shown to the child. Falls back to the first routine if none is flagged. */
  async getActive(): Promise<Routine | null> {
    const db = await getDb();
    const row =
      (await db.getFirstAsync<RoutineRow>('SELECT * FROM routines WHERE is_active = 1 ORDER BY id LIMIT 1')) ??
      (await db.getFirstAsync<RoutineRow>('SELECT * FROM routines ORDER BY id LIMIT 1'));
    return row ? toRoutine(row) : null;
  },

  async create(name: string): Promise<number> {
    const db = await getDb();
    const res = await db.runAsync(
      'INSERT INTO routines (name, is_active, created_at) VALUES (?, 0, ?)',
      name.trim(), nowIso(),
    );
    notify('routines');
    return res.lastInsertRowId;
  },

  async rename(id: number, name: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE routines SET name = ? WHERE id = ?', name.trim(), id);
    notify('routines');
  },

  async setActive(id: number): Promise<void> {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      await db.runAsync('UPDATE routines SET is_active = 0');
      await db.runAsync('UPDATE routines SET is_active = 1 WHERE id = ?', id);
    });
    notify('routines');
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM routines WHERE id = ?', id);
    notify('routines');
  },

  /** Items of the active routine — used by My Day and the parent dashboard. */
  async getActiveItems(): Promise<RoutineItem[]> {
    const active = await routinesRepo.getActive();
    return active ? routinesRepo.getItems(active.id) : [];
  },

  // ---- items -------------------------------------------------------------

  async getItems(routineId: number): Promise<RoutineItem[]> {
    const db = await getDb();
    await routinesRepo.rolloverIfNewDay();
    const rows = await db.getAllAsync<RoutineItemRow>(
      `SELECT i.*, l.status AS log_status
         FROM routine_items i
         LEFT JOIN routine_log l ON l.routine_item_id = i.id AND l.day = ?
        WHERE i.routine_id = ? ORDER BY i.sort_order, i.id`,
      today(), routineId,
    );
    return rows.map(toItem);
  },

  /**
   * My Day is a DAILY schedule: the first time it is read on a new day, yesterday's ticks are
   * cleared. (Skips need nothing — they live in the day log, which is per day already.) The day
   * last seen is kept in app_settings, so this runs once a day however often the screen renders.
   */
  async rolloverIfNewDay(): Promise<void> {
    const db = await getDb();
    const day = today();
    const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM app_settings WHERE key = 'routineDay'");
    if (row?.value === day) return;
    if (row) await db.runAsync('UPDATE routine_items SET is_done = 0');
    await db.runAsync("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('routineDay', ?)", day);
  },

  async addItem(routineId: number, label: string, icon: string, startTime: string | null = null, segment: RoutineSegment = 'morning', notes = '', endTime: string | null = null, linkedActivity: RoutineLink | null = null): Promise<number> {
    const db = await getDb();
    const max = await db.getFirstAsync<{ m: number | null }>(
      'SELECT MAX(sort_order) AS m FROM routine_items WHERE routine_id = ?', routineId,
    );
    const res = await db.runAsync(
      'INSERT INTO routine_items (routine_id, label, icon, sort_order, is_done, start_time, segment, notes, end_time, linked_activity) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?)',
      routineId, label.trim(), icon, (max?.m ?? -1) + 1, startTime, segment, notes.trim(), endTime, linkedActivity,
    );
    notify('routines');
    return res.lastInsertRowId;
  },

  async updateItem(id: number, label: string, icon: string, startTime: string | null = null, segment: RoutineSegment = 'morning', notes = '', endTime: string | null = null, linkedActivity: RoutineLink | null = null): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE routine_items SET label = ?, icon = ?, start_time = ?, segment = ?, notes = ?, end_time = ?, linked_activity = ? WHERE id = ?',
      label.trim(), icon, startTime, segment, notes.trim(), endTime, linkedActivity, id,
    );
    notify('routines');
  },

  async removeItem(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM routine_items WHERE id = ?', id);
    notify('routines');
  },

  async moveItem(id: number, direction: -1 | 1): Promise<void> {
    const db = await getDb();
    const item = await db.getFirstAsync<{ routine_id: number }>('SELECT routine_id FROM routine_items WHERE id = ?', id);
    if (!item) return;
    await moveRow(db, 'routine_items', id, direction, 'routine_id = ?', [item.routine_id]);
    notify('routines');
  },

  async setItemDone(id: number, done: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE routine_items SET is_done = ? WHERE id = ?', done ? 1 : 0, id);
    // Remember the day, for the weekly summary (un-ticking the same day takes it back out).
    // Done replaces a skip made earlier the same day.
    const day = today();
    if (done) {
      await db.runAsync(
        `INSERT INTO routine_log (routine_item_id, label, day, created_at, status) SELECT id, label, ?, ?, 'done' FROM routine_items WHERE id = ?
         ON CONFLICT (routine_item_id, day) DO UPDATE SET status = 'done'`,
        day, nowIso(), id,
      );
    } else {
      await db.runAsync('DELETE FROM routine_log WHERE routine_item_id = ? AND day = ?', id, day);
    }
    notify('routines');
  },

  /** Skip a step for today (or undo the skip). A skipped step is not done and not "next". */
  async setItemSkipped(id: number, skipped: boolean): Promise<void> {
    const db = await getDb();
    const day = today();
    if (skipped) {
      await db.runAsync('UPDATE routine_items SET is_done = 0 WHERE id = ?', id);
      await db.runAsync(
        `INSERT INTO routine_log (routine_item_id, label, day, created_at, status) SELECT id, label, ?, ?, 'skipped' FROM routine_items WHERE id = ?
         ON CONFLICT (routine_item_id, day) DO UPDATE SET status = 'skipped'`,
        day, nowIso(), id,
      );
    } else {
      await db.runAsync("DELETE FROM routine_log WHERE routine_item_id = ? AND day = ? AND status = 'skipped'", id, day);
    }
    notify('routines');
  },

  /** Clears today's ticks and skips — used by the "Start a new day" button. */
  async resetDone(routineId: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE routine_items SET is_done = 0 WHERE routine_id = ?', routineId);
    await db.runAsync('DELETE FROM routine_log WHERE day = ? AND routine_item_id IN (SELECT id FROM routine_items WHERE routine_id = ?)', today(), routineId);
    notify('routines');
  },
};
