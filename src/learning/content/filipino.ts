import { QUESTIONS_PER_SESSION as N, fromBank, mcq } from '../engine';
import type { LearningActivity, LearningSubject } from '../types';

/** Filipino picture words with English meaning (used for the spoken hint). */
const WORDS: { word: string; english: string; emoji: string }[] = [
  { word: 'aso', english: 'dog', emoji: '🐶' }, { word: 'pusa', english: 'cat', emoji: '🐱' },
  { word: 'bahay', english: 'house', emoji: '🏠' }, { word: 'tubig', english: 'water', emoji: '💧' },
  { word: 'araw', english: 'sun', emoji: '☀️' }, { word: 'buwan', english: 'moon', emoji: '🌙' },
  { word: 'bulaklak', english: 'flower', emoji: '🌸' }, { word: 'puno', english: 'tree', emoji: '🌳' },
  { word: 'isda', english: 'fish', emoji: '🐟' }, { word: 'ibon', english: 'bird', emoji: '🐦' },
  { word: 'mansanas', english: 'apple', emoji: '🍎' }, { word: 'saging', english: 'banana', emoji: '🍌' },
  { word: 'kanin', english: 'rice', emoji: '🍚' }, { word: 'itlog', english: 'egg', emoji: '🥚' },
  { word: 'sapatos', english: 'shoes', emoji: '👟' }, { word: 'sombrero', english: 'hat', emoji: '🎩' },
  { word: 'libro', english: 'book', emoji: '📖' }, { word: 'kotse', english: 'car', emoji: '🚗' },
  { word: 'bola', english: 'ball', emoji: '⚽' }, { word: 'upuan', english: 'chair', emoji: '🪑' },
  { word: 'kama', english: 'bed', emoji: '🛏️' }, { word: 'ulan', english: 'rain', emoji: '🌧️' },
  { word: 'bituin', english: 'star', emoji: '⭐' }, { word: 'baboy', english: 'pig', emoji: '🐷' },
  { word: 'kalabaw', english: 'carabao', emoji: '🐃' }, { word: 'manok', english: 'chicken', emoji: '🐔' },
  { word: 'mata', english: 'eyes', emoji: '👀' }, { word: 'kamay', english: 'hand', emoji: '✋' },
  { word: 'paa', english: 'foot', emoji: '🦶' }, { word: 'ilong', english: 'nose', emoji: '👃' },
];

const vocabulary: LearningActivity = {
  key: 'filipino.vocabulary',
  subjectKey: 'filipino',
  title: 'Mga Salita',
  emoji: '🍌',
  description: 'Tingnan ang larawan, piliin ang salita. (Picture to Filipino word.)',
  generate: (d, rng) =>
    fromBank(rng, WORDS, N, (item) =>
      mcq(rng, d, 'Ano ito?', { label: item.word }, WORDS.map((w) => ({ label: w.word })), {
        promptEmoji: item.emoji,
        speak: `Ano ito? What is this in Filipino?`,
        explain: `Tama! ${item.word}. ${item.english}.`,
      }),
    ),
};

const wordRecognition: LearningActivity = {
  key: 'filipino.word_recognition',
  subjectKey: 'filipino',
  title: 'Hanapin ang Larawan',
  emoji: '🔎',
  description: 'Basahin ang salita, piliin ang larawan. (Word to picture.)',
  generate: (d, rng) =>
    fromBank(rng, WORDS, N, (item) =>
      mcq(rng, d, `Hanapin: ${item.word}`, { label: item.word, emoji: item.emoji }, WORDS.map((w) => ({ label: w.word, emoji: w.emoji })), {
        speak: `Hanapin ang ${item.word}. Find the ${item.english}.`,
        explain: `Tama! Iyan ang ${item.word}.`,
      }),
    ),
};

interface SentenceItem { before: string; after: string; answer: string; distractors: string[]; emoji: string; english: string }
const SENTENCES: SentenceItem[] = [
  { before: 'Ang aso ay', after: '.', answer: 'tumatakbo', distractors: ['lumilipad', 'lumalangoy'], emoji: '🐶', english: 'The dog is running.' },
  { before: 'Kumakain ako ng', after: '.', answer: 'kanin', distractors: ['bato', 'sapatos'], emoji: '🍚', english: 'I am eating rice.' },
  { before: 'Ang araw ay', after: '.', answer: 'mainit', distractors: ['malamig', 'basa'], emoji: '☀️', english: 'The sun is hot.' },
  { before: 'Umiinom ako ng', after: '.', answer: 'tubig', distractors: ['papel', 'bola'], emoji: '💧', english: 'I drink water.' },
  { before: 'Ang ibon ay', after: '.', answer: 'lumilipad', distractors: ['natutulog', 'nagbabasa'], emoji: '🐦', english: 'The bird is flying.' },
  { before: 'Natutulog ako sa', after: '.', answer: 'kama', distractors: ['puno', 'kotse'], emoji: '🛏️', english: 'I sleep on the bed.' },
  { before: 'Ang isda ay nasa', after: '.', answer: 'tubig', distractors: ['langit', 'upuan'], emoji: '🐟', english: 'The fish is in the water.' },
  { before: 'Nagbabasa ako ng', after: '.', answer: 'libro', distractors: ['itlog', 'ulan'], emoji: '📖', english: 'I read a book.' },
  { before: 'Ang bulaklak ay', after: '.', answer: 'maganda', distractors: ['maingay', 'mabilis'], emoji: '🌸', english: 'The flower is beautiful.' },
  { before: 'Sa gabi, nakikita ko ang', after: '.', answer: 'buwan', distractors: ['araw', 'bus'], emoji: '🌙', english: 'At night I see the moon.' },
];

const sentences: LearningActivity = {
  key: 'filipino.sentences',
  subjectKey: 'filipino',
  title: 'Buuin ang Pangungusap',
  emoji: '✏️',
  description: 'Piliin ang tamang salita. (Complete the sentence.)',
  generate: (d, rng) =>
    fromBank(rng, SENTENCES, N, (s) =>
      mcq(rng, d, `${s.before} ____${s.after}`, { label: s.answer }, s.distractors.map((x) => ({ label: x })), {
        promptEmoji: s.emoji,
        speak: `${s.before}, blank. ${s.english}`,
        explain: `Tama! ${s.before} ${s.answer}${s.after}`,
      }),
    ),
};

interface ReadingItem { text: string; english: string; emoji: string; question: string; answer: string; distractors: string[] }
const READING: ReadingItem[] = [
  { text: 'Si Ana ay may pusa. Puti ang pusa.', english: 'Ana has a cat. The cat is white.', emoji: '🐱', question: 'Ano ang kulay ng pusa?', answer: 'puti', distractors: ['itim', 'pula', 'dilaw'] },
  { text: 'Kumain si Ben ng saging. Masarap ito.', english: 'Ben ate a banana. It is delicious.', emoji: '🍌', question: 'Ano ang kinain ni Ben?', answer: 'saging', distractors: ['mansanas', 'kanin', 'itlog'] },
  { text: 'Umuulan. May payong si Mia.', english: 'It is raining. Mia has an umbrella.', emoji: '🌧️☂️', question: 'Ano ang mayroon si Mia?', answer: 'payong', distractors: ['bola', 'libro', 'sombrero'] },
  { text: 'Ang aso ay tumatakbo sa parke.', english: 'The dog is running in the park.', emoji: '🐶🌳', question: 'Saan tumatakbo ang aso?', answer: 'sa parke', distractors: ['sa kama', 'sa kotse', 'sa tubig'] },
  { text: 'Si Lolo ay nagtatanim ng puno.', english: 'Grandpa is planting a tree.', emoji: '👴🌳', question: 'Ano ang itinatanim ni Lolo?', answer: 'puno', distractors: ['bato', 'bola', 'kama'] },
  { text: 'Pumasok kami sa paaralan sakay ng bus.', english: 'We went to school by bus.', emoji: '🚌', question: 'Ano ang sinakyan nila?', answer: 'bus', distractors: ['bangka', 'bisikleta', 'eroplano'] },
];

const reading: LearningActivity = {
  key: 'filipino.reading',
  subjectKey: 'filipino',
  title: 'Pagbasa',
  emoji: '📖',
  description: 'Basahin ang kuwento at sagutin ang tanong. (Read and answer.)',
  generate: (d, rng) =>
    fromBank(rng, READING, N, (r) =>
      mcq(rng, d, `${r.text}\n\n${r.question}`, { label: r.answer }, r.distractors.map((x) => ({ label: x })), {
        promptEmoji: r.emoji,
        speak: `${r.text} ${r.english} ${r.question}`,
        explain: `Tama! ${r.answer}.`,
      }),
    ),
};

export const FILIPINO: LearningSubject = {
  key: 'filipino',
  name: 'Filipino',
  emoji: '🇵🇭',
  color: '#FFF3A8',
  activities: [vocabulary, wordRecognition, sentences, reading],
};
