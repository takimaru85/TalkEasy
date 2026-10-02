import { modelKey } from '@/speechpractice/pronunciation';
import type { PracticeItem, PracticeLevel, SoundExercise } from './types';

/**
 * The sounds a child can practise — the ONE place a practice sound is defined. Content, not
 * database data (same idea as `src/learning/content`), so it ships with the app and works with no
 * network. Every screen and every audio call reads a sound from here; nothing else spells out how
 * a sound is said.
 *
 * Each entry separates the LETTER the child sees from the PHONEME they practise and the EXAMPLE
 * WORD that anchors it (see SoundExercise). There is deliberately no respelled "cue" such as
 * "guh": that is /ɡə/, a consonant plus a vowel, and it taught the wrong target.
 *
 * A phoneme's audio is a recording at `phonemeAssetPath(id)`, registered in
 * speechpractice/modelAudio.ts under `phonemeModelKey(id)`.
 *
 * To add a sound: append an entry (and record its phoneme). The grid, the practice screen, the
 * Speech Practice sound activities and the Listen & Talk sound ladder all read from here.
 */
export const SOUND_EXERCISES: SoundExercise[] = [
  {
    id: 'a', letter: 'A', phoneme: '/æ/', phonemeKind: 'vowel',
    exampleWord: 'Apple', exampleIpa: '/ˈæpəl/', emoji: '🍎',
    syllables: ['AB', 'AD', 'AM', 'AN', 'AT'],
    words: ['Apple', 'Ant', 'Arm'],
    phrases: ['I want an apple.'],
  },
  {
    id: 'b', letter: 'B', phoneme: '/b/', phonemeKind: 'consonant',
    exampleWord: 'Ball', exampleIpa: '/bɔl/', emoji: '⚽',
    syllables: ['BA', 'BE', 'BI', 'BO', 'BU'],
    words: ['Ball', 'Baby', 'Banana'],
    phrases: ['I want the ball.'],
  },
  {
    id: 'm', letter: 'M', phoneme: '/m/', phonemeKind: 'consonant',
    exampleWord: 'Moon', exampleIpa: '/mun/', emoji: '🌙',
    syllables: ['MA', 'ME', 'MI', 'MO', 'MU'],
    words: ['Mama', 'Milk', 'Moon'],
    phrases: ['I want milk.'],
  },
  {
    id: 'p', letter: 'P', phoneme: '/p/', phonemeKind: 'consonant',
    exampleWord: 'Person', exampleIpa: '/ˈpɝsən/', emoji: '👦',
    syllables: ['PA', 'PE', 'PI', 'PO', 'PU'],
    words: ['Papa', 'Pen', 'Pizza'],
    phrases: ['I see Papa.'],
  },
  {
    id: 't', letter: 'T', phoneme: '/t/', phonemeKind: 'consonant',
    exampleWord: 'Teddy', exampleIpa: '/ˈtɛdi/', emoji: '🧸',
    syllables: ['TA', 'TE', 'TI', 'TO', 'TU'],
    words: ['Toy', 'Table', 'Tea'],
    phrases: ['I want the toy.'],
  },
  {
    id: 'k', letter: 'K', phoneme: '/k/', phonemeKind: 'consonant',
    exampleWord: 'Kite', exampleIpa: '/kaɪt/', emoji: '🪁',
    syllables: ['KA', 'KE', 'KI', 'KO', 'KU'],
    words: ['Kite', 'Key', 'Cake'],
    phrases: ['I see the kite.'],
  },
  {
    id: 'g', letter: 'G', phoneme: '/ɡ/', phonemeKind: 'consonant',
    exampleWord: 'Goat', exampleIpa: '/ɡoʊt/', emoji: '🐐',
    syllables: ['GA', 'GE', 'GI', 'GO', 'GU'],
    words: ['Goat', 'Girl', 'Go'],
    phrases: ['I see the goat.'],
  },
  {
    id: 's', letter: 'S', phoneme: '/s/', phonemeKind: 'consonant',
    exampleWord: 'Sun', exampleIpa: '/sʌn/', emoji: '☀️',
    syllables: ['SA', 'SE', 'SI', 'SO', 'SU'],
    words: ['Sun', 'Sock', 'Soap'],
    phrases: ['I see the sun.'],
  },
  {
    id: 'f', letter: 'F', phoneme: '/f/', phonemeKind: 'consonant',
    exampleWord: 'Fish', exampleIpa: '/fɪʃ/', emoji: '🐟',
    syllables: ['FA', 'FE', 'FI', 'FO', 'FU'],
    words: ['Fish', 'Fan', 'Food'],
    phrases: ['I want food.'],
  },
  {
    id: 'n', letter: 'N', phoneme: '/n/', phonemeKind: 'consonant',
    exampleWord: 'Nose', exampleIpa: '/noʊz/', emoji: '👃',
    syllables: ['NA', 'NE', 'NI', 'NO', 'NU'],
    words: ['Nose', 'Net', 'Nine'],
    phrases: ['I see my nose.'],
  },
  {
    id: 'd', letter: 'D', phoneme: '/d/', phonemeKind: 'consonant',
    exampleWord: 'Dog', exampleIpa: '/dɔɡ/', emoji: '🐶',
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
    level === 'sound' ? [exercise.letter]
    : level === 'syllable' ? exercise.syllables
    : level === 'word' ? exercise.words
    : exercise.phrases;
  return texts.map((text) => ({ level, text }));
}

/** The model-audio key of a sound's isolated phoneme recording ("sound:g"). */
export function phonemeModelKey(id: string): string {
  return modelKey('sound', id);
}

/**
 * Where the bundled recording of a sound's isolated phoneme belongs (see
 * assets/audio/speech-practice/README.md). Phonemes are English targets, so they live in the
 * English set whichever syllable pronunciation set a family has chosen.
 */
export function phonemeAssetPath(id: string): string {
  return `assets/audio/speech-practice/en/sounds/${id}.m4a`;
}
