import { subjectsRepo } from '@/database';
import type { DayOfWeek, ScheduledSubject, Subject, SubjectMaterial, SubjectScheduleEntry } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NONE: Subject[] = [];
const NO_SCHEDULE: SubjectScheduleEntry[] = [];
const NO_SCHEDULED: ScheduledSubject[] = [];
const NO_MATERIALS: SubjectMaterial[] = [];

export function useSubjects(includeInactive = false) {
  return useDbQuery(() => subjectsRepo.getAll(includeInactive), NONE, ['subjects'], [includeInactive]);
}

export function useSubject(id: number | undefined) {
  return useDbQuery(
    () => (id === undefined ? Promise.resolve(null) : subjectsRepo.getById(id)),
    null as Subject | null,
    ['subjects'],
    [id],
  );
}

export function useSubjectSchedule(subjectId: number | undefined) {
  return useDbQuery(
    () => (subjectId === undefined ? Promise.resolve(NO_SCHEDULE) : subjectsRepo.getSchedule(subjectId)),
    NO_SCHEDULE,
    ['subjects'],
    [subjectId],
  );
}

/** Classes on a given weekday, in time order. */
export function useScheduleForDay(day: DayOfWeek) {
  return useDbQuery(() => subjectsRepo.getScheduleForDay(day), NO_SCHEDULED, ['subjects'], [day]);
}

export function useSubjectMaterials(subjectId: number | undefined) {
  return useDbQuery(
    () => (subjectId === undefined ? Promise.resolve(NO_MATERIALS) : subjectsRepo.getMaterials(subjectId)),
    NO_MATERIALS,
    ['subjects'],
    [subjectId],
  );
}
