import { assignmentsRepo, eventsRepo } from '@/database';
import { EVENT_TYPE_META, KIND_META } from '@/constants/school';
import type { CalendarEntry, SchoolEvent } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NONE: SchoolEvent[] = [];
const NO_ENTRIES: CalendarEntry[] = [];

export function useEvents() {
  return useDbQuery(() => eventsRepo.getAll(), NONE, ['events']);
}

export function useEvent(id: number | undefined) {
  return useDbQuery(
    () => (id === undefined ? Promise.resolve(null) : eventsRepo.getById(id)),
    null as SchoolEvent | null,
    ['events'],
    [id],
  );
}

export function useUpcomingEvents(fromDate: string, limit = 20) {
  return useDbQuery(() => eventsRepo.getUpcoming(fromDate, limit), NONE, ['events'], [fromDate, limit]);
}

/**
 * Calendar entries (assignments by due date + school events) inside [from, to],
 * sorted by date then time.
 */
export function useCalendarEntries(from: string, to: string) {
  return useDbQuery(
    async () => {
      const [assignments, events] = await Promise.all([
        assignmentsRepo.getDueBetween(from, to),
        eventsRepo.getBetween(from, to),
      ]);
      const entries: CalendarEntry[] = [
        ...assignments.map((a) => ({
          key: `a${a.id}`,
          date: a.dueDate as string,
          time: null,
          title: a.title,
          icon: a.subject?.icon ?? KIND_META[a.kind].icon,
          color: a.subject?.color ?? KIND_META[a.kind].color,
          source: 'assignment' as const,
          assignment: a,
        })),
        ...events.map((e) => ({
          key: `e${e.id}`,
          date: e.date,
          time: e.time,
          title: e.title,
          icon: EVENT_TYPE_META[e.eventType].icon,
          color: EVENT_TYPE_META[e.eventType].color,
          source: 'event' as const,
          event: e,
        })),
      ];
      return entries.sort((x, y) => x.date.localeCompare(y.date) || (x.time ?? '99').localeCompare(y.time ?? '99'));
    },
    NO_ENTRIES,
    ['events', 'assignments', 'subjects'],
    [from, to],
  );
}
