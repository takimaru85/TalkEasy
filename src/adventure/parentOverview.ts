/**
 * Plain-language pieces of the Parent "Practice overview". Pure, so the wording rules are checked
 * without a device. Everything here describes PRACTICE that was recorded — it never scores, ranks
 * or assesses, and never says anything about real-world communication.
 */
export interface OverviewCounts {
  words: number;
  sounds: number;
  speechExercises: number;
  tracingSessions: number;
}

/** True when nothing has been practised yet, so the screen says so instead of showing four zeros. */
export function isEmptyHistory(c: OverviewCounts): boolean {
  return c.words + c.sounds + c.speechExercises + c.tracingSessions === 0;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** One calm sentence about what has been practised. Never a comparison, never a gap or a streak. */
export function overviewSentence(c: OverviewCounts): string {
  if (isEmptyHistory(c)) return 'No practice has been recorded yet. Whenever you are ready, one short activity is a good start.';
  const parts = [
    c.words > 0 ? plural(c.words, 'different word', 'different words') : null,
    c.sounds > 0 ? plural(c.sounds, 'different sound', 'different sounds') : null,
    c.tracingSessions > 0 ? plural(c.tracingSessions, 'tracing session', 'tracing sessions') : null,
  ].filter((p): p is string => p !== null);
  if (parts.length === 0) return `So far TalkEasy has recorded ${plural(c.speechExercises, 'speech exercise', 'speech exercises')}.`;
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
  return `So far TalkEasy has recorded ${list} practised.`;
}

/** An optional, flexible idea built from today's real session plan. Not a prescribed plan. */
export function suggestionSentence(activities: number, minutes: number): string {
  if (activities <= 0) return 'There is no suggested session right now. Any activity your child enjoys is fine.';
  return `If you would like an idea: today's short session has about ${plural(activities, 'activity', 'activities')} (around ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}). It is optional, and stopping early or skipping a day is completely fine.`;
}

export const CAREGIVER_TIPS: string[] = [
  'Keep it short and playful. A few relaxed minutes is plenty.',
  'Let your child choose the activity when they can.',
  'Celebrate trying, not getting it exactly right. Missed days do not matter.',
  'Practise sounds and words in real moments too: at meals, at play, in the car.',
  'If your child is tired or upset, stop and try another time.',
];

export const PRACTICE_VS_PROGRESS =
  "These numbers count practice done in the app. They are not a test and do not show how your child communicates in everyday life. Your own observations and your child's therapist or teacher are the best guide to that.";

export const SUPPLEMENT_NOTICE =
  'TalkEasy is a supplementary learning tool. It does not replace an individualized plan or advice from a qualified speech-language professional.';
