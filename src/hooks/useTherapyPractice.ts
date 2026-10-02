import { useCallback } from 'react';
import { therapyPracticeRepo } from '@/database';
import { useDbQuery } from './useDbQuery';
import type { TherapyGroup } from '@/therapy/types';

const NONE: string[] = [];
const NO_COUNTS: Record<string, number> = {};

/** The activity ids practised today — what My Therapy Day ticks off. */
export function useTherapyDoneToday() {
  return useDbQuery(() => therapyPracticeRepo.doneToday(), NONE, ['therapy']);
}

/** Practices per activity over the last seven days, for Parent Goals. */
export function useTherapyWeekCounts() {
  return useDbQuery(() => therapyPracticeRepo.weekCounts(), NO_COUNTS, ['therapy']);
}

/**
 * Records a practice.
 *
 * Deliberately returns nothing but a recorder: there is no result to report back, because nothing
 * about the practice is judged. A failure is swallowed — a lost count must never interrupt a child
 * or present a grown-up with an error in the middle of a therapy activity.
 */
export function useRecordTherapyPractice() {
  return useCallback((activityId: string, group: TherapyGroup, durationMs: number) => {
    therapyPracticeRepo.record(activityId, group, durationMs).catch(() => {});
  }, []);
}
