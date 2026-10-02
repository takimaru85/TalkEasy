import type { LocaleCode } from '@/i18n/types';

/**
 * Domain models used throughout the app.
 * Database rows are snake_case; repositories map them to these camelCase types.
 */

/** A MaterialCommunityIcons glyph name OR an emoji string (the Icon component renders both). */
export type IconName = string;

// ---------------------------------------------------------------------------
// Communication
// ---------------------------------------------------------------------------

export interface Category {
  id: number;
  key: string;
  name: string;
  icon: IconName;
  color: string;
  sortOrder: number;
  isSystem: boolean;
  /** Whether this category appears in the category bar on the Communicate screen. */
  showOnHome: boolean;
}

export interface CommunicationButton {
  id: number;
  categoryId: number;
  /** Short text shown on the tile. */
  label: string;
  /** Full sentence spoken aloud and shown in the phrase banner. */
  phrase: string;
  icon: IconName;
  /** Optional photo (e.g. a real picture of Mom) shown instead of the icon. */
  imageUri: string | null;
  color: string;
  sortOrder: number;
  isSystem: boolean;
  isHidden: boolean;
  /** Also a Speech Practice word ("My Words"). */
  practice: boolean;
  tapCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationButtonInput {
  categoryId: number;
  label: string;
  phrase: string;
  icon: IconName;
  imageUri: string | null;
  color: string;
}

export interface Favorite {
  id: number;
  buttonId: number;
  sortOrder: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Routine
// ---------------------------------------------------------------------------

export interface Routine {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface RoutineItem {
  id: number;
  routineId: number;
  label: string;
  icon: IconName;
  sortOrder: number;
  isDone: boolean;
  /** Optional 'HH:MM' (24h). */
  startTime: string | null;
  /** Which part of the day this step belongs to. */
  segment: RoutineSegment;
  /** Optional short note shown on the card, e.g. "Blue bag today". */
  notes: string;
  /** Optional 'HH:MM' when the step stops being "now" (else: when the next timed step starts). */
  endTime: string | null;
  /** A child screen "Let's go" opens for this step (e.g. Homework → Lessons), or null. */
  linkedActivity: RoutineLink | null;
  /** Skipped today (the day log says so). Done and skipped are both per day. */
  isSkipped: boolean;
}

/** Child screens a My Day step can open. */
export type RoutineLink = 'SpeechPractice' | 'WritingPractice' | 'AdaptiveHome' | 'Learn' | 'Communicate' | 'Activities' | 'Feelings';
export const ROUTINE_LINKS: RoutineLink[] = ['SpeechPractice', 'WritingPractice', 'AdaptiveHome', 'Learn', 'Communicate', 'Activities', 'Feelings'];

export type RoutineSegment = 'morning' | 'school' | 'afternoon' | 'evening';

// ---------------------------------------------------------------------------
// Therapy / activities
// ---------------------------------------------------------------------------

export type ActivityFrequency = 'daily' | 'weekdays' | 'weekly' | 'as_needed';

/**
 * Categories on the Activities screen.
 *
 * 'therapy' was REMOVED (migration 16) when Therapy became its own section: a filter pill listing
 * six older therapy activities, one tap below the card that opens the real Therapy section, was two
 * answers to the same question. Removing it from this type is what also removes it from Parent
 * Mode's category picker, so no new activity can be stranded in a category nothing shows.
 */
export type ActivityCategory = 'games' | 'art' | 'music' | 'exercise' | 'reading' | 'outdoor' | 'sensory' | 'chores';

export interface TherapyActivity {
  id: number;
  name: string;
  icon: IconName;
  instructions: string;
  durationMinutes: number;
  frequency: ActivityFrequency;
  category: ActivityCategory;
  imageUri: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface TherapyActivityInput {
  name: string;
  icon: IconName;
  instructions: string;
  durationMinutes: number;
  frequency: ActivityFrequency;
  category: ActivityCategory;
  imageUri: string | null;
}

export interface ActivityLog {
  id: number;
  therapyActivityId: number;
  completedAt: string;
  note: string;
}

// ---------------------------------------------------------------------------
// School
// ---------------------------------------------------------------------------

export interface Subject {
  id: number;
  name: string;
  icon: IconName;
  color: string;
  teacherName: string;
  notes: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface SubjectInput {
  name: string;
  icon: IconName;
  color: string;
  teacherName: string;
  notes: string;
}

/** 0 = Sunday … 6 = Saturday (matches JS Date.getDay()). */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface SubjectScheduleEntry {
  id: number;
  subjectId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string | null;
}

/** A schedule entry joined with its subject — what "today's subjects" screens render. */
export interface ScheduledSubject extends SubjectScheduleEntry {
  subject: Subject;
}

export interface SubjectMaterial {
  id: number;
  subjectId: number;
  name: string;
  note: string;
  sortOrder: number;
}

export type AssignmentKind = 'assignment' | 'project' | 'exam';
export type AssignmentPriority = 'low' | 'medium' | 'high';
export type AssignmentStatus = 'todo' | 'in_progress' | 'done';

export interface Assignment {
  id: number;
  subjectId: number | null;
  title: string;
  description: string;
  kind: AssignmentKind;
  /** ISO date 'YYYY-MM-DD' or null. */
  dateAssigned: string | null;
  dueDate: string | null;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  notes: string;
  photoUri: string | null;
  attachmentUri: string | null;
  attachmentName: string | null;
  /**
   * Scan Assignment (src/scan). Empty on an assignment that was typed in rather than scanned.
   *
   * `scanText` is what the text engine READ and is never rewritten — `description` carries what the
   * grown-up corrected it to, so the original is always recoverable. `scanType` is the parser's
   * reading of it, which never replaces the text either.
   */
  scanText: string;
  scanLanguage: string;
  scanType: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Assignment joined with its subject (may be null if the subject was deleted). */
export interface AssignmentWithSubject extends Assignment {
  subject: Subject | null;
}

export interface AssignmentInput {
  subjectId: number | null;
  title: string;
  description: string;
  kind: AssignmentKind;
  dateAssigned: string | null;
  dueDate: string | null;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  notes: string;
  photoUri: string | null;
  attachmentUri: string | null;
  attachmentName: string | null;
  /** Scan Assignment fields; omitted (and defaulted empty) for an assignment typed in by hand. */
  scanText?: string;
  scanLanguage?: string;
  scanType?: string;
}

export type SchoolEventType = 'event' | 'holiday' | 'meeting' | 'reminder' | 'exam' | 'project';

export interface SchoolEvent {
  id: number;
  title: string;
  eventType: SchoolEventType;
  subjectId: number | null;
  /** ISO date 'YYYY-MM-DD'. */
  date: string;
  time: string | null;
  notes: string;
  createdAt: string;
}

export interface SchoolEventInput {
  title: string;
  eventType: SchoolEventType;
  subjectId: number | null;
  date: string;
  time: string | null;
  notes: string;
}

/** One line on the calendar: either an assignment (by due date) or a school event. */
export interface CalendarEntry {
  key: string;
  date: string;
  time: string | null;
  title: string;
  icon: IconName;
  color: string;
  source: 'assignment' | 'event';
  assignment?: AssignmentWithSubject;
  event?: SchoolEvent;
}

// ---------------------------------------------------------------------------
// Learning
// ---------------------------------------------------------------------------

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface LearningActivityConfig {
  activityKey: string;
  isEnabled: boolean;
  /** null = follow the global setting. */
  difficulty: Difficulty | null;
}

export interface LearningProgressEntry {
  id: number;
  activityKey: string;
  subjectKey: string;
  difficulty: Difficulty;
  correct: number;
  total: number;
  playedAt: string;
}

export interface LearningSubjectStats {
  subjectKey: string;
  sessions: number;
  correct: number;
  total: number;
  lastPlayedAt: string | null;
}

// ---------------------------------------------------------------------------
// Child profile & rewards
// ---------------------------------------------------------------------------

/** Theme accent chosen for the child ("favourite colour"). */
export type ThemeColorKey = 'blue' | 'green' | 'yellow' | 'purple' | 'coral' | 'teal' | 'orange';

export interface ProfileFavorites {
  subjects: string[];
  activities: string[];
  foods: string[];
  people: string[];
}

export interface CommunicationPreferences {
  /** Show the "Recent" strip on the Talk screen. */
  showRecent: boolean;
  /** "I want..." style starters compose with the next tile ("I want water"). */
  sentenceBuilder: boolean;
  /** Speak the whole sentence ("I want water, please.") or just the label ("Water"). */
  speakFullPhrase: boolean;
}

export interface RewardPreferences {
  /** Stars granted per event type. */
  starsPerLearningSession: number;
  starsPerPerfectSession: number;
  starsPerRoutineStep: number;
  starsPerActivity: number;
  starsPerAssignment: number;
  /** Spoken/shown when a star is earned. The text {name} is replaced with the child's name. */
  celebrationMessage: string;
}

export interface ChildProfile {
  id: number;
  name: string;
  nickname: string;
  age: number | null;
  grade: string;
  school: string;
  /** Emoji avatar, used when there is no photo. */
  avatar: string;
  photoUri: string | null;
  favoriteColor: ThemeColorKey;
  favorites: ProfileFavorites;
  communication: CommunicationPreferences;
  rewards: RewardPreferences;
  learningGoals: string;
  difficulty: Difficulty;
  /** Adaptive Learning: how much help the child gets. */
  assistanceLevel: 'guided' | 'assisted' | 'independent';
  /** Adaptive Learning: the answer method offered first (null = let the activity decide). */
  preferredMethod: 'tap' | 'picture' | 'match' | 'type' | 'speak' | 'write' | 'assisted' | null;
  isActive: boolean;
  createdAt: string;
}

export type ChildProfileInput = Omit<ChildProfile, 'id' | 'isActive' | 'createdAt'>;

export interface Reward {
  id: number;
  title: string;
  icon: IconName;
  starsRequired: number;
  sortOrder: number;
  createdAt: string;
}

export type StarSource = 'learning' | 'routine' | 'activity' | 'assignment' | 'manual' | 'reward';

export interface StarEvent {
  id: number;
  /** Positive = earned, negative = spent on a reward. */
  amount: number;
  reason: string;
  source: StarSource;
  createdAt: string;
}

export interface StarSummary {
  total: number;
  earnedToday: number;
  /** Next reward not yet affordable, or null when every reward is reachable. */
  nextReward: Reward | null;
}

// ---------------------------------------------------------------------------
// Notes & settings
// ---------------------------------------------------------------------------

/**
 * Note categories. 'observation' and 'general' are from earlier versions and stay readable;
 * new notes use the others. 'teacher' and 'reminder' power Care → Teacher notes / Reminders.
 */
export type NoteType = 'speech' | 'school' | 'behavior' | 'activity' | 'teacher' | 'reminder' | 'other' | 'observation' | 'general';

export interface CaregiverNote {
  id: number;
  noteType: NoteType;
  title: string;
  body: string;
  /** A copy in the app's private storage (services/files), or null. */
  photoUri: string | null;
  /** The day the note is about, YYYY-MM-DD (defaults to the day it was written). */
  noteDate: string;
  createdAt: string;
}

export interface CaregiverNoteInput {
  noteType: NoteType;
  title: string;
  body: string;
  photoUri?: string | null;
  noteDate?: string | null;
}

export type SizeOption = 'medium' | 'large' | 'xlarge';

export interface AppSettings {
  speechRate: number;
  speechPitch: number;
  /** Device voice identifier, or null for the system default. */
  speechVoice: string | null;
  buttonSize: SizeOption;
  textSize: SizeOption;
  hapticsEnabled: boolean;
  parentPin: string;
  /** Open the app directly in School Mode. */
  schoolModeAtStart: boolean;
  /** Default difficulty for learning activities. */
  learningDifficulty: Difficulty;
  /** Ask "Are you sure?" before the child marks something done. */
  confirmComplete: boolean;
  /** Stronger borders, black-on-white text, no tinted backgrounds. */
  highContrast: boolean;
  /** Disable tap/celebration animations and screen transitions. */
  reducedMotion: boolean;
  /** Master switch for spoken feedback (TTS). Communication tiles still speak. */
  soundEnabled: boolean;
  /** Screen rotation: 'auto' = landscape allowed on tablets only. */
  rotation: RotationMode;
  /**
   * UI language and letterform style (see src/i18n). US English is the default; changing this
   * never rewrites the database — content is translated as it is rendered.
   */
  language: LocaleCode;
  /** Speech Practice activities the parent has hidden from the child (comma list of ids). */
  speechPracticeHidden: string;
  /** Comma-separated ids of guided tours already seen or skipped. Never shown twice. */
  toursDone: string;
  /** Speech Practice pronunciation set (see speechpractice/pronunciation.ts). English only for now. */
  /** Vowel values for the syllable drill. Source of truth: speechpractice/pronunciation.ts. */
  speechPronunciationSet: 'en' | 'fil';
  /**
   * Per-device pronunciation corrections chosen in Parent Mode → Pronunciation test:
   * JSON { "en|syllable:bo": { text, locale } }. Defaults live in speechpractice/pronunciationDictionary.ts.
   */
  speechPronunciationOverrides: string;
  /**
   * Choose Your Adventure (src/adventure/worlds.ts): a fixed world picked by the grown-up, or
   * 'child' to let the child choose.
   */
  adventureTheme: 'child' | 'space' | 'dinosaurs' | 'animals' | 'vehicles';
  /** The world the child picked ('' = not chosen yet, which shows Space). */
  adventureWorld: '' | 'space' | 'dinosaurs' | 'animals' | 'vehicles';
  /** Therapy goals a grown-up has chosen, as a comma list (see src/therapy). '' = none chosen. */
  therapyGoals: string;
  /** Therapy activities a grown-up has switched off, as a comma list of activity ids. */
  therapyHidden: string;
  /**
   * When the therapy safety notice was last acknowledged (ISO date), or '' if it has not been.
   *
   * A DATE rather than a flag: the notice is the one thing in this section that must not become
   * invisible furniture, and storing when it was seen leaves the door open to showing it again.
   */
  therapySafetyAcceptedAt: string;
  /**
   * The family's TalkEasy Plus entitlement, as JSON (see src/subscription).
   *
   * A RECORD, not a flag: it carries the plan, where it came from, the product and an expiry, so
   * a lapsed subscription can be noticed and a development entitlement can never be mistaken for a
   * store one. Anything unreadable is treated as Free. '' means Free.
   */
  subscriptionStatus: string;
}

export type RotationMode = 'auto' | 'always' | 'portrait';
