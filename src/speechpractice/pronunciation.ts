/**
 * Speech Practice pronunciation data — the INTENDED model pronunciation of every practice unit,
 * written down, never guessed.
 *
 * Why this exists: a text-to-speech engine given "BO" or "BE" decides for itself how to read
 * it (a word? letter names? a different vowel?), and that is not acceptable for a practice model.
 * So each syllable's intended pronunciation is part of the exercise data, per PRONUNCIATION SET,
 * and pronunciationDictionary.ts holds the pronunciation-safe text the engine is given to produce
 * it ("BO" → "beau"). The raw syllable is never sent to the engine. A recording, if one exists
 * (modelAudio.ts / a parent's), still takes priority over the dictionary.
 *
 * Pronunciation sets are explicit because the same letters are different sounds in different
 * languages. TalkEasy is English-only, so there is one set; another language would be a new key
 * here plus its entries in pronunciationDictionary.ts.
 */

export type PronunciationSet = 'en';

export const PRONUNCIATION_SETS: { key: PronunciationSet; name: string }[] = [
  { key: 'en', name: 'English' },
];

export const DEFAULT_PRONUNCIATION_SET: PronunciationSet = 'en';

export function isPronunciationSet(value: string | null | undefined): value is PronunciationSet {
  return PRONUNCIATION_SETS.some((s) => s.key === value);
}

export type Vowel = 'a' | 'e' | 'i' | 'o' | 'u';
export const VOWELS: Vowel[] = ['a', 'e', 'i', 'o', 'u'];

/** The consonant rows of the syllable library, in teaching order. */
export const SYLLABLE_CONSONANTS = ['b', 'm', 'p', 't', 'd', 'k', 'g', 's', 'n', 'f'] as const;
export type SyllableConsonant = (typeof SYLLABLE_CONSONANTS)[number];

/** Consonants are the same sound in every set here (hard G, K not C). */
const CONSONANT_IPA: Record<SyllableConsonant, string> = {
  b: 'b', m: 'm', p: 'p', t: 't', d: 'd', k: 'k', g: 'ɡ', s: 's', n: 'n', f: 'f',
};

/**
 * The vowel of a consonant–vowel syllable, per set: IPA and a plain "sounds like" guide for
 * whoever records the model. These are the decisions — change them here, nowhere else.
 */
export const VOWEL_MODEL: Record<PronunciationSet, Record<Vowel, { ipa: string; like: string }>> = {
  // English: A is the open "ah" (MA "mah", as in mama); E, I, O, U say their long sound (BE "bee",
  // BI "bye", BO "beau", BU "boo").
  en: {
    a: { ipa: 'ɑ', like: 'a in "father" / "mama"' },
    e: { ipa: 'iː', like: 'e in "me"' },
    i: { ipa: 'aɪ', like: 'i in "hi"' },
    o: { ipa: 'oʊ', like: 'o in "go"' },
    u: { ipa: 'uː', like: 'oo in "boot"' },
  },
};

export interface SyllableModel {
  /** Stable id, also the recording's file name: "ba". */
  id: string;
  /** What the child sees: "BA". */
  display: string;
  consonant: SyllableConsonant;
  vowel: Vowel;
  /** The intended pronunciation, per set: /bɑ/ and a guide for the person recording it. */
  pronunciation: Record<PronunciationSet, { ipa: string; guide: string }>;
}

function build(consonant: SyllableConsonant, vowel: Vowel): SyllableModel {
  const id = `${consonant}${vowel}`;
  const pronunciation = {} as SyllableModel['pronunciation'];
  for (const { key } of PRONUNCIATION_SETS) {
    const v = VOWEL_MODEL[key][vowel];
    pronunciation[key] = {
      ipa: `/${CONSONANT_IPA[consonant]}${v.ipa}/`,
      // Said as ONE sound, never the letter names ("bee-ay").
      guide: `${consonant.toUpperCase()} + ${v.like}`,
    };
  }
  return { id, display: id.toUpperCase(), consonant, vowel, pronunciation };
}

/** BA BE BI BO BU · MA … · FU — 50 syllables, each with an explicit model per set. */
export const SYLLABLES: SyllableModel[] = SYLLABLE_CONSONANTS.flatMap((c) => VOWELS.map((v) => build(c, v)));

export function getSyllable(id: string): SyllableModel | undefined {
  return SYLLABLES.find((s) => s.id === id.toLowerCase());
}

export function syllablesFor(consonant: string): SyllableModel[] {
  return SYLLABLES.filter((s) => s.consonant === consonant);
}

// ---------------------------------------------------------------------------------------------
// Per-device corrections. The defaults live in pronunciationDictionary.ts; a voice engine on one
// particular phone may still misread a default, so a grown-up can pick one of the entry's tested
// alternatives in Parent Mode → Pronunciation test. That choice is stored per device and wins.
// ---------------------------------------------------------------------------------------------

/** A spoken form: exactly what the engine gets, and in which locale. */
export interface DeviceSpokenForm {
  text: string;
  locale: string;
}

/** "en|syllable:bo" → the spoken form chosen on this device. Stored in app_settings. */
export type PronunciationOverrides = Record<string, DeviceSpokenForm>;

export function overrideKey(set: PronunciationSet, key: string): string {
  return `${set}|${key}`;
}

/** Parses the stored overrides; anything malformed (or from an older version) is ignored. */
export function parseOverrides(value: string | null | undefined): PronunciationOverrides {
  try {
    const parsed = JSON.parse(value || '{}');
    const out: PronunciationOverrides = {};
    if (parsed && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        const f = v as Partial<DeviceSpokenForm> | null;
        if (f && typeof f.text === 'string' && f.text.trim() && typeof f.locale === 'string') out[k] = { text: f.text, locale: f.locale };
      }
    }
    return out;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------------------------
// Model keys: one name per practice unit, shared by bundled files and parent recordings.
// ---------------------------------------------------------------------------------------------

export type ModelKind = 'sound' | 'syllable' | 'word' | 'phrase';

/** "syllable:ba", "word:v-ball", "phrase:ph-water", "sound:b". */
export function modelKey(kind: ModelKind, id: string): string {
  return `${kind}:${id}`;
}

export function parseModelKey(key: string): { kind: ModelKind; id: string } | null {
  const m = /^(sound|syllable|word|phrase):([a-z0-9-]+)$/.exec(key);
  return m ? { kind: m[1] as ModelKind, id: m[2] } : null;
}
