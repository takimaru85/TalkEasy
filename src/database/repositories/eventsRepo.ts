import { getDb, nowIso } from '../db';
import { notify } from '../events';
import type { SchoolEvent, SchoolEventInput, SchoolEventType } from '@/types/models';

interface EventRow {
  id: number;
  title: string;
  event_type: string;
  subject_id: number | null;
  date: string;
  time: string | null;
  notes: string;
  created_at: string;
}

const toModel = (r: EventRow): SchoolEvent => ({
  id: r.id,
  title: r.title,
  eventType: (r.event_type as SchoolEventType) || 'event',
  subjectId: r.subject_id,
  date: r.date,
  time: r.time,
  notes: r.notes,
  createdAt: r.created_at,
});

/** School calendar events (holidays, meetings, reminders, exams, projects, other events). */
export const eventsRepo = {
  async getAll(): Promise<SchoolEvent[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<EventRow>('SELECT * FROM school_events ORDER BY date, time, id');
    return rows.map(toModel);
  },

  async getBetween(from: string, to: string): Promise<SchoolEvent[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<EventRow>(
      'SELECT * FROM school_events WHERE date BETWEEN ? AND ? ORDER BY date, time, id',
      from, to,
    );
    return rows.map(toModel);
  },

  async getUpcoming(fromDate: string, limit = 20): Promise<SchoolEvent[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<EventRow>(
      'SELECT * FROM school_events WHERE date >= ? ORDER BY date, time, id LIMIT ?',
      fromDate, limit,
    );
    return rows.map(toModel);
  },

  async getById(id: number): Promise<SchoolEvent | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<EventRow>('SELECT * FROM school_events WHERE id = ?', id);
    return row ? toModel(row) : null;
  },

  async create(input: SchoolEventInput): Promise<number> {
    const db = await getDb();
    const res = await db.runAsync(
      'INSERT INTO school_events (title, event_type, subject_id, date, time, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      input.title.trim(), input.eventType, input.subjectId, input.date, input.time, input.notes.trim(), nowIso(),
    );
    notify('events');
    return res.lastInsertRowId;
  },

  async update(id: number, input: SchoolEventInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE school_events SET title = ?, event_type = ?, subject_id = ?, date = ?, time = ?, notes = ? WHERE id = ?',
      input.title.trim(), input.eventType, input.subjectId, input.date, input.time, input.notes.trim(), id,
    );
    notify('events');
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM school_events WHERE id = ?', id);
    notify('events');
  },
};
