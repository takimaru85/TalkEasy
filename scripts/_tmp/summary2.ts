import { getDb } from '@/database/db';
import { summaryRepo, weekRange } from '@/database/repositories/summaryRepo';
(async () => {
  const db = await getDb();
  const now = new Date().toISOString();
  const lesson: any = await db.getFirstAsync('SELECT l.id, (SELECT COUNT(*) FROM lesson_activities la WHERE la.lesson_id = l.id) AS size FROM lessons l ORDER BY id LIMIT 1');
  const acts: any[] = await db.getAllAsync('SELECT id FROM lesson_activities WHERE lesson_id = ?', lesson.id);
  for (const a of acts) await db.runAsync("INSERT INTO adaptive_attempts (child_id, lesson_id, activity_id, answer_method, correct, attempts, answer_text, completed_at) VALUES (1, ?, ?, 'tap', 1, 1, '', ?)", lesson.id, a.id, now);
  const today = weekRange(0).days[(new Date().getDay() + 6) % 7];
  await db.runAsync("INSERT INTO assignments (title, status, due_date, completed_at, created_at, updated_at) VALUES ('A','done',?,?,?,?),('B','todo',?,NULL,?,?)", today, now, now, now, today, now, now);
  const w = await summaryRepo.weekly(weekRange(0), 1);
  console.log({ lessonSize: lesson.size, lessons: w.lessonsCompleted, done: w.assignmentsDone, total: w.assignmentsTotal });
  const last = await summaryRepo.weekly(weekRange(1), 1);
  console.log({ lastWeekLessons: last.lessonsCompleted, lastWeekDone: last.assignmentsDone });
  console.log(w.lessonsCompleted === 1 && w.assignmentsDone === 1 && w.assignmentsTotal >= 2 && last.lessonsCompleted === 0 ? 'ALL OK' : 'MISMATCH');
})().catch((e) => { console.error(e); process.exit(1); });
