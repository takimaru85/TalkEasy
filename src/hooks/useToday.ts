import { useEffect, useState } from 'react';
import { toIsoDate, toTimeString } from '@/utils/date';
import type { DayOfWeek } from '@/types/models';

/**
 * Today's ISO date, weekday and time, refreshed every minute so a screen left open
 * overnight rolls over correctly.
 */
export function useToday() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return {
    now,
    isoDate: toIsoDate(now),
    dayOfWeek: now.getDay() as DayOfWeek,
    /** 'HH:MM' */
    time: toTimeString(now),
  };
}
