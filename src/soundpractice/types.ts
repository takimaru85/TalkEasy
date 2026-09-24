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

export interface SoundExercise {
  /** Stable key used in the database and for model-audio lookup — never translated. */
  id: string;
  /** The letter shown to the child, e.g. "B". */
  sound: string;
  /**
   * How the isolated sound should be spoken. Text-to-speech says the letter *name* for "B"
   * ("bee"), which is not the sound a child is practising — so the model is driven by this
   * spelled-out cue ("buh") instead. Replaced by a recorded file when one exists.
   */
  cue: string;
  /** A word that starts with the sound, used to anchor the cue ("buh, like ball"). */
  exampleWord: string;
  /** Offline-safe picture, in keeping with the rest of the app. */
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
