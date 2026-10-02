import type { Strings } from '@/i18n/types';

/**
 * A target sound, and the six steps of practising it.
 *
 * This is the journey the Sounds stage exists for: pick BA, then go
 *
 *   listen -> say it -> words -> a phrase -> a sentence -> a game
 *
 * one screen, no navigation in between. It is the speech ladder applied to ONE target rather than
 * spread across a dashboard, which is what makes "what am I practising right now?" answerable at a
 * glance: the answer is at the top of the screen in letters an inch high.
 *
 * WHAT THE WORD STEP ACTUALLY PRACTISES. The syllable (BA, BE, BI…) is the warm-up; the words
 * practise the INITIAL CONSONANT /b/, which is the real speech target. English has no tidy set of
 * child-friendly words beginning with each of /ba/, /bɛ/, /bi/, /bo/, /bu/ exactly, so the words
 * below are /b/-initial and chosen for familiarity, with the closest vowel available. Pretending
 * otherwise would mean either strange words or a false claim about the vowel.
 *
 * Nothing here requires speech. Every step can be completed by listening and tapping, and the
 * recording step is offered, never demanded — the same rule as everywhere else in the app.
 */

export type TargetStepId = 'listen' | 'say' | 'words' | 'phrase' | 'sentence' | 'play';

export const TARGET_STEPS: TargetStepId[] = ['listen', 'say', 'words', 'phrase', 'sentence', 'play'];

export interface TargetStepDef {
  id: TargetStepId;
  emoji: string;
  titleKey: keyof Strings;
  /** What the child is being invited to do. Always an invitation, never an instruction to be right. */
  cueKey: keyof Strings;
}

export const TARGET_STEP_DEFS: TargetStepDef[] = [
  { id: 'listen', emoji: '👂', titleKey: 'tgStepListen', cueKey: 'tgCueListen' },
  { id: 'say', emoji: '🎤', titleKey: 'tgStepSay', cueKey: 'tgCueSay' },
  { id: 'words', emoji: '🔤', titleKey: 'tgStepWords', cueKey: 'tgCueWords' },
  { id: 'phrase', emoji: '💬', titleKey: 'tgStepPhrase', cueKey: 'tgCuePhrase' },
  { id: 'sentence', emoji: '📝', titleKey: 'tgStepSentence', cueKey: 'tgCueSentence' },
  { id: 'play', emoji: '🎮', titleKey: 'tgStepPlay', cueKey: 'tgCuePlay' },
];

export interface TargetWord {
  text: string;
  picture: string;
}

export interface SoundTarget {
  /** Matches the syllable id in the pronunciation dictionary, so the model is the tested one. */
  id: string;
  display: string;
  /** Three words that start with the target consonant. */
  words: [TargetWord, TargetWord, TargetWord];
  phrase: string;
  sentence: string;
  /** Two words that do NOT start with the target, for the game's other choices. */
  others: [TargetWord, TargetWord];
}

export const SOUND_TARGETS: SoundTarget[] = [
  {
    id: 'ba',
    display: 'BA',
    words: [
      { text: 'ball', picture: '⚽' },
      { text: 'baby', picture: '👶' },
      { text: 'banana', picture: '🍌' },
    ],
    phrase: 'big ball',
    sentence: 'The ball is big.',
    others: [
      { text: 'cat', picture: '🐱' },
      { text: 'sun', picture: '☀️' },
    ],
  },
  {
    id: 'be',
    display: 'BE',
    words: [
      { text: 'bed', picture: '🛏️' },
      { text: 'bell', picture: '🔔' },
      { text: 'belt', picture: '🩳' },
    ],
    phrase: 'my bed',
    sentence: 'I sleep in my bed.',
    others: [
      { text: 'dog', picture: '🐶' },
      { text: 'tree', picture: '🌳' },
    ],
  },
  {
    id: 'bi',
    display: 'BI',
    words: [
      { text: 'big', picture: '🐘' },
      { text: 'bird', picture: '🐦' },
      { text: 'bike', picture: '🚲' },
    ],
    phrase: 'big bird',
    sentence: 'The bird is big.',
    others: [
      { text: 'shoe', picture: '👟' },
      { text: 'moon', picture: '🌙' },
    ],
  },
  {
    id: 'bo',
    display: 'BO',
    words: [
      { text: 'book', picture: '📗' },
      { text: 'boat', picture: '⛵' },
      { text: 'box', picture: '📦' },
    ],
    phrase: 'my book',
    sentence: 'I read my book.',
    others: [
      { text: 'apple', picture: '🍎' },
      { text: 'car', picture: '🚗' },
    ],
  },
  {
    id: 'bu',
    display: 'BU',
    words: [
      { text: 'bus', picture: '🚌' },
      { text: 'bug', picture: '🐛' },
      { text: 'button', picture: '🔘' },
    ],
    phrase: 'red bus',
    sentence: 'The bus is red.',
    others: [
      { text: 'fish', picture: '🐟' },
      { text: 'hat', picture: '🧢' },
    ],
  },
];

export function getTarget(id: string): SoundTarget | undefined {
  return SOUND_TARGETS.find((x) => x.id === id);
}

/**
 * The log key for one step of one target.
 *
 * Steps are recorded against the existing `sounds` activity with a scoped item, so per-target
 * progress can be counted without a new table or a new activity id — and so a family's existing
 * Sound Practice history is untouched.
 */
export function stepItemKey(targetId: string, step: TargetStepId): string {
  return `${targetId}:${step}`;
}

export function stepItemKeys(targetId: string): string[] {
  return TARGET_STEPS.map((s) => stepItemKey(targetId, s));
}
