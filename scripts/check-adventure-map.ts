// Adventure Map progress: runs the real migrations on Node's SQLite and the exact SQL the app uses.
// Regression: a sound practised in the Sounds hub (voice / speech tables) did not move Sound Explorer,
// which only read sound_practice_attempts. Run: npm run check:adventure-map
import { DatabaseSync } from 'node:sqlite';
import { MIGRATIONS } from '../src/database/schema';
import { PLAIN_WORDS_SQL, SOUND_EXPLORER_SQL, evaluateMap, newlyCompleted } from '../src/adventure/adventureMap';

const db = new DatabaseSync(':memory:');
for (const m of MIGRATIONS as any[]) db.exec(typeof m === 'string' ? m : (m.sql ?? m.up ?? ''));
const n = () => (db.prepare(SOUND_EXPLORER_SQL).get() as { n: number }).n;
const fails: string[] = [];
const eq = (label: string, got: unknown, want: unknown) => { if (got !== want) fails.push(`${label}: got ${got}, want ${want}`); };
const at = new Date().toISOString();

eq('new child', n(), 0);
db.prepare("INSERT INTO voice_practice_events (activity_id, category, kind, item, duration_ms, created_at) VALUES ('soundSay','sounds','voice-try','B',0,?)").run(at);
eq('one Say sound (voice table)', n(), 1);
db.prepare("INSERT INTO speech_practice_events (activity_id, kind, item, duration_ms, created_at) VALUES ('sounds','exercise','b',0,?)").run(at);
eq('same sound in speech table counts once', n(), 1);
db.prepare("INSERT INTO speech_practice_events (activity_id, kind, item, duration_ms, created_at) VALUES ('matching','exercise','M',0,?)").run(at);
eq('second sound', n(), 2);
db.prepare("INSERT INTO speech_practice_events (activity_id, kind, item, duration_ms, created_at) VALUES ('sounds','exercise','ba:listen',0,?)").run(at);
eq('target-journey step is not a sound', n(), 2);
db.prepare("INSERT INTO speech_practice_events (activity_id, kind, item, duration_ms, created_at) VALUES ('sounds','session','',0,?)").run(at);
eq('empty session row ignored', n(), 2);
db.prepare("INSERT INTO speech_practice_events (activity_id, kind, item, duration_ms, created_at) VALUES ('words','exercise','cat',0,?)").run(at);
eq('other activity ignored', n(), 2);
db.prepare("INSERT INTO sound_practice_attempts (sound_id, level, item, duration_ms, created_at) VALUES ('s1','sound','S',0,?)").run(at);
eq('Sound Practice screen still counts', n(), 3);

const st = evaluateMap({ wordsPractised: 0, soundsPractised: n(), targetSteps: 0, speechExercises: 0 });
eq('map Sound Explorer count', st[1].count, 3);
eq('map Sound Explorer capped at goal', evaluateMap({ wordsPractised: 0, soundsPractised: 99, targetSteps: 0, speechExercises: 0 })[1].count, 5);

const words = () => (db.prepare(PLAIN_WORDS_SQL).get() as { n: number }).n;
eq('journey keys and sounds-hub items: words', words(), 3);
db.prepare("INSERT INTO speech_practice_events (activity_id, kind, item, duration_ms, created_at) VALUES ('words','exercise','CAT',0,?)").run(at);
eq('duplicate word, any case, counts once', words(), 3);

// Celebration: only a real incomplete -> complete change, once.
const z = { wordsPractised: 0, soundsPractised: 0, targetSteps: 0, speechExercises: 0 };
const seen = new Set<string>();
eq('incomplete: nothing to celebrate', newlyCompleted(seen, evaluateMap(z)).length, 0);
const first = newlyCompleted(seen, evaluateMap({ ...z, wordsPractised: 5 }));
eq('newly completed stage', first.join(), 'firstWords');
first.forEach((id) => seen.add(id));
eq('refresh/reopen does not repeat', newlyCompleted(seen, evaluateMap({ ...z, wordsPractised: 9 })).length, 0);
const baseline = new Set(evaluateMap({ ...z, wordsPractised: 5 }).filter((s) => s.done).map((s) => s.def.id));
eq('already completed at first look stays silent', newlyCompleted(baseline, evaluateMap({ ...z, wordsPractised: 5 })).length, 0);
const all = evaluateMap({ wordsPractised: 5, soundsPractised: 5, targetSteps: 12, speechExercises: 30 });
eq('all complete: no current stage', all.some((s) => s.current), false);
eq('all complete: four done', all.filter((s) => s.done).length, 4);
eq('incomplete: one current', evaluateMap(z).filter((s) => s.current).length, 1);

if (fails.length) { console.error('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('Adventure map progress OK');
