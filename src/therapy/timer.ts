/**
 * The practice timer's state machine. Pure, no React, so `check:therapy` can drive it under Node.
 *
 * WHAT THE TIMER IS. A flexible guide to "about how long this usually takes" — never a target, never
 * a minimum, never a score. Reaching 00:00 completes NOTHING: it does not record practice, does not
 * mark the activity done and does not ask the child to stop or carry on. Recording stays with the
 * activity's own "Done for today" button, which this module knows nothing about.
 *
 * WHY A WALL-CLOCK `endsAt` AND NOT A COUNT OF TICKS. A phone that is locked, backgrounded or simply
 * busy does not deliver one-second ticks on time, so a timer that subtracts a second per tick drifts
 * — and one that is paused by the OS would resume with the wrong time. A running timer therefore
 * stores the moment it ends, and every reading is `endsAt - now`. The interval in `useCountdown` only
 * decides when to LOOK; it never decides what the time is.
 */

export const QUICK_MINUTES = [1, 3, 5, 10, 15] as const;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 30;

export type TimerState =
  | { kind: 'idle'; minutes: number }
  | { kind: 'running'; minutes: number; endsAt: number }
  | { kind: 'paused'; minutes: number; remainingMs: number }
  | { kind: 'done'; minutes: number };

/** A whole number of minutes inside the range the picker offers; anything else becomes the nearest. */
export function clampMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return MIN_MINUTES;
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(minutes)));
}

export function initialTimer(minutes: number): TimerState {
  return { kind: 'idle', minutes: clampMinutes(minutes) };
}

const totalMs = (s: TimerState) => s.minutes * 60_000;

/** Milliseconds left at `now`. Never negative. */
export function remainingMs(s: TimerState, now: number): number {
  switch (s.kind) {
    case 'idle':
      return totalMs(s);
    case 'running':
      return Math.max(0, s.endsAt - now);
    case 'paused':
      return s.remainingMs;
    case 'done':
      return 0;
  }
}

/** Picks a length. Only while nothing is counting: changing it mid-count would silently move the goalposts. */
export function selectMinutes(s: TimerState, minutes: number): TimerState {
  if (s.kind === 'running' || s.kind === 'paused') return s;
  return initialTimer(minutes);
}

export function start(s: TimerState, now: number): TimerState {
  if (s.kind !== 'idle') return s; // a second Start while counting must never add a second countdown
  return { kind: 'running', minutes: s.minutes, endsAt: now + totalMs(s) };
}

export function pause(s: TimerState, now: number): TimerState {
  if (s.kind !== 'running') return s;
  const left = Math.max(0, s.endsAt - now);
  return left === 0 ? { kind: 'done', minutes: s.minutes } : { kind: 'paused', minutes: s.minutes, remainingMs: left };
}

export function resume(s: TimerState, now: number): TimerState {
  if (s.kind !== 'paused') return s;
  return { kind: 'running', minutes: s.minutes, endsAt: now + s.remainingMs };
}

/** Back to the SELECTED length, not to the activity's default. */
export function reset(s: TimerState): TimerState {
  return { kind: 'idle', minutes: s.minutes };
}

/** Moves a running timer to 'done' once its time has passed. Returns the same object when nothing changed. */
export function tick(s: TimerState, now: number): TimerState {
  if (s.kind === 'running' && now >= s.endsAt) return { kind: 'done', minutes: s.minutes };
  return s;
}

/** "05:00". Rounds UP, so the display reads 00:01 until the very last moment rather than 00:00 early. */
export function formatClock(ms: number): string {
  const secs = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** What a screen reader says: "4 minutes 30 seconds left". */
export function spokenRemaining(ms: number): string {
  const secs = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const parts = [m > 0 ? `${m} ${m === 1 ? 'minute' : 'minutes'}` : '', s > 0 || m === 0 ? `${s} ${s === 1 ? 'second' : 'seconds'}` : ''];
  return `${parts.filter(Boolean).join(' ')} left`;
}

/**
 * Everything the timer says to a person. Kept here, as data, so `check:therapy` can read the exact
 * words: no dosage, no pressure, nothing that pushes a tired child on.
 */
export const TIMER_COPY = {
  title: 'PRACTICE TIMER',
  guide: 'A flexible guide, not a target. Stop whenever your child has had enough.',
  safety:
    'Stay close and give the support your child usually needs. Stop if they are tired, in pain, dizzy, unsteady or upset.',
  done: 'Practice time is complete!',
  doneSub: 'Well done for having a go. You can stop here, or carry on if your child is happy to.',
} as const;
