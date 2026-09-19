import { assignmentsRepo } from '@/database';
import type { DbTopic } from '@/database';
import type { AssignmentStatus, AssignmentWithSubject } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NONE: AssignmentWithSubject[] = [];
const TOPICS: DbTopic[] = ['assignments', 'subjects'];

export function useAssignments() {
  return useDbQuery(() => assignmentsRepo.getAll(), NONE, TOPICS);
}

export function useOpenAssignments() {
  return useDbQuery(() => assignmentsRepo.getOpen(), NONE, TOPICS);
}

export function useSubjectAssignments(subjectId: number | undefined) {
  return useDbQuery(
    () => (subjectId === undefined ? Promise.resolve(NONE) : assignmentsRepo.getBySubject(subjectId)),
    NONE,
    TOPICS,
    [subjectId],
  );
}

/** Open assignments due on `date` or earlier (i.e. due today + overdue). */
export function useAssignmentsDueBy(date: string) {
  return useDbQuery(() => assignmentsRepo.getDueBy(date), NONE, TOPICS, [date]);
}

export function useAssignment(id: number | undefined) {
  return useDbQuery(
    () => (id === undefined ? Promise.resolve(null) : assignmentsRepo.getById(id)),
    null as AssignmentWithSubject | null,
    TOPICS,
    [id],
  );
}

const ZERO: Record<AssignmentStatus, number> = { todo: 0, in_progress: 0, done: 0 };

export function useAssignmentCounts() {
  return useDbQuery(() => assignmentsRepo.getCounts(), ZERO, ['assignments']);
}
