import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { WORD_ACTIVITIES } from '@/speechpractice/activities';
import { PLAIN_WORDS_SQL, SOUND_EXPLORER_SQL } from '@/adventure/adventureMap';
import type { ActivityPracticeRow, PracticeDay, SpeechEventInput, SpeechPracticeStats } from '@/speechpractice/types';

/**
 * Speech Practice tracking ("Practice History").
 *
 * Counts and minutes only — how much practice happened, never how well it went. There is no
 * audio, no score and no correctness column (see AGENTS.md and `check:db`). Sound Practice keeps
 * its own table from migration 5; the summaries here add it in, so a grown-up sees one total.
 */

/** Local midnight `daysAgo` days back, as a UTC timestamp, so "today" is the child's day. */
function startOfDay(daysAgo = 0): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysAgo, 0, 0, 0, 0).toISOString();
}

function localDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** A single screen visit is capped so a phone left open on the table does not count as an hour. */
const MAX_SESSION_MS = 30 * 60 * 1000;

interface EventRow {
  activity_id: string;
  kind: string;
  item: string;
  duration_ms: number;
  created_at: string;
}

interface SoundRow {
  sound_id: string;
  duration_ms: number;
  created_at: string;
}

export const speechPracticeRepo = {
  async record(input: SpeechEventInput): Promise<void> {
    const db = await getDb();
    const duration = Math.min(MAX_SESSION_MS, Math.max(0, Math.round(input.durationMs ?? 0)));
    await db.runAsync(
      'INSERT INTO speech_practice_events (activity_id, kind, item, duration_ms, created_at) VALUES (?, ?, ?, ?, ?)',
      input.activityId, input.kind, (input.item ?? '').slice(0, 80), duration, nowIso(),
    );
    notify('speechPractice');
  },

  /** How many of `items` have been practised in an activity (e.g. BA..BU in Syllables), all time. */
  async distinctItems(activityId: string, items: readonly string[]): Promise<number> {
    if (items.length === 0) return 0;
    const db = await getDb();
    const row = await db.getFirstAsync<{ n: number }>(
      `SELECT COUNT(DISTINCT UPPER(item)) AS n FROM speech_practice_events
        WHERE activity_id = ? AND kind IN ('attempt', 'exercise') AND UPPER(item) IN (${items.map(() => '?').join(', ')})`,
      activityId, ...items.map((i) => i.toUpperCase()),
    );
    return row?.n ?? 0;
  },

  /**
   * Steps practised per TARGET SOUND, from the scoped item keys the target journey writes
   * (`ba:listen`, `ba:words`…). One query rather than one per target, so the Home screen can
   * say which sound is in progress without five round trips.
   */
  async targetSteps(): Promise<{ target: string; steps: number }[]> {
    const db = await getDb();
    return db.getAllAsync<{ target: string; steps: number }>(
      `SELECT substr(item, 1, instr(item, ':') - 1) AS target,
              COUNT(DISTINCT item)                     AS steps
         FROM speech_practice_events
        WHERE activity_id = 'sounds' AND instr(item, ':') > 1
        GROUP BY target`,
    );
  },
  /** "Today's practice", including Sound Practice attempts. */
  /**
   * All-time counts, for badges and the progress screen: exercises done, activities touched and
   * how many different words/items have been practised.
   */
  async lifetime(): Promise<{ exercises: number; activities: number; words: number }> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ exercises: number; activities: number; words: number }>(
      `SELECT COUNT(*) AS exercises,
              COUNT(DISTINCT activity_id) AS activities,
              COUNT(DISTINCT CASE WHEN item <> '' THEN item END) AS words
         FROM speech_practice_events`,
    );
    // `words` above also counts the target journey's step keys (`ba:listen`); use the plain count.
    return { exercises: row?.exercises ?? 0, activities: row?.activities ?? 0, words: await this.plainWords() };
  },

  /**
   * Different real words/items practised, all time — WITHOUT the target journey's scoped step keys
   * (`ba:listen`), which `lifetime().words` counts as words. The Adventure Map's First Words stage
   * uses this so the Word Builder stage cannot fill it.
   */
  async plainWords(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ n: number }>(PLAIN_WORDS_SQL);
    return row?.n ?? 0;
  },

  /** Different sounds practised across the Sounds hub — see SOUND_EXPLORER_SQL for the sources. */
  async soundsExplored(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ n: number }>(SOUND_EXPLORER_SQL);
    return row?.n ?? 0;
  },

  async todayStats(): Promise<SpeechPracticeStats> {
    const db = await getDb();
    const since = startOfDay();
    const rows = await db.getAllAsync<EventRow>('SELECT * FROM speech_practice_events WHERE created_at >= ?', since);
    const sounds = await db.getAllAsync<SoundRow>('SELECT sound_id, duration_ms, created_at FROM sound_practice_attempts WHERE created_at >= ?', since);

    const words = new Set(
      rows
        .filter((r) => r.kind === 'exercise' && (WORD_ACTIVITIES as string[]).includes(r.activity_id) && r.item)
        .map((r) => r.item.toLowerCase()),
    );
    return {
      activitiesCompleted: rows.filter((r) => r.kind === 'complete').length,
      wordsPracticed: words.size,
      attempts: rows.filter((r) => r.kind === 'attempt').length + sounds.length,
      practiceMs:
        rows.filter((r) => r.kind === 'session').reduce((n, r) => n + r.duration_ms, 0) +
        sounds.reduce((n, r) => n + (r.duration_ms ?? 0), 0),
    };
  },

  /** Today, per activity — for Parent Mode. Sound Practice appears as "sounds". */
  async todayByActivity(): Promise<ActivityPracticeRow[]> {
    const db = await getDb();
    const since = startOfDay();
    const rows = await db.getAllAsync<EventRow>('SELECT * FROM speech_practice_events WHERE created_at >= ?', since);
    const sounds = await db.getAllAsync<SoundRow>('SELECT sound_id, duration_ms, created_at FROM sound_practice_attempts WHERE created_at >= ?', since);

    const byId = new Map<string, ActivityPracticeRow>();
    const row = (id: string) => {
      let r = byId.get(id);
      if (!r) byId.set(id, (r = { activityId: id, exercises: 0, attempts: 0, practiceMs: 0 }));
      return r;
    };
    for (const r of rows) {
      const a = row(r.activity_id);
      if (r.kind === 'exercise') a.exercises += 1;
      if (r.kind === 'attempt') a.attempts += 1;
      if (r.kind === 'session') a.practiceMs += r.duration_ms;
    }
    for (const s of sounds) {
      const a = row('sounds');
      a.attempts += 1;
      a.exercises += 1;
      a.practiceMs += s.duration_ms ?? 0;
    }
    return [...byId.values()].filter((r) => r.exercises + r.attempts + r.practiceMs > 0).sort((a, b) => b.practiceMs - a.practiceMs || b.exercises - a.exercises);
  },

  /** The last `days` days, newest first, days without practice included as zeros. */
  async history(days = 7): Promise<PracticeDay[]> {
    const db = await getDb();
    const since = startOfDay(days - 1);
    const rows = await db.getAllAsync<EventRow>('SELECT * FROM speech_practice_events WHERE created_at >= ?', since);
    const sounds = await db.getAllAsync<SoundRow>('SELECT sound_id, duration_ms, created_at FROM sound_practice_attempts WHERE created_at >= ?', since);

    const out: PracticeDay[] = [];
    for (let i = 0; i < days; i++) out.push({ date: localDate(startOfDay(i)), exercises: 0, attempts: 0, practiceMs: 0 });
    const find = (iso: string) => out.find((d) => d.date === localDate(iso));
    for (const r of rows) {
      const d = find(r.created_at);
      if (!d) continue;
      if (r.kind === 'exercise') d.exercises += 1;
      if (r.kind === 'attempt') d.attempts += 1;
      if (r.kind === 'session') d.practiceMs += r.duration_ms;
    }
    for (const s of sounds) {
      const d = find(s.created_at);
      if (!d) continue;
      d.attempts += 1;
      d.exercises += 1;
      d.practiceMs += s.duration_ms ?? 0;
    }
    return out;
  },
};
