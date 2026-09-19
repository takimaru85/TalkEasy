import { getDb, nowIso } from '../db';
import { notify } from '../events';
import type { CaregiverNote, CaregiverNoteInput, NoteType } from '@/types/models';

interface NoteRow {
  id: number;
  note_type: string;
  title: string;
  body: string;
  created_at: string;
}

const toModel = (r: NoteRow): CaregiverNote => ({
  id: r.id,
  noteType: r.note_type as NoteType,
  title: r.title,
  body: r.body,
  createdAt: r.created_at,
});

export const notesRepo = {
  async getAll(): Promise<CaregiverNote[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<NoteRow>('SELECT * FROM caregiver_notes ORDER BY created_at DESC, id DESC');
    return rows.map(toModel);
  },

  async getById(id: number): Promise<CaregiverNote | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<NoteRow>('SELECT * FROM caregiver_notes WHERE id = ?', id);
    return row ? toModel(row) : null;
  },

  async create(input: CaregiverNoteInput): Promise<number> {
    const db = await getDb();
    const res = await db.runAsync(
      'INSERT INTO caregiver_notes (note_type, title, body, created_at) VALUES (?, ?, ?, ?)',
      input.noteType, input.title.trim(), input.body.trim(), nowIso(),
    );
    notify('notes');
    return res.lastInsertRowId;
  },

  async update(id: number, input: CaregiverNoteInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE caregiver_notes SET note_type = ?, title = ?, body = ? WHERE id = ?',
      input.noteType, input.title.trim(), input.body.trim(), id,
    );
    notify('notes');
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM caregiver_notes WHERE id = ?', id);
    notify('notes');
  },
};
