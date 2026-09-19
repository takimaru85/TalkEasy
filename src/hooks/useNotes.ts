import { notesRepo } from '@/database';
import type { CaregiverNote } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NONE: CaregiverNote[] = [];

export function useNotes() {
  return useDbQuery(() => notesRepo.getAll(), NONE, ['notes']);
}

export function useNote(id: number | undefined) {
  return useDbQuery(
    () => (id === undefined ? Promise.resolve(null) : notesRepo.getById(id)),
    null as CaregiverNote | null,
    ['notes'],
    [id],
  );
}
