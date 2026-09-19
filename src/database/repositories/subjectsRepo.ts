import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { moveRow } from '../reorder';
import type {
  DayOfWeek,
  ScheduledSubject,
  Subject,
  SubjectInput,
  SubjectMaterial,
  SubjectScheduleEntry,
} from '@/types/models';

interface SubjectRow {
  id: number;
  name: string;
  icon: string;
  color: string;
  teacher_name: string;
  notes: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

interface ScheduleRow {
  id: number;
  subject_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string | null;
}

interface MaterialRow {
  id: number;
  subject_id: number;
  name: string;
  note: string;
  sort_order: number;
}

export const toSubject = (r: SubjectRow): Subject => ({
  id: r.id,
  name: r.name,
  icon: r.icon,
  color: r.color,
  teacherName: r.teacher_name,
  notes: r.notes,
  sortOrder: r.sort_order,
  isActive: r.is_active === 1,
  createdAt: r.created_at,
});

const toSchedule = (r: ScheduleRow): SubjectScheduleEntry => ({
  id: r.id,
  subjectId: r.subject_id,
  dayOfWeek: r.day_of_week as DayOfWeek,
  startTime: r.start_time,
  endTime: r.end_time,
});

const toMaterial = (r: MaterialRow): SubjectMaterial => ({
  id: r.id,
  subjectId: r.subject_id,
  name: r.name,
  note: r.note,
  sortOrder: r.sort_order,
});

export const subjectsRepo = {
  async getAll(includeInactive = false): Promise<Subject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<SubjectRow>(
      `SELECT * FROM subjects ${includeInactive ? '' : 'WHERE is_active = 1'} ORDER BY sort_order, id`,
    );
    return rows.map(toSubject);
  },

  async getById(id: number): Promise<Subject | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<SubjectRow>('SELECT * FROM subjects WHERE id = ?', id);
    return row ? toSubject(row) : null;
  },

  async create(input: SubjectInput): Promise<number> {
    const db = await getDb();
    const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM subjects');
    const res = await db.runAsync(
      `INSERT INTO subjects (name, icon, color, teacher_name, notes, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      input.name.trim(), input.icon, input.color, input.teacherName.trim(), input.notes.trim(),
      (max?.m ?? -1) + 1, nowIso(),
    );
    notify('subjects');
    return res.lastInsertRowId;
  },

  async update(id: number, input: SubjectInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE subjects SET name = ?, icon = ?, color = ?, teacher_name = ?, notes = ? WHERE id = ?',
      input.name.trim(), input.icon, input.color, input.teacherName.trim(), input.notes.trim(), id,
    );
    notify('subjects', 'assignments', 'events');
  },

  async setActive(id: number, active: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE subjects SET is_active = ? WHERE id = ?', active ? 1 : 0, id);
    notify('subjects');
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM subjects WHERE id = ?', id);
    notify('subjects', 'assignments', 'events');
  },

  async move(id: number, direction: -1 | 1): Promise<void> {
    const db = await getDb();
    await moveRow(db, 'subjects', id, direction);
    notify('subjects');
  },

  // ---- schedule -----------------------------------------------------------

  async getSchedule(subjectId: number): Promise<SubjectScheduleEntry[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ScheduleRow>(
      'SELECT * FROM subject_schedule WHERE subject_id = ? ORDER BY day_of_week, start_time',
      subjectId,
    );
    return rows.map(toSchedule);
  },

  /** All classes on a weekday, in time order, with their subject. */
  async getScheduleForDay(day: DayOfWeek): Promise<ScheduledSubject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ScheduleRow & { s_id: number; s_name: string; s_icon: string; s_color: string; s_teacher: string; s_notes: string; s_sort: number; s_active: number; s_created: string }>(
      `SELECT sc.*, s.id AS s_id, s.name AS s_name, s.icon AS s_icon, s.color AS s_color,
              s.teacher_name AS s_teacher, s.notes AS s_notes, s.sort_order AS s_sort,
              s.is_active AS s_active, s.created_at AS s_created
       FROM subject_schedule sc JOIN subjects s ON s.id = sc.subject_id
       WHERE sc.day_of_week = ? AND s.is_active = 1
       ORDER BY sc.start_time, s.sort_order`,
      day,
    );
    return rows.map((r) => ({
      ...toSchedule(r),
      subject: toSubject({
        id: r.s_id, name: r.s_name, icon: r.s_icon, color: r.s_color, teacher_name: r.s_teacher,
        notes: r.s_notes, sort_order: r.s_sort, is_active: r.s_active, created_at: r.s_created,
      }),
    }));
  },

  async addSchedule(subjectId: number, day: DayOfWeek, startTime: string, endTime: string | null): Promise<number> {
    const db = await getDb();
    const res = await db.runAsync(
      'INSERT INTO subject_schedule (subject_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
      subjectId, day, startTime, endTime,
    );
    notify('subjects');
    return res.lastInsertRowId;
  },

  async removeSchedule(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM subject_schedule WHERE id = ?', id);
    notify('subjects');
  },

  // ---- materials -----------------------------------------------------------

  async getMaterials(subjectId: number): Promise<SubjectMaterial[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<MaterialRow>(
      'SELECT * FROM subject_materials WHERE subject_id = ? ORDER BY sort_order, id',
      subjectId,
    );
    return rows.map(toMaterial);
  },

  async addMaterial(subjectId: number, name: string, note = ''): Promise<number> {
    const db = await getDb();
    const max = await db.getFirstAsync<{ m: number | null }>(
      'SELECT MAX(sort_order) AS m FROM subject_materials WHERE subject_id = ?', subjectId,
    );
    const res = await db.runAsync(
      'INSERT INTO subject_materials (subject_id, name, note, sort_order) VALUES (?, ?, ?, ?)',
      subjectId, name.trim(), note.trim(), (max?.m ?? -1) + 1,
    );
    notify('subjects');
    return res.lastInsertRowId;
  },

  async removeMaterial(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM subject_materials WHERE id = ?', id);
    notify('subjects');
  },
};
