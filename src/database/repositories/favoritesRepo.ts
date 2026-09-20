import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { moveRow } from '../reorder';
import type { CommunicationButton } from '@/types/models';

interface FavoriteButtonRow {
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
  favorite_id: number;
  favorite_order: number;
}

function toButton(r: FavoriteButtonRow): CommunicationButton {
  return {
    id: r.id,
    categoryId: r.category_id,
    label: r.label,
    phrase: r.phrase,
    icon: r.icon,
    imageUri: r.image_uri ?? null,
    color: r.color,
    sortOrder: r.favorite_order,
    isSystem: r.is_system === 1,
    isHidden: r.is_hidden === 1,
    tapCount: r.tap_count,
    lastUsedAt: r.last_used_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export const favoritesRepo = {
  /** Favorite buttons in favorite order (hidden buttons excluded). */
  async getButtons(): Promise<CommunicationButton[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<FavoriteButtonRow>(
      `SELECT b.*, f.id AS favorite_id, f.sort_order AS favorite_order
       FROM favorites f JOIN communication_buttons b ON b.id = f.button_id
       WHERE b.is_hidden = 0
       ORDER BY f.sort_order, f.id`,
    );
    return rows.map(toButton);
  },

  async getButtonIds(): Promise<Set<number>> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ button_id: number }>('SELECT button_id FROM favorites');
    return new Set(rows.map((r) => r.button_id));
  },

  async isFavorite(buttonId: number): Promise<boolean> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM favorites WHERE button_id = ?', buttonId);
    return !!row;
  },

  async add(buttonId: number): Promise<void> {
    const db = await getDb();
    const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM favorites');
    await db.runAsync(
      'INSERT OR IGNORE INTO favorites (button_id, sort_order, created_at) VALUES (?, ?, ?)',
      buttonId, (max?.m ?? -1) + 1, nowIso(),
    );
    notify('favorites');
  },

  async remove(buttonId: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM favorites WHERE button_id = ?', buttonId);
    notify('favorites');
  },

  async toggle(buttonId: number): Promise<boolean> {
    const isFav = await favoritesRepo.isFavorite(buttonId);
    if (isFav) await favoritesRepo.remove(buttonId);
    else await favoritesRepo.add(buttonId);
    return !isFav;
  },

  async move(buttonId: number, direction: -1 | 1): Promise<void> {
    const db = await getDb();
    const fav = await db.getFirstAsync<{ id: number }>('SELECT id FROM favorites WHERE button_id = ?', buttonId);
    if (!fav) return;
    await moveRow(db, 'favorites', fav.id, direction);
    notify('favorites');
  },
};
