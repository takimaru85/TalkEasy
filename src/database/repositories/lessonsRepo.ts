import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { moveRow } from '../reorder';
import type {
  ActivityType,
  AnswerMethod,
  Choice,
  Lesson,
  LessonActivity,
  LessonActivityInput,
  LessonInput,
  LessonWithSubject,
  MatchPair,
} from '@/adaptive/types';
import { ACTIVITY_TYPE_META } from '@/adaptive/types';

interface LessonRow {
  id: number;
  subject_id: number | null;
  title: string;
  grade_level: string;
  content: string;
  vocabulary_json: string;
  objectives: string;
  assigned_date: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
}

interface ActivityRow {
  id: number;
  lesson_id: number;
  type: string;
  question: string;
  image: string | null;
  choices_json: string;
  pairs_json: string;
  answers_json: string;
  hint: string;
  difficulty: string;
  allowed_methods_json: string;
  sort_order: number;
}

function parseArray<T>(raw: string): T[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

const toLesson = (r: LessonRow): Lesson => ({
  id: r.id,
  subjectId: r.subject_id,
  title: r.title,
  gradeLevel: r.grade_level,
  content: r.content,
  vocabulary: parseArray<string>(r.vocabulary_json),
  objectives: r.objectives,
  assignedDate: r.assigned_date,
  sortOrder: r.sort_order,
  isActive: r.is_active === 1,
  createdAt: r.created_at,
});

const toActivity = (r: ActivityRow): LessonActivity => {
  const type = (r.type as ActivityType) in ACTIVITY_TYPE_META ? (r.type as ActivityType) : 'mcq';
  const allowed = parseArray<AnswerMethod>(r.allowed_methods_json);
  return {
    id: r.id,
    lessonId: r.lesson_id,
    type,
    question: r.question,
    image: r.image,
    choices: parseArray<Choice>(r.choices_json),
    pairs: parseArray<MatchPair>(r.pairs_json),
    answers: parseArray<string>(r.answers_json),
    hint: r.hint,
    difficulty: (['easy', 'medium', 'hard'].includes(r.difficulty) ? r.difficulty : 'easy') as LessonActivity['difficulty'],
    allowedMethods: allowed.length ? allowed : ACTIVITY_TYPE_META[type].defaultMethods,
    sortOrder: r.sort_order,
  };
};

const LESSON_JOIN = `
  SELECT l.*, s.name AS s_name, s.icon AS s_icon, s.color AS s_color,
    (SELECT COUNT(*) FROM lesson_activities a WHERE a.lesson_id = l.id) AS activity_count,
    (SELECT COUNT(DISTINCT a.id) FROM lesson_activities a
       JOIN adaptive_attempts t ON t.activity_id = a.id AND t.child_id = ? AND t.correct = 1
     WHERE a.lesson_id = l.id) AS completed_count
  FROM lessons l LEFT JOIN subjects s ON s.id = l.subject_id`;

type JoinedRow = LessonRow & { s_name: string | null; s_icon: string | null; s_color: string | null; activity_count: number; completed_count: number };

const toJoined = (r: JoinedRow): LessonWithSubject => ({
  ...toLesson(r),
  subjectName: r.s_name ?? 'Lesson',
  subjectIcon: r.s_icon ?? '📘',
  subjectColor: r.s_color ?? '#DCEBFF',
  activityCount: r.activity_count,
  completedCount: r.completed_count,
});

/** Lessons + their activities (parent-authored or seeded). Progress joins use the child id. */
export const lessonsRepo = {
  async getAll(childId: number, includeInactive = false): Promise<LessonWithSubject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<JoinedRow>(
      `${LESSON_JOIN} ${includeInactive ? '' : 'WHERE l.is_active = 1'} ORDER BY l.sort_order, l.id`,
      childId,
    );
    return rows.map(toJoined);
  },

  async getBySubject(childId: number, subjectId: number | null): Promise<LessonWithSubject[]> {
    const db = await getDb();
    const rows = subjectId === null
      ? await db.getAllAsync<JoinedRow>(`${LESSON_JOIN} WHERE l.is_active = 1 AND l.subject_id IS NULL ORDER BY l.sort_order, l.id`, childId)
      : await db.getAllAsync<JoinedRow>(`${LESSON_JOIN} WHERE l.is_active = 1 AND l.subject_id = ? ORDER BY l.sort_order, l.id`, childId, subjectId);
    return rows.map(toJoined);
  },

  /** Today's schoolwork: lessons dated today, plus undated active lessons that are not finished. */
  async getToday(childId: number, isoDate: string): Promise<LessonWithSubject[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<JoinedRow>(
      `${LESSON_JOIN} WHERE l.is_active = 1 AND (l.assigned_date = ? OR l.assigned_date IS NULL)
       ORDER BY CASE WHEN l.assigned_date = ? THEN 0 ELSE 1 END, l.sort_order, l.id`,
      childId, isoDate, isoDate,
    );
    return rows.map(toJoined).filter((l) => l.assignedDate === isoDate || l.completedCount < l.activityCount || l.activityCount === 0);
  },

  async getById(childId: number, id: number): Promise<LessonWithSubject | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<JoinedRow>(`${LESSON_JOIN} WHERE l.id = ?`, childId, id);
    return row ? toJoined(row) : null;
  },

  async create(input: LessonInput): Promise<number> {
    const db = await getDb();
    const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM lessons');
    const res = await db.runAsync(
      `INSERT INTO lessons (subject_id, title, grade_level, content, vocabulary_json, objectives, assigned_date, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.subjectId, input.title.trim(), input.gradeLevel.trim(), input.content.trim(), JSON.stringify(input.vocabulary),
      input.objectives.trim(), input.assignedDate, (max?.m ?? -1) + 1, input.isActive ? 1 : 0, nowIso(),
    );
    notify('lessons');
    return res.lastInsertRowId;
  },

  async update(id: number, input: LessonInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE lessons SET subject_id = ?, title = ?, grade_level = ?, content = ?, vocabulary_json = ?, objectives = ?,
         assigned_date = ?, is_active = ? WHERE id = ?`,
      input.subjectId, input.title.trim(), input.gradeLevel.trim(), input.content.trim(), JSON.stringify(input.vocabulary),
      input.objectives.trim(), input.assignedDate, input.isActive ? 1 : 0, id,
    );
    notify('lessons');
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM lessons WHERE id = ?', id);
    notify('lessons', 'adaptive');
  },

  async move(id: number, direction: -1 | 1): Promise<void> {
    const db = await getDb();
    await moveRow(db, 'lessons', id, direction);
    notify('lessons');
  },

  // ---- activities -----------------------------------------------------------

  async getActivities(lessonId: number): Promise<LessonActivity[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ActivityRow>('SELECT * FROM lesson_activities WHERE lesson_id = ? ORDER BY sort_order, id', lessonId);
    return rows.map(toActivity);
  },

  async addActivity(lessonId: number, input: LessonActivityInput): Promise<number> {
    const db = await getDb();
    const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM lesson_activities WHERE lesson_id = ?', lessonId);
    const res = await db.runAsync(
      `INSERT INTO lesson_activities (lesson_id, type, question, image, choices_json, pairs_json, answers_json, hint, difficulty, allowed_methods_json, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      lessonId, input.type, input.question.trim(), input.image, JSON.stringify(input.choices), JSON.stringify(input.pairs),
      JSON.stringify(input.answers), input.hint.trim(), input.difficulty, JSON.stringify(input.allowedMethods), (max?.m ?? -1) + 1,
    );
    notify('lessons');
    return res.lastInsertRowId;
  },

  async updateActivity(id: number, input: LessonActivityInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE lesson_activities SET type = ?, question = ?, image = ?, choices_json = ?, pairs_json = ?, answers_json = ?, hint = ?,
         difficulty = ?, allowed_methods_json = ? WHERE id = ?`,
      input.type, input.question.trim(), input.image, JSON.stringify(input.choices), JSON.stringify(input.pairs),
      JSON.stringify(input.answers), input.hint.trim(), input.difficulty, JSON.stringify(input.allowedMethods), id,
    );
    notify('lessons');
  },

  async removeActivity(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM lesson_activities WHERE id = ?', id);
    notify('lessons', 'adaptive');
  },

  async moveActivity(id: number, direction: -1 | 1): Promise<void> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ lesson_id: number }>('SELECT lesson_id FROM lesson_activities WHERE id = ?', id);
    if (!row) return;
    await moveRow(db, 'lesson_activities', id, direction, 'lesson_id = ?', [row.lesson_id]);
    notify('lessons');
  },
};
