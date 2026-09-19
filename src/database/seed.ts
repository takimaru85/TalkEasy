import type { SQLiteDatabase } from 'expo-sqlite';
import {
  DEFAULT_BUTTONS,
  DEFAULT_CATEGORIES,
  DEFAULT_FAVORITES,
  DEFAULT_ROUTINE_ITEMS,
  DEFAULT_ROUTINE_NAME,
  DEFAULT_SETTINGS,
  DEFAULT_SUBJECTS,
  DEFAULT_THERAPY,
  SEED_VERSION,
} from '@/constants/defaults';

const SEED_VERSION_KEY = 'seed_version';
const LEGACY_SEED_FLAG = 'seeded_v1';

/**
 * Seeds default content.
 *
 * - Fresh install: everything below is inserted.
 * - Upgrade (seed_version behind SEED_VERSION): only missing default categories, buttons and
 *   subjects are added — once — so the parent's earlier deletions are respected.
 */
export async function seedIfNeeded(db: SQLiteDatabase): Promise<void> {
  const current = await getSeedVersion(db);
  if (current >= SEED_VERSION) return;
  const fresh = current === 0;
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (txn) => {
    // ---- Categories (insert missing) ------------------------------------
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const cat = DEFAULT_CATEGORIES[i];
      await txn.runAsync(
        `INSERT INTO categories (key, name, icon, color, sort_order, is_system, show_on_home)
         SELECT ?, ?, ?, ?, ?, 1, ?
         WHERE NOT EXISTS (SELECT 1 FROM categories WHERE key = ?)`,
        cat.key, cat.name, cat.icon, cat.color, i, cat.showOnHome ? 1 : 0, cat.key,
      );
      await txn.runAsync('UPDATE categories SET sort_order = ? WHERE key = ?', i, cat.key);
    }

    // ---- Buttons (insert missing by category + label) --------------------
    const perCategoryCount = new Map<string, number>();
    for (const btn of DEFAULT_BUTTONS) {
      const cat = await txn.getFirstAsync<{ id: number }>('SELECT id FROM categories WHERE key = ?', btn.category);
      if (!cat) continue;
      const order = perCategoryCount.get(btn.category) ?? 0;
      perCategoryCount.set(btn.category, order + 1);
      await txn.runAsync(
        `INSERT INTO communication_buttons
           (category_id, label, phrase, icon, color, sort_order, is_system, is_hidden, tap_count, created_at, updated_at)
         SELECT ?, ?, ?, ?, ?, ?, 1, 0, 0, ?, ?
         WHERE NOT EXISTS (SELECT 1 FROM communication_buttons WHERE category_id = ? AND label = ?)`,
        cat.id, btn.label, btn.phrase, btn.icon, btn.color, order, now, now, cat.id, btn.label,
      );
    }

    // ---- Subjects (insert missing by name) -------------------------------
    for (let i = 0; i < DEFAULT_SUBJECTS.length; i++) {
      const s = DEFAULT_SUBJECTS[i];
      await txn.runAsync(
        `INSERT INTO subjects (name, icon, color, teacher_name, notes, sort_order, is_active, created_at)
         SELECT ?, ?, ?, '', '', ?, 1, ?
         WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = ?)`,
        s.name, s.icon, s.color, i, now, s.name,
      );
    }

    // ---- Fresh-install-only content --------------------------------------
    if (fresh) {
      let favOrder = 0;
      for (const [catKey, label] of DEFAULT_FAVORITES) {
        const row = await txn.getFirstAsync<{ id: number }>(
          `SELECT b.id FROM communication_buttons b JOIN categories c ON c.id = b.category_id
           WHERE c.key = ? AND b.label = ?`,
          catKey, label,
        );
        if (!row) continue;
        await txn.runAsync(
          'INSERT OR IGNORE INTO favorites (button_id, sort_order, created_at) VALUES (?, ?, ?)',
          row.id, favOrder++, now,
        );
      }

      const routine = await txn.runAsync(
        'INSERT INTO routines (name, is_active, created_at) VALUES (?, 1, ?)',
        DEFAULT_ROUTINE_NAME, now,
      );
      for (let i = 0; i < DEFAULT_ROUTINE_ITEMS.length; i++) {
        const item = DEFAULT_ROUTINE_ITEMS[i];
        await txn.runAsync(
          'INSERT INTO routine_items (routine_id, label, icon, sort_order, is_done, start_time) VALUES (?, ?, ?, ?, 0, ?)',
          routine.lastInsertRowId, item.label, item.icon, i, item.time,
        );
      }

      for (let i = 0; i < DEFAULT_THERAPY.length; i++) {
        const t = DEFAULT_THERAPY[i];
        await txn.runAsync(
          `INSERT INTO therapy_activities (name, icon, instructions, duration_minutes, frequency, is_completed, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
          t.name, t.icon, t.instructions, t.durationMinutes, t.frequency, i, now,
        );
      }

      const entries: [string, string][] = [
        ['speechRate', String(DEFAULT_SETTINGS.speechRate)],
        ['speechPitch', String(DEFAULT_SETTINGS.speechPitch)],
        ['speechVoice', DEFAULT_SETTINGS.speechVoice ?? ''],
        ['buttonSize', DEFAULT_SETTINGS.buttonSize],
        ['textSize', DEFAULT_SETTINGS.textSize],
        ['hapticsEnabled', DEFAULT_SETTINGS.hapticsEnabled ? '1' : '0'],
        ['parentPin', DEFAULT_SETTINGS.parentPin],
      ];
      for (const [key, value] of entries) {
        await txn.runAsync('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)', key, value);
      }
    }

    await txn.runAsync(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
      SEED_VERSION_KEY, String(SEED_VERSION),
    );
  });
}

async function getSeedVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', SEED_VERSION_KEY);
  if (row) return Number(row.value) || 0;
  // Installs from v1 stored a flag instead of a version number.
  const legacy = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', LEGACY_SEED_FLAG);
  return legacy ? 1 : 0;
}
