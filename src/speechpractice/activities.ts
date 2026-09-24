import { tileColor } from '@/constants/colors';
import type { ActivityDef, ActivityId, SpeechLevel } from './types';

/**
 * The 20 Speech Practice activities, grouped by level.
 *
 * The level is an organisational guide for a grown-up, NOT a clinical difficulty rating, and
 * nothing is locked: every activity the parent has not hidden is always available.
 */
export const ACTIVITIES: ActivityDef[] = [
  // 🟢 Beginner
  { id: 'listening', emoji: '👂', icon: 'ear-hearing', tint: tileColor('blue'), titleKey: 'spListening', level: 'beginner' },
  { id: 'imitation', emoji: '🔄', icon: 'mirror', tint: tileColor('purple'), titleKey: 'spImitation', level: 'beginner' },
  { id: 'sounds', emoji: '👄', icon: 'waveform', tint: tileColor('coral'), titleKey: 'spSounds', level: 'beginner', route: 'SoundPractice' },
  { id: 'syllables', emoji: '🔤', icon: 'format-letter-case', tint: tileColor('orange'), titleKey: 'spSyllables', level: 'beginner' },
  { id: 'memory', emoji: '🧠', icon: 'brain', tint: tileColor('pink'), titleKey: 'spMemory', level: 'beginner' },
  // 🟡 Intermediate
  { id: 'words', emoji: '🧸', icon: 'cards-outline', tint: tileColor('green'), titleKey: 'spWords', level: 'intermediate' },
  { id: 'vocabulary', emoji: '📚', icon: 'book-alphabet', tint: tileColor('teal'), titleKey: 'spVocabulary', level: 'intermediate' },
  { id: 'pictureNaming', emoji: '🖼️', icon: 'image-text', tint: tileColor('yellow'), titleKey: 'spPictureNaming', level: 'intermediate' },
  { id: 'repetition', emoji: '🗣️', icon: 'repeat', tint: tileColor('blue'), titleKey: 'spRepetition', level: 'intermediate' },
  { id: 'directions', emoji: '🎯', icon: 'gesture-tap-button', tint: tileColor('orange'), titleKey: 'spDirections', level: 'intermediate' },
  { id: 'matching', emoji: '🧩', icon: 'puzzle-outline', tint: tileColor('purple'), titleKey: 'spMatching', level: 'intermediate' },
  { id: 'phrases', emoji: '💬', icon: 'chat-processing-outline', tint: tileColor('teal'), titleKey: 'spPhrases', level: 'intermediate' },
  // 🔵 Advanced
  { id: 'sentences', emoji: '🧱', icon: 'text-box-edit-outline', tint: tileColor('green'), titleKey: 'spSentences', level: 'advanced' },
  { id: 'questions', emoji: '❓', icon: 'comment-question-outline', tint: tileColor('blue'), titleKey: 'spQuestions', level: 'advanced' },
  { id: 'stories', emoji: '📖', icon: 'book-open-page-variant-outline', tint: tileColor('orange'), titleKey: 'spStories', level: 'advanced' },
  { id: 'social', emoji: '😊', icon: 'account-heart-outline', tint: tileColor('pink'), titleKey: 'spSocial', level: 'advanced' },
  { id: 'turnTaking', emoji: '🔁', icon: 'swap-horizontal', tint: tileColor('teal'), titleKey: 'spTurnTaking', level: 'advanced' },
  { id: 'rolePlay', emoji: '🎭', icon: 'drama-masks', tint: tileColor('purple'), titleKey: 'spRolePlay', level: 'advanced' },
  { id: 'rhythm', emoji: '🎵', icon: 'music-note-eighth', tint: tileColor('yellow'), titleKey: 'spRhythm', level: 'advanced' },
  { id: 'voice', emoji: '📢', icon: 'volume-high', tint: tileColor('coral'), titleKey: 'spVoice', level: 'advanced' },
];

export const LEVELS: { level: SpeechLevel; emoji: string; titleKey: 'spLevelBeginner' | 'spLevelIntermediate' | 'spLevelAdvanced' }[] = [
  { level: 'beginner', emoji: '🟢', titleKey: 'spLevelBeginner' },
  { level: 'intermediate', emoji: '🟡', titleKey: 'spLevelIntermediate' },
  { level: 'advanced', emoji: '🔵', titleKey: 'spLevelAdvanced' },
];

/** English names for Parent Mode (which is English-only, see docs/ARCHITECTURE.md). */
export const ACTIVITY_NAMES: Record<ActivityId, string> = {
  sounds: 'Sounds',
  syllables: 'Syllables',
  words: 'Words',
  listening: 'Listening',
  matching: 'Sound Matching',
  pictureNaming: 'Picture Naming',
  imitation: 'Imitation',
  repetition: 'Word Repetition',
  phrases: 'Phrase Practice',
  sentences: 'Sentence Building',
  questions: 'WH Questions',
  stories: 'Story Practice',
  directions: 'Following Directions',
  vocabulary: 'Vocabulary',
  turnTaking: 'Turn Taking',
  social: 'Social Communication',
  rolePlay: 'Role Play',
  memory: 'Memory Practice',
  rhythm: 'Rhythm & Rhyme',
  voice: 'Voice Practice',
};

/** Activities whose items count towards "Words practiced". */
export const WORD_ACTIVITIES: ActivityId[] = ['words', 'vocabulary', 'repetition', 'pictureNaming', 'listening'];

export function getActivityDef(id: string): ActivityDef | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

export function isActivityId(id: string): id is ActivityId {
  return ACTIVITIES.some((a) => a.id === id);
}

/** Parses the parent's "hidden activities" setting (a comma list). Unknown ids are ignored. */
export function parseHiddenActivities(value: string): Set<ActivityId> {
  return new Set(value.split(',').map((s) => s.trim()).filter(isActivityId));
}

export function serializeHiddenActivities(hidden: Set<ActivityId>): string {
  return ACTIVITIES.filter((a) => hidden.has(a.id)).map((a) => a.id).join(',');
}
