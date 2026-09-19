import type { Difficulty } from '@/types/models';

export type LearningSubjectKey = 'english' | 'filipino' | 'math' | 'science' | 'ap' | 'esp';

export interface Option {
  /** Text on the answer button. */
  label: string;
  /** Optional big pictogram above the text. */
  emoji?: string;
  /** What TTS says when the option is read aloud (defaults to label). */
  speak?: string;
}

export interface Question {
  /** Question text shown large. */
  prompt: string;
  /** Optional large picture(s) shown with the prompt (emoji string). */
  promptEmoji?: string;
  /** Text read aloud when the question appears (defaults to prompt). */
  speak?: string;
  /** 2–4 answer options. */
  options: Option[];
  /** Index of the correct option. */
  answer: number;
  /** Spoken after a correct answer, e.g. "Yes! 2 plus 3 is 5." */
  explain?: string;
}

/** A simple deterministic-enough RNG wrapper so tests can seed it. */
export interface Rng {
  next(): number; // [0,1)
  int(min: number, max: number): number; // inclusive
  pick<T>(arr: readonly T[]): T;
  shuffle<T>(arr: readonly T[]): T[];
  sample<T>(arr: readonly T[], n: number): T[];
}

export interface LearningActivity {
  /** Stable key stored in the DB, e.g. "math.counting". */
  key: string;
  subjectKey: LearningSubjectKey;
  title: string;
  emoji: string;
  description: string;
  /** Produces the questions for one practice session. */
  generate: (difficulty: Difficulty, rng: Rng) => Question[];
}

export interface LearningSubject {
  key: LearningSubjectKey;
  name: string;
  emoji: string;
  color: string;
  activities: LearningActivity[];
}
