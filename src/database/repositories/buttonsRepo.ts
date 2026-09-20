import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { moveRow } from '../reorder';
import type { CommunicationButton, CommunicationButtonInput } from '@/types/models';

interface ButtonRow {
  id: number;
  category_id: number;
  label: string;
  phrase: string;
  icon: string;
  image_uri: string | null;
  color: string;
  sort_order: number;
  is_system: number;
  is_hidden: number;
  tap_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

function toModel(r: ButtonRow): CommunicationButton {
  return {
    id: r.id,
    categoryId: r.category_id,
    label: r.label,
    phrase: r.phrase,
    icon: r.icon,
    imageUri: r.image_uri ?? null,
    color: r.color,
    sortOrder: r.sort_order,
    isSystem: r.is_system === 1,
    isHidden: r.is_hidden === 1,
    tapCount: r.tap_count,
    lastUsedAt: r.last_used_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const ORDER = 'ORDER BY sort_order, id';

export const buttonsRepo = {
  /** All buttons, including hidden ones (parent mode). */
  async getAll(): Promise<CommunicationButton[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ButtonRow>(`SELECT * FROM communication_buttons ${ORDER}`);
    return rows.map(toModel);
  },

  /** Visible buttons for the child, optionally limited to one category. */
  async getVisible(categoryId?: number): Promise<CommunicationButton[]> {
    const db = await getDb();
    const rows = categoryId === undefined
      ? await db.getAllAsync<ButtonRow>(
          `SELECT b.* FROM communication_buttons b
           JOIN categories c ON c.id = b.category_id
           WHERE b.is_hidden = 0 AND c.show_on_home = 1
           ORDER BY c.sort_order, b.sort_order, b.id`,
        )
      : await db.getAllAsync<ButtonRow>(
          `SELECT * FROM communication_buttons WHERE is_hidden = 0 AND category_id = ? ${ORDER}`,
          categoryId,
        );
    return rows.map(toModel);
  },

  /**
   * Looks up visible buttons by [category key, label] pairs, preserving the order of `pairs`.
   * Used by School Mode's pinned quick phrases. Missing (deleted/hidden) ones are skipped.
   */
  async getByCategoryLabels(pairs: [string, string][]): Promise<CommunicationButton[]> {
    const db = await getDb();
    const out: CommunicationButton[] = [];
    for (const [key, label] of pairs) {
      const row = await db.getFirstAsync<ButtonRow>(
        `SELECT b.* FROM communication_buttons b JOIN categories c ON c.id = b.category_id
         WHERE c.key = ? AND b.label = ? AND b.is_hidden = 0 LIMIT 1`,
        key, label,
      );
      if (row) out.push(toModel(row));
    }
    return out;
  },

  async getById(id: number): Promise<CommunicationButton | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<ButtonRow>('SELECT * FROM communication_buttons WHERE id = ?', id);
    return row ? toModel(row) : null;
  },

  /** Most recently tapped visible buttons (the "Recent" strip). */
  async getRecent(limit = 6): Promise<CommunicationButton[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ButtonRow>(
      `SELECT * FROM communication_buttons
       WHERE is_hidden = 0 AND last_used_at IS NOT NULL
       ORDER BY last_used_at DESC LIMIT ?`,
      limit,
    );
    return rows.map(toModel);
  },

  async getMostUsed(limit = 6): Promise<CommunicationButton[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ButtonRow>(
      `SELECT * FROM communication_buttons
       WHERE is_hidden = 0 AND tap_count > 0
       ORDER BY tap_count DESC, last_used_at DESC LIMIT ?`,
      limit,
    );
    return rows.map(toModel);
  },

  async create(input: CommunicationButtonInput): Promise<number> {
    const db = await getDb();
    const now = nowIso();
    const max = await db.getFirstAsync<{ m: number | null }>(
      'SELECT MAX(sort_order) AS m FROM communication_buttons WHERE category_id = ?',
      input.categoryId,
    );
    const res = await db.runAsync(
      `INSERT INTO communication_buttons
         (category_id, label, phrase, icon, image_uri, color, sort_order, is_system, is_hidden, tap_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?)`,
      input.categoryId, input.label.trim(), input.phrase.trim(), input.icon, input.imageUri, input.color,
      (max?.m ?? -1) + 1, now, now,
    );
    notify('buttons');
    return res.lastInsertRowId;
  },

  async update(id: number, input: CommunicationButtonInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE communication_buttons
       SET category_id = ?, label = ?, phrase = ?, icon = ?, image_uri = ?, color = ?, updated_at = ?
       WHERE id = ?`,
      input.categoryId, input.label.trim(), input.phrase.trim(), input.icon, input.imageUri, input.color, nowIso(), id,
    );
    notify('buttons', 'favorites');
  },

  async setHidden(id: number, hidden: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE communication_buttons SET is_hidden = ?, updated_at = ? WHERE id = ?',
      hidden ? 1 : 0, nowIso(), id,
    );
    notify('buttons', 'favorites');
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM communication_buttons WHERE id = ?', id);
    notify('buttons', 'favorites');
  },

  /** Move one step up (-1) or down (+1) inside the same category. */
  async move(id: number, direction: -1 | 1): Promise<void> {
    const db = await getDb();
    const current = await db.getFirstAsync<{ category_id: number }>(
      'SELECT category_id FROM communication_buttons WHERE id = ?', id,
    );
    if (!current) return;
    await moveRow(db, 'communication_buttons', id, direction, 'category_id = ?', [current.category_id]);
    notify('buttons');
  },

  /** Records a tap so "most used" stays accurate. Fire-and-forget from the UI. */
  async recordTap(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE communication_buttons SET tap_count = tap_count + 1, last_used_at = ? WHERE id = ?',
      nowIso(), id,
    );
    notify('recent');
  },
};
