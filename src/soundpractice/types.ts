/**
 * Sound Practice — data model.
 *
 * Sound Practice is a *practice* aid: Listen → Try → Repeat. It is not an assessment. Nothing
 * here scores a child, and no result is ever presented as clinical. See docs/ARCHITECTURE.md.
 *
 * The four levels below are part of the model from the start so that syllables, words and
 * phrases can be switched on without reshaping the data. The first version practises the
 * 'sound' level only.
 */

/** How much the child says at once. Ordered easiest → hardest. */
export type PracticeLevel = 'sound' | 'syllable' | 'word' | 'phrase';

export const PRACTICE_LEVELS: PracticeLevel[] = ['sound', 'syllable', 'word', 'phrase'];

/**
 * One practice sound, as THREE separate things that must never be confused:
 *
 *   letter   "G"      what the child SEES — a spelling, never given to a voice engine as the model
 *   phoneme  /ɡ/      what the child HEARS and practises — the speech sound itself, no added vowel
 *   example  "Goat"   a real word that starts with the phoneme, spoken as a whole word
 *
 * A text-to-speech engine cannot say a phoneme: given "G" it says the letter name "gee", and given
 * a respelling it adds a vowel ("guh" is /ɡə/, not /ɡ/). So the phoneme is played ONLY from a
 * recording — see services/soundPracticeAudio.ts `playPhoneme`.
 */
export interface SoundExercise {
  /** Stable key used in the database and for model-audio lookup — never translated. */
  id: string;
  /** The letter shown to the child, e.g. "G". Display only. */
  letter: string;
  /**
   * The target speech sound in IPA between slashes: "/ɡ/" (U+0261, the IPA script g). Chosen by
   * the curriculum, never inferred from the letter name — "A" here is /æ/ as in apple, not "ay".
   */
  phoneme: string;
  /** A consonant or a vowel: a speaker models them differently (a stop cannot be held). */
  phonemeKind: 'consonant' | 'vowel';
  /** A familiar word that BEGINS with the phoneme ("Goat"). Spoken as a whole word. */
  exampleWord: string;
  /** Its pronunciation (General American), starting with the phoneme: "/ɡoʊt/". */
  exampleIpa: string;
  /** Offline-safe picture of the example word, in keeping with the rest of the app. */
  emoji: string;
  syllables: string[];
  words: string[];
  phrases: string[];
}

/** One thing the child says: the letter, a syllable, a word or a phrase. */
export interface PracticeItem {
  level: PracticeLevel;
  /** What is shown and said, e.g. "B", "BA", "Ball". */
  text: string;
}

/** What Sound Practice recorded for a single attempt. Never includes audio. */
export interface SoundAttemptInput {
  soundId: string;
  level: PracticeLevel;
  item: string;
  durationMs: number;
}

/** Practice tracking for a day. Deliberately counts and minutes — never a score. */
export interface SoundPracticeStats {
  soundsPracticed: number;
  attempts: number;
  practiceMs: number;
}
