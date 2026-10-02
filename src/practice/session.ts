import { PRACTICE_ACTIVITIES } from './content';
import { buildExercises } from './engine';
import type { PracticeActivityDef, PracticeAreaId } from './types';

/**
 * A short practice session — warm up, two activities, a bit of practice, a reward, finish.
 *
 * WHY SHORT IS THE WHOLE POINT. A session is built to run for roughly five to eight minutes and it
 * is capped, not paced: it CANNOT grow into a long one, because the thing that makes short daily
 * practice work is that it ends while the child is still enjoying it. An app that kept offering
 * "one more" would reliably turn practice into something to avoid.
 *
 * A session can be stopped at any moment and nothing is lost: every exercise is logged as it is
 * finished (the activity screen does that), so a child who manages two minutes has two minutes of
 * practice recorded. There is no "session completed" flag to miss out on, deliberately — a reward
 * that only arrives at the end would punish the child who needed to stop.
 *
 * THE ORDER IS THE DEVELOPMENTAL ORDER. A warm-up always comes from listening or early
 * communication, so a session opens with something that needs no speech and that almost any child
 * can succeed at. Only then does it ask for more.
 */

export type SessionStepKind = 'warmup' | 'activity' | 'practice';

export interface SessionStep {
  kind: SessionStepKind;
  activityId: string;
  /** How many of that activity's exercises this step uses. Small on purpose. */
  count: number;
}

export interface SessionPlan {
  /** Stable for a given seed, so re-opening the hub does not reshuffle the plan mid-session. */
  id: string;
  steps: SessionStep[];
  /** Exercises across the whole session. The cap that keeps it short. */
  totalExercises: number;
  estimatedMinutes: number;
}

/** Roughly how long one exercise takes, including listening to the model and having a go. */
const SECONDS_PER_EXERCISE = 38;

/** Nothing above this, ever. A session that runs longer stops being a short session. */
export const MAX_SESSION_EXERCISES = 12;

/** Areas a warm-up may come from: listening and joining in, never production. */
const WARMUP_AREAS: PracticeAreaId[] = ['attention', 'early'];
/** The middle of a session: understanding, sounds, voice. */
const MAIN_AREAS: PracticeAreaId[] = ['understanding', 'sounds', 'intonation', 'listening', 'focus'];
/** The end: using it with someone. */
const PRACTICE_AREAS_END: PracticeAreaId[] = ['turns', 'conversation', 'expressive', 'expression'];

/** A small deterministic shuffle, so the same seed always gives the same session. */
function rotate<T>(items: T[], seed: number): T[] {
  if (items.length === 0) return items;
  const at = seed % items.length;
  return [...items.slice(at), ...items.slice(0, at)];
}

function firstWithExercises(areas: PracticeAreaId[], seed: number, used: Set<string>): PracticeActivityDef | undefined {
  for (const area of rotate(areas, seed)) {
    const candidates = rotate(PRACTICE_ACTIVITIES.filter((a) => a.category === area), seed);
    const found = candidates.find((a) => !used.has(a.id) && buildExercises(a.id).length > 0);
    if (found) return found;
  }
  return undefined;
}

/**
 * Builds today's session.
 *
 * `seed` is a number that changes daily (see `sessionSeed`), so a child gets a different shape
 * each day but the SAME one all day — re-opening the screen must not hand them a different plan
 * halfway through.
 */
export function buildSession(seed: number): SessionPlan {
  const used = new Set<string>();
  const steps: SessionStep[] = [];

  const add = (kind: SessionStepKind, areas: PracticeAreaId[], count: number, offset: number) => {
    const activity = firstWithExercises(areas, seed + offset, used);
    if (!activity) return;
    used.add(activity.id);
    const available = buildExercises(activity.id).length;
    steps.push({ kind, activityId: activity.id, count: Math.min(count, available) });
  };

  add('warmup', WARMUP_AREAS, 2, 0);
  add('activity', MAIN_AREAS, 3, 1);
  add('activity', MAIN_AREAS, 3, 2);
  add('practice', PRACTICE_AREAS_END, 2, 3);

  // The cap, applied to the plan rather than trusted to the numbers above.
  let total = 0;
  const capped: SessionStep[] = [];
  for (const step of steps) {
    const room = MAX_SESSION_EXERCISES - total;
    if (room <= 0) break;
    const count = Math.min(step.count, room);
    capped.push({ ...step, count });
    total += count;
  }

  return {
    id: `s${seed}`,
    steps: capped,
    totalExercises: total,
    estimatedMinutes: Math.max(1, Math.round((total * SECONDS_PER_EXERCISE) / 60)),
  };
}

/** A seed that changes once a day, in the child's own timezone. */
export function sessionSeed(now = new Date()): number {
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
}
