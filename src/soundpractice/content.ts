import type { PracticeItem, PracticeLevel, SoundExercise } from './types';

/**
 * The sounds a child can practise. Content, not database data — same idea as
 * `src/learning/content`, so it ships with the app and works with no network.
 *
 * To add a sound: append an entry. Nothing else needs to change; the grid, the practice screen
 * and the level data all read from here.
 *
 * `cue` matters: text-to-speech pronounces "B" as the letter name "bee", not the sound "buh".
 * Every model plays the cue, anchored by an example word, until a recorded file exists for the
 * sound (see src/services/soundPracticeAudio.ts).
 */
export const SOUND_EXERCISES: SoundExercise[] = [
  {
    id: 'a', sound: 'A', cue: 'ah', exampleWord: 'Apple', emoji: '🍎',
    syllables: ['AB', 'AD', 'AM', 'AN', 'AT'],
    words: ['Apple', 'Ant', 'Arm'],
    phrases: ['I want an apple.'],
  },
  {
    id: 'b', sound: 'B', cue: 'buh', exampleWord: 'Ball', emoji: '⚽',
    syllables: ['BA', 'BE', 'BI', 'BO', 'BU'],
    words: ['Ball', 'Baby', 'Banana'],
    phrases: ['I want the ball.'],
  },
  {
    id: 'm', sound: 'M', cue: 'mmm', exampleWord: 'Moon', emoji: '🌙',
    syllables: ['MA', 'ME', 'MI', 'MO', 'MU'],
    words: ['Mama', 'Milk', 'Moon'],
    phrases: ['I want milk.'],
  },
  {
    id: 'p', sound: 'P', cue: 'puh', exampleWord: 'Papa', emoji: '👨',
    syllables: ['PA', 'PE', 'PI', 'PO', 'PU'],
    words: ['Papa', 'Pen', 'Pizza'],
    phrases: ['I see Papa.'],
  },
  {
    id: 't', sound: 'T', cue: 'tuh', exampleWord: 'Toy', emoji: '🧸',
    syllables: ['TA', 'TE', 'TI', 'TO', 'TU'],
    words: ['Toy', 'Table', 'Tea'],
    phrases: ['I want the toy.'],
  },
  {
    id: 'k', sound: 'K', cue: 'kuh', exampleWord: 'Kite', emoji: '🪁',
    syllables: ['KA', 'KE', 'KI', 'KO', 'KU'],
    words: ['Kite', 'Key', 'Cake'],
    phrases: ['I see the kite.'],
  },
  {
    id: 'g', sound: 'G', cue: 'guh', exampleWord: 'Goat', emoji: '🐐',
    syllables: ['GA', 'GE', 'GI', 'GO', 'GU'],
    words: ['Goat', 'Girl', 'Go'],
    phrases: ['I see the goat.'],
  },
  {
    id: 's', sound: 'S', cue: 'sss', exampleWord: 'Sun', emoji: '☀️',
    syllables: ['SA', 'SE', 'SI', 'SO', 'SU'],
    words: ['Sun', 'Sock', 'Soap'],
    phrases: ['I see the sun.'],
  },
  {
    id: 'f', sound: 'F', cue: 'fff', exampleWord: 'Fish', emoji: '🐟',
    syllables: ['FA', 'FE', 'FI', 'FO', 'FU'],
    words: ['Fish', 'Fan', 'Food'],
    phrases: ['I want food.'],
  },
  {
    id: 'n', sound: 'N', cue: 'nnn', exampleWord: 'Nose', emoji: '👃',
    syllables: ['NA', 'NE', 'NI', 'NO', 'NU'],
    words: ['Nose', 'Net', 'Nine'],
    phrases: ['I see my nose.'],
  },
  {
    id: 'd', sound: 'D', cue: 'duh', exampleWord: 'Dog', emoji: '🐶',
    syllables: ['DA', 'DE', 'DI', 'DO', 'DU'],
    words: ['Dog', 'Door', 'Duck'],
    phrases: ['I see the dog.'],
  },
];

export function getSoundExercise(id: string): SoundExercise | undefined {
  return SOUND_EXERCISES.find((s) => s.id === id);
}

/** The sound after this one, wrapping around — what "Next" moves to. */
export function nextSoundId(id: string): string {
  const i = SOUND_EXERCISES.findIndex((s) => s.id === id);
  return SOUND_EXERCISES[(i + 1) % SOUND_EXERCISES.length]?.id ?? SOUND_EXERCISES[0].id;
}

/** Everything the child can say at a level. Level 1 is the sound on its own. */
export function itemsForLevel(exercise: SoundExercise, level: PracticeLevel): PracticeItem[] {
  const texts =
    level === 'sound' ? [exercise.sound]
    : level === 'syllable' ? exercise.syllables
    : level === 'word' ? exercise.words
    : exercise.phrases;
  return texts.map((text) => ({ level, text }));
}
