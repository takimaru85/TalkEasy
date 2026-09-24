import type {
  ActivityCategory,
  ActivityFrequency,
  AssignmentKind,
  AssignmentPriority,
  AssignmentStatus,
  DayOfWeek,
  RoutineSegment,
  Difficulty,
  SchoolEventType,
} from '@/types/models';

interface Meta {
  label: string;
  icon: string;
  color: string;
}

export const STATUS_META: Record<AssignmentStatus, Meta & { childLabel: string }> = {
  todo: { label: 'To Do', childLabel: 'Not finished', icon: 'checkbox-blank-outline', color: '#FFF3A8' },
  in_progress: { label: 'In Progress', childLabel: 'Working on it', icon: 'progress-clock', color: '#BFE0FF' },
  done: { label: 'Done', childLabel: 'Completed', icon: 'check-circle', color: '#C4F2C8' },
};

export const STATUS_ORDER: AssignmentStatus[] = ['todo', 'in_progress', 'done'];

export const KIND_META: Record<AssignmentKind, Meta> = {
  assignment: { label: 'Assignment', icon: 'pencil', color: '#FFF3A8' },
  project: { label: 'Project', icon: 'palette', color: '#DED0FF' },
  exam: { label: 'Exam', icon: 'clipboard-text-outline', color: '#FFC9DC' },
};

export const PRIORITY_META: Record<AssignmentPriority, Meta> = {
  low: { label: 'Low', icon: 'arrow-down', color: '#E4E4E4' },
  medium: { label: 'Medium', icon: 'minus', color: '#FFF3A8' },
  high: { label: 'High', icon: 'alert-decagram', color: '#FFC9DC' },
};

export const EVENT_TYPE_META: Record<SchoolEventType, Meta> = {
  event: { label: 'School event', icon: 'calendar-star', color: '#BFE0FF' },
  holiday: { label: 'Holiday', icon: 'beach', color: '#C4F2C8' },
  meeting: { label: 'Teacher meeting', icon: 'account-group', color: '#DED0FF' },
  reminder: { label: 'Reminder', icon: 'bell', color: '#FFF3A8' },
  exam: { label: 'Exam', icon: 'clipboard-text-outline', color: '#FFC9DC' },
  project: { label: 'Project', icon: 'palette', color: '#FFD9B0' },
};

export const FREQUENCY_META: Record<ActivityFrequency, { label: string }> = {
  daily: { label: 'Every day' },
  weekdays: { label: 'School days' },
  weekly: { label: 'Once a week' },
  as_needed: { label: 'As needed' },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string; icon: string }> = {
  easy: { label: 'Easy', icon: 'star-outline' },
  medium: { label: 'Medium', icon: 'star-half-full' },
  hard: { label: 'Hard', icon: 'star' },
};

export const DAY_NAMES: Record<DayOfWeek, { short: string; long: string }> = {
  0: { short: 'Sun', long: 'Sunday' },
  1: { short: 'Mon', long: 'Monday' },
  2: { short: 'Tue', long: 'Tuesday' },
  3: { short: 'Wed', long: 'Wednesday' },
  4: { short: 'Thu', long: 'Thursday' },
  5: { short: 'Fri', long: 'Friday' },
  6: { short: 'Sat', long: 'Saturday' },
};

export const SCHOOL_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5];
export const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

/** Emoji used for the child's home grid and section headers. */
export const SECTION_EMOJI = {
  communicate: '🗣️',
  school: '🎒',
  assignments: '📝',
  learn: '📚',
  myday: '📅',
  activities: '🧩',
  favorites: '⭐',
  parent: '👨‍👩‍👧',
  schoolMode: '🏫',
  calendar: '🗓️',
} as const;

export const ACTIVITY_CATEGORY_META: Record<ActivityCategory, { label: string; emoji: string; color: string }> = {
  games: { label: 'Games', emoji: '🎲', color: '#FFF1C2' },
  art: { label: 'Art', emoji: '🎨', color: '#FFDBEA' },
  music: { label: 'Music', emoji: '🎵', color: '#E8DFFF' },
  exercise: { label: 'Exercise', emoji: '🏃', color: '#DDF5E3' },
  reading: { label: 'Reading', emoji: '📖', color: '#DCEBFF' },
  outdoor: { label: 'Outdoor', emoji: '🌳', color: '#D3F3F0' },
  sensory: { label: 'Sensory', emoji: '🖐️', color: '#FFE3C7' },
  chores: { label: 'Chores', emoji: '🧹', color: '#ECEEF2' },
  therapy: { label: 'Therapy', emoji: '🧩', color: '#FFD9D3' },
};

export const ROUTINE_SEGMENT_META: Record<RoutineSegment, { label: string; emoji: string }> = {
  morning: { label: 'Morning', emoji: '🌅' },
  school: { label: 'School', emoji: '🏫' },
  afternoon: { label: 'After school', emoji: '🌤️' },
  evening: { label: 'Evening', emoji: '🌙' },
};

/** Soft tint per part of the day (TileColors): icons are drawn in its matching ink. */
export const ROUTINE_SEGMENT_TINT: Record<RoutineSegment, string> = {
  morning: '#FFE3C7',
  school: '#DCEBFF',
  afternoon: '#D3F3F0',
  evening: '#E8DFFF',
};
