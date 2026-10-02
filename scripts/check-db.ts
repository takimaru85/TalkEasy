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
import { DEFAULT_THERAPY, SEED_VERSION } from '../src/constants/defaults';
import { existsSync, readFileSync } from 'node:fs';
import { ACTIVITY_PICTURES, ACTIVITY_PICTURE_RATIO, activityPictureKey } from '../src/activities/pictures';

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

// Migration 6: Speech Practice. Same rule as Sound Practice - a practice log, never audio and
// never a score - plus the My Words flag on Talk cards, off for every existing card.
function checkSpeechPractice(raw: DatabaseSync) {
  const cols = (raw.prepare('PRAGMA table_info(speech_practice_events)').all() as any[]).map((c) => c.name);
  assert(cols.includes('activity_id') && cols.includes('kind') && cols.includes('duration_ms'), 'speech practice columns');
  assert(!cols.some((c: string) => /audio|uri|path|recording|score|correct|accuracy/.test(c)), 'speech practice stores no audio and no score');
  raw.prepare("INSERT INTO speech_practice_events (activity_id, kind, item, duration_ms, created_at) VALUES ('words','exercise','Dog',0,?)").run(new Date().toISOString());
  assert(count(raw, 'speech_practice_events') === 1, 'speech practice event recorded');
  const buttonCols = (raw.prepare('PRAGMA table_info(communication_buttons)').all() as any[]).map((c) => c.name);
  assert(buttonCols.includes('practice'), 'communication_buttons.practice added');
  assert((raw.prepare('SELECT COUNT(*) AS n FROM communication_buttons WHERE practice = 1').get() as any).n === 0, 'no card is a practice word by default');
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
  // Migration 5: Sound Practice tracking. The table must exist and must hold no audio column -
  // the child's recording is temporary and is never persisted (see soundPracticeRepo).
  const soundCols = (raw.prepare('PRAGMA table_info(sound_practice_attempts)').all() as any[]).map((c) => c.name);
  assert(soundCols.length > 0, 'sound_practice_attempts created');
  assert(soundCols.includes('sound_id') && soundCols.includes('level') && soundCols.includes('duration_ms'), 'sound practice columns');
  assert(!soundCols.some((c: string) => /audio|uri|path|recording|score|correct/.test(c)), 'sound practice stores no audio and no score');
  raw.prepare("INSERT INTO sound_practice_attempts (sound_id, level, item, duration_ms, created_at) VALUES ('b','sound','B',1200,?)").run(new Date().toISOString());
  assert(count(raw, 'sound_practice_attempts') === 1, 'sound practice attempt recorded');
  checkSpeechPractice(raw);

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
  // A lesson is SPOKEN in the language it is WRITTEN in, so the language has to survive seeding.
  // It did not: the seed had its own INSERT that never listed the column, and a freshly installed
  // Filipino lesson was read out by an English voice ("Mga" as the letters M, G, A).
  const seeded = raw.prepare('SELECT title, language FROM lessons ORDER BY id').all() as any[];
  const filipino = seeded.find((l) => l.title.startsWith('Mga hayop'));
  assert(filipino?.language === 'fil-PH', 'the seeded Filipino lesson carries its language');
  // The free allowance applies to built-in lessons only, so seeding must say which they are — the
  // same shape of bug as the language column, which the seed's own INSERT silently dropped.
  const builtin = raw.prepare('SELECT title, is_builtin FROM lessons').all() as any[];
  assert(builtin.length > 0 && builtin.every((l) => l.is_builtin === 1), 'every seeded lesson is marked built-in');
  assert(seeded.filter((l) => l !== filipino).every((l) => l.language === ''), 'English lessons seed with the app voice');
  // ---- the retired 'therapy' activity category (migration 16) ------------------------------------
  // Therapy is its own section now. A fresh install must not seed the six old therapy activities,
  // and no activity may be left in a category the Activities screen no longer shows — a row whose
  // category has no metadata would blow up when the screen looked up its label.
  const cats = (raw.prepare('SELECT DISTINCT category FROM therapy_activities').all() as any[]).map((r) => r.category);
  assert(!cats.includes('therapy'), "a fresh install seeds no 'therapy' activities");
  const KNOWN = ['games', 'art', 'music', 'exercise', 'reading', 'outdoor', 'sensory', 'chores'];
  assert(cats.every((c: string) => KNOWN.includes(c)), 'every seeded activity is in a category the screen can show');

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
  // The v1 row must survive the rename, and the default activities must arrive alongside it
  // without duplicating anything the parent already has.
  const survived = (raw.prepare("SELECT COUNT(*) AS n FROM therapy_activities WHERE name='Arm stretch'").get() as any).n;
  assert(survived === 1, 'the v1 exercise row survived the rename to therapy_activities');
  assert(count(raw, 'therapy_activities') === DEFAULT_THERAPY.length + 1, 'default activities added on upgrade, existing row kept');
  assert(count(raw, 'subjects') === 7, 'subjects seeded on upgrade');
  assert(count(raw, 'routines') === 1, 'routine not duplicated on upgrade');
  assert((raw.prepare(`SELECT value FROM app_settings WHERE key='seed_version'`).get() as any).value === String(SEED_VERSION), 'seed_version recorded');
  assert(count(raw, 'lessons') === 4, 'demo lessons added on upgrade');
  assert((raw.prepare('SELECT assistance_level FROM child_profile').get() as any).assistance_level === 'assisted', 'assistance level default');
  // Migration 5: Sound Practice tracking. The table must exist and must hold no audio column -
  // the child's recording is temporary and is never persisted (see soundPracticeRepo).
  const soundCols = (raw.prepare('PRAGMA table_info(sound_practice_attempts)').all() as any[]).map((c) => c.name);
  assert(soundCols.length > 0, 'sound_practice_attempts created');
  assert(soundCols.includes('sound_id') && soundCols.includes('level') && soundCols.includes('duration_ms'), 'sound practice columns');
  assert(!soundCols.some((c: string) => /audio|uri|path|recording|score|correct/.test(c)), 'sound practice stores no audio and no score');
  raw.prepare("INSERT INTO sound_practice_attempts (sound_id, level, item, duration_ms, created_at) VALUES ('b','sound','B',1200,?)").run(new Date().toISOString());
  assert(count(raw, 'sound_practice_attempts') === 1, 'sound practice attempt recorded');
  checkSpeechPractice(raw);
  console.log('upgrade OK');
}

// Migration 7: the Filipino family cards become English. A phone installed before it has "Ate" and
// "Kuya" cards; the untouched ones are renamed, a card the parent edited is left alone.
async function englishFamilyCards() {
  console.log('--- migration 7: Ate/Kuya -> Sister/Brother');
  const fresh = new DatabaseSync(':memory:');
  fresh.exec('PRAGMA foreign_keys = ON;');
  migrate(fresh, 99);
  await seedIfNeeded(makeShim(fresh));
  const freshLabels = labels(fresh, "SELECT b.label FROM communication_buttons b JOIN categories c ON c.id=b.category_id WHERE c.key='people'");
  assert(freshLabels.includes('Sister') && freshLabels.includes('Brother'), 'fresh install has Sister and Brother');
  assert(!/\bAte\b|\bKuya\b/.test(freshLabels), 'fresh install has no Ate / Kuya card');

  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  migrate(raw, 6);
  // seedIfNeeded is CURRENT code and in the real app only ever runs after EVERY migration. This
  // scenario deliberately rewinds the schema to v6 to give migration 7 something to do, so the
  // columns the current seed writes are added by hand; user_version stays at 6.
  raw.exec("ALTER TABLE lessons ADD COLUMN language TEXT NOT NULL DEFAULT ''");
  raw.exec('ALTER TABLE lessons ADD COLUMN is_builtin INTEGER NOT NULL DEFAULT 0');
  await seedIfNeeded(makeShim(raw));
  const people = (raw.prepare("SELECT id FROM categories WHERE key='people'").get() as any).id;
  // What an older install looked like: the seeded cards under their old names, and one edited by the parent.
  raw.prepare("UPDATE communication_buttons SET label='Ate', phrase='I want Ate.' WHERE label='Sister'").run();
  raw.prepare("UPDATE communication_buttons SET label='Kuya', phrase='Where is Kuya Jun?' WHERE label='Brother'").run();
  raw.prepare(`UPDATE child_profile SET favorites_json = '{"people":["Mom","Dad","Ate"]}'`).run();
  migrate(raw, 7);
  const row = (label: string) => raw.prepare('SELECT label, phrase FROM communication_buttons WHERE category_id = ? AND label = ?').get(people, label) as any;
  assert(row('Sister')?.phrase === 'I want my sister.', 'seeded Ate renamed to Sister');
  assert(row('Kuya')?.phrase === 'Where is Kuya Jun?', 'a card the parent edited is left alone');
  assert(!row('Ate'), 'no Ate card left');
  assert((raw.prepare('SELECT favorites_json FROM child_profile').get() as any).favorites_json.includes('"Sister"'), 'favourite person Ate -> Sister');
  console.log('migration 7 OK');
}


/**
 * Migration 16 retires the 'therapy' activity category.
 *
 * The six TalkEasy shipped are deleted; anything else in that category was created by a GROWN-UP and
 * is MOVED to 'exercise' instead. A cleanup that silently deleted a family's own work would be a bug
 * rather than a tidy-up, so that distinction is checked rather than trusted.
 */
async function retiredTherapyCategory() {
  console.log('--- migration 16: the retired therapy category');
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  migrate(raw, 15);

  const insert = (name: string, category: string) =>
    raw
      .prepare(
        `INSERT INTO therapy_activities (name, icon, instructions, duration_minutes, frequency, category, is_completed, sort_order, created_at)
         VALUES (?, 'star', 'x', 5, 'daily', ?, 0, 0, 'x')`,
      )
      .run(name, category);

  insert('Stretching', 'therapy');            // seeded — should go
  insert('Gentle yoga', 'therapy');           // seeded — should go
  insert("Dad's wobble board", 'therapy');    // a parent's own — must SURVIVE
  insert('Drawing time', 'art');              // untouched

  migrate(raw, 16);

  const rows = raw.prepare('SELECT name, category FROM therapy_activities ORDER BY name').all() as any[];
  const names = rows.map((r) => r.name);
  assert(!names.includes('Stretching'), 'the seeded Stretching activity is removed');
  assert(!names.includes('Gentle yoga'), 'the seeded Gentle yoga activity is removed');
  assert(names.includes("Dad's wobble board"), "a grown-up's own therapy activity is NOT deleted");
  assert(
    rows.find((r) => r.name === "Dad's wobble board")?.category === 'exercise',
    "a grown-up's own therapy activity moves to a category the screen still shows",
  );
  assert(rows.find((r) => r.name === 'Drawing time')?.category === 'art', 'other activities are untouched');
  assert(!rows.some((r) => r.category === 'therapy'), "no row is left in the retired category");
  console.log('migration 16 OK');
}

/**
 * The bundled pictures on the Activities detail screen.
 *
 * They are matched to the seeded activities BY NAME, which is a string a typo can break silently: a
 * picture keyed "ball paly" would simply never show and nothing would complain. So every key must
 * name a real seeded activity, every picture must exist at the shape the screen assumes, and the
 * registry the screen actually imports must list exactly the same files.
 */
function activityPictures() {
  console.log('--- activity pictures');
  const seeded = new Set(DEFAULT_THERAPY.map((a) => a.name.toLowerCase()));
  const keys = Object.keys(ACTIVITY_PICTURES);
  for (const name of keys) {
    assert(seeded.has(name), `"${name}" is a seeded activity, so its picture can be found`);
    const file = `assets/activities/${ACTIVITY_PICTURES[name]}.webp`;
    assert(existsSync(file), `${file} exists`);
    const buf = readFileSync(file);
    const kind = buf.toString('ascii', 12, 16);
    let w = 0;
    let h = 0;
    if (kind === 'VP8X') { w = 1 + buf.readUIntLE(24, 3); h = 1 + buf.readUIntLE(27, 3); }
    else if (kind === 'VP8 ') { w = buf.readUInt16LE(26) & 0x3fff; h = buf.readUInt16LE(28) & 0x3fff; }
    assert(w > 0 && Math.abs(w / h - ACTIVITY_PICTURE_RATIO) < 0.01, `${file} is the shape the screen assumes (${w}x${h})`);
  }
  assert(new Set(keys.map((k) => ACTIVITY_PICTURES[k])).size === keys.length, 'no two activities share a picture file');
  assert(activityPictureKey('  Ball Play ') === 'ball-play', 'lookup ignores case and surrounding spaces');
  assert(activityPictureKey('Look at photos') === undefined, 'an activity with no picture simply has none (it shows its icon)');
  // the registry the app really imports lists the same files
  const registry = readFileSync('src/components/activities/activityPictures.ts', 'utf8');
  for (const key of keys.map((k) => ACTIVITY_PICTURES[k])) {
    assert(registry.includes(`'${key}': require('../../../assets/activities/${key}.webp')`), `the registry requires ${key}`);
  }
  assert((registry.match(/: require\('\.\.\/\.\.\/\.\.\/assets\/activities\//g) ?? []).length === keys.length, 'the registry holds exactly the pictures the table names');
  // a grown-up's own photo must still win over a bundled picture
  const screen = readFileSync('src/screens/child/ActivitiesScreen.tsx', 'utf8');
  assert(screen.includes('open.imageUri ? null : activityPicture(open.name)'), "a photo a grown-up attached outranks the bundled picture");
  assert(!screen.includes('aspectRatio:'), 'the picture is sized with an explicit width and height (react-native-web ignores aspectRatio)');
  console.log('activity pictures OK');
}

(async () => {
  await freshInstall();
  await retiredTherapyCategory();
  await upgradeFromV1();
  await englishFamilyCards();
  activityPictures();
  console.log('ALL OK');
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
