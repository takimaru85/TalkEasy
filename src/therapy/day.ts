import { THERAPY_ACTIVITIES } from './content';
import type { DayPart, TherapyActivityDef, TherapyGoalId } from './types';

/**
 * My Therapy Day, and the counting behind Parent Goals. Pure — no React, no database, no clock of
 * its own, so the checks can prove it.
 */

/** The blocks of the day, in order. 'handSkills' is a block rather than a time, and sits third. */
export const DAY_PARTS: readonly { id: DayPart; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'handSkills', label: 'Hand Skills' },
  { id: 'evening', label: 'Evening' },
];

/** A comma list of activity ids a grown-up has switched off. */
export function parseHidden(raw: string | null | undefined): Set<string> {
  return new Set((raw ?? '').split(',').map((s) => s.trim()).filter(Boolean));
}

export function withHidden(raw: string | null | undefined, id: string, hidden: boolean): string {
  const set = parseHidden(raw);
  if (hidden) set.add(id);
  else set.delete(id);
  return [...set].join(',');
}

/** A comma list of the goals a grown-up has chosen. */
export function parseGoals(raw: string | null | undefined): TherapyGoalId[] {
  const valid = new Set(THERAPY_ACTIVITIES.flatMap((a) => a.goals));
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is TherapyGoalId => valid.has(s as TherapyGoalId));
}

export function withGoal(raw: string | null | undefined, goal: TherapyGoalId, on: boolean): string {
  const set = new Set(parseGoals(raw));
  if (on) set.add(goal);
  else set.delete(goal);
  return [...set].join(',');
}

/**
 * The activities in one block of the day, minus anything switched off.
 *
 * When a grown-up has chosen goals, the day is NARROWED to the activities that serve them — which
 * is the whole point of asking. With no goals chosen, everything shows, because an empty day would
 * punish a parent for not having filled in a form.
 */
export function activitiesForDayPart(part: DayPart, hidden: Set<string>, goals: TherapyGoalId[]): TherapyActivityDef[] {
  return THERAPY_ACTIVITIES.filter(
    (a) =>
      a.dayPart === part &&
      // The DAY is the short routine, not the whole library — see `inDailyRoutine`.
      a.inDailyRoutine &&
      !hidden.has(a.id) &&
      (goals.length === 0 || a.goals.some((g) => goals.includes(g))),
  );
}

/** Every activity on today's plan, in day order. */
export function todaysPlan(hidden: Set<string>, goals: TherapyGoalId[]): TherapyActivityDef[] {
  return DAY_PARTS.flatMap((p) => activitiesForDayPart(p.id, hidden, goals));
}

/**
 * How much of today is done.
 *
 * `doneIds` is the set practised TODAY. Counting distinct activities rather than sessions means
 * doing one activity five times does not show the day as finished — and, just as deliberately, it
 * means there is nothing to gain by repeating something, so the number cannot become a target to
 * chase with a child who has had enough.
 */
export function dayProgress(plan: TherapyActivityDef[], doneIds: Set<string>): { done: number; total: number } {
  return { done: plan.filter((a) => doneIds.has(a.id)).length, total: plan.length };
}

/**
 * The activities that serve a goal — what "this week's practice" is counted over.
 *
 * Hidden activities are excluded, so a goal never reports progress against something the family has
 * switched off.
 */
export function activitiesForGoal(goal: TherapyGoalId, hidden: Set<string>): TherapyActivityDef[] {
  return THERAPY_ACTIVITIES.filter((a) => a.goals.includes(goal) && !hidden.has(a.id));
}

/** A plain-words summary of a goal's week. Never a score, and never a target. */
export function weekSummary(count: number): string {
  if (count === 0) return 'No practice recorded yet this week';
  return `${count} practice${count === 1 ? '' : 's'} this week`;
}
