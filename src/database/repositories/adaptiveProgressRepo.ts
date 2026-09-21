import { getDb, nowIso } from '../db';
import { notify } from '../events';
import type { AdaptiveAttempt, AdaptiveProgress, AnswerMethod, HandwritingSession } from '@/adaptive/types';

interface AttemptRow {
  id: number;
  child_id: number;
  lesson_id: number;
  activity_id: number;
  answer_method: string;
  correct: number;
  attempts: number;
  answer_text: string;
  completed_at: string;
}

interface HandwritingRow {
  id: number;
  child_id: number;
  level: number;
  item: string;
  strokes: number;
  duration_ms: number;
  completed_at: string;
}

const toAttempt = (r: AttemptRow): AdaptiveAttempt => ({
  id: r.id,
  childId: r.child_id,
  lessonId: r.lesson_id,
  activityId: r.activity_id,
  answerMethod: r.answer_method as AnswerMethod,
  correct: r.correct === 1,
  attempts: r.attempts,
  answerText: r.answer_text,
  completedAt: r.completed_at,
});

const toSession = (r: HandwritingRow): HandwritingSession => ({
  id: r.id,
  childId: r.child_id,
  level: r.level,
  item: r.item,
  strokes: r.strokes,
  durationMs: r.duration_ms,
  completedAt: r.completed_at,
});

export const HANDWRITING_LEVEL_COUNT = 7;

/**
 * Learning attempts (how the child answered) and handwriting practice sessions.
 * The two are summarised separately: learning progress must never be dragged down by
 * handwriting difficulty.
 */
export const adaptiveProgressRepo = {
  async recordAttempt(entry: { childId: number; lessonId: number; activityId: number; answerMethod: AnswerMethod; correct: boolean; attempts: number; answerText?: string }): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO adaptive_attempts (child_id, lesson_id, activity_id, answer_method, correct, attempts, answer_text, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      entry.childId, entry.lessonId, entry.activityId, entry.answerMethod, entry.correct ? 1 : 0, entry.attempts,
      (entry.answerText ?? '').slice(0, 200), nowIso(),
    );
    notify('adaptive');
  },

  async recordHandwriting(entry: { childId: number; level: number; item: string; strokes: number; durationMs: number }): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'INSERT INTO handwriting_sessions (child_id, level, item, strokes, duration_ms, completed_at) VALUES (?, ?, ?, ?, ?, ?)',
      entry.childId, entry.level, entry.item, entry.strokes, entry.durationMs, nowIso(),
    );
    notify('adaptive');
  },

  /** Ids of activities in a lesson the child has answered correctly. */
  async getCompletedActivityIds(childId: number, lessonId: number): Promise<Set<number>> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ activity_id: number }>(
      'SELECT DISTINCT activity_id FROM adaptive_attempts WHERE child_id = ? AND lesson_id = ? AND correct = 1',
      childId, lessonId,
    );
    return new Set(rows.map((r) => r.activity_id));
  },

  async getRecentAttempts(childId: number, limit = 30): Promise<AdaptiveAttempt[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<AttemptRow>(
      'SELECT * FROM adaptive_attempts WHERE child_id = ? ORDER BY completed_at DESC, id DESC LIMIT ?', childId, limit,
    );
    return rows.map(toAttempt);
  },

  async getHandwritingSessions(childId: number, limit = 30): Promise<HandwritingSession[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<HandwritingRow>(
      'SELECT * FROM handwriting_sessions WHERE child_id = ? ORDER BY completed_at DESC, id DESC LIMIT ?', childId, limit,
    );
    return rows.map(toSession);
  },

  async getProgress(childId: number): Promise<AdaptiveProgress> {
    const db = await getDb();

    // Learning: one row per activity, "correct" if ANY attempt was correct (persistence counts).
    const perActivity = await db.getAllAsync<{ activity_id: number; lesson_id: number; subject_id: number | null; s_name: string | null; s_icon: string | null; best: number }>(
      `SELECT t.activity_id, t.lesson_id, l.subject_id, s.name AS s_name, s.icon AS s_icon, MAX(t.correct) AS best
       FROM adaptive_attempts t
       JOIN lessons l ON l.id = t.lesson_id
       LEFT JOIN subjects s ON s.id = l.subject_id
       WHERE t.child_id = ?
       GROUP BY t.activity_id`,
      childId,
    );
    const questionsAnswered = perActivity.length;
    const correctAnswers = perActivity.filter((p) => p.best === 1).length;

    const subjectMap = new Map<string, AdaptiveProgress['subjects'][number]>();
    for (const p of perActivity) {
      const key = String(p.subject_id ?? 'none');
      const s = subjectMap.get(key) ?? { subjectId: p.subject_id, name: p.s_name ?? 'Other', icon: p.s_icon ?? '📘', correct: 0, total: 0 };
      s.total += 1;
      if (p.best === 1) s.correct += 1;
      subjectMap.set(key, s);
    }

    const methodRows = await db.getAllAsync<{ answer_method: string; n: number; c: number }>(
      'SELECT answer_method, COUNT(*) AS n, SUM(correct) AS c FROM adaptive_attempts WHERE child_id = ? GROUP BY answer_method',
      childId,
    );
    const methods = methodRows.map((m) => ({ method: m.answer_method as AnswerMethod, count: m.n, correct: m.c }));
    const find = (m: AnswerMethod) => methods.find((x) => x.method === m) ?? { method: m, count: 0, correct: 0 };

    const lessons = await db.getAllAsync<{ id: number; total: number; done: number }>(
      `SELECT l.id,
         (SELECT COUNT(*) FROM lesson_activities a WHERE a.lesson_id = l.id) AS total,
         (SELECT COUNT(DISTINCT a.id) FROM lesson_activities a JOIN adaptive_attempts t ON t.activity_id = a.id AND t.child_id = ? AND t.correct = 1 WHERE a.lesson_id = l.id) AS done
       FROM lessons l WHERE l.is_active = 1`,
      childId,
    );
    const lessonsWithWork = lessons.filter((l) => l.total > 0);
    const lessonsCompleted = lessonsWithWork.filter((l) => l.done >= l.total).length;

    // Handwriting: separate. "Percent" = share of the 7 levels the child has practised at least once.
    const hw = await db.getAllAsync<{ level: number; n: number }>(
      'SELECT level, COUNT(*) AS n FROM handwriting_sessions WHERE child_id = ? GROUP BY level', childId,
    );
    const levels = hw.map((h) => h.level).sort((a, b) => a - b);
    const handwritingSessions = hw.reduce((n, h) => n + h.n, 0);

    return {
      learningPercent: questionsAnswered ? Math.round((correctAnswers / questionsAnswered) * 100) : 0,
      questionsAnswered,
      correctAnswers,
      lessonsCompleted,
      lessonsTotal: lessonsWithWork.length,
      subjects: [...subjectMap.values()],
      methods,
      handwritingSessions,
      handwritingLevelsPractised: levels,
      handwritingPercent: Math.round((levels.length / HANDWRITING_LEVEL_COUNT) * 100),
      speechAnswers: { count: find('speak').count, correct: find('speak').correct },
      typingAnswers: { count: find('type').count, correct: find('type').correct },
    };
  },
};
