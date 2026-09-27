import { getDb, nowIso } from '../db';
import { notify } from '../events';
import type { CaregiverNote, CaregiverNoteInput, NoteType } from '@/types/models';

interface NoteRow {
  id: number;
  note_type: string;
  title: string;
  body: string;
  photo_uri: string | null;
  note_date: string | null;
  created_at: string;
}

/** The local day of an ISO timestamp. */
function localDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const toModel = (r: NoteRow): CaregiverNote => ({
  id: r.id,
  noteType: r.note_type as NoteType,
  title: r.title,
  body: r.body,
  photoUri: r.photo_uri ?? null,
  noteDate: r.note_date || localDay(r.created_at),
  createdAt: r.created_at,
});

export const notesRepo = {
  async getAll(): Promise<CaregiverNote[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<NoteRow>("SELECT * FROM caregiver_notes ORDER BY COALESCE(note_date, date(created_at, 'localtime')) DESC, created_at DESC, id DESC");
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
      'INSERT INTO caregiver_notes (note_type, title, body, photo_uri, note_date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      input.noteType, input.title.trim(), input.body.trim(), input.photoUri ?? null, input.noteDate ?? null, nowIso(),
    );
    notify('notes');
    return res.lastInsertRowId;
  },

  async update(id: number, input: CaregiverNoteInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE caregiver_notes SET note_type = ?, title = ?, body = ?, photo_uri = ?, note_date = ? WHERE id = ?',
      input.noteType, input.title.trim(), input.body.trim(), input.photoUri ?? null, input.noteDate ?? null, id,
    );
    notify('notes');
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM caregiver_notes WHERE id = ?', id);
    notify('notes');
  },
};
