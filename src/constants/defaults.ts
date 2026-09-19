import type { ActivityFrequency, AppSettings } from '@/types/models';
import { TileColors } from './colors';

const c = (key: string) => TileColors.find((t) => t.key === key)?.value ?? TileColors[0].value;

/**
 * Bump when defaults below gain new rows. On upgrade the seed inserts any missing default
 * category / button / subject once, without resurrecting rows the parent deleted earlier.
 */
export const SEED_VERSION = 2;

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

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { key: 'needs', name: 'Basic', icon: 'hand-heart', color: c('blue'), showOnHome: true },
  { key: 'people', name: 'People', icon: 'account-child', color: c('pink'), showOnHome: true },
  { key: 'school', name: 'School', icon: 'school', color: c('green'), showOnHome: true },
  { key: 'feelings', name: 'Feelings', icon: 'emoticon-happy', color: c('yellow'), showOnHome: true },
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
 * Default communication buttons. To add a new default tile, append a row here and bump
 * SEED_VERSION — it will be created on next launch. (Parents add tiles in Parent Mode.)
 */
export const DEFAULT_BUTTONS: DefaultButton[] = [
  // Basic
  { category: 'needs', label: 'Water', phrase: 'I want water.', icon: 'cup-water', color: c('blue') },
  { category: 'needs', label: 'Hungry', phrase: 'I am hungry.', icon: 'food-apple', color: c('orange') },
  { category: 'needs', label: 'Eat', phrase: 'I want to eat.', icon: 'silverware-fork-knife', color: c('orange') },
  { category: 'needs', label: 'Bathroom', phrase: 'I need the bathroom.', icon: 'toilet', color: c('teal') },
  { category: 'needs', label: 'Tired', phrase: 'I am tired.', icon: 'power-sleep', color: c('purple') },
  { category: 'needs', label: 'Sleepy', phrase: 'I am sleepy.', icon: 'bed', color: c('purple') },
  { category: 'needs', label: 'Pain', phrase: 'I am in pain.', icon: 'bandage', color: c('pink') },
  { category: 'needs', label: 'Help', phrase: 'Help me.', icon: 'hand-heart', color: c('yellow') },
  { category: 'needs', label: 'Rest', phrase: 'I want to rest.', icon: 'sofa', color: c('purple') },
  { category: 'needs', label: 'Play', phrase: 'I want to play.', icon: 'teddy-bear', color: c('green') },
  { category: 'needs', label: 'Yes', phrase: 'Yes.', icon: 'check', color: c('green') },
  { category: 'needs', label: 'No', phrase: 'No.', icon: 'close', color: c('pink') },
  { category: 'needs', label: 'More', phrase: 'More, please.', icon: 'plus', color: c('yellow') },
  { category: 'needs', label: 'Finished', phrase: 'I am finished.', icon: 'flag-checkered', color: c('grey') },
  { category: 'needs', label: "Don't want", phrase: "I don't want this.", icon: 'thumb-down', color: c('orange') },
  { category: 'needs', label: 'I like this', phrase: 'I like this.', icon: 'heart', color: c('pink') },
  { category: 'needs', label: "Don't like", phrase: "I don't like this.", icon: 'heart-off', color: c('grey') },
  { category: 'needs', label: 'Medicine', phrase: 'I need my medicine.', icon: 'pill', color: c('pink') },

  // People
  { category: 'people', label: 'Dad', phrase: 'I want Dad.', icon: 'face-man', color: c('blue') },
  { category: 'people', label: 'Mom', phrase: 'I want Mom.', icon: 'face-woman', color: c('pink') },
  { category: 'people', label: 'Teacher', phrase: 'I want my teacher.', icon: 'human-male-board', color: c('green') },
  { category: 'people', label: 'Ate', phrase: 'I want Ate.', icon: 'human-female', color: c('purple') },
  { category: 'people', label: 'Kuya', phrase: 'I want Kuya.', icon: 'human-male', color: c('teal') },
  { category: 'people', label: 'Caregiver', phrase: 'I want my caregiver.', icon: 'mother-heart', color: c('yellow') },

  // School
  { category: 'school', label: 'I need help', phrase: 'I need help.', icon: 'hand-heart', color: c('yellow') },
  { category: 'school', label: "Don't understand", phrase: "I don't understand.", icon: 'help-circle', color: c('orange') },
  { category: 'school', label: 'Repeat', phrase: 'Please repeat.', icon: 'replay', color: c('blue') },
  { category: 'school', label: 'Break', phrase: 'I need a break.', icon: 'pause-circle', color: c('purple') },
  { category: 'school', label: 'Answer', phrase: 'I want to answer.', icon: 'hand-front-right', color: c('green') },
  { category: 'school', label: 'I finished', phrase: 'I finished.', icon: 'check-circle', color: c('green') },
  { category: 'school', label: 'Assignment help', phrase: 'I need help with my assignment.', icon: 'book-open-variant', color: c('yellow') },
  { category: 'school', label: 'Bathroom', phrase: 'I need to go to the bathroom.', icon: 'toilet', color: c('teal') },
  { category: 'school', label: "I'm tired", phrase: "I'm tired.", icon: 'power-sleep', color: c('purple') },
  { category: 'school', label: "I'm ready", phrase: "I'm ready.", icon: 'thumb-up', color: c('green') },

  // Feelings
  { category: 'feelings', label: 'Happy', phrase: 'I feel happy.', icon: 'emoticon-happy', color: c('yellow') },
  { category: 'feelings', label: 'Sad', phrase: 'I feel sad.', icon: 'emoticon-sad', color: c('blue') },
  { category: 'feelings', label: 'Angry', phrase: 'I feel angry.', icon: 'emoticon-angry', color: c('orange') },
  { category: 'feelings', label: 'Scared', phrase: 'I feel scared.', icon: 'emoticon-frown', color: c('purple') },
  { category: 'feelings', label: 'Tired', phrase: 'I feel tired.', icon: 'power-sleep', color: c('grey') },
  { category: 'feelings', label: 'Sleepy', phrase: 'I feel sleepy.', icon: 'bed', color: c('purple') },
  { category: 'feelings', label: 'In pain', phrase: 'I am in pain.', icon: 'bandage', color: c('pink') },
  { category: 'feelings', label: 'Okay', phrase: 'I feel okay.', icon: 'emoticon-neutral', color: c('green') },
];

/** [category key, label] of default buttons that start in Favorites. */
export const DEFAULT_FAVORITES: [string, string][] = [
  ['needs', 'Water'],
  ['needs', 'Bathroom'],
  ['needs', 'Help'],
  ['needs', 'Pain'],
  ['needs', 'Hungry'],
  ['people', 'Dad'],
  ['school', 'Break'],
];

/** Quick phrases pinned in School Mode: [category key, label]. */
export const SCHOOL_MODE_QUICK: [string, string][] = [
  ['school', 'I need help'],
  ['school', 'Break'],
  ['school', "Don't understand"],
  ['school', 'I finished'],
  ['school', 'Bathroom'],
  ['needs', 'Pain'],
  ['needs', 'Water'],
  ['people', 'Teacher'],
];

// ---------------------------------------------------------------------------
// Routine
// ---------------------------------------------------------------------------

export const DEFAULT_ROUTINE_NAME = 'My day';

export const DEFAULT_ROUTINE_ITEMS: { label: string; icon: string; time: string | null }[] = [
  { label: 'Wake up', icon: 'weather-sunset-up', time: '06:30' },
  { label: 'Brush teeth', icon: 'toothbrush', time: null },
  { label: 'Breakfast', icon: 'egg-fried', time: '07:00' },
  { label: 'School', icon: 'school', time: '08:00' },
  { label: 'Lunch', icon: 'food', time: '12:00' },
  { label: 'Rest', icon: 'sofa', time: null },
  { label: 'Homework', icon: 'pencil', time: '15:00' },
  { label: 'Therapy / Activity', icon: 'puzzle', time: '16:00' },
  { label: 'Dinner', icon: 'pot-steam', time: '18:00' },
  { label: 'Bath', icon: 'bathtub', time: null },
  { label: 'Reading', icon: 'book-open-variant', time: null },
  { label: 'Sleep', icon: 'bed', time: '20:00' },
];

// ---------------------------------------------------------------------------
// Therapy / activities
// ---------------------------------------------------------------------------

export const DEFAULT_THERAPY: { name: string; icon: string; instructions: string; durationMinutes: number; frequency: ActivityFrequency }[] = [
  {
    name: 'Stretching',
    icon: 'human-handsup',
    instructions: 'Slowly stretch arms and legs the way your therapist showed you. Take your time.',
    durationMinutes: 10,
    frequency: 'daily',
  },
  {
    name: 'Reach and grab',
    icon: 'hand-wave',
    instructions: 'Place a favourite toy in front. Reach, grab, and bring it close.',
    durationMinutes: 5,
    frequency: 'daily',
  },
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
};
