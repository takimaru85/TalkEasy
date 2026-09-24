import type { ActivityCategory, SentenceFrame, SpeechItem, StoryPage, TurnGame } from './types';

/**
 * Speech Practice content (everything except the picture vocabulary, see vocabulary.ts).
 *
 * All of this is data. The engine (engine.ts) turns it into exercises and one screen runs every
 * exercise, so growing an activity from five items to five hundred never touches a screen.
 * Keep entries short, concrete and everyday — this is for young children practising at home.
 */

// ---------------------------------------------------------------------------------------------
// Imitation — actions first (no speech needed), then simple sounds.
// ---------------------------------------------------------------------------------------------

export interface ImitationItem extends SpeechItem {
  mode: 'speak' | 'action';
  /** A syllable to imitate: modelled by the syllable library's recording, never TTS. */
  syllable?: string;
}

export const IMITATION: ImitationItem[] = [
  { id: 'im-clap', text: 'Clap', picture: '👏', speak: 'Clap your hands!', mode: 'action' },
  { id: 'im-wave', text: 'Wave', picture: '👋', speak: 'Wave hello!', mode: 'action' },
  { id: 'im-smile', text: 'Smile', picture: '😊', speak: 'Give me a big smile!', mode: 'action' },
  { id: 'im-mouth', text: 'Open mouth', picture: '😮', speak: 'Open your mouth wide. Ahh.', mode: 'action' },
  { id: 'im-tongue', text: 'Tongue out', picture: '😛', speak: 'Stick out your tongue!', mode: 'action' },
  { id: 'im-blow', text: 'Blow', picture: '🌬️', speak: 'Blow like the wind. Whoosh!', mode: 'action' },
  { id: 'im-ma', text: 'Ma', picture: '👄', syllable: 'ma', mode: 'speak' },
  { id: 'im-ba', text: 'Ba', picture: '👄', syllable: 'ba', mode: 'speak' },
  { id: 'im-moo', text: 'Moo', picture: '🐮', speak: 'moo', mode: 'speak' },
  { id: 'im-woof', text: 'Woof', picture: '🐶', speak: 'woof woof', mode: 'speak' },
];

// ---------------------------------------------------------------------------------------------
// Phrases — short and functional: things a child actually needs to say.
// ---------------------------------------------------------------------------------------------

export const PHRASES: SpeechItem[] = [
  { id: 'ph-water', text: 'I want water.', picture: '💧' },
  { id: 'ph-help', text: 'Help me.', picture: '🙋' },
  { id: 'ph-more', text: 'More, please.', picture: '➕' },
  { id: 'ph-open', text: 'Open it.', picture: '📦' },
  { id: 'ph-go', text: "Let's go.", picture: '🚶' },
  { id: 'ph-come', text: 'Come here.', picture: '🤗' },
  { id: 'ph-ball', text: 'I want the ball.', picture: '⚽' },
  { id: 'ph-done', text: 'All done.', picture: '✅' },
  { id: 'ph-stop', text: 'Stop, please.', picture: '✋' },
  { id: 'ph-turn', text: 'My turn.', picture: '🙋' },
];

// ---------------------------------------------------------------------------------------------
// Sentence building — a starter, then a picture. Articles come from the frame so the spoken
// sentence is correct English ("I want an apple", "I want milk", "Give me the cup").
// ---------------------------------------------------------------------------------------------

export const SENTENCE_FRAMES: (SentenceFrame & { categories: string[] })[] = [
  { id: 'want', starter: 'I want', pictures: ['👦', '❤️'], article: 'a', categories: ['food', 'drinks', 'toys'] },
  { id: 'see', starter: 'I see', pictures: ['👦', '👀'], article: 'a', categories: ['animals', 'transport', 'people'] },
  { id: 'this', starter: 'This is', pictures: ['👉'], article: 'a', categories: ['animals', 'toys', 'school', 'home'] },
  { id: 'like', starter: 'I like', pictures: ['👦', '👍'], article: 'the', categories: ['toys', 'food', 'animals'] },
  { id: 'give', starter: 'Give me', pictures: ['🤲'], article: 'the', categories: ['school', 'home', 'toys'] },
  { id: 'help', starter: 'Help me', pictures: ['🙋'], article: 'none', categories: ['actions'] },
];

// ---------------------------------------------------------------------------------------------
// WH questions — a scene, a question, picture answers.
// ---------------------------------------------------------------------------------------------

export interface WhQuestion {
  id: string;
  wh: 'who' | 'what' | 'where' | 'doing';
  scene: string[];
  question: string;
  choices: SpeechItem[];
  answerId: string;
}

const c = (id: string, text: string, picture: string): SpeechItem => ({ id, text, picture });

export const WH_QUESTIONS: WhQuestion[] = [
  {
    id: 'wh-who-eat', wh: 'who', scene: ['👦', '🍎'], question: 'Who is eating?',
    choices: [c('boy', 'Boy', '👦'), c('dog', 'Dog', '🐶'), c('mom', 'Mom', '👩')], answerId: 'boy',
  },
  {
    id: 'wh-what-eat', wh: 'what', scene: ['👦', '🍎'], question: 'What is the boy eating?',
    choices: [c('apple', 'Apple', '🍎'), c('ball', 'Ball', '⚽'), c('dog', 'Dog', '🐶')], answerId: 'apple',
  },
  {
    id: 'wh-where-cat', wh: 'where', scene: ['🏠', '🐱'], question: 'Where is the cat?',
    choices: [c('house', 'In the house', '🏠'), c('tree', 'In the tree', '🌳'), c('car', 'In the car', '🚗')], answerId: 'house',
  },
  {
    id: 'wh-who-sleep', wh: 'who', scene: ['👶', '🛏️'], question: 'Who is sleeping?',
    choices: [c('baby', 'Baby', '👶'), c('cat', 'Cat', '🐱'), c('dad', 'Dad', '👨')], answerId: 'baby',
  },
  {
    id: 'wh-doing-girl', wh: 'doing', scene: ['👧', '📖'], question: 'What is the girl doing?',
    choices: [c('read', 'Reading', '📖'), c('eat', 'Eating', '🍽️'), c('run', 'Running', '🏃')], answerId: 'read',
  },
  {
    id: 'wh-where-bird', wh: 'where', scene: ['🌳', '🐦'], question: 'Where is the bird?',
    choices: [c('tree', 'In the tree', '🌳'), c('water', 'In the water', '🌊'), c('bed', 'In the bed', '🛏️')], answerId: 'tree',
  },
  {
    id: 'wh-what-drink', wh: 'what', scene: ['👨', '🥛'], question: 'What is Dad drinking?',
    choices: [c('milk', 'Milk', '🥛'), c('bread', 'Bread', '🍞'), c('shoe', 'Shoe', '👟')], answerId: 'milk',
  },
  {
    id: 'wh-doing-dog', wh: 'doing', scene: ['🐶', '🏃'], question: 'What is the dog doing?',
    choices: [c('run', 'Running', '🏃'), c('sleep', 'Sleeping', '😴'), c('eat', 'Eating', '🍽️')], answerId: 'run',
  },
];

// ---------------------------------------------------------------------------------------------
// Stories — three or four very short pages, then gentle questions.
// ---------------------------------------------------------------------------------------------

export interface Story {
  id: string;
  title: string;
  picture: string;
  pages: StoryPage[];
  questions: { id: string; question: string; choices: SpeechItem[]; answerId: string }[];
}

export const STORIES: Story[] = [
  {
    id: 'st-ball', title: 'Tom and the Ball', picture: '⚽',
    pages: [
      { picture: '👦 ⚽', text: 'Tom has a ball.' },
      { picture: '👦 💨 ⚽', text: 'Tom throws the ball.' },
      { picture: '🐶 ⚽', text: 'The dog gets the ball.' },
      { picture: '👦 🐶 😊', text: 'Tom and the dog are happy.' },
    ],
    questions: [
      { id: 'q1', question: 'Who has a ball?', choices: [c('tom', 'Tom', '👦'), c('cat', 'Cat', '🐱'), c('baby', 'Baby', '👶')], answerId: 'tom' },
      { id: 'q2', question: 'What does Tom throw?', choices: [c('ball', 'Ball', '⚽'), c('apple', 'Apple', '🍎'), c('book', 'Book', '📖')], answerId: 'ball' },
      { id: 'q3', question: 'Who gets the ball?', choices: [c('dog', 'Dog', '🐶'), c('bird', 'Bird', '🐦'), c('mom', 'Mom', '👩')], answerId: 'dog' },
    ],
  },
  {
    id: 'st-lunch', title: "Mia's Lunch", picture: '🥪',
    pages: [
      { picture: '👧 😋', text: 'Mia is hungry.' },
      { picture: '👩 🥪', text: 'Mom makes a sandwich.' },
      { picture: '👧 🥪', text: 'Mia eats the sandwich.' },
      { picture: '👧 😊', text: 'Now Mia is happy.' },
    ],
    questions: [
      { id: 'q1', question: 'Who is hungry?', choices: [c('mia', 'Mia', '👧'), c('dad', 'Dad', '👨'), c('dog', 'Dog', '🐶')], answerId: 'mia' },
      { id: 'q2', question: 'What does Mom make?', choices: [c('sandwich', 'Sandwich', '🥪'), c('cake', 'Cake', '🍰'), c('ball', 'Ball', '⚽')], answerId: 'sandwich' },
      { id: 'q3', question: 'How does Mia feel at the end?', choices: [c('happy', 'Happy', '😊'), c('sad', 'Sad', '😢'), c('angry', 'Angry', '😠')], answerId: 'happy' },
    ],
  },
  {
    id: 'st-park', title: 'Going to the Park', picture: '🏞️',
    pages: [
      { picture: '👦 👨 🚗', text: 'Ben and Dad get in the car.' },
      { picture: '🚗 🏞️', text: 'They go to the park.' },
      { picture: '👦 🛝', text: 'Ben plays on the slide.' },
    ],
    questions: [
      { id: 'q1', question: 'Where do they go?', choices: [c('park', 'Park', '🏞️'), c('school', 'School', '🏫'), c('store', 'Store', '🏪')], answerId: 'park' },
      { id: 'q2', question: 'Who goes with Ben?', choices: [c('dad', 'Dad', '👨'), c('teacher', 'Teacher', '🧑‍🏫'), c('baby', 'Baby', '👶')], answerId: 'dad' },
      { id: 'q3', question: 'What happened at the park?', choices: [c('slide', 'Ben played on the slide', '🛝'), c('sleep', 'Ben went to sleep', '😴'), c('eat', 'Ben ate cake', '🍰')], answerId: 'slide' },
    ],
  },
];

// ---------------------------------------------------------------------------------------------
// Following directions. One step first; two-step directions use the same exercise with
// `ordered: true` and two answer ids (see engine.ts `twoStepDirection`).
// ---------------------------------------------------------------------------------------------

export const DIRECTION_VERBS = ['Touch the', 'Point to the', 'Tap the'];

/** Colour directions — "Touch the red car". The picture and the word both carry the colour. */
export const COLOUR_THINGS: SpeechItem[] = [
  { id: 'col-red-car', text: 'red car', picture: '🚗' },
  { id: 'col-blue-car', text: 'blue car', picture: '🚙' },
  { id: 'col-red-apple', text: 'red apple', picture: '🍎' },
  { id: 'col-green-apple', text: 'green apple', picture: '🍏' },
  { id: 'col-yellow-star', text: 'yellow star', picture: '⭐' },
  { id: 'col-red-heart', text: 'red heart', picture: '❤️' },
  { id: 'col-blue-heart', text: 'blue heart', picture: '💙' },
];

// ---------------------------------------------------------------------------------------------
// Social communication.
// ---------------------------------------------------------------------------------------------

export const SOCIAL_CATEGORIES: ActivityCategory[] = [
  { key: 'greetings', name: 'Greetings', picture: '👋' },
  { key: 'politeness', name: 'Please & thank you', picture: '🙏' },
  { key: 'requests', name: 'Asking', picture: '🙋' },
  { key: 'responses', name: 'Answers', picture: '👍' },
  { key: 'feelings', name: 'Feelings', picture: '😊' },
];

export const SOCIAL: (SpeechItem & { category: string })[] = [
  { id: 'so-hello', text: 'Hello!', picture: '👋', category: 'greetings' },
  { id: 'so-morning', text: 'Good morning!', picture: '☀️', category: 'greetings' },
  { id: 'so-bye', text: 'Goodbye!', picture: '👋', category: 'greetings' },
  { id: 'so-please', text: 'Please.', picture: '🙏', category: 'politeness' },
  { id: 'so-thanks', text: 'Thank you.', picture: '💖', category: 'politeness' },
  { id: 'so-welcome', text: "You're welcome.", picture: '😊', category: 'politeness' },
  { id: 'so-help', text: 'Help me.', picture: '🙋', category: 'requests' },
  { id: 'so-want', text: 'I want this.', picture: '👉', category: 'requests' },
  { id: 'so-have', text: 'Can I have it?', picture: '🤲', category: 'requests' },
  { id: 'so-yes', text: 'Yes.', picture: '👍', category: 'responses' },
  { id: 'so-no', text: 'No.', picture: '👎', category: 'responses' },
  { id: 'so-maybe', text: 'Maybe.', picture: '🤔', category: 'responses' },
  { id: 'so-dunno', text: "I don't know.", picture: '🤷', category: 'responses' },
  { id: 'so-happy', text: 'I feel happy.', picture: '😊', category: 'feelings' },
  { id: 'so-sad', text: 'I feel sad.', picture: '😢', category: 'feelings' },
  { id: 'so-angry', text: 'I feel angry.', picture: '😠', category: 'feelings' },
  { id: 'so-tired', text: 'I feel tired.', picture: '🥱', category: 'feelings' },
  { id: 'so-scared', text: 'I feel scared.', picture: '😨', category: 'feelings' },
];

// ---------------------------------------------------------------------------------------------
// Role play — an everyday place and the thing to say there.
// ---------------------------------------------------------------------------------------------

export interface RolePlayScene {
  id: string;
  place: SpeechItem;
  lines: SpeechItem[];
}

export const ROLE_PLAY: RolePlayScene[] = [
  {
    id: 'rp-home', place: { id: 'home', text: 'At home', picture: '🏠' },
    lines: [{ id: 'water', text: 'I want water.', picture: '💧' }, { id: 'hug', text: 'Can I have a hug?', picture: '🤗' }],
  },
  {
    id: 'rp-school', place: { id: 'school', text: 'At school', picture: '🏫' },
    lines: [{ id: 'pencil', text: 'Can I have a pencil?', picture: '✏️' }, { id: 'toilet', text: 'May I go to the bathroom?', picture: '🚻' }],
  },
  {
    id: 'rp-store', place: { id: 'store', text: 'At the store', picture: '🏪' },
    lines: [{ id: 'this', text: 'I want this.', picture: '👉' }, { id: 'thanks', text: 'Thank you.', picture: '💖' }],
  },
  {
    id: 'rp-playground', place: { id: 'playground', text: 'At the playground', picture: '🛝' },
    lines: [{ id: 'play', text: 'Can I play?', picture: '⚽' }, { id: 'turn', text: 'Your turn!', picture: '🙌' }],
  },
  {
    id: 'rp-help', place: { id: 'help', text: 'Asking for help', picture: '🙋' },
    lines: [{ id: 'help', text: 'Help me, please.', picture: '🙋' }, { id: 'hurt', text: 'I am hurt.', picture: '🩹' }],
  },
];

// ---------------------------------------------------------------------------------------------
// Rhythm & rhyme.
// ---------------------------------------------------------------------------------------------

export interface RhymeSet {
  id: string;
  word: SpeechItem;
  rhyme: SpeechItem;
  others: SpeechItem[];
}

export const RHYMES: RhymeSet[] = [
  { id: 'rh-cat', word: c('cat', 'Cat', '🐱'), rhyme: c('hat', 'Hat', '🎩'), others: [c('dog', 'Dog', '🐶'), c('sun', 'Sun', '☀️')] },
  { id: 'rh-dog', word: c('dog', 'Dog', '🐶'), rhyme: c('log', 'Log', '🪵'), others: [c('cup', 'Cup', '🥤'), c('bee', 'Bee', '🐝')] },
  { id: 'rh-sun', word: c('sun', 'Sun', '☀️'), rhyme: c('bun', 'Bun', '🍞'), others: [c('car', 'Car', '🚗'), c('fish', 'Fish', '🐟')] },
  { id: 'rh-bee', word: c('bee', 'Bee', '🐝'), rhyme: c('tree', 'Tree', '🌳'), others: [c('ball', 'Ball', '⚽'), c('hat', 'Hat', '🎩')] },
  { id: 'rh-car', word: c('car', 'Car', '🚗'), rhyme: c('star', 'Star', '⭐'), others: [c('cat', 'Cat', '🐱'), c('boat', 'Boat', '⛵')] },
  { id: 'rh-cake', word: c('cake', 'Cake', '🍰'), rhyme: c('snake', 'Snake', '🐍'), others: [c('dog', 'Dog', '🐶'), c('moon', 'Moon', '🌙')] },
];

/** Clap the syllables. `beats` are shown one per clap. */
export const CLAP_WORDS: { item: SpeechItem; beats: string[] }[] = [
  { item: c('cl-dog', 'Dog', '🐶'), beats: ['DOG'] },
  { item: c('cl-apple', 'Apple', '🍎'), beats: ['AP', 'PLE'] },
  { item: c('cl-banana', 'Banana', '🍌'), beats: ['BA', 'NA', 'NA'] },
  { item: c('cl-teddy', 'Teddy', '🧸'), beats: ['TED', 'DY'] },
  { item: c('cl-butterfly', 'Butterfly', '🦋'), beats: ['BUT', 'TER', 'FLY'] },
  { item: c('cl-mama', 'Mama', '👩'), beats: ['MA', 'MA'] },
  { item: c('cl-elephant', 'Elephant', '🐘'), beats: ['EL', 'E', 'PHANT'] },
];

// ---------------------------------------------------------------------------------------------
// Voice practice — loud / quiet, fast / slow, long / short. Practice only: the app never
// measures volume, pitch, resonance or breathing, and says nothing about the child's voice.
// ---------------------------------------------------------------------------------------------

export const VOICE: (SpeechItem & { hint: string })[] = [
  { id: 'vo-loud', text: 'Loud', picture: '🔊', speak: 'Hello!', hint: 'Say "Hello!" in a big, loud voice.' },
  { id: 'vo-quiet', text: 'Quiet', picture: '🔈', speak: 'hello', hint: 'Say "hello" in a quiet, soft voice.' },
  { id: 'vo-fast', text: 'Fast', picture: '🐇', speak: 'one two three four five', rate: 1.5, hint: 'Count to five fast.' },
  { id: 'vo-slow', text: 'Slow', picture: '🐢', speak: 'one. two. three. four. five.', rate: 0.6, hint: 'Count to five slowly.' },
  { id: 'vo-long', text: 'Long', picture: '〰️', speak: 'Aaaaaaaaah', rate: 0.6, hint: 'Say "Aaah" and hold it.' },
  { id: 'vo-short', text: 'Short', picture: '•', speak: 'Ah! Ah! Ah!', hint: 'Say "Ah!" short, three times.' },
];

// ---------------------------------------------------------------------------------------------
// Turn taking — cooperative, no scores, nobody wins.
// ---------------------------------------------------------------------------------------------

const DICE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'].map((d, i) => ({ id: `die-${i + 1}`, text: String(i + 1), picture: d }));

export const TURN_GAMES: TurnGame[] = [
  { id: 'tg-roll', item: { id: 'roll', text: 'Roll', picture: '🎲' }, options: DICE, style: 'roll', rounds: 3 },
  {
    id: 'tg-colour', item: { id: 'choose', text: 'Choose a colour', picture: '🎨' },
    options: [c('red', 'Red', '🔴'), c('blue', 'Blue', '🔵'), c('green', 'Green', '🟢'), c('yellow', 'Yellow', '🟡')],
    style: 'pick', rounds: 3,
  },
  {
    id: 'tg-match', item: { id: 'match', text: 'Pick an animal', picture: '🧩' },
    options: [c('dog', 'Dog', '🐶'), c('cat', 'Cat', '🐱'), c('fish', 'Fish', '🐟'), c('bird', 'Bird', '🐦')],
    style: 'pick', rounds: 3,
  },
];
