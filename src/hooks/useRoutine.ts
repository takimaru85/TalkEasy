import { routinesRepo } from '@/database';
import type { Routine, RoutineItem } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NO_ITEMS: RoutineItem[] = [];
const NO_ROUTINES: Routine[] = [];

export function useRoutines() {
  return useDbQuery(() => routinesRepo.getAll(), NO_ROUTINES, ['routines']);
}

/** The active routine (what the child sees). */
export function useActiveRoutine() {
  return useDbQuery(() => routinesRepo.getActive(), null as Routine | null, ['routines']);
}

/** Items of the active routine. */
export function useActiveRoutineItems() {
  return useDbQuery(() => routinesRepo.getActiveItems(), NO_ITEMS, ['routines']);
}

export function useRoutineItems(routineId: number | undefined) {
  return useDbQuery(
    () => (routineId === undefined ? Promise.resolve(NO_ITEMS) : routinesRepo.getItems(routineId)),
    NO_ITEMS,
    ['routines'],
    [routineId],
  );
}
