import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { computeDay, type DayState } from '@/myday/schedule';
import { routinesRepo } from '@/database';
import type { RoutineItem } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NO_ITEMS: RoutineItem[] = [];

/**
 * The current time, re-rendering at each minute boundary and whenever the app comes back to the
 * foreground — so "Starts in 15 minutes" becomes "Starts in 14 minutes", and 12:00 becomes
 * "It's time!", without anyone refreshing. One timer per screen, aligned to the minute, not a
 * fast interval: cheap on the low-end Android phones this app runs on.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const d = new Date();
      // Wake just after the next minute begins.
      const wait = (60 - d.getSeconds()) * 1000 - d.getMilliseconds() + 250;
      timer = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, wait);
    };
    schedule();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(new Date());
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return now;
}

/** My Day, live: the day's steps from Parent Mode, evaluated against the clock. */
export function useMyDay(): DayState & { at: Date; loading: boolean } {
  const at = useNow();
  // Keyed on the date, so at midnight the steps are read again — and yesterday's ticks roll over.
  const day = at.toDateString();
  const { data: items, loading } = useDbQuery(() => routinesRepo.getActiveItems(), NO_ITEMS, ['routines'], [day]);
  const state = useMemo(() => computeDay(items, at), [items, at]);
  return { ...state, at, loading };
}
