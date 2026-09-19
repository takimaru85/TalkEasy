import { getDb } from '../db';
import { notify } from '../events';
import type { Category } from '@/types/models';

interface CategoryRow {
  id: number;
  key: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_system: number;
  show_on_home: number;
}

function toModel(r: CategoryRow): Category {
  return {
    id: r.id,
    key: r.key,
    name: r.name,
    icon: r.icon,
    color: r.color,
    sortOrder: r.sort_order,
    isSystem: r.is_system === 1,
    showOnHome: r.show_on_home === 1,
  };
}

export const categoriesRepo = {
  async getAll(): Promise<Category[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<CategoryRow>('SELECT * FROM categories ORDER BY sort_order, id');
    return rows.map(toModel);
  },

  async getByKey(key: string): Promise<Category | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE key = ?', key);
    return row ? toModel(row) : null;
  },

  /** Categories for the Talk screen's category bar: shown on home AND containing at least one visible button. */
  async getHomeCategories(): Promise<Category[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<CategoryRow>(
      `SELECT c.* FROM categories c
       WHERE c.show_on_home = 1
         AND EXISTS (SELECT 1 FROM communication_buttons b WHERE b.category_id = c.id AND b.is_hidden = 0)
       ORDER BY c.sort_order, c.id`,
    );
    return rows.map(toModel);
  },

  async rename(id: number, name: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE categories SET name = ? WHERE id = ?', name.trim(), id);
    notify('categories');
  },
};
