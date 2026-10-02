import type { RoutineItem } from '@/types/models';

/**
 * My Day as a LIVE schedule: given the day's steps and the time, what is happening NOW, what is
 * NEXT, how long until it starts, and whether it is time.
 *
 * Pure — no clock, no React — so the rules are easy to read and `npm run check:myday` can test
 * them at any time of day. Nothing here is hard-coded: the steps come from Parent Mode → Daily
 * schedule, and every "Starts in N minutes" is computed from the real clock.
 *
 * The rules, in the language the child sees:
 *  - A step with a time is NOW from its start until its end (its own end time if set, else the
 *    next timed step's start, else one hour later).
 *  - A step WITHOUT a time belongs between the timed steps around it in the list: "Brush teeth"
 *    between Wake up (6:30) and Breakfast (7:00) is a 6:30-7:00 job, so it is not suggested at
 *    lunchtime. A routine with no times at all is simply done in order, as My Day always was.
 *  - NOW is the first unfinished step, in the day's order, whose time it is. When the step that
 *    was NOW is finished, the schedule ADVANCES: the next step becomes NOW straight away (with its
 *    "Starts in…" until its time comes), so the child always has one thing in focus.
 *  - NEXT is the first unfinished step after NOW, so it follows the day's sequence: while Dinner
 *    is NOW, Bath is NEXT, not Bedtime.
 *  - Done and skipped steps are never NOW or NEXT. A step whose time passed without being ticked
 *    is not nagged about; it simply stays open on the list.
 */

export type ScheduleStatus = 'completed' | 'skipped' | 'current' | 'upcoming' | 'missed';

/** How close the next step is — drives how noticeable the "Up next" cue becomes. */
export type NextPhase = 'later' | 'soon' | 'upNext' | 'almost';

export interface ScheduleEntry {
  item: RoutineItem;
  /** Minutes since midnight, or null for a step without a time. */
  start: number | null;
  end: number | null;
  status: ScheduleStatus;
}

export interface DayState {
  entries: ScheduleEntry[];
  now: ScheduleEntry | null;
  next: ScheduleEntry | null;
  /** Whole minutes until `next` starts (timed steps only). */
  minutesUntilNext: number | null;
  /** NOW has advanced to a step whose time has not come yet: whole minutes until it starts. */
  minutesUntilNow: number | null;
  nextPhase: NextPhase | null;
  /** The NOW step has just started and is not ticked yet: "It's time!". */
  itsTime: ScheduleEntry | null;
  done: number;
  total: number;
  allDone: boolean;
}

/** "It's time!" shows for this long after a step starts (or until it is ticked). */
export const ITS_TIME_MINUTES = 15;
/** Thresholds for the "Up next" cue. */
export const SOON_MINUTES = 30;
export const UP_NEXT_MINUTES = 15;
export const ALMOST_MINUTES = 5;
/** "Starts in…" is shown once a step is this close; further off, just its time. */
export const COUNTDOWN_MINUTES = 120;
/** A timed step with nothing after it lasts this long. */
const DEFAULT_LENGTH = 60;

/** 'HH:MM' → minutes since midnight. */
export function toMinutes(hhmm: string | null | undefined): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h >= 0 && h < 24 && min >= 0 && min < 60 ? h * 60 + min : null;
}

/** Minutes since midnight, with seconds as a fraction, for a Date. */
export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

export function computeDay(items: RoutineItem[], at: Date): DayState {
  const nowMin = minutesOfDay(at);
  const timedStarts = items.map((i) => toMinutes(i.startTime)).filter((m): m is number => m !== null).sort((a, b) => a - b);

  const starts = items.map((i) => toMinutes(i.startTime));
  const entries: ScheduleEntry[] = items.map((item, index) => {
    const start = starts[index];
    // The window a step belongs to. Timed: its start to its end. Untimed: between the timed steps
    // before and after it in the list (the whole day when there are none).
    let from: number;
    let to: number;
    let end: number | null = null;
    if (start !== null) {
      const ownEnd = toMinutes(item.endTime);
      const nextStart = timedStarts.find((m) => m > start);
      end = ownEnd !== null && ownEnd > start ? ownEnd : nextStart ?? Math.min(24 * 60, start + DEFAULT_LENGTH);
      from = start;
      to = end;
    } else {
      const before = starts.slice(0, index).filter((m): m is number => m !== null);
      const after = starts.slice(index + 1).find((m): m is number => m !== null);
      from = before.length ? Math.max(...before) : 0;
      to = after ?? 24 * 60;
      if (to <= from) to = 24 * 60;
    }
    let status: ScheduleStatus;
    if (item.isDone) status = 'completed';
    else if (item.isSkipped) status = 'skipped';
    else if (nowMin < from) status = 'upcoming';
    else if (nowMin < to) status = 'current';
    else status = 'missed';
    return { item, start, end, status };
  });

  const open = (e: ScheduleEntry) => e.status !== 'completed' && e.status !== 'skipped';

  // NOW: the first unfinished step whose time it is — or, when nothing's time it is (the step
  // before was finished early), the schedule advances to the first step still to come.
  const now = entries.find((e) => e.status === 'current') ?? entries.find((e) => e.status === 'upcoming') ?? null;
  // NEXT: the first unfinished step after NOW that is not already over.
  const afterNow = now ? entries.indexOf(now) : -1;
  const next = now ? entries.find((e, i) => i > afterNow && (e.status === 'current' || e.status === 'upcoming')) ?? null : null;
  const minutesUntilNow = now && now.status === 'upcoming' && now.start !== null ? Math.max(0, Math.ceil(now.start - nowMin)) : null;

  const minutesUntilNext = next && next.start !== null ? Math.max(0, Math.ceil(next.start - nowMin)) : null;
  const nextPhase: NextPhase | null =
    minutesUntilNext === null ? (next ? 'later' : null)
    : minutesUntilNext <= ALMOST_MINUTES ? 'almost'
    : minutesUntilNext <= UP_NEXT_MINUTES ? 'upNext'
    : minutesUntilNext <= SOON_MINUTES ? 'soon'
    : 'later';

  // It's time: NOW's start has been REACHED (not merely advanced to) in the last few minutes.
  const itsTime = now && now.status === 'current' && now.start !== null && nowMin >= now.start && nowMin - now.start < ITS_TIME_MINUTES ? now : null;
  const done = entries.filter((e) => e.status === 'completed').length;

  return {
    entries,
    now,
    next,
    minutesUntilNext,
    minutesUntilNow,
    nextPhase,
    itsTime,
    done,
    total: entries.length,
    allDone: entries.length > 0 && entries.every((e) => !open(e)),
  };
}

/**
 * Child-friendly countdown, never seconds: "Starts in 5 minutes", "Starts in 1 hour",
 * "Starts in 1½ hours". Under an hour it counts minutes; above, the nearest half hour.
 */
export function startsIn(minutes: number, short = false): string {
  if (minutes <= 0) return 'Starting now';
  if (minutes < 60) return short ? `Starts in ${minutes} min` : `Starts in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  const halves = Math.round(minutes / 30);
  const hours = Math.floor(halves / 2);
  const half = halves % 2 === 1;
  if (hours === 0) return short ? 'Starts in 30 min' : 'Starts in 30 minutes';
  if (short) return half ? `Starts in ${hours}½ hrs` : `Starts in ${hours} hr${hours === 1 ? '' : 's'}`;
  return half ? `Starts in ${hours}½ hours` : `Starts in ${hours} hour${hours === 1 ? '' : 's'}`;
}

/** Whether a step this many minutes away gets a countdown line under its time. */
export const showsCountdown = (minutes: number | null) => minutes !== null && minutes <= COUNTDOWN_MINUTES;
