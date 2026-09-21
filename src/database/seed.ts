import type { SQLiteDatabase } from 'expo-sqlite';
import {
  DEFAULT_BUTTONS,
  DEFAULT_CATEGORIES,
  DEFAULT_FAVORITES,
  DEFAULT_PROFILE,
  DEFAULT_REWARDS,
  DEFAULT_ROUTINE_ITEMS,
  DEFAULT_ROUTINE_NAME,
  DEFAULT_SETTINGS,
  DEFAULT_SUBJECTS,
  DEFAULT_THERAPY,
  SEED_VERSION,
} from '@/constants/defaults';
import { DEMO_LESSONS } from '@/adaptive/demoLessons';

const SEED_VERSION_KEY = 'seed_version';
const LEGACY_SEED_FLAG = 'seeded_v1';

/**
 * Seeds default content.
 *
 * - Fresh install: everything below is inserted (Brayden's demo profile included).
 * - Upgrade (seed_version behind SEED_VERSION): only missing default categories, buttons,
 *   subjects, rewards and the profile are added — once — so the parent's earlier deletions
 *   are respected.
 */
export async function seedIfNeeded(db: SQLiteDatabase): Promise<void> {
  const current = await getSeedVersion(db);
  if (current >= SEED_VERSION) return;
  const fresh = current === 0;
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (txn) => {
    // ---- Categories (insert missing, keep order) --------------------------
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

    // ---- Demo lessons (insert missing by title; activities only with a new lesson) ------
    for (const demo of DEMO_LESSONS) {
      const exists = await txn.getFirstAsync<{ id: number }>('SELECT id FROM lessons WHERE title = ?', demo.lesson.title);
      if (exists) continue;
      const subject = await txn.getFirstAsync<{ id: number }>('SELECT id FROM subjects WHERE name = ?', demo.subjectName);
      const maxOrder = await txn.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM lessons');
      const res = await txn.runAsync(
        `INSERT INTO lessons (subject_id, title, grade_level, content, vocabulary_json, objectives, assigned_date, sort_order, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        subject?.id ?? null, demo.lesson.title, demo.lesson.gradeLevel, demo.lesson.content, JSON.stringify(demo.lesson.vocabulary),
        demo.lesson.objectives, demo.lesson.assignedDate, (maxOrder?.m ?? -1) + 1, now,
      );
      for (let i = 0; i < demo.activities.length; i++) {
        const a = demo.activities[i];
        await txn.runAsync(
          `INSERT INTO lesson_activities (lesson_id, type, question, image, choices_json, pairs_json, answers_json, hint, difficulty, allowed_methods_json, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          res.lastInsertRowId, a.type, a.question, a.image, JSON.stringify(a.choices), JSON.stringify(a.pairs), JSON.stringify(a.answers),
          a.hint, a.difficulty, JSON.stringify(a.allowedMethods), i,
        );
      }
    }

    // ---- Profile (only if none exists) -----------------------------------
    const profileCount = await txn.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM child_profile');
    if ((profileCount?.n ?? 0) === 0) {
      // Carry over the learning difficulty a v2 install may have chosen.
      const diff = await txn.getFirstAsync<{ value: string }>("SELECT value FROM app_settings WHERE key = 'learningDifficulty'");
      const p = DEFAULT_PROFILE;
      await txn.runAsync(
        `INSERT INTO child_profile
           (name, nickname, age, grade, school, avatar, photo_uri, favorite_color, favorites_json,
            communication_json, rewards_json, learning_goals, difficulty, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        p.name, p.nickname, p.age, p.grade, p.school, p.avatar, p.photoUri, p.favoriteColor,
        JSON.stringify(p.favorites), JSON.stringify(p.communication), JSON.stringify(p.rewards),
        p.learningGoals, diff?.value || p.difficulty, now,
      );
    }

    // ---- Rewards (only if none exist) ------------------------------------
    const rewardCount = await txn.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM rewards');
    if ((rewardCount?.n ?? 0) === 0) {
      for (let i = 0; i < DEFAULT_REWARDS.length; i++) {
        const r = DEFAULT_REWARDS[i];
        await txn.runAsync(
          'INSERT INTO rewards (title, icon, stars_required, sort_order, created_at) VALUES (?, ?, ?, ?, ?)',
          r.title, r.icon, r.stars, i, now,
        );
      }
    }

    // ---- Routine: fresh installs get the full day; v2 installs get segments guessed by time
    const routineCount = await txn.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM routines');
    if ((routineCount?.n ?? 0) === 0) {
      const routine = await txn.runAsync(
        'INSERT INTO routines (name, is_active, created_at) VALUES (?, 1, ?)',
        DEFAULT_ROUTINE_NAME, now,
      );
      for (let i = 0; i < DEFAULT_ROUTINE_ITEMS.length; i++) {
        const item = DEFAULT_ROUTINE_ITEMS[i];
        await txn.runAsync(
          `INSERT INTO routine_items (routine_id, label, icon, sort_order, is_done, start_time, segment, notes)
           VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
          routine.lastInsertRowId, item.label, item.icon, i, item.time, item.segment, item.notes ?? '',
        );
      }
    } else if (current < 3) {
      await txn.execAsync(`
        UPDATE routine_items SET segment = CASE
          WHEN start_time IS NULL THEN segment
          WHEN start_time < '08:00' THEN 'morning'
          WHEN start_time < '14:00' THEN 'school'
          WHEN start_time < '18:00' THEN 'afternoon'
          ELSE 'evening' END;
      `);
    }

    // ---- Activities (fresh only) -----------------------------------------
    const therapyCount = await txn.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM therapy_activities');
    if ((therapyCount?.n ?? 0) === 0) {
      for (let i = 0; i < DEFAULT_THERAPY.length; i++) {
        const t = DEFAULT_THERAPY[i];
        await txn.runAsync(
          `INSERT INTO therapy_activities (name, icon, instructions, duration_minutes, frequency, category, is_completed, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
          t.name, t.icon, t.instructions, t.durationMinutes, t.frequency, t.category, i, now,
        );
      }
    }

    // ---- Fresh-install-only: favorites + settings -------------------------
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
