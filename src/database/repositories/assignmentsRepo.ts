import { getDb, nowIso } from '../db';
import { notify } from '../events';
import type {
  Assignment,
  AssignmentInput,
  AssignmentKind,
  AssignmentPriority,
  AssignmentStatus,
  AssignmentWithSubject,
  Subject,
} from '@/types/models';

interface AssignmentRow {
  id: number;
  subject_id: number | null;
  title: string;
  description: string;
  kind: string;
  date_assigned: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  notes: string;
  photo_uri: string | null;
  attachment_uri: string | null;
  attachment_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

type JoinedRow = AssignmentRow & {
  s_id: number | null;
  s_name: string | null;
  s_icon: string | null;
  s_color: string | null;
  s_teacher: string | null;
  s_notes: string | null;
  s_sort: number | null;
  s_active: number | null;
  s_created: string | null;
};

const toModel = (r: AssignmentRow): Assignment => ({
  id: r.id,
  subjectId: r.subject_id,
  title: r.title,
  description: r.description,
  kind: (r.kind as AssignmentKind) || 'assignment',
  dateAssigned: r.date_assigned,
  dueDate: r.due_date,
  priority: (r.priority as AssignmentPriority) || 'medium',
  status: (r.status as AssignmentStatus) || 'todo',
  notes: r.notes,
  photoUri: r.photo_uri,
  attachmentUri: r.attachment_uri,
  attachmentName: r.attachment_name,
  completedAt: r.completed_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toJoined = (r: JoinedRow): AssignmentWithSubject => ({
  ...toModel(r),
  subject:
    r.s_id !== null
      ? ({
          id: r.s_id,
          name: r.s_name ?? '',
          icon: r.s_icon ?? 'book-open-variant',
          color: r.s_color ?? '#E4E4E4',
          teacherName: r.s_teacher ?? '',
          notes: r.s_notes ?? '',
          sortOrder: r.s_sort ?? 0,
          isActive: r.s_active === 1,
          createdAt: r.s_created ?? '',
        } satisfies Subject)
      : null,
});

const SELECT_JOINED = `
  SELECT a.*, s.id AS s_id, s.name AS s_name, s.icon AS s_icon, s.color AS s_color,
         s.teacher_name AS s_teacher, s.notes AS s_notes, s.sort_order AS s_sort,
         s.is_active AS s_active, s.created_at AS s_created
  FROM assignments a LEFT JOIN subjects s ON s.id = a.subject_id`;

/** Sort: open work first (by due date, no date last), then done (most recent first). */
const ORDER = `
  ORDER BY CASE WHEN a.status = 'done' THEN 1 ELSE 0 END,
           CASE WHEN a.due_date IS NULL THEN 1 ELSE 0 END, a.due_date, a.priority = 'high' DESC, a.id DESC`;

export const assignmentsRepo = {
  async getAll(): Promise<AssignmentWithSubject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<JoinedRow>(`${SELECT_JOINED} ${ORDER}`);
    return rows.map(toJoined);
  },

  async getOpen(): Promise<AssignmentWithSubject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<JoinedRow>(`${SELECT_JOINED} WHERE a.status != 'done' ${ORDER}`);
    return rows.map(toJoined);
  },

  async getBySubject(subjectId: number): Promise<AssignmentWithSubject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<JoinedRow>(`${SELECT_JOINED} WHERE a.subject_id = ? ${ORDER}`, subjectId);
    return rows.map(toJoined);
  },

  /** Open items due on `date` or earlier (overdue) — for School Mode / dashboard "today". */
  async getDueBy(date: string): Promise<AssignmentWithSubject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<JoinedRow>(
      `${SELECT_JOINED} WHERE a.status != 'done' AND a.due_date IS NOT NULL AND a.due_date <= ? ${ORDER}`,
      date,
    );
    return rows.map(toJoined);
  },

  /** Items with a due date inside [from, to] (inclusive) — for the calendar. */
  async getDueBetween(from: string, to: string): Promise<AssignmentWithSubject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<JoinedRow>(
      `${SELECT_JOINED} WHERE a.due_date IS NOT NULL AND a.due_date BETWEEN ? AND ? ORDER BY a.due_date, a.id`,
      from, to,
    );
    return rows.map(toJoined);
  },

  async getById(id: number): Promise<AssignmentWithSubject | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<JoinedRow>(`${SELECT_JOINED} WHERE a.id = ?`, id);
    return row ? toJoined(row) : null;
  },

  async getCounts(): Promise<Record<AssignmentStatus, number>> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ status: string; n: number }>(
      'SELECT status, COUNT(*) AS n FROM assignments GROUP BY status',
    );
    const counts: Record<AssignmentStatus, number> = { todo: 0, in_progress: 0, done: 0 };
    for (const r of rows) if (r.status in counts) counts[r.status as AssignmentStatus] = r.n;
    return counts;
  },

  async create(input: AssignmentInput): Promise<number> {
    const db = await getDb();
    const now = nowIso();
    const res = await db.runAsync(
      `INSERT INTO assignments
         (subject_id, title, description, kind, date_assigned, due_date, priority, status, notes,
          photo_uri, attachment_uri, attachment_name, completed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.subjectId, input.title.trim(), input.description.trim(), input.kind, input.dateAssigned,
      input.dueDate, input.priority, input.status, input.notes.trim(), input.photoUri,
      input.attachmentUri, input.attachmentName, input.status === 'done' ? now : null, now, now,
    );
    notify('assignments');
    return res.lastInsertRowId;
  },

  async update(id: number, input: AssignmentInput): Promise<void> {
    const db = await getDb();
    const existing = await db.getFirstAsync<{ status: string; completed_at: string | null }>(
      'SELECT status, completed_at FROM assignments WHERE id = ?', id,
    );
    const now = nowIso();
    const completedAt =
      input.status === 'done' ? (existing?.status === 'done' ? existing.completed_at : now) : null;
    await db.runAsync(
      `UPDATE assignments SET subject_id = ?, title = ?, description = ?, kind = ?, date_assigned = ?,
         due_date = ?, priority = ?, status = ?, notes = ?, photo_uri = ?, attachment_uri = ?,
         attachment_name = ?, completed_at = ?, updated_at = ?
       WHERE id = ?`,
      input.subjectId, input.title.trim(), input.description.trim(), input.kind, input.dateAssigned,
      input.dueDate, input.priority, input.status, input.notes.trim(), input.photoUri,
      input.attachmentUri, input.attachmentName, completedAt, now, id,
    );
    notify('assignments');
  },

  async setStatus(id: number, status: AssignmentStatus): Promise<void> {
    const db = await getDb();
    const now = nowIso();
    await db.runAsync(
      'UPDATE assignments SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?',
      status, status === 'done' ? now : null, now, id,
    );
    notify('assignments');
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM assignments WHERE id = ?', id);
    notify('assignments');
  },
};
