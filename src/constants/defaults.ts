import type { ActivityCategory, ActivityFrequency, AppSettings, ChildProfileInput, RoutineSegment } from '@/types/models';
import { tileColor as c } from './colors';

/**
 * Bump when defaults below gain new rows. On upgrade the seed inserts any missing default
 * category / button / subject once, without resurrecting rows the parent deleted earlier.
 */
export const SEED_VERSION = 3;

// ---------------------------------------------------------------------------
// Child profile (demo data — everything here is editable in Parent Mode → My child)
// ---------------------------------------------------------------------------

export const DEFAULT_PROFILE: ChildProfileInput = {
  name: 'Brayden',
  nickname: 'Bray',
  age: 8,
  grade: 'Grade 2',
  school: '',
  avatar: '🦖',
  photoUri: null,
  favoriteColor: 'blue',
  favorites: {
    subjects: ['Mathematics', 'English'],
    activities: ['Drawing', 'Building blocks', 'Music'],
    foods: ['Pancakes', 'Mango', 'Chicken'],
    people: ['Mom', 'Dad', 'Ate'],
  },
  communication: {
    showRecent: true,
    sentenceBuilder: true,
    speakFullPhrase: true,
  },
  rewards: {
    starsPerLearningSession: 1,
    starsPerPerfectSession: 1,
    starsPerRoutineStep: 1,
    starsPerActivity: 1,
    starsPerAssignment: 2,
    celebrationMessage: 'Great job, {name}! ⭐',
  },
  learningGoals: 'Read short sentences. Count to 100. Say what I need at school.',
  difficulty: 'easy',
};

export const AVATAR_CHOICES = ['🦖', '🐯', '🦁', '🐼', '🐨', '🦊', '🐸', '🐧', '🦄', '🐬', '🚀', '⚽', '🎨', '🎸', '🌟', '🙂'];

// ---------------------------------------------------------------------------
// Communication
// ---------------------------------------------------------------------------

export interface DefaultCategory {
  key: string;
  name: string;
  icon: string;
  color: string;
  showOnHome: boolean;
}

/** `needs` is the legacy key for "Basic" (kept so v1/v2 installs upgrade cleanly). */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { key: 'needs', name: 'Basic', icon: 'hand-heart', color: c('blue'), showOnHome: true },
  { key: 'people', name: 'People', icon: 'account-child', color: c('coral'), showOnHome: true },
  { key: 'school', name: 'School', icon: 'school', color: c('green'), showOnHome: true },
  { key: 'feelings', name: 'Feelings', icon: 'emoticon-happy', color: c('yellow'), showOnHome: true },
  { key: 'food', name: 'Food', icon: 'food-apple', color: c('orange'), showOnHome: true },
  { key: 'drinks', name: 'Drinks', icon: 'cup-water', color: c('teal'), showOnHome: true },
  { key: 'bathroom', name: 'Bathroom', icon: 'toilet', color: c('purple'), showOnHome: true },
  { key: 'activities', name: 'Activities', icon: 'teddy-bear', color: c('pink'), showOnHome: true },
  { key: 'home', name: 'Home', icon: 'home', color: c('green'), showOnHome: true },
  { key: 'emergency', name: 'Emergency', icon: 'alert-circle', color: c('coral'), showOnHome: true },
  { key: 'custom', name: 'My phrases', icon: 'star', color: c('teal'), showOnHome: true },
];

export interface DefaultButton {
  category: string;
  label: string;
  phrase: string;
  icon: string;
  color: string;
}

/**
 * Default communication buttons. A phrase ending in "..." is a sentence starter: with the
 * sentence builder on, the next tile completes it ("I want..." + "Water" → "I want water").
 * To add a default tile, append a row and bump SEED_VERSION.
 */
export const DEFAULT_BUTTONS: DefaultButton[] = [
  // Basic
  { category: 'needs', label: 'I want...', phrase: 'I want...', icon: 'hand-pointing-right', color: c('blue') },
  { category: 'needs', label: 'Hungry', phrase: "I'm hungry.", icon: 'food-apple', color: c('orange') },
  { category: 'needs', label: 'Thirsty', phrase: "I'm thirsty.", icon: 'cup-water', color: c('teal') },
  { category: 'needs', label: 'Help', phrase: 'I need help.', icon: 'hand-heart', color: c('yellow') },
  { category: 'needs', label: 'Bathroom', phrase: 'I need the bathroom.', icon: 'toilet', color: c('purple') },
  { category: 'needs', label: 'Tired', phrase: "I'm tired.", icon: 'power-sleep', color: c('purple') },
  { category: 'needs', label: 'Yes', phrase: 'Yes.', icon: 'check', color: c('green') },
  { category: 'needs', label: 'No', phrase: 'No.', icon: 'close', color: c('coral') },
  { category: 'needs', label: 'More', phrase: 'More, please.', icon: 'plus', color: c('yellow') },
  { category: 'needs', label: 'Finished', phrase: "I'm finished.", icon: 'flag-checkered', color: c('grey') },
  { category: 'needs', label: 'Again', phrase: 'Again, please.', icon: 'replay', color: c('blue') },
  { category: 'needs', label: 'I like this', phrase: 'I like this.', icon: 'heart', color: c('pink') },
  { category: 'needs', label: "Don't like", phrase: "I don't like this.", icon: 'heart-off', color: c('grey') },
  { category: 'needs', label: 'Play', phrase: 'I want to play.', icon: 'teddy-bear', color: c('green') },
  { category: 'needs', label: 'Go home', phrase: 'I want to go home.', icon: 'home', color: c('green') },
  { category: 'needs', label: 'Rest', phrase: 'I want to rest.', icon: 'sofa', color: c('purple') },
  { category: 'needs', label: 'Pain', phrase: "I'm in pain.", icon: 'bandage', color: c('coral') },
  { category: 'needs', label: 'Medicine', phrase: 'I need my medicine.', icon: 'pill', color: c('pink') },

  // People
  { category: 'people', label: 'Mom', phrase: 'I want Mom.', icon: 'face-woman', color: c('pink') },
  { category: 'people', label: 'Dad', phrase: 'I want Dad.', icon: 'face-man', color: c('blue') },
  { category: 'people', label: 'Teacher', phrase: 'I want my teacher.', icon: 'human-male-board', color: c('green') },
  { category: 'people', label: 'Ate', phrase: 'I want Ate.', icon: 'human-female', color: c('purple') },
  { category: 'people', label: 'Kuya', phrase: 'I want Kuya.', icon: 'human-male', color: c('teal') },
  { category: 'people', label: 'Caregiver', phrase: 'I want my caregiver.', icon: 'mother-heart', color: c('yellow') },
  { category: 'people', label: 'Friend', phrase: 'I want to play with my friend.', icon: 'account-group', color: c('orange') },

  // School
  { category: 'school', label: 'I need help', phrase: 'I need help.', icon: 'hand-heart', color: c('yellow') },
  { category: 'school', label: "Don't understand", phrase: "I don't understand.", icon: 'help-circle', color: c('orange') },
  { category: 'school', label: 'Repeat', phrase: 'Please repeat.', icon: 'replay', color: c('blue') },
  { category: 'school', label: 'Break', phrase: 'I need a break.', icon: 'pause-circle', color: c('purple') },
  { category: 'school', label: 'Answer', phrase: 'I want to answer.', icon: 'hand-front-right', color: c('green') },
  { category: 'school', label: 'I finished', phrase: 'I finished.', icon: 'check-circle', color: c('green') },
  { category: 'school', label: 'Assignment help', phrase: 'I need help with my assignment.', icon: 'book-open-variant', color: c('yellow') },
  { category: 'school', label: 'Bathroom', phrase: 'I need to go to the bathroom.', icon: 'toilet', color: c('teal') },
  { category: 'school', label: "I'm ready", phrase: "I'm ready.", icon: 'thumb-up', color: c('green') },
  { category: 'school', label: 'Too loud', phrase: 'It is too loud.', icon: 'volume-high', color: c('coral') },

  // Feelings
  { category: 'feelings', label: 'Happy', phrase: "I'm happy.", icon: 'emoticon-happy', color: c('yellow') },
  { category: 'feelings', label: 'Sad', phrase: "I'm sad.", icon: 'emoticon-sad', color: c('blue') },
  { category: 'feelings', label: 'Angry', phrase: "I'm angry.", icon: 'emoticon-angry', color: c('coral') },
  { category: 'feelings', label: 'Scared', phrase: "I'm scared.", icon: 'emoticon-frown', color: c('purple') },
  { category: 'feelings', label: 'Tired', phrase: "I'm tired.", icon: 'power-sleep', color: c('grey') },
  { category: 'feelings', label: 'Excited', phrase: "I'm excited!", icon: 'emoticon-excited', color: c('orange') },
  { category: 'feelings', label: 'Okay', phrase: "I'm okay.", icon: 'emoticon-neutral', color: c('green') },
  { category: 'feelings', label: 'Sick', phrase: "I feel sick.", icon: 'emoticon-sick', color: c('teal') },

  // Food
  { category: 'food', label: 'Rice', phrase: 'I want rice.', icon: 'rice', color: c('orange') },
  { category: 'food', label: 'Bread', phrase: 'I want bread.', icon: 'bread-slice', color: c('orange') },
  { category: 'food', label: 'Fruit', phrase: 'I want fruit.', icon: 'fruit-cherries', color: c('coral') },
  { category: 'food', label: 'Snack', phrase: 'I want a snack.', icon: 'cookie', color: c('yellow') },
  { category: 'food', label: 'Chicken', phrase: 'I want chicken.', icon: 'food-drumstick', color: c('orange') },
  { category: 'food', label: 'Egg', phrase: 'I want an egg.', icon: 'egg', color: c('yellow') },
  { category: 'food', label: 'Ice cream', phrase: 'I want ice cream.', icon: 'ice-cream', color: c('pink') },
  { category: 'food', label: 'Full', phrase: "I'm full.", icon: 'check-circle', color: c('green') },

  // Drinks
  { category: 'drinks', label: 'Water', phrase: 'I want water.', icon: 'cup-water', color: c('teal') },
  { category: 'drinks', label: 'Milk', phrase: 'I want milk.', icon: 'cup', color: c('blue') },
  { category: 'drinks', label: 'Juice', phrase: 'I want juice.', icon: 'bottle-soda', color: c('orange') },
  { category: 'drinks', label: 'Hot choco', phrase: 'I want hot chocolate.', icon: 'coffee', color: c('coral') },

  // Bathroom
  { category: 'bathroom', label: 'Toilet', phrase: 'I need the toilet.', icon: 'toilet', color: c('purple') },
  { category: 'bathroom', label: 'Wash hands', phrase: 'I want to wash my hands.', icon: 'hand-wash', color: c('teal') },
  { category: 'bathroom', label: 'Bath', phrase: 'I want a bath.', icon: 'bathtub', color: c('blue') },
  { category: 'bathroom', label: 'Brush teeth', phrase: 'I want to brush my teeth.', icon: 'toothbrush', color: c('green') },
  { category: 'bathroom', label: 'Wet', phrase: "I'm wet.", icon: 'water', color: c('blue') },

  // Activities
  { category: 'activities', label: 'Draw', phrase: 'I want to draw.', icon: 'palette', color: c('pink') },
  { category: 'activities', label: 'Blocks', phrase: 'I want to play with blocks.', icon: 'toy-brick', color: c('yellow') },
  { category: 'activities', label: 'Music', phrase: 'I want to listen to music.', icon: 'music', color: c('purple') },
  { category: 'activities', label: 'Book', phrase: 'I want to read a book.', icon: 'book-open-variant', color: c('blue') },
  { category: 'activities', label: 'TV', phrase: 'I want to watch TV.', icon: 'television', color: c('grey') },
  { category: 'activities', label: 'Outside', phrase: 'I want to go outside.', icon: 'weather-sunny', color: c('green') },
  { category: 'activities', label: 'Ball', phrase: 'I want to play ball.', icon: 'soccer', color: c('orange') },

  // Home
  { category: 'home', label: 'Bed', phrase: 'I want to go to bed.', icon: 'bed', color: c('purple') },
  { category: 'home', label: 'Blanket', phrase: 'I want my blanket.', icon: 'bed-king', color: c('blue') },
  { category: 'home', label: 'Hot', phrase: "I'm hot.", icon: 'thermometer', color: c('coral') },
  { category: 'home', label: 'Cold', phrase: "I'm cold.", icon: 'snowflake', color: c('teal') },
  { category: 'home', label: 'Quiet', phrase: 'I want it quiet.', icon: 'volume-mute', color: c('grey') },
  { category: 'home', label: 'Hug', phrase: 'I want a hug.', icon: 'hand-heart', color: c('pink') },

  // Emergency
  { category: 'emergency', label: 'Help now', phrase: 'Help me now, please!', icon: 'alert-circle', color: c('coral') },
  { category: 'emergency', label: 'Hurt', phrase: 'I am hurt.', icon: 'bandage', color: c('coral') },
  { category: 'emergency', label: "Can't breathe", phrase: 'I cannot breathe well.', icon: 'lungs', color: c('coral') },
  { category: 'emergency', label: 'Feel sick', phrase: 'I feel very sick.', icon: 'emoticon-sick', color: c('coral') },
  { category: 'emergency', label: 'Scared', phrase: "I'm scared. Stay with me.", icon: 'emoticon-frown', color: c('purple') },
  { category: 'emergency', label: 'Call Mom', phrase: 'Please call Mom.', icon: 'phone', color: c('pink') },
];

/** [category key, label] of default buttons that start in Favorites. */
export const DEFAULT_FAVORITES: [string, string][] = [
  ['drinks', 'Water'],
  ['needs', 'Bathroom'],
  ['needs', 'Help'],
  ['needs', 'Hungry'],
  ['people', 'Mom'],
  ['people', 'Dad'],
  ['school', 'Break'],
  ['needs', 'Play'],
];

/** Quick phrases pinned in School Mode: [category key, label]. */
export const SCHOOL_MODE_QUICK: [string, string][] = [
  ['school', 'I need help'],
  ['school', 'Break'],
  ['school', "Don't understand"],
  ['school', 'I finished'],
  ['school', 'Bathroom'],
  ['needs', 'Pain'],
  ['drinks', 'Water'],
  ['people', 'Teacher'],
];

// ---------------------------------------------------------------------------
// Routine
// ---------------------------------------------------------------------------

export const DEFAULT_ROUTINE_NAME = 'My day';

export const DEFAULT_ROUTINE_ITEMS: { label: string; icon: string; time: string | null; segment: RoutineSegment; notes?: string }[] = [
  { label: 'Wake up', icon: 'weather-sunset-up', time: '06:30', segment: 'morning' },
  { label: 'Brush teeth', icon: 'toothbrush', time: null, segment: 'morning' },
  { label: 'Eat breakfast', icon: 'egg-fried', time: '07:00', segment: 'morning' },
  { label: 'Get ready', icon: 'tshirt-crew', time: '07:30', segment: 'morning', notes: 'Bag, water bottle, ID' },
  { label: 'School', icon: 'school', time: '08:00', segment: 'school' },
  { label: 'Lunch', icon: 'food', time: '12:00', segment: 'school' },
  { label: 'Homework', icon: 'pencil', time: '15:00', segment: 'afternoon' },
  { label: 'Play', icon: 'teddy-bear', time: '16:00', segment: 'afternoon' },
  { label: 'Dinner', icon: 'pot-steam', time: '18:00', segment: 'evening' },
  { label: 'Bath', icon: 'bathtub', time: null, segment: 'evening' },
  { label: 'Relax', icon: 'sofa', time: null, segment: 'evening', notes: 'Story or music' },
  { label: 'Bedtime', icon: 'bed', time: '20:00', segment: 'evening' },
];

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export const DEFAULT_THERAPY: {
  name: string;
  icon: string;
  instructions: string;
  durationMinutes: number;
  frequency: ActivityFrequency;
  category: ActivityCategory;
}[] = [
  { name: 'Stretching', icon: 'human-handsup', instructions: 'Slowly stretch arms and legs the way your therapist showed you. Take your time.', durationMinutes: 10, frequency: 'daily', category: 'therapy' },
  { name: 'Reach and grab', icon: 'hand-wave', instructions: 'Put a favourite toy in front. Reach, grab, and bring it close.', durationMinutes: 5, frequency: 'daily', category: 'therapy' },
  { name: 'Drawing time', icon: 'palette', instructions: 'Draw anything you like with big crayons. Show someone when you finish!', durationMinutes: 15, frequency: 'daily', category: 'art' },
  { name: 'Building blocks', icon: 'toy-brick', instructions: 'Build a tall tower. Count the blocks as you go.', durationMinutes: 15, frequency: 'weekdays', category: 'games' },
  { name: 'Music and clapping', icon: 'music', instructions: 'Play a favourite song. Clap or tap along with the beat.', durationMinutes: 10, frequency: 'daily', category: 'music' },
  { name: 'Story time', icon: 'book-open-variant', instructions: 'Read one short story together. Point to the pictures.', durationMinutes: 15, frequency: 'daily', category: 'reading' },
  { name: 'Walk outside', icon: 'walk', instructions: 'A short walk or wheel around the garden. Name three things you see.', durationMinutes: 15, frequency: 'weekly', category: 'outdoor' },
  { name: 'Sensory bin', icon: 'hand-front-right', instructions: 'Feel the rice, beans or water beads. Find the hidden toys.', durationMinutes: 10, frequency: 'weekly', category: 'sensory' },
  { name: 'Tidy toys', icon: 'basket', instructions: 'Put the toys back in the box. High five when done!', durationMinutes: 5, frequency: 'daily', category: 'chores' },
];

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------

export const DEFAULT_REWARDS: { title: string; icon: string; stars: number }[] = [
  { title: 'Choose a game', icon: '🎮', stars: 10 },
  { title: 'Choose a snack', icon: '🍪', stars: 20 },
  { title: 'Choose an activity', icon: '🎨', stars: 30 },
];

// ---------------------------------------------------------------------------
// School
// ---------------------------------------------------------------------------

export const DEFAULT_SUBJECTS: { name: string; icon: string; color: string }[] = [
  { name: 'English', icon: '📖', color: c('blue') },
  { name: 'Filipino', icon: '🇵🇭', color: c('yellow') },
  { name: 'Mathematics', icon: '🔢', color: c('green') },
  { name: 'Science', icon: '🔬', color: c('teal') },
  { name: 'Araling Panlipunan', icon: '🏘️', color: c('orange') },
  { name: 'ESP / Values', icon: '💗', color: c('pink') },
  { name: 'MAPEH', icon: '🎨', color: c('purple') },
];

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const DEFAULT_SETTINGS: AppSettings = {
  speechRate: 0.9,
  speechPitch: 1.0,
  speechVoice: null,
  buttonSize: 'large',
  textSize: 'large',
  hapticsEnabled: true,
  parentPin: '1234',
  schoolModeAtStart: false,
  learningDifficulty: 'easy',
  confirmComplete: false,
  highContrast: false,
  reducedMotion: false,
  soundEnabled: true,
  rotation: 'auto',
};
