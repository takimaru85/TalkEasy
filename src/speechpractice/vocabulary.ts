import type { ActivityCategory, SpeechItem } from './types';

/**
 * The picture vocabulary — one bank shared by Words, Vocabulary, Listening, Picture Naming,
 * Word Repetition, Following Directions, Memory and Sentence Building, so a word added here
 * shows up everywhere it fits.
 *
 * Content, not database data (like src/learning/content): it ships with the app and works
 * offline. Pictures are emoji, rendered by the OS's own colour-emoji font.
 *
 * To add a word: append it to its category. To add a category: add it to VOCAB_CATEGORIES and
 * give it words. Nothing else changes.
 */
export interface VocabItem extends SpeechItem {
  category: string;
  picture: string;
  /** Uncountable (milk, rice): no "a" before it. */
  mass?: boolean;
  /** A name (Mama): never an article. */
  name?: boolean;
}

export const VOCAB_CATEGORIES: ActivityCategory[] = [
  { key: 'animals', name: 'Animals', picture: '🐶' },
  { key: 'food', name: 'Food', picture: '🍎' },
  { key: 'drinks', name: 'Drinks', picture: '🥛' },
  { key: 'people', name: 'People', picture: '👪' },
  { key: 'body', name: 'Body Parts', picture: '👃' },
  { key: 'clothes', name: 'Clothes', picture: '👕' },
  { key: 'toys', name: 'Toys', picture: '🧸' },
  { key: 'school', name: 'School', picture: '🎒' },
  { key: 'home', name: 'Home', picture: '🏠' },
  { key: 'transport', name: 'Transportation', picture: '🚗' },
  { key: 'places', name: 'Places', picture: '🏞️' },
  { key: 'actions', name: 'Actions', picture: '🏃' },
  { key: 'feelings', name: 'Feelings', picture: '😊' },
];

type Row = [id: string, text: string, picture: string, flags?: { mass?: boolean; name?: boolean }];

function bank(category: string, rows: Row[]): VocabItem[] {
  return rows.map(([id, text, picture, flags]) => ({ id: `v-${id}`, text, picture, category, ...flags }));
}

export const VOCABULARY: VocabItem[] = [
  ...bank('animals', [
    ['dog', 'Dog', '🐶'], ['cat', 'Cat', '🐱'], ['bird', 'Bird', '🐦'], ['fish', 'Fish', '🐟'],
    ['cow', 'Cow', '🐮'], ['duck', 'Duck', '🦆'], ['horse', 'Horse', '🐴'], ['pig', 'Pig', '🐷'],
  ]),
  ...bank('food', [
    ['apple', 'Apple', '🍎'], ['banana', 'Banana', '🍌'], ['rice', 'Rice', '🍚', { mass: true }],
    ['bread', 'Bread', '🍞', { mass: true }], ['egg', 'Egg', '🥚'], ['cake', 'Cake', '🍰'],
    ['mango', 'Mango', '🥭'], ['cookie', 'Cookie', '🍪'],
  ]),
  ...bank('drinks', [
    ['milk', 'Milk', '🥛', { mass: true }], ['water', 'Water', '💧', { mass: true }],
    ['juice', 'Juice', '🧃', { mass: true }], ['tea', 'Tea', '🍵', { mass: true }],
  ]),
  ...bank('people', [
    ['mama', 'Mama', '👩', { name: true }], ['papa', 'Papa', '👨', { name: true }], ['baby', 'Baby', '👶'],
    ['boy', 'Boy', '👦'], ['girl', 'Girl', '👧'], ['teacher', 'Teacher', '🧑‍🏫'],
  ]),
  ...bank('body', [
    ['nose', 'Nose', '👃'], ['eye', 'Eye', '👁️'], ['ear', 'Ear', '👂'], ['mouth', 'Mouth', '👄'],
    ['hand', 'Hand', '✋'], ['foot', 'Foot', '🦶'],
  ]),
  ...bank('clothes', [
    ['shirt', 'Shirt', '👕'], ['pants', 'Pants', '👖', { mass: true }], ['shoe', 'Shoe', '👟'],
    ['hat', 'Hat', '🧢'], ['sock', 'Sock', '🧦'], ['dress', 'Dress', '👗'],
  ]),
  ...bank('toys', [
    ['ball', 'Ball', '⚽'], ['teddy', 'Teddy bear', '🧸'], ['car-toy', 'Toy car', '🏎️'],
    ['blocks', 'Blocks', '🧱', { mass: true }], ['kite', 'Kite', '🪁'], ['doll', 'Doll', '🪆'],
  ]),
  ...bank('school', [
    ['book', 'Book', '📖'], ['pencil', 'Pencil', '✏️'], ['bag', 'Bag', '🎒'],
    ['crayon', 'Crayon', '🖍️'], ['scissors', 'Scissors', '✂️', { mass: true }], ['paper', 'Paper', '📄', { mass: true }],
  ]),
  ...bank('home', [
    ['cup', 'Cup', '🥤'], ['bed', 'Bed', '🛏️'], ['chair', 'Chair', '🪑'], ['door', 'Door', '🚪'],
    ['spoon', 'Spoon', '🥄'], ['toothbrush', 'Toothbrush', '🪥'],
  ]),
  ...bank('transport', [
    ['car', 'Car', '🚗'], ['bus', 'Bus', '🚌'], ['bike', 'Bike', '🚲'], ['train', 'Train', '🚆'],
    ['plane', 'Plane', '✈️'], ['boat', 'Boat', '⛵'],
  ]),
  ...bank('places', [
    ['house', 'House', '🏠'], ['school-place', 'School', '🏫'], ['park', 'Park', '🏞️'],
    ['store', 'Store', '🏪'], ['hospital', 'Hospital', '🏥'], ['beach', 'Beach', '🏖️'],
  ]),
  ...bank('actions', [
    ['eat', 'Eat', '🍽️'], ['drink', 'Drink', '🥤'], ['sleep', 'Sleep', '😴'], ['run', 'Run', '🏃'],
    ['jump', 'Jump', '🦘'], ['wash', 'Wash', '🧼'], ['play', 'Play', '🎲'], ['read', 'Read', '📖'],
  ]),
  ...bank('feelings', [
    ['happy', 'Happy', '😊'], ['sad', 'Sad', '😢'], ['angry', 'Angry', '😠'], ['tired', 'Tired', '🥱'],
    ['scared', 'Scared', '😨'], ['sick', 'Sick', '🤒'],
  ]),
];

/** The four everyday groups used by Word Practice (the others live in Vocabulary). */
export const WORD_PRACTICE_CATEGORIES = ['animals', 'food', 'people', 'toys'];

/** Things — nouns a child can point at, want or see (not actions or feelings). */
export const THING_CATEGORIES = ['animals', 'food', 'drinks', 'people', 'body', 'clothes', 'toys', 'school', 'home', 'transport'];

export function vocabInCategory(category: string): VocabItem[] {
  return VOCABULARY.filter((v) => v.category === category);
}

export function vocabById(id: string): VocabItem | undefined {
  return VOCABULARY.find((v) => v.id === id);
}

/** Things only, for Listening / Picture Naming / Directions / Memory. */
export function thingVocabulary(): VocabItem[] {
  return VOCABULARY.filter((v) => THING_CATEGORIES.includes(v.category));
}
