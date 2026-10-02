import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  initialTimer,
  pause as pauseTimer,
  remainingMs,
  reset as resetTimer,
  resume as resumeTimer,
  selectMinutes,
  start as startTimer,
  tick,
  type TimerState,
} from '@/therapy/timer';

/**
 * A countdown, driven by `therapy/timer.ts`.
 *
 * ONE INTERVAL, EVER. The effect depends on `timer.kind` only, so it exists exactly while the timer
 * is 'running' and its cleanup clears it before any other state — pause, reset, completion, unmount —
 * can leave one behind. Start on a timer that is already running is a no-op in the state machine, so
 * a double tap cannot add a second countdown either.
 *
 * THE INTERVAL ONLY DECIDES WHEN TO LOOK. What time it is comes from the stored end moment, so a
 * locked phone, a backgrounded app or a dropped tick cannot make it drift; when the app returns to
 * the foreground it is re-read immediately instead of waiting up to a second for the next tick.
 */
export function useCountdown(defaultMinutes: number) {
  const [timer, setTimer] = useState<TimerState>(() => initialTimer(defaultMinutes));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (timer.kind !== 'running') return undefined;
    const look = () => {
      const t = Date.now();
      setNow(t);
      setTimer((s) => tick(s, t));
    };
    look();
    const id = setInterval(look, 1000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') look();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [timer.kind]);

  const act = useCallback((fn: (s: TimerState, t: number) => TimerState) => {
    const t = Date.now();
    setNow(t);
    setTimer((s) => fn(s, t));
  }, []);

  return {
    timer,
    left: remainingMs(timer, now),
    start: useCallback(() => act((s, t) => startTimer(s, t)), [act]),
    pause: useCallback(() => act((s, t) => pauseTimer(s, t)), [act]),
    resume: useCallback(() => act((s, t) => resumeTimer(s, t)), [act]),
    reset: useCallback(() => act((s) => resetTimer(s)), [act]),
    choose: useCallback((minutes: number) => act((s) => selectMinutes(s, minutes)), [act]),
  };
}
