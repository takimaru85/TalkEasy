/**
 * What counts as COMPLETING a task, and what that is worth. Pure: no React, no storage, so the rules can
 * be checked in Node and read in one place.
 *
 * NOT ONE RULE FOR EVERYTHING. Each kind of task is verified by what the app can actually observe:
 *
 *  quiz / perfect  every configured question was answered (the screen only reaches its finish step after
 *                  the last question). A wrong answer is never a failed attempt, only another go.
 *  lesson          every question in the lesson's queue was answered.
 *  practice        at least ONE step of the voice-practice session was completed. We never judge
 *                  pronunciation: there is no recogniser deciding whether a child "said it right".
 *  routine         ticked on My Day. Self-reported and CANNOT be verified; credited once per step per day.
 *  offline         a real-world activity (a walk, a drawing, a chore). The app cannot see it, so it waits
 *                  for a grown-up to confirm in Parent Mode before any star is credited.
 *  assignment      homework. Same: waits for a grown-up.
 *
 * Writing and tracing award no stars today; their guard is `isMeaningfulTrace`, which stops an empty
 * canvas being "finished" and advancing a child's progress.
 */
export type ClaimKind = 'quiz' | 'perfect' | 'lesson' | 'practice' | 'routine' | 'offline' | 'assignment';

/** Where stars of each kind are tallied in the ledger (the existing `StarSource`). */
export type ClaimSource = 'learning' | 'routine' | 'activity' | 'assignment';

interface Policy {
  /** True when the app cannot verify it and a grown-up must confirm first. */
  requiresParent: boolean;
  source: ClaimSource;
  /** One sentence a child can read: what they need to do. */
  childHint: string;
}

export const CLAIM_POLICY: Record<ClaimKind, Policy> = {
  quiz: { requiresParent: false, source: 'learning', childHint: 'Answer all the questions to earn your star.' },
  perfect: { requiresParent: false, source: 'learning', childHint: 'Get every question right the first time for a bonus star.' },
  lesson: { requiresParent: false, source: 'learning', childHint: 'Finish the lesson to earn your star.' },
  practice: { requiresParent: false, source: 'activity', childHint: 'Finish one practice step to earn your star.' },
  routine: { requiresParent: false, source: 'routine', childHint: 'Tick a step when you have done it.' },
  offline: { requiresParent: true, source: 'activity', childHint: 'Do the activity, then tap Done. A grown-up will check it.' },
  assignment: { requiresParent: true, source: 'assignment', childHint: 'Finish your work, then tap Done. A grown-up will check it.' },
};

/** The grown-up's own settings (`profile.rewards`). The ONLY place an amount comes from. */
export interface RewardRates {
  starsPerLearningSession: number;
  starsPerPerfectSession: number;
  starsPerRoutineStep: number;
  starsPerActivity: number;
  starsPerAssignment: number;
}

/** How many stars a completion of this kind is worth. Screens never choose an amount. */
export function starsFor(kind: ClaimKind, rates: RewardRates): number {
  const n =
    kind === 'quiz' || kind === 'lesson' ? rates.starsPerLearningSession
    : kind === 'perfect' ? rates.starsPerPerfectSession
    : kind === 'routine' ? rates.starsPerRoutineStep
    : kind === 'assignment' ? rates.starsPerAssignment
    : rates.starsPerActivity; // practice, offline
  return Math.max(0, Math.round(Number.isFinite(n) ? n : 0));
}

/**
 * The claim KEY: one per task completion, built from what makes the completion unique. Screens use these
 * builders, so the same completion always produces the same key and a second claim for it is a no-op.
 *  - a quiz or lesson play  -> the play's own id (a replay is a NEW completion and earns again);
 *  - a routine step         -> that step on that day;
 *  - an offline activity    -> that activity on that day;
 *  - an assignment          -> that assignment, once.
 */
export const claimKey = {
  quiz: (activityKey: string, playId: number) => `quiz:${activityKey}:${playId}`,
  perfect: (activityKey: string, playId: number) => `perfect:${activityKey}:${playId}`,
  lesson: (lessonId: number, playId: number) => `lesson:${lessonId}:${playId}`,
  practice: (sessionId: number) => `practice:${sessionId}`,
  routine: (itemId: number, isoDate: string) => `routine:${itemId}:${isoDate}`,
  offline: (activityId: number, isoDate: string) => `offline:${activityId}:${isoDate}`,
  assignment: (assignmentId: number) => `assignment:${assignmentId}`,
};

/** The five states a task can be in. 'not_started' and 'in_progress' are the absence of a claim. */
export type CompletionState = 'not_started' | 'in_progress' | 'awaiting_parent' | 'completed' | 'reward_credited';
export type ClaimStatus = 'awaiting_parent' | 'credited' | 'declined';

export function completionState(status: ClaimStatus | null | undefined, inProgress: boolean): CompletionState {
  if (status === 'credited') return 'reward_credited';
  if (status === 'awaiting_parent') return 'awaiting_parent';
  // A declined claim is not a failure: the task simply has no reward yet and can be done again.
  return inProgress ? 'in_progress' : 'not_started';
}

/** A gentle line for a task awaiting a grown-up. */
export const AWAITING_MESSAGE = 'Great work! A grown-up will check it, then your star is yours.';

// ---- writing and tracing ---------------------------------------------------------------------------

/** One finger-drag is at least this long, in points, to count as a stroke rather than a tap. */
export const MIN_STROKE_LENGTH = 24;

/**
 * Is there enough on the canvas to call it a try? At least one real stroke (not a dot from a tap) — that
 * is all. It does NOT judge accuracy, because a child who traces wobbly is still tracing, and a child with
 * limited motor control must be able to finish. `strokeLengths` is the length of each stroke in points.
 */
export function isMeaningfulTrace(strokeLengths: readonly number[]): boolean {
  return strokeLengths.some((l) => l >= MIN_STROKE_LENGTH);
}

/** The drawn length of an SVG path of `M x y L x y ...` segments, in points (0 for anything it cannot read). */
export function pathLength(d: string): number {
  const n = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let total = 0;
  for (let i = 2; i + 1 < n.length; i += 2) total += Math.hypot(n[i] - n[i - 2], n[i + 1] - n[i - 1]);
  return total;
}

/** What to say when Done is pressed on an empty or near-empty canvas. Encouraging, never accusing. */
export const EMPTY_TRACE_MESSAGE = 'Trace with your finger first, then tap Done.';
