import { QUESTIONS_PER_SESSION as N, fromBank, mcq } from '../engine';
import type { LearningActivity, LearningSubject, Option } from '../types';

/** Picture words: emoji + English word. Shared by vocabulary and picture matching. */
export const PICTURE_WORDS: { word: string; emoji: string }[] = [
  { word: 'apple', emoji: '🍎' }, { word: 'ball', emoji: '⚽' }, { word: 'cat', emoji: '🐱' },
  { word: 'dog', emoji: '🐶' }, { word: 'egg', emoji: '🥚' }, { word: 'fish', emoji: '🐟' },
  { word: 'goat', emoji: '🐐' }, { word: 'hat', emoji: '🎩' }, { word: 'ice cream', emoji: '🍦' },
  { word: 'jam', emoji: '🫙' }, { word: 'kite', emoji: '🪁' }, { word: 'lion', emoji: '🦁' },
  { word: 'moon', emoji: '🌙' }, { word: 'nest', emoji: '🪺' }, { word: 'orange', emoji: '🍊' },
  { word: 'pig', emoji: '🐷' }, { word: 'queen', emoji: '👸' }, { word: 'rain', emoji: '🌧️' },
  { word: 'sun', emoji: '☀️' }, { word: 'tree', emoji: '🌳' }, { word: 'umbrella', emoji: '☂️' },
  { word: 'van', emoji: '🚐' }, { word: 'water', emoji: '💧' }, { word: 'box', emoji: '📦' },
  { word: 'yarn', emoji: '🧶' }, { word: 'zebra', emoji: '🦓' }, { word: 'book', emoji: '📖' },
  { word: 'house', emoji: '🏠' }, { word: 'car', emoji: '🚗' }, { word: 'flower', emoji: '🌸' },
  { word: 'bird', emoji: '🐦' }, { word: 'chair', emoji: '🪑' }, { word: 'bed', emoji: '🛏️' },
  { word: 'shoe', emoji: '👟' }, { word: 'star', emoji: '⭐' }, { word: 'cake', emoji: '🎂' },
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LETTER_WORD: Record<string, { word: string; emoji: string }> = {
  A: { word: 'apple', emoji: '🍎' }, B: { word: 'ball', emoji: '⚽' }, C: { word: 'cat', emoji: '🐱' },
  D: { word: 'dog', emoji: '🐶' }, E: { word: 'egg', emoji: '🥚' }, F: { word: 'fish', emoji: '🐟' },
  G: { word: 'goat', emoji: '🐐' }, H: { word: 'hat', emoji: '🎩' }, I: { word: 'ice cream', emoji: '🍦' },
  J: { word: 'jam', emoji: '🫙' }, K: { word: 'kite', emoji: '🪁' }, L: { word: 'lion', emoji: '🦁' },
  M: { word: 'moon', emoji: '🌙' }, N: { word: 'nest', emoji: '🪺' }, O: { word: 'orange', emoji: '🍊' },
  P: { word: 'pig', emoji: '🐷' }, Q: { word: 'queen', emoji: '👸' }, R: { word: 'rain', emoji: '🌧️' },
  S: { word: 'sun', emoji: '☀️' }, T: { word: 'tree', emoji: '🌳' }, U: { word: 'umbrella', emoji: '☂️' },
  V: { word: 'van', emoji: '🚐' }, W: { word: 'water', emoji: '💧' }, X: { word: 'box', emoji: '📦' },
  Y: { word: 'yarn', emoji: '🧶' }, Z: { word: 'zebra', emoji: '🦓' },
};

const letters: LearningActivity = {
  key: 'english.letters',
  subjectKey: 'english',
  title: 'Letters',
  emoji: '🔤',
  description: 'Match big and small letters; find the letter a word starts with.',
  generate: (d, rng) =>
    rng.sample(LETTERS, N).map((L) => {
      const lw = LETTER_WORD[L];
      const mode = d === 'easy' ? 0 : rng.int(0, 1);
      if (mode === 0) {
        // uppercase -> lowercase
        return mcq(rng, d, `Find small letter ${L}.`, { label: L.toLowerCase(), speak: L }, LETTERS.map((x) => ({ label: x.toLowerCase(), speak: x })), {
          promptEmoji: L,
          speak: `This is big letter ${L}. Find the small letter ${L}.`,
          explain: `Yes! Big ${L} and small ${L}.`,
        });
      }
      // word -> first letter
      return mcq(rng, d, `${lw.word} starts with…`, { label: L }, LETTERS.map((x) => ({ label: x })), {
        promptEmoji: lw.emoji,
        speak: `${lw.word}. Which letter does ${lw.word} start with?`,
        explain: `Yes! ${L} is for ${lw.word}.`,
      });
    }),
};

const vocabulary: LearningActivity = {
  key: 'english.vocabulary',
  subjectKey: 'english',
  title: 'Words',
  emoji: '🍎',
  description: 'See a picture, tap the word.',
  generate: (d, rng) =>
    fromBank(rng, PICTURE_WORDS, N, (item) =>
      mcq(rng, d, 'What is this?', { label: item.word }, PICTURE_WORDS.map((w) => ({ label: w.word })), {
        promptEmoji: item.emoji,
        speak: 'What is this? Tap the word.',
        explain: `Yes! It is ${item.word}.`,
      }),
    ),
};

const pictureMatch: LearningActivity = {
  key: 'english.picture_match',
  subjectKey: 'english',
  title: 'Find the picture',
  emoji: '🖼️',
  description: 'Hear a word, tap the matching picture.',
  generate: (d, rng) =>
    fromBank(rng, PICTURE_WORDS, N, (item) =>
      mcq(rng, d, `Find: ${item.word}`, { label: item.word, emoji: item.emoji }, PICTURE_WORDS.map((w) => ({ label: w.word, emoji: w.emoji })), {
        speak: `Find the ${item.word}.`,
        explain: `Yes! That is the ${item.word}.`,
      }),
    ),
};

interface SentenceItem { before: string; after: string; answer: string; distractors: string[]; emoji: string }
const SENTENCES: SentenceItem[] = [
  { before: 'The cat is', after: '.', answer: 'sleeping', distractors: ['blue', 'a car', 'wet'], emoji: '🐱💤' },
  { before: 'I eat an', after: '.', answer: 'apple', distractors: ['chair', 'shoe', 'moon'], emoji: '🍎' },
  { before: 'The sun is', after: '.', answer: 'hot', distractors: ['cold', 'wet', 'green'], emoji: '☀️' },
  { before: 'Birds can', after: '.', answer: 'fly', distractors: ['swim', 'drive', 'read'], emoji: '🐦' },
  { before: 'I sleep on a', after: '.', answer: 'bed', distractors: ['spoon', 'tree', 'fish'], emoji: '🛏️' },
  { before: 'We drink', after: '.', answer: 'water', distractors: ['rocks', 'paper', 'shoes'], emoji: '💧' },
  { before: 'The dog says', after: '.', answer: 'woof', distractors: ['meow', 'moo', 'quack'], emoji: '🐶' },
  { before: 'I read a', after: '.', answer: 'book', distractors: ['ball', 'hat', 'cake'], emoji: '📖' },
  { before: 'Fish live in', after: '.', answer: 'water', distractors: ['trees', 'cars', 'beds'], emoji: '🐟' },
  { before: 'At night I see the', after: '.', answer: 'moon', distractors: ['sun', 'bus', 'egg'], emoji: '🌙' },
  { before: 'I wear a', after: 'on my head.', answer: 'hat', distractors: ['shoe', 'sock', 'bag'], emoji: '🎩' },
  { before: 'The frog is', after: '.', answer: 'green', distractors: ['purple', 'square', 'loud'], emoji: '🐸' },
];

const sentences: LearningActivity = {
  key: 'english.sentences',
  subjectKey: 'english',
  title: 'Finish the sentence',
  emoji: '✏️',
  description: 'Pick the word that completes the sentence.',
  generate: (d, rng) =>
    fromBank(rng, SENTENCES, N, (s) =>
      mcq(rng, d, `${s.before} ____ ${s.after}`, { label: s.answer }, s.distractors.map((x) => ({ label: x })), {
        promptEmoji: s.emoji,
        speak: `${s.before}, blank, ${s.after}. Which word goes in the blank?`,
        explain: `Yes! ${s.before} ${s.answer} ${s.after}`,
      }),
    ),
};

interface ReadingItem { text: string; emoji: string; question: string; answer: string; distractors: string[] }
const READING: ReadingItem[] = [
  { text: 'Ben has a red ball. He kicks it high.', emoji: '⚽', question: 'What color is the ball?', answer: 'red', distractors: ['blue', 'green', 'yellow'] },
  { text: 'Ana has a cat. The cat likes milk.', emoji: '🐱🥛', question: 'What does the cat like?', answer: 'milk', distractors: ['rice', 'juice', 'bread'] },
  { text: 'It is raining. Mia opens her umbrella.', emoji: '🌧️☂️', question: 'What does Mia open?', answer: 'her umbrella', distractors: ['her bag', 'the door', 'a book'] },
  { text: 'The bird sits in the tree. It sings a song.', emoji: '🐦🌳', question: 'Where is the bird?', answer: 'in the tree', distractors: ['in the car', 'on the bed', 'in the water'] },
  { text: 'Tom eats an apple. It is sweet.', emoji: '🍎', question: 'How does the apple taste?', answer: 'sweet', distractors: ['salty', 'sour', 'hot'] },
  { text: 'Lola bakes a cake. The cake is big.', emoji: '🎂', question: 'What does Lola bake?', answer: 'a cake', distractors: ['a fish', 'an egg', 'a pie'] },
  { text: 'The dog runs fast. It wants to play.', emoji: '🐶', question: 'What does the dog want?', answer: 'to play', distractors: ['to sleep', 'to eat', 'to swim'] },
  { text: 'We go to school on the bus. The bus is yellow.', emoji: '🚌', question: 'How do we go to school?', answer: 'on the bus', distractors: ['in a boat', 'on a bike', 'in a plane'] },
];

const reading: LearningActivity = {
  key: 'english.reading',
  subjectKey: 'english',
  title: 'Reading',
  emoji: '📖',
  description: 'Listen to a short story, then answer a question.',
  generate: (d, rng) =>
    fromBank(rng, READING, N, (r) =>
      mcq(rng, d, `${r.text}\n\n${r.question}`, { label: r.answer }, r.distractors.map((x) => ({ label: x })), {
        promptEmoji: r.emoji,
        speak: `${r.text} ${r.question}`,
        explain: `Yes! ${r.answer}.`,
      }),
    ),
};

export const ENGLISH: LearningSubject = {
  key: 'english',
  name: 'English',
  emoji: '📖',
  color: '#BFE0FF',
  activities: [letters, vocabulary, pictureMatch, sentences, reading],
};

export const wordOptions = (): Option[] => PICTURE_WORDS.map((w) => ({ label: w.word, emoji: w.emoji }));
