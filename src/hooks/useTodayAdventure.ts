import { speechPracticeRepo } from '@/database';
import { buildSession, sessionSeed } from '@/practice/session';
import { SOUND_TARGETS, TARGET_STEPS } from '@/speechpractice/targets';
import { evaluateMap, type MapStageState } from '@/adventure/adventureMap';
import { useAchievements } from './useAchievements';
import { useDbQuery } from './useDbQuery';

/**
 * What the Home screen offers the child TODAY.
 *
 * The point of this hook is that the home screen stops saying "Continue your journey" — a sentence
 * that is true of every day and tells a child nothing — and starts saying what today actually is.
 * Both numbers below are REAL: the plan comes from the same session builder the Practice Time
 * screen runs, and the sound comes from what the child has actually practised. Nothing here is a
 * placeholder, because a headline figure a product cannot justify is the thing that makes it feel
 * like a prototype.
 */
export interface TodayAdventure {
  /** Steps in today's session. */
  activities: number;
  estimatedMinutes: number;
}

export function useTodayAdventure(): TodayAdventure {
  const plan = buildSession(sessionSeed());
  return { activities: plan.steps.length, estimatedMinutes: plan.estimatedMinutes };
}

export interface CurrentTarget {
  /** The sound to carry on with, e.g. "BA". */
  display: string;
  id: string;
  stepsDone: number;
  totalSteps: number;
  /** 0..1, for the bar. */
  progress: number;
  /** Every sound has had all its steps practised. The card then says so instead of "carry on" at 6 of 6. */
  allDone: boolean;
  /** Nothing practised yet anywhere — the card invites a start rather than a continuation. */
  fresh: boolean;
}

/**
 * The sound to carry on with: the first one in ladder order that has been started but not finished,
 * else the first unstarted one.
 *
 * "In progress before untouched" is deliberate — a child who did three steps of BA yesterday should
 * be offered BA, not moved on. It is also why this never reports a sound as finished-and-done: the
 * journey is practice, and practice does not expire.
 */
export function useCurrentTarget(): CurrentTarget {
  const { data } = useDbQuery<{ target: string; steps: number }[]>(
    () => speechPracticeRepo.targetSteps(),
    [],
    ['speechPractice'],
  );

  const steps = new Map((data ?? []).map((r) => [r.target, r.steps]));
  const total = TARGET_STEPS.length;
  const started = SOUND_TARGETS.find((t) => {
    const n = steps.get(t.id) ?? 0;
    return n > 0 && n < total;
  });
  const unstarted = SOUND_TARGETS.find((t) => (steps.get(t.id) ?? 0) === 0);
  const target = started ?? unstarted ?? SOUND_TARGETS[0];
  const done = Math.min(steps.get(target.id) ?? 0, total);

  return {
    display: target.display,
    id: target.id,
    stepsDone: done,
    totalSteps: total,
    progress: total > 0 ? done / total : 0,
    fresh: (data ?? []).length === 0,
    allDone: SOUND_TARGETS.every((t) => (steps.get(t.id) ?? 0) >= total),
  };
}

export interface AdventureMap {
  stages: MapStageState[];
  /** The sound to open for the Word Builder stage. */
  targetId: string;
  /** Raw counts (not capped at a stage goal) for things that react to a change, like the Space Pet. */
  sounds: number;
  exercises: number;
  /** Every query behind the stages has answered at least once; until then the counts are zeros. */
  ready: boolean;
}

/** The four map stages, from counted practice (useAchievements) and the per-sound step counts. */
export function useAdventureMap(): AdventureMap {
  const { metrics, loading: metricsLoading } = useAchievements();
  const { data, loading: stepsLoading } = useDbQuery<{ target: string; steps: number }[]>(
    () => speechPracticeRepo.targetSteps(),
    [],
    ['speechPractice'],
  );
  const { data: plainWords, loading: wordsLoading } = useDbQuery<number>(() => speechPracticeRepo.plainWords(), 0, ['speechPractice']);
  const { data: soundsExplored, loading: soundsLoading } = useDbQuery<number>(
    () => speechPracticeRepo.soundsExplored(),
    0,
    ['soundPractice', 'speechPractice', 'voicePractice'],
  );
  const current = useCurrentTarget();
  const targetSteps = (data ?? []).reduce((n, r) => n + Math.min(r.steps, TARGET_STEPS.length), 0);
  const stages = evaluateMap({
    wordsPractised: plainWords,
    soundsPractised: soundsExplored,
    speechExercises: metrics.speechExercises,
    targetSteps,
  });
  return { stages, targetId: current.id, sounds: soundsExplored, exercises: metrics.speechExercises, ready: !metricsLoading && !stepsLoading && !wordsLoading && !soundsLoading };
}
