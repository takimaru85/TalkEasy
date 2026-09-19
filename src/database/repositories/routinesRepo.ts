import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { moveRow } from '../reorder';
import type { Routine, RoutineItem } from '@/types/models';

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
    const rows = await db.getAllAsync<RoutineItemRow>(
      'SELECT * FROM routine_items WHERE routine_id = ? ORDER BY sort_order, id',
      routineId,
    );
    return rows.map(toItem);
  },

  async addItem(routineId: number, label: string, icon: string, startTime: string | null = null): Promise<number> {
    const db = await getDb();
    const max = await db.getFirstAsync<{ m: number | null }>(
      'SELECT MAX(sort_order) AS m FROM routine_items WHERE routine_id = ?', routineId,
    );
    const res = await db.runAsync(
      'INSERT INTO routine_items (routine_id, label, icon, sort_order, is_done, start_time) VALUES (?, ?, ?, ?, 0, ?)',
      routineId, label.trim(), icon, (max?.m ?? -1) + 1, startTime,
    );
    notify('routines');
    return res.lastInsertRowId;
  },

  async updateItem(id: number, label: string, icon: string, startTime: string | null = null): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE routine_items SET label = ?, icon = ?, start_time = ? WHERE id = ?', label.trim(), icon, startTime, id);
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
    notify('routines');
  },

  /** Clears all "done" ticks — used by the "Start a new day" button. */
  async resetDone(routineId: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE routine_items SET is_done = 0 WHERE routine_id = ?', routineId);
    notify('routines');
  },
};
