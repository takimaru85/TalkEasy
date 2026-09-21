/**
 * Adaptive Learning & Accessible Schoolwork — domain types.
 *
 * The lesson content and answer method are separate: an activity has a learning objective
 * (question + accepted answers) and a set of ALLOWED answer methods. The child (or parent)
 * picks the method that works for their body that day — the objective never changes.
 */

/** How the child can give an answer. */
export type AnswerMethod = 'tap' | 'picture' | 'match' | 'type' | 'speak' | 'write' | 'assisted';

export const ALL_ANSWER_METHODS: AnswerMethod[] = ['tap', 'picture', 'match', 'type', 'speak', 'write', 'assisted'];

export const ANSWER_METHOD_META: Record<AnswerMethod, { label: string; emoji: string; short: string; description: string }> = {
  tap: { label: 'Choose the answer', emoji: '👆', short: 'Tap', description: 'Tap one of the big cards.' },
  picture: { label: 'Pick the picture', emoji: '🖼️', short: 'Picture', description: 'Tap the matching picture.' },
  match: { label: 'Match them', emoji: '🔗', short: 'Match', description: 'Tap a pair to match them (no dragging needed).' },
  type: { label: 'Type the answer', emoji: '⌨️', short: 'Type', description: 'Use the big keyboard.' },
  speak: { label: 'Say the answer', emoji: '🎤', short: 'Speak', description: 'Tap the microphone and say it.' },
  write: { label: 'Write the answer', emoji: '✍️', short: 'Write', description: 'Write with your finger — any size is fine.' },
  assisted: { label: 'Tell a grown-up', emoji: '🙋', short: 'Helper', description: 'Say or show the answer; a parent or teacher taps ✓.' },
};

/** What kind of learning activity this is (drives the default method and the UI). */
export type ActivityType = 'mcq' | 'picture' | 'matching' | 'typing' | 'speaking' | 'writing';

export const ACTIVITY_TYPE_META: Record<ActivityType, { label: string; emoji: string; defaultMethods: AnswerMethod[] }> = {
  mcq: { label: 'Multiple choice', emoji: '👆', defaultMethods: ['tap', 'speak', 'assisted'] },
  picture: { label: 'Picture question', emoji: '🖼️', defaultMethods: ['picture', 'speak', 'assisted'] },
  matching: { label: 'Matching', emoji: '🔗', defaultMethods: ['match', 'assisted'] },
  typing: { label: 'Typing question', emoji: '⌨️', defaultMethods: ['type', 'speak', 'tap', 'write', 'assisted'] },
  speaking: { label: 'Speaking question', emoji: '🎤', defaultMethods: ['speak', 'assisted', 'type'] },
  writing: { label: 'Writing practice', emoji: '✍️', defaultMethods: ['write', 'type', 'assisted'] },
};

/** How much help the child gets. Stored on the child profile; parent-adjustable. */
export type AssistanceLevel = 'guided' | 'assisted' | 'independent';

export const ASSISTANCE_META: Record<AssistanceLevel, { label: string; emoji: string; description: string; choices: number; hintAlways: boolean }> = {
  guided: { label: 'Guided', emoji: '🟢', description: 'Big prompts, hint shown, only 2 choices.', choices: 2, hintAlways: true },
  assisted: { label: 'Assisted', emoji: '🟡', description: '3 choices, hint on request.', choices: 3, hintAlways: false },
  independent: { label: 'Independent', emoji: '🔵', description: 'All choices, minimal help, more typing/speaking.', choices: 4, hintAlways: false },
};

export interface Choice {
  label: string;
  emoji?: string;
  correct: boolean;
}

/** A matching pair (left ↔ right). */
export interface MatchPair {
  left: string;
  leftEmoji?: string;
  right: string;
  rightEmoji?: string;
}

export interface LessonActivity {
  id: number;
  lessonId: number;
  type: ActivityType;
  question: string;
  /** Optional big picture (emoji) shown with the question. */
  image: string | null;
  /** For mcq/picture. */
  choices: Choice[];
  /** For matching. */
  pairs: MatchPair[];
  /** Accepted answers for typing/speaking (case/punctuation-insensitive). */
  answers: string[];
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  allowedMethods: AnswerMethod[];
  sortOrder: number;
}

export type LessonActivityInput = Omit<LessonActivity, 'id' | 'lessonId' | 'sortOrder'>;

export interface Lesson {
  id: number;
  subjectId: number | null;
  title: string;
  gradeLevel: string;
  /** Simple explanation shown before the questions (may be pasted from the school lesson). */
  content: string;
  /** Visual vocabulary lines, e.g. "☀️ Sunlight". One per line. */
  vocabulary: string[];
  objectives: string;
  /** ISO date to show under "Today's schoolwork"; null = always available. */
  assignedDate: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export type LessonInput = Omit<Lesson, 'id' | 'sortOrder' | 'createdAt'>;

export interface LessonWithSubject extends Lesson {
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;
  activityCount: number;
  /** Activities answered correctly (or completed) by the active child. */
  completedCount: number;
}

export interface AdaptiveAttempt {
  id: number;
  childId: number;
  lessonId: number;
  activityId: number;
  answerMethod: AnswerMethod;
  correct: boolean;
  attempts: number;
  answerText: string;
  completedAt: string;
}

export interface HandwritingSession {
  id: number;
  childId: number;
  level: number;
  item: string;
  strokes: number;
  durationMs: number;
  completedAt: string;
}

/** Summary used by the child dashboard and the parent progress screen. */
export interface AdaptiveProgress {
  /** Learning progress = correct / attempted activities (NOT handwriting). */
  learningPercent: number;
  questionsAnswered: number;
  correctAnswers: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  /** Per subject: correct / total. */
  subjects: { subjectId: number | null; name: string; icon: string; correct: number; total: number }[];
  /** Answer-method usage (which methods the child actually uses). */
  methods: { method: AnswerMethod; count: number; correct: number }[];
  /** Motor practice — kept separate on purpose. */
  handwritingSessions: number;
  handwritingLevelsPractised: number[];
  handwritingPercent: number;
  speechAnswers: { count: number; correct: number };
  typingAnswers: { count: number; correct: number };
}
