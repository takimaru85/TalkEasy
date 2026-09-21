// Sanity check for the data layer: runs the real migrations, seed and reorder helper against
// Node's built-in SQLite through a tiny shim of the expo-sqlite API. Run: npm run check:db
//
// Two scenarios are exercised:
//   1. fresh install   — all migrations then seed
//   2. v1 -> v2 upgrade — migration 1 + v1 seed shape, then migration 2 + seed v2 additions
import { DatabaseSync } from 'node:sqlite';
import { MIGRATIONS } from '../src/database/schema';
import { seedIfNeeded } from '../src/database/seed';
import { moveRow } from '../src/database/reorder';

function makeShim(raw: DatabaseSync): any {
  const shim: any = {
    execAsync: async (sql: string) => raw.exec(sql),
    runAsync: async (sql: string, ...params: any[]) => {
      const r = raw.prepare(sql).run(...params);
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: r.changes };
    },
    getFirstAsync: async (sql: string, ...params: any[]) => raw.prepare(sql).get(...params) ?? null,
    getAllAsync: async (sql: string, ...params: any[]) => raw.prepare(sql).all(...params),
    withTransactionAsync: async (task: () => Promise<void>) => { raw.exec('BEGIN'); try { await task(); raw.exec('COMMIT'); } catch (e) { raw.exec('ROLLBACK'); throw e; } },
    withExclusiveTransactionAsync: async (task: (txn: any) => Promise<void>) => { raw.exec('BEGIN'); try { await task(shim); raw.exec('COMMIT'); } catch (e) { raw.exec('ROLLBACK'); throw e; } },
  };
  return shim;
}

function migrate(raw: DatabaseSync, upTo: number) {
  const current = (raw.prepare('PRAGMA user_version').get() as any).user_version as number;
  for (const m of MIGRATIONS) {
    if (m.version <= current || m.version > upTo) continue;
    raw.exec(m.sql);
    raw.exec(`PRAGMA user_version = ${m.version}`);
  }
}

const count = (raw: DatabaseSync, t: string) => (raw.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as any).n as number;
const labels = (raw: DatabaseSync, sql: string) => (raw.prepare(sql).all() as any[]).map((r) => r.label ?? r.name).join(', ');

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error('ASSERT: ' + msg);
}

async function freshInstall() {
  console.log('--- fresh install');
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  migrate(raw, 99);
  const shim = makeShim(raw);
  await seedIfNeeded(shim);
  await seedIfNeeded(shim); // no-op

  console.log('categories:', labels(raw, 'SELECT name FROM categories ORDER BY sort_order'));
  console.log('buttons', count(raw, 'communication_buttons'), '| favorites', count(raw, 'favorites'),
    '| routine items', count(raw, 'routine_items'), '| therapy', count(raw, 'therapy_activities'),
    '| subjects', count(raw, 'subjects'));
  console.log('school:', labels(raw, `SELECT b.label FROM communication_buttons b JOIN categories c ON c.id=b.category_id WHERE c.key='school' ORDER BY b.sort_order`));
  console.log('favorites:', labels(raw, `SELECT b.label FROM favorites f JOIN communication_buttons b ON b.id=f.button_id ORDER BY f.sort_order`));
  console.log('subjects:', labels(raw, 'SELECT name FROM subjects ORDER BY sort_order'));
  assert(count(raw, 'categories') === 11, 'eleven categories');
  assert(count(raw, 'child_profile') === 1, 'demo profile seeded');
  assert((raw.prepare('SELECT name FROM child_profile').get() as any).name === 'Brayden', 'profile name');
  assert(count(raw, 'rewards') === 3, 'three rewards');
  assert(count(raw, 'lessons') === 4, 'four demo lessons');
  assert(count(raw, 'lesson_activities') === 12, 'twelve demo activities');
  raw.prepare("INSERT INTO adaptive_attempts (child_id, lesson_id, activity_id, answer_method, correct, attempts, answer_text, completed_at) VALUES (1, 1, 1, 'speak', 1, 1, 'sunlight', 'x')").run();
  raw.prepare('DELETE FROM lessons WHERE id = 1').run();
  assert(count(raw, 'adaptive_attempts') === 0, 'attempts cascade with lesson');
  assert(count(raw, 'routine_items') === 12, 'twelve routine steps');
  assert((raw.prepare("SELECT segment FROM routine_items WHERE label='Bedtime'").get() as any).segment === 'evening', 'segment seeded');
  raw.prepare("INSERT INTO star_events (amount, reason, source, created_at) VALUES (3, 'test', 'manual', 'x')").run();
  assert((raw.prepare('SELECT SUM(amount) AS t FROM star_events').get() as any).t === 3, 'star ledger');
  assert(count(raw, 'subjects') === 7, 'seven subjects');
  assert(count(raw, 'favorites') === 8, 'eight favorites');

  // Assignments + events + schedule smoke test
  const subj = (raw.prepare(`SELECT id FROM subjects WHERE name='Mathematics'`).get() as any).id;
  raw.prepare(`INSERT INTO assignments (subject_id,title,description,kind,date_assigned,due_date,priority,status,notes,created_at,updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(subj, 'Answer pages 25-26', '', 'assignment', '2026-09-18', '2026-09-21', 'medium', 'todo', '', 'x', 'x');
  raw.prepare(`INSERT INTO subject_schedule (subject_id, day_of_week, start_time, end_time) VALUES (?,?,?,?)`).run(subj, 1, '10:00', '11:00');
  raw.prepare(`INSERT INTO school_events (title,event_type,subject_id,date,time,notes,created_at) VALUES (?,?,?,?,?,?,?)`).run('Family day', 'event', null, '2026-09-25', null, '', 'x');
  raw.prepare(`INSERT INTO learning_progress (activity_key,subject_key,difficulty,correct,total,played_at) VALUES (?,?,?,?,?,?)`).run('math.counting', 'math', 'easy', 4, 5, 'x');
  const joined = raw.prepare(`SELECT a.title, s.name AS subject FROM assignments a LEFT JOIN subjects s ON s.id=a.subject_id`).get() as any;
  console.log('assignment join:', joined.title, '/', joined.subject);
  raw.prepare(`DELETE FROM subjects WHERE id = ?`).run(subj);
  const orphan = raw.prepare(`SELECT subject_id FROM assignments`).get() as any;
  assert(orphan.subject_id === null, 'assignment subject set to NULL after subject delete');
  assert(count(raw, 'subject_schedule') === 0, 'schedule cascades on subject delete');

  // therapy log
  const th = (raw.prepare(`SELECT id FROM therapy_activities LIMIT 1`).get() as any).id;
  raw.prepare(`INSERT INTO activity_logs (therapy_activity_id, completed_at, note) VALUES (?,?,?)`).run(th, 'x', '');
  raw.prepare(`DELETE FROM therapy_activities WHERE id=?`).run(th);
  assert(count(raw, 'activity_logs') === 0, 'activity logs cascade');

  const basic = (raw.prepare(`SELECT id FROM categories WHERE key='needs'`).get() as any).id;
  const help = (raw.prepare(`SELECT id FROM communication_buttons WHERE label='Help' AND category_id=?`).get(basic) as any).id;
  await moveRow(shim, 'communication_buttons', help, -1, 'category_id = ?', [basic]);
  console.log('fresh OK');
}

async function upgradeFromV1() {
  console.log('--- v1 -> v2 upgrade');
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  migrate(raw, 1);
  // Reproduce the v1 seed shape: needs/people/choices/body/feelings/custom + the seeded_v1 flag.
  const cats = ['needs', 'people', 'choices', 'body', 'feelings', 'custom'];
  cats.forEach((k, i) => raw.prepare(`INSERT INTO categories (key,name,icon,color,sort_order,is_system,show_on_home) VALUES (?,?,?,?,?,1,?)`).run(k, k, 'star', '#fff', i, k === 'feelings' ? 0 : 1));
  const id = (k: string) => (raw.prepare(`SELECT id FROM categories WHERE key=?`).get(k) as any).id;
  const ins = (cat: string, label: string) => raw.prepare(`INSERT INTO communication_buttons (category_id,label,phrase,icon,color,sort_order,is_system,is_hidden,tap_count,created_at,updated_at) VALUES (?,?,?,?,?,0,1,0,3,'x','x')`).run(id(cat), label, label, 'star', '#fff');
  ins('needs', 'Water'); ins('choices', 'Yes'); ins('body', "I'm tired"); ins('people', 'Dad'); ins('custom', 'Blanket');
  raw.prepare(`INSERT INTO app_settings (key,value) VALUES ('seeded_v1','x'), ('parentPin','9999')`).run();
  raw.prepare(`INSERT INTO exercises (name,icon,instructions,duration_minutes,is_completed,sort_order,created_at) VALUES ('Arm stretch','arm-flex','',5,0,0,'x')`).run();
  raw.prepare(`INSERT INTO routines (name,is_active,created_at) VALUES ('My day',1,'x')`).run();
  raw.prepare(`INSERT INTO routine_items (routine_id,label,icon,sort_order,is_done) VALUES (1,'Wake up','x',0,0)`).run();
  // (start_time column exists only after migration 2; set it after migrating)

  migrate(raw, 2);
  raw.prepare("UPDATE routine_items SET start_time='06:30' WHERE label='Wake up'").run();
  migrate(raw, 99);
  await seedIfNeeded(makeShim(raw));

  console.log('categories:', labels(raw, 'SELECT name FROM categories ORDER BY sort_order'));
  assert(count(raw, 'categories') === 11, 'choices/body merged, new categories added');
  assert(count(raw, 'child_profile') === 1, 'profile created on upgrade');
  assert((raw.prepare("SELECT segment FROM routine_items WHERE label='Wake up'").get() as any).segment === 'morning', 'segment guessed on upgrade');
  const yes = raw.prepare(`SELECT c.key FROM communication_buttons b JOIN categories c ON c.id=b.category_id WHERE b.label='Yes'`).get() as any;
  assert(yes.key === 'needs', 'Yes moved into Basic');
  const water = raw.prepare(`SELECT tap_count FROM communication_buttons WHERE label='Water'`).get() as any;
  assert(water.tap_count === 3, 'existing Water row kept (tap_count preserved), not duplicated');
  assert(count(raw, 'communication_buttons') > 30, 'new defaults added');
  assert((raw.prepare(`SELECT value FROM app_settings WHERE key='parentPin'`).get() as any).value === '9999', 'PIN preserved');
  assert(count(raw, 'therapy_activities') === 1, 'exercises renamed to therapy_activities with data');
  assert(count(raw, 'subjects') === 7, 'subjects seeded on upgrade');
  assert(count(raw, 'routines') === 1, 'routine not duplicated on upgrade');
  assert((raw.prepare(`SELECT value FROM app_settings WHERE key='seed_version'`).get() as any).value === '4', 'seed_version recorded');
  assert(count(raw, 'lessons') === 4, 'demo lessons added on upgrade');
  assert((raw.prepare('SELECT assistance_level FROM child_profile').get() as any).assistance_level === 'assisted', 'assistance level default');
  console.log('upgrade OK');
}

(async () => {
  await freshInstall();
  await upgradeFromV1();
  console.log('ALL OK');
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
