import { getDb } from '../db';
import { notify } from '../events';
import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { LOCALES } from '@/i18n/registry';
import type { LocaleCode } from '@/i18n/types';
import { isPronunciationSet } from '@/speechpractice/pronunciation';
import type { AppSettings, Difficulty, RotationMode, SizeOption } from '@/types/models';

const SIZE_OPTIONS: SizeOption[] = ['medium', 'large', 'xlarge'];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const ROTATIONS: RotationMode[] = ['auto', 'always', 'portrait'];
const LOCALE_CODES: LocaleCode[] = LOCALES.map((l) => l.code);

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === '1';
}

function parseSize(value: string | undefined, fallback: SizeOption): SizeOption {
  return SIZE_OPTIONS.includes(value as SizeOption) ? (value as SizeOption) : fallback;
}

function parseNumber(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Serialises one settings value into the TEXT column. */
function serialize(key: keyof AppSettings, value: AppSettings[keyof AppSettings]): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? '1' : '0';
  return String(value);
}

export const settingsRepo = {
  async getAll(): Promise<AppSettings> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM app_settings');
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      speechRate: parseNumber(map.get('speechRate'), DEFAULT_SETTINGS.speechRate),
      speechPitch: parseNumber(map.get('speechPitch'), DEFAULT_SETTINGS.speechPitch),
      speechVoice: map.get('speechVoice') || null,
      buttonSize: parseSize(map.get('buttonSize'), DEFAULT_SETTINGS.buttonSize),
      textSize: parseSize(map.get('textSize'), DEFAULT_SETTINGS.textSize),
      hapticsEnabled: parseBool(map.get('hapticsEnabled'), DEFAULT_SETTINGS.hapticsEnabled),
      parentPin: map.get('parentPin') || DEFAULT_SETTINGS.parentPin,
      schoolModeAtStart: parseBool(map.get('schoolModeAtStart'), DEFAULT_SETTINGS.schoolModeAtStart),
      learningDifficulty: DIFFICULTIES.includes(map.get('learningDifficulty') as Difficulty)
        ? (map.get('learningDifficulty') as Difficulty)
        : DEFAULT_SETTINGS.learningDifficulty,
      confirmComplete: parseBool(map.get('confirmComplete'), DEFAULT_SETTINGS.confirmComplete),
      highContrast: parseBool(map.get('highContrast'), DEFAULT_SETTINGS.highContrast),
      reducedMotion: parseBool(map.get('reducedMotion'), DEFAULT_SETTINGS.reducedMotion),
      soundEnabled: parseBool(map.get('soundEnabled'), DEFAULT_SETTINGS.soundEnabled),
      rotation: ROTATIONS.includes(map.get('rotation') as RotationMode) ? (map.get('rotation') as RotationMode) : DEFAULT_SETTINGS.rotation,
      // An unknown code (e.g. a language dropped in a later version) falls back to US English.
      language: LOCALE_CODES.includes(map.get('language') as LocaleCode) ? (map.get('language') as LocaleCode) : DEFAULT_SETTINGS.language,
      speechPracticeHidden: map.get('speechPracticeHidden') ?? DEFAULT_SETTINGS.speechPracticeHidden,
      speechPronunciationOverrides: map.get('speechPronunciationOverrides') || DEFAULT_SETTINGS.speechPronunciationOverrides,
      speechPronunciationSet: isPronunciationSet(map.get('speechPronunciationSet')) ? (map.get('speechPronunciationSet') as AppSettings['speechPronunciationSet']) : DEFAULT_SETTINGS.speechPronunciationSet,
    };
  },

  async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
      key, serialize(key, value),
    );
    notify('settings');
  },
};
