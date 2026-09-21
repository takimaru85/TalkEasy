import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { DEFAULT_PROFILE } from '@/constants/defaults';
import type {
  ChildProfile,
  ChildProfileInput,
  CommunicationPreferences,
  Difficulty,
  ProfileFavorites,
  RewardPreferences,
  ThemeColorKey,
} from '@/types/models';
import { ACCENT_KEYS } from '@/theme/tokens';

interface ProfileRow {
  id: number;
  name: string;
  nickname: string;
  age: number | null;
  grade: string;
  school: string;
  avatar: string;
  photo_uri: string | null;
  favorite_color: string;
  favorites_json: string;
  communication_json: string;
  rewards_json: string;
  learning_goals: string;
  difficulty: string;
  assistance_level: string;
  preferred_method: string | null;
  is_active: number;
  created_at: string;
}

function parseJson<T extends object>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

function toModel(r: ProfileRow): ChildProfile {
  return {
    id: r.id,
    name: r.name,
    nickname: r.nickname,
    age: r.age,
    grade: r.grade,
    school: r.school,
    avatar: r.avatar || DEFAULT_PROFILE.avatar,
    photoUri: r.photo_uri,
    favoriteColor: (ACCENT_KEYS as string[]).includes(r.favorite_color) ? (r.favorite_color as ThemeColorKey) : 'blue',
    favorites: parseJson<ProfileFavorites>(r.favorites_json, DEFAULT_PROFILE.favorites),
    communication: parseJson<CommunicationPreferences>(r.communication_json, DEFAULT_PROFILE.communication),
    rewards: parseJson<RewardPreferences>(r.rewards_json, DEFAULT_PROFILE.rewards),
    learningGoals: r.learning_goals,
    difficulty: DIFFICULTIES.includes(r.difficulty as Difficulty) ? (r.difficulty as Difficulty) : 'easy',
    assistanceLevel: (['guided', 'assisted', 'independent'] as const).includes(r.assistance_level as ChildProfile['assistanceLevel']) ? (r.assistance_level as ChildProfile['assistanceLevel']) : 'assisted',
    preferredMethod: (r.preferred_method as ChildProfile['preferredMethod']) || null,
    isActive: r.is_active === 1,
    createdAt: r.created_at,
  };
}

/**
 * The child's profile. Exactly one profile is active; the table supports more so another
 * child can be added later without a schema change.
 */
export const profileRepo = {
  async getActive(): Promise<ChildProfile | null> {
    const db = await getDb();
    const row =
      (await db.getFirstAsync<ProfileRow>('SELECT * FROM child_profile WHERE is_active = 1 ORDER BY id LIMIT 1')) ??
      (await db.getFirstAsync<ProfileRow>('SELECT * FROM child_profile ORDER BY id LIMIT 1'));
    return row ? toModel(row) : null;
  },

  async getAll(): Promise<ChildProfile[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProfileRow>('SELECT * FROM child_profile ORDER BY id');
    return rows.map(toModel);
  },

  async create(input: ChildProfileInput, makeActive = true): Promise<number> {
    const db = await getDb();
    let newId = 0;
    await db.withTransactionAsync(async () => {
      if (makeActive) await db.runAsync('UPDATE child_profile SET is_active = 0');
      const res = await db.runAsync(
        `INSERT INTO child_profile
           (name, nickname, age, grade, school, avatar, photo_uri, favorite_color, favorites_json,
            communication_json, rewards_json, learning_goals, difficulty, assistance_level, preferred_method, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        input.name.trim(), input.nickname.trim(), input.age, input.grade.trim(), input.school.trim(),
        input.avatar, input.photoUri, input.favoriteColor, JSON.stringify(input.favorites),
        JSON.stringify(input.communication), JSON.stringify(input.rewards), input.learningGoals.trim(),
        input.difficulty, input.assistanceLevel, input.preferredMethod, makeActive ? 1 : 0, nowIso(),
      );
      newId = res.lastInsertRowId;
    });
    notify('profile');
    return newId;
  },

  async update(id: number, input: ChildProfileInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE child_profile SET name = ?, nickname = ?, age = ?, grade = ?, school = ?, avatar = ?, photo_uri = ?,
         favorite_color = ?, favorites_json = ?, communication_json = ?, rewards_json = ?, learning_goals = ?, difficulty = ?,
         assistance_level = ?, preferred_method = ?
       WHERE id = ?`,
      input.name.trim(), input.nickname.trim(), input.age, input.grade.trim(), input.school.trim(),
      input.avatar, input.photoUri, input.favoriteColor, JSON.stringify(input.favorites),
      JSON.stringify(input.communication), JSON.stringify(input.rewards), input.learningGoals.trim(),
      input.difficulty, input.assistanceLevel, input.preferredMethod, id,
    );
    notify('profile');
  },

  /** Convenience for single-field updates from settings-like screens. */
  async patch(id: number, patch: Partial<ChildProfileInput>): Promise<void> {
    const current = await profileRepo.getActive();
    if (!current || current.id !== id) return;
    const { id: _id, isActive: _a, createdAt: _c, ...rest } = current;
    await profileRepo.update(id, { ...rest, ...patch });
  },

  async setActive(id: number): Promise<void> {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      await db.runAsync('UPDATE child_profile SET is_active = 0');
      await db.runAsync('UPDATE child_profile SET is_active = 1 WHERE id = ?', id);
    });
    notify('profile');
  },
};
