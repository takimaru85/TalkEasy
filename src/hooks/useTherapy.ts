import { therapyRepo } from '@/database';
import type { TherapyActivity } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NONE: TherapyActivity[] = [];
type LogRows = Awaited<ReturnType<typeof therapyRepo.getLogs>>;
const NO_LOGS: LogRows = [];

export function useTherapyActivities() {
  return useDbQuery(() => therapyRepo.getAll(), NONE, ['exercises']);
}

export function useTherapyActivity(id: number | undefined) {
  return useDbQuery(
    () => (id === undefined ? Promise.resolve(null) : therapyRepo.getById(id)),
    null as TherapyActivity | null,
    ['exercises'],
    [id],
  );
}

export function useActivityLogs(limit = 50) {
  return useDbQuery(() => therapyRepo.getLogs(limit), NO_LOGS, ['exercises'], [limit]);
}
