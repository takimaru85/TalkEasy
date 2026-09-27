import { getDb } from '../db';
import { WORD_ACTIVITIES } from '@/speechpractice/activities';

/**
 * Parent Mode summaries: "Today's progress" and "Weekly progress".
 *
 * Every number is COUNTED from what the app already records — practice logs, attempts, star
 * events, the routine log — never stored as a total. They describe activity (what was done, how
 * often), not ability: no score, no percentage correct, nothing that reads as an assessment.
 */

/** Local YYYY-MM-DD. */
export function localDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface WeekRange {
  /** UTC timestamps bounding the local week, for created_at comparisons. */
  startIso: string;
  endIso: string;
  /** Local days Monday..Sunday. */
  days: string[];
}

/** The local Monday-to-Sunday week, `offset` weeks back (0 = this week). */
export function weekRange(offset = 0, now = new Date()): WeekRange {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - offset * 7);
  const next = new Date(monday);
  next.setDate(next.getDate() + 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return localDay(d);
  });
  return { startIso: monday.toISOString(), endIso: next.toISOString(), days };
}

export interface WeeklySummary {
  speechSessions: number;
  wordsPracticed: number;
  soundsPracticed: number;
  lessonsCompleted: number;
  assignmentsDone: number;
  /** Assignments due this week, plus any finished this week that were due another time. */
  assignmentsTotal: number;
  learningActivities: number;
  handwritingSessions: number;
  starsEarned: number;
  /** Share of My Day steps ticked, over the days My Day was used; null if it was not used. */
  routinePercent: number | null;
  routineDays: number;
  routineSteps: number;
  /** Highlights. */
  topSound: { soundId: string; count: number } | null;
  newWords: number;
  topSpeechActivity: { activityId: string; count: number } | null;
  topLearnActivity: { activityKey: string; count: number } | null;
}

const n = (row: { n: number | null } | null) => row?.n ?? 0;

export const summaryRepo = {
  async weekly(range: WeekRange, childId: number): Promise<WeeklySummary> {
    const db = await getDb();
    const { startIso: s, endIso: e } = range;
    const wordList = WORD_ACTIVITIES.map(() => '?').join(', ');

    const [
      speechSessions, soundSessions, words, sounds, lessons, done, total, learning, handwriting, stars,
      routineSteps, routineDays, routineSize, topSound, newWords, topSpeech, topLearn,
    ] = await Promise.all([
      db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM speech_practice_events WHERE kind = 'session' AND created_at >= ? AND created_at < ?", s, e),
      // A sound practised on a day counts as one Sound Practice session.
      db.getFirstAsync<{ n: number }>("SELECT COUNT(DISTINCT sound_id || date(created_at, 'localtime')) AS n FROM sound_practice_attempts WHERE created_at >= ? AND created_at < ?", s, e),
      db.getFirstAsync<{ n: number }>(
        `SELECT COUNT(DISTINCT UPPER(item)) AS n FROM speech_practice_events
          WHERE item <> '' AND kind IN ('attempt', 'exercise') AND activity_id IN (${wordList}) AND created_at >= ? AND created_at < ?`,
        ...WORD_ACTIVITIES, s, e,
      ),
      db.getFirstAsync<{ n: number }>('SELECT COUNT(DISTINCT sound_id) AS n FROM sound_practice_attempts WHERE created_at >= ? AND created_at < ?', s, e),
      // A lesson counts in the week its last question was answered, once every question has been.
      db.getFirstAsync<{ n: number }>(
        `SELECT COUNT(*) AS n FROM (
           SELECT a.lesson_id, MAX(a.completed_at) AS last, COUNT(DISTINCT a.activity_id) AS answered,
                  (SELECT COUNT(*) FROM lesson_activities la WHERE la.lesson_id = a.lesson_id) AS size
             FROM adaptive_attempts a WHERE a.child_id = ? GROUP BY a.lesson_id
         ) WHERE size > 0 AND answered >= size AND last >= ? AND last < ?`,
        childId, s, e,
      ),
      db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM assignments WHERE status = 'done' AND completed_at >= ? AND completed_at < ?", s, e),
      db.getFirstAsync<{ n: number }>(
        "SELECT COUNT(*) AS n FROM assignments WHERE (due_date >= ? AND due_date <= ?) OR (status = 'done' AND completed_at >= ? AND completed_at < ?)",
        range.days[0], range.days[6], s, e,
      ),
      db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM learning_progress WHERE played_at >= ? AND played_at < ?', s, e),
      db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM handwriting_sessions WHERE child_id = ? AND completed_at >= ? AND completed_at < ?', childId, s, e),
      db.getFirstAsync<{ n: number | null }>('SELECT SUM(amount) AS n FROM star_events WHERE amount > 0 AND created_at >= ? AND created_at < ?', s, e),
      db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM routine_log WHERE day >= ? AND day <= ?', range.days[0], range.days[6]),
      db.getFirstAsync<{ n: number }>('SELECT COUNT(DISTINCT day) AS n FROM routine_log WHERE day >= ? AND day <= ?', range.days[0], range.days[6]),
      db.getFirstAsync<{ n: number }>(
        `SELECT COUNT(*) AS n FROM routine_items WHERE routine_id =
           COALESCE((SELECT id FROM routines WHERE is_active = 1 ORDER BY id LIMIT 1), (SELECT id FROM routines ORDER BY id LIMIT 1))`,
      ),
      db.getFirstAsync<{ soundId: string; count: number }>(
        'SELECT sound_id AS soundId, COUNT(*) AS count FROM sound_practice_attempts WHERE created_at >= ? AND created_at < ? GROUP BY sound_id ORDER BY count DESC LIMIT 1',
        s, e,
      ),
      // Words met for the first time this week.
      db.getFirstAsync<{ n: number }>(
        `SELECT COUNT(*) AS n FROM (
           SELECT UPPER(item) AS w, MIN(created_at) AS first FROM speech_practice_events
            WHERE item <> '' AND kind IN ('attempt', 'exercise') AND activity_id IN (${wordList})
            GROUP BY UPPER(item)
         ) WHERE first >= ? AND first < ?`,
        ...WORD_ACTIVITIES, s, e,
      ),
      db.getFirstAsync<{ activityId: string; count: number }>(
        "SELECT activity_id AS activityId, COUNT(*) AS count FROM speech_practice_events WHERE kind IN ('exercise', 'complete') AND created_at >= ? AND created_at < ? GROUP BY activity_id ORDER BY count DESC LIMIT 1",
        s, e,
      ),
      db.getFirstAsync<{ activityKey: string; count: number }>(
        'SELECT activity_key AS activityKey, COUNT(*) AS count FROM learning_progress WHERE played_at >= ? AND played_at < ? GROUP BY activity_key ORDER BY count DESC LIMIT 1',
        s, e,
      ),
    ]);

    const steps = n(routineSteps);
    const daysUsed = n(routineDays);
    const size = n(routineSize);
    return {
      speechSessions: n(speechSessions) + n(soundSessions),
      wordsPracticed: n(words),
      soundsPracticed: n(sounds),
      lessonsCompleted: n(lessons),
      assignmentsDone: n(done),
      assignmentsTotal: n(total),
      learningActivities: n(learning),
      handwritingSessions: n(handwriting),
      starsEarned: n(stars),
      routinePercent: daysUsed > 0 && size > 0 ? Math.min(100, Math.round((steps / (size * daysUsed)) * 100)) : null,
      routineDays: daysUsed,
      routineSteps: steps,
      topSound: topSound && topSound.count > 0 ? topSound : null,
      newWords: n(newWords),
      topSpeechActivity: topSpeech && topSpeech.count > 0 ? topSpeech : null,
      topLearnActivity: topLearn && topLearn.count > 0 ? topLearn : null,
    };
  },

  /** Today, for the dashboard: assignments finished today, and Speech Practice exercises today. */
  async today(): Promise<{ assignmentsDoneToday: number; speechToday: number; learningToday: number }> {
    const db = await getDb();
    const d = new Date();
    const since = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const [assignments, speech, sound, learning] = await Promise.all([
      db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM assignments WHERE status = 'done' AND completed_at >= ?", since),
      db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM speech_practice_events WHERE kind = 'exercise' AND created_at >= ?", since),
      db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM sound_practice_attempts WHERE created_at >= ?', since),
      db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM learning_progress WHERE played_at >= ?', since),
    ]);
    return { assignmentsDoneToday: n(assignments), speechToday: n(speech) + n(sound), learningToday: n(learning) };
  },

  /** Stars earned (positive events only) since a moment. */
  async starsEarnedSince(iso: string): Promise<number> {
    const db = await getDb();
    return n(await db.getFirstAsync<{ n: number | null }>('SELECT SUM(amount) AS n FROM star_events WHERE amount > 0 AND created_at >= ?', iso));
  },
};
