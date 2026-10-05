/**
 * Versioned schema migrations.
 *
 * Each entry runs once, in order, and the database's `PRAGMA user_version` is set to its
 * version afterwards. To change the schema, ADD a new migration — never edit an old one,
 * or existing installs will not pick up the change.
 */
export interface Migration {
  version: number;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        key           TEXT    NOT NULL UNIQUE,
        name          TEXT    NOT NULL,
        icon          TEXT    NOT NULL,
        color         TEXT    NOT NULL,
        sort_order    INTEGER NOT NULL DEFAULT 0,
        is_system     INTEGER NOT NULL DEFAULT 0,
        show_on_home  INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS communication_buttons (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        label         TEXT    NOT NULL,
        phrase        TEXT    NOT NULL,
        icon          TEXT    NOT NULL,
        color         TEXT    NOT NULL,
        sort_order    INTEGER NOT NULL DEFAULT 0,
        is_system     INTEGER NOT NULL DEFAULT 0,
        is_hidden     INTEGER NOT NULL DEFAULT 0,
        tap_count     INTEGER NOT NULL DEFAULT 0,
        last_used_at  TEXT,
        created_at    TEXT    NOT NULL,
        updated_at    TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_buttons_category ON communication_buttons(category_id, sort_order);

      CREATE TABLE IF NOT EXISTS favorites (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        button_id     INTEGER NOT NULL UNIQUE REFERENCES communication_buttons(id) ON DELETE CASCADE,
        sort_order    INTEGER NOT NULL DEFAULT 0,
        created_at    TEXT    NOT NULL
      );

      CREATE TABLE IF NOT EXISTS routines (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT    NOT NULL,
        is_active     INTEGER NOT NULL DEFAULT 0,
        created_at    TEXT    NOT NULL
      );

      CREATE TABLE IF NOT EXISTS routine_items (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id    INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
        label         TEXT    NOT NULL,
        icon          TEXT    NOT NULL,
        sort_order    INTEGER NOT NULL DEFAULT 0,
        is_done       INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_routine_items ON routine_items(routine_id, sort_order);

      CREATE TABLE IF NOT EXISTS exercises (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        name             TEXT    NOT NULL,
        icon             TEXT    NOT NULL,
        instructions     TEXT    NOT NULL DEFAULT '',
        duration_minutes INTEGER NOT NULL DEFAULT 0,
        is_completed     INTEGER NOT NULL DEFAULT 0,
        completed_at     TEXT,
        sort_order       INTEGER NOT NULL DEFAULT 0,
        created_at       TEXT    NOT NULL
      );

      CREATE TABLE IF NOT EXISTS caregiver_notes (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        note_type     TEXT    NOT NULL DEFAULT 'general',
        title         TEXT    NOT NULL,
        body          TEXT    NOT NULL DEFAULT '',
        created_at    TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_notes_created ON caregiver_notes(created_at DESC);

      CREATE TABLE IF NOT EXISTS app_settings (
        key           TEXT PRIMARY KEY,
        value         TEXT NOT NULL
      );
    `,
  },
  {
    version: 2,
    sql: `
      -- Routine steps can carry an optional time ("8:00 School").
      ALTER TABLE routine_items ADD COLUMN start_time TEXT;

      -- Therapy / activity cards: clearer name, plus frequency and an optional picture.
      ALTER TABLE exercises RENAME TO therapy_activities;
      ALTER TABLE therapy_activities ADD COLUMN frequency TEXT NOT NULL DEFAULT 'daily';
      ALTER TABLE therapy_activities ADD COLUMN image_uri TEXT;

      CREATE TABLE IF NOT EXISTS activity_logs (
        id                   INTEGER PRIMARY KEY AUTOINCREMENT,
        therapy_activity_id  INTEGER NOT NULL REFERENCES therapy_activities(id) ON DELETE CASCADE,
        completed_at         TEXT    NOT NULL,
        note                 TEXT    NOT NULL DEFAULT ''
      );
      CREATE INDEX IF NOT EXISTS idx_activity_logs ON activity_logs(therapy_activity_id, completed_at DESC);

      -- School
      CREATE TABLE IF NOT EXISTS subjects (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT    NOT NULL,
        icon          TEXT    NOT NULL,
        color         TEXT    NOT NULL,
        teacher_name  TEXT    NOT NULL DEFAULT '',
        notes         TEXT    NOT NULL DEFAULT '',
        sort_order    INTEGER NOT NULL DEFAULT 0,
        is_active     INTEGER NOT NULL DEFAULT 1,
        created_at    TEXT    NOT NULL
      );

      CREATE TABLE IF NOT EXISTS subject_schedule (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id    INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        day_of_week   INTEGER NOT NULL,
        start_time    TEXT    NOT NULL,
        end_time      TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_subject_schedule ON subject_schedule(day_of_week, start_time);

      CREATE TABLE IF NOT EXISTS subject_materials (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id    INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        name          TEXT    NOT NULL,
        note          TEXT    NOT NULL DEFAULT '',
        sort_order    INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id      INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
        title           TEXT    NOT NULL,
        description     TEXT    NOT NULL DEFAULT '',
        kind            TEXT    NOT NULL DEFAULT 'assignment',
        date_assigned   TEXT,
        due_date        TEXT,
        priority        TEXT    NOT NULL DEFAULT 'medium',
        status          TEXT    NOT NULL DEFAULT 'todo',
        notes           TEXT    NOT NULL DEFAULT '',
        photo_uri       TEXT,
        attachment_uri  TEXT,
        attachment_name TEXT,
        completed_at    TEXT,
        created_at      TEXT    NOT NULL,
        updated_at      TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_assignments_due ON assignments(due_date, status);

      CREATE TABLE IF NOT EXISTS school_events (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        title         TEXT    NOT NULL,
        event_type    TEXT    NOT NULL DEFAULT 'event',
        subject_id    INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
        date          TEXT    NOT NULL,
        time          TEXT,
        notes         TEXT    NOT NULL DEFAULT '',
        created_at    TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_school_events_date ON school_events(date);

      -- Learning: content lives in code; these hold parent config + results.
      CREATE TABLE IF NOT EXISTS learning_activities (
        activity_key  TEXT PRIMARY KEY,
        is_enabled    INTEGER NOT NULL DEFAULT 1,
        difficulty    TEXT
      );

      CREATE TABLE IF NOT EXISTS learning_progress (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_key  TEXT    NOT NULL,
        subject_key   TEXT    NOT NULL,
        difficulty    TEXT    NOT NULL,
        correct       INTEGER NOT NULL,
        total         INTEGER NOT NULL,
        played_at     TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_learning_progress ON learning_progress(subject_key, played_at DESC);

      -- Communication categories: fold "Choices" and "Body" into "Basic" so the category bar
      -- stays at 5 chips, and free the way for the new "School" category (added by the seed).
      UPDATE communication_buttons
        SET category_id = (SELECT id FROM categories WHERE key = 'needs')
        WHERE category_id IN (SELECT id FROM categories WHERE key IN ('choices', 'body'))
          AND EXISTS (SELECT 1 FROM categories WHERE key = 'needs');
      DELETE FROM categories WHERE key IN ('choices', 'body');
      UPDATE categories SET name = 'Basic', icon = 'hand-heart' WHERE key = 'needs';
      UPDATE categories SET show_on_home = 1 WHERE key = 'feelings';
    `,
  },
  {
    version: 3,
    sql: `
      -- One row per child. Only one is active; the structure allows another child later.
      CREATE TABLE IF NOT EXISTS child_profile (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        name              TEXT    NOT NULL,
        nickname          TEXT    NOT NULL DEFAULT '',
        age               INTEGER,
        grade             TEXT    NOT NULL DEFAULT '',
        school            TEXT    NOT NULL DEFAULT '',
        avatar            TEXT    NOT NULL DEFAULT '🙂',
        photo_uri         TEXT,
        favorite_color    TEXT    NOT NULL DEFAULT 'blue',
        favorites_json    TEXT    NOT NULL DEFAULT '{}',
        communication_json TEXT   NOT NULL DEFAULT '{}',
        rewards_json      TEXT    NOT NULL DEFAULT '{}',
        learning_goals    TEXT    NOT NULL DEFAULT '',
        difficulty        TEXT    NOT NULL DEFAULT 'easy',
        is_active         INTEGER NOT NULL DEFAULT 1,
        created_at        TEXT    NOT NULL
      );

      -- Positive reward system: rewards the parent defines + a ledger of stars.
      CREATE TABLE IF NOT EXISTS rewards (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        title           TEXT    NOT NULL,
        icon            TEXT    NOT NULL DEFAULT '🎁',
        stars_required  INTEGER NOT NULL DEFAULT 10,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      TEXT    NOT NULL
      );

      CREATE TABLE IF NOT EXISTS star_events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        amount      INTEGER NOT NULL,
        reason      TEXT    NOT NULL DEFAULT '',
        source      TEXT    NOT NULL DEFAULT 'manual',
        created_at  TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_star_events_created ON star_events(created_at DESC);

      -- Routine steps belong to a part of the day and may carry a note.
      ALTER TABLE routine_items ADD COLUMN segment TEXT NOT NULL DEFAULT 'morning';
      ALTER TABLE routine_items ADD COLUMN notes TEXT NOT NULL DEFAULT '';

      -- Activities are grouped (games, art, music, exercise, reading, outdoor, sensory, chores, therapy).
      ALTER TABLE therapy_activities ADD COLUMN category TEXT NOT NULL DEFAULT 'therapy';

      -- Communication tiles can show a real photo (of Mom, Dad, the teacher...).
      ALTER TABLE communication_buttons ADD COLUMN image_uri TEXT;
    `,
  },
  {
    version: 4,
    sql: `
      -- Adaptive Learning & Accessible Schoolwork ------------------------------------------
      -- A lesson is the learning objective (explanation + vocabulary); activities are the
      -- questions; attempts record HOW the child answered. Handwriting practice is logged in
      -- its own table so motor practice never mixes into learning progress.

      ALTER TABLE child_profile ADD COLUMN assistance_level TEXT NOT NULL DEFAULT 'assisted';
      ALTER TABLE child_profile ADD COLUMN preferred_method TEXT;

      CREATE TABLE IF NOT EXISTS lessons (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id      INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
        title           TEXT    NOT NULL,
        grade_level     TEXT    NOT NULL DEFAULT '',
        content         TEXT    NOT NULL DEFAULT '',
        vocabulary_json TEXT    NOT NULL DEFAULT '[]',
        objectives      TEXT    NOT NULL DEFAULT '',
        assigned_date   TEXT,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        is_active       INTEGER NOT NULL DEFAULT 1,
        created_at      TEXT    NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lesson_activities (
        id                   INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id            INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        type                 TEXT    NOT NULL DEFAULT 'mcq',
        question             TEXT    NOT NULL,
        image                TEXT,
        choices_json         TEXT    NOT NULL DEFAULT '[]',
        pairs_json           TEXT    NOT NULL DEFAULT '[]',
        answers_json         TEXT    NOT NULL DEFAULT '[]',
        hint                 TEXT    NOT NULL DEFAULT '',
        difficulty           TEXT    NOT NULL DEFAULT 'easy',
        allowed_methods_json TEXT    NOT NULL DEFAULT '[]',
        sort_order           INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_lesson_activities ON lesson_activities(lesson_id, sort_order);

      CREATE TABLE IF NOT EXISTS adaptive_attempts (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id       INTEGER NOT NULL,
        lesson_id      INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        activity_id    INTEGER NOT NULL REFERENCES lesson_activities(id) ON DELETE CASCADE,
        answer_method  TEXT    NOT NULL,
        correct        INTEGER NOT NULL DEFAULT 0,
        attempts       INTEGER NOT NULL DEFAULT 1,
        answer_text    TEXT    NOT NULL DEFAULT '',
        completed_at   TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_adaptive_attempts ON adaptive_attempts(child_id, lesson_id, activity_id);

      CREATE TABLE IF NOT EXISTS handwriting_sessions (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id      INTEGER NOT NULL,
        level         INTEGER NOT NULL,
        item          TEXT    NOT NULL,
        strokes       INTEGER NOT NULL DEFAULT 0,
        duration_ms   INTEGER NOT NULL DEFAULT 0,
        completed_at  TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_handwriting ON handwriting_sessions(child_id, completed_at DESC);
    `,
  },
  {
    version: 5,
    // Sound Practice. Tracking only: how much practice happened, never how well it went, and
    // never any audio - the child's recording is a temporary file that is deleted after
    // playback and is never referenced here.
    sql: `
      CREATE TABLE IF NOT EXISTS sound_practice_attempts (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        sound_id    TEXT    NOT NULL,
        level       TEXT    NOT NULL DEFAULT 'sound',
        item        TEXT    NOT NULL DEFAULT '',
        duration_ms INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sound_practice ON sound_practice_attempts(created_at DESC);
    `,
  },
  {
    version: 6,
    // Speech Practice. Same rules as Sound Practice: a log of practice that happened (attempts,
    // exercises, finished activities, minutes) - never audio, never a score, never correctness.
    // `communication_buttons.practice` lets a parent's own Talk card ("Grandma", with a photo)
    // double as a practice word, so a word is never stored twice.
    sql: `
      CREATE TABLE IF NOT EXISTS speech_practice_events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id TEXT    NOT NULL,
        kind        TEXT    NOT NULL,
        item        TEXT    NOT NULL DEFAULT '',
        duration_ms INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_speech_practice ON speech_practice_events(created_at DESC);

      ALTER TABLE communication_buttons ADD COLUMN practice INTEGER NOT NULL DEFAULT 0;
    `,
  },
  {
    version: 7,
    // TalkEasy is English-only: the seeded Filipino family cards become English ones
    // ("Ate" -> "Sister", "Kuya" -> "Brother"). Only the untouched built-in cards are renamed; a card
    // a parent edited (different phrase) is left exactly as it is. The demo favourite person
    // "Ate" follows.
    sql: `
      UPDATE communication_buttons SET label = 'Sister', phrase = 'I want my sister.'
       WHERE is_system = 1 AND label = 'Ate' AND phrase = 'I want Ate.';
      UPDATE communication_buttons SET label = 'Brother', phrase = 'I want my brother.'
       WHERE is_system = 1 AND label = 'Kuya' AND phrase = 'I want Kuya.';
      UPDATE child_profile SET favorites_json = REPLACE(favorites_json, '"Ate"', '"Sister"');
    `,
  },
  {
    version: 8,
    // Parent Mode, weekly view. routine_log remembers WHICH day a My Day step was ticked (the
    // routine itself only knows "done now"), so a week's routine completion can be shown truthfully.
    // One row per step per day. Caregiver notes gain an optional photo and a date the parent can
    // choose (NULL = the day it was written).
    sql: `
      CREATE TABLE IF NOT EXISTS routine_log (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_item_id  INTEGER NOT NULL,
        label            TEXT    NOT NULL,
        day              TEXT    NOT NULL,
        created_at       TEXT    NOT NULL,
        UNIQUE (routine_item_id, day)
      );
      CREATE INDEX IF NOT EXISTS idx_routine_log_day ON routine_log(day);

      ALTER TABLE caregiver_notes ADD COLUMN photo_uri TEXT;
      ALTER TABLE caregiver_notes ADD COLUMN note_date TEXT;
    `,
  },
  {
    version: 9,
    // Voice & Communication practice. Like sound_practice_attempts and speech_practice_events,
    // this table records THAT practice happened and nothing about how it went: no audio, no
    // transcript, and deliberately no correctness or score column. `category` is stored so the
    // six practice areas can be summarised without the app having to know today's activity list.
    sql: `
      CREATE TABLE IF NOT EXISTS voice_practice_events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id TEXT    NOT NULL,
        category    TEXT    NOT NULL,
        kind        TEXT    NOT NULL,
        item        TEXT    NOT NULL DEFAULT '',
        duration_ms INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_voice_practice ON voice_practice_events(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_voice_practice_cat ON voice_practice_events(category);
    `,
  },
  {
    version: 10,
    // My Day as a live schedule. A step may have an END time (when it is no longer "now") and a
    // linked activity that "Let's go" opens. The day log learns a status, so a step can be SKIPPED
    // as well as done — both per day, so tomorrow starts fresh without anyone resetting it.
    sql: `
      ALTER TABLE routine_items ADD COLUMN end_time TEXT;
      ALTER TABLE routine_items ADD COLUMN linked_activity TEXT;
      ALTER TABLE routine_log ADD COLUMN status TEXT NOT NULL DEFAULT 'done';
    `,
  },
  {
    version: 11,
    // A lesson says what language it is WRITTEN in, so it can be SPOKEN in that language. The app's
    // interface is English-only; its schoolwork is not, and a Filipino subject read by an English
    // voice turns "Mga" into the letters M-G-A. '' means English, which is almost every lesson.
    //
    // The backfill is the one-off cost of adding the column late: lessons already seeded under a
    // Filipino subject were written in Filipino, so they are marked as such rather than left silent
    // for every child who already has them.
    sql: `
      ALTER TABLE lessons ADD COLUMN language TEXT NOT NULL DEFAULT '';

      UPDATE lessons SET language = 'fil-PH'
       WHERE subject_id IN (SELECT id FROM subjects WHERE LOWER(name) IN ('filipino', 'tagalog'));
    `,
  },
  {
    version: 12,
    // Repairs lessons that were seeded with no language.
    //
    // Migration 11 added the column and backfilled the lessons that existed AT THAT MOMENT, but
    // migrations run before seeding: a database created in the window where the column existed and
    // the seed did not yet write to it ended up with a Filipino lesson marked as English, which is
    // exactly the silence this feature is meant to fix. Seeding now carries the language itself
    // (database/seed.ts), so this is a one-off repair for the databases caught in between.
    //
    // Deliberately only touches rows still left blank, so a language a grown-up chose is never
    // overwritten by a guess made from the subject's name.
    sql: `
      UPDATE lessons SET language = 'fil-PH'
       WHERE (language IS NULL OR language = '')
         AND subject_id IN (SELECT id FROM subjects WHERE LOWER(name) IN ('filipino', 'tagalog'));
    `,
  },
  {
    version: 13,
    // Which lessons TalkEasy shipped, and which a grown-up wrote themselves.
    //
    // The free plan limits the BUILT-IN lessons only. A parent who types in tonight's homework must
    // never be told their own lesson is a premium feature, so authorship has to be a fact in the
    // data rather than something guessed from an id or a position in a list — both of which change.
    //
    // Existing databases are backfilled by the seeded titles, the only signal an old row carries.
    // A parent who renamed one keeps it as their own, which is the safe way round to be wrong.
    sql: `
      ALTER TABLE lessons ADD COLUMN is_builtin INTEGER NOT NULL DEFAULT 0;

      UPDATE lessons SET is_builtin = 1
       WHERE title IN ('What plants need', 'Adding to 10', 'Animal sounds', 'Mga hayop (Animals)');
    `,
  },
  {
    version: 14,
    // Therapy home practice. Like sound_practice_attempts, speech_practice_events and
    // voice_practice_events, this table records THAT practice happened and nothing about how it
    // went: no measurement, no range, no quality, no correctness column, and deliberately nothing a
    // parent or anyone else could read as a clinical result. TalkEasy is not assessing a child's
    // movement and must never look as though it is.
    sql: `
      CREATE TABLE IF NOT EXISTS therapy_sessions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id TEXT    NOT NULL,
        group_id    TEXT    NOT NULL,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_therapy_sessions ON therapy_sessions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_therapy_sessions_activity ON therapy_sessions(activity_id);
    `,
  },
  {
    version: 15,
    // Scan Assignment. A scan IS an assignment — it goes in the table School Mode already reads, so
    // a scanned worksheet turns up under "Today's assignments" and opens in AssignmentDetail with no
    // new list, no second store and no screen to keep in sync.
    //
    // Three columns, and the split between the first two is the point: `scan_text` is what the
    // engine read and is never rewritten, while the ordinary `description` holds what the grown-up
    // corrected it to. Keeping them apart is what lets somebody get back to the original after an
    // edit goes wrong. `scan_type` is the parser's guess, stored beside the text rather than
    // replacing it.
    sql: `
      ALTER TABLE assignments ADD COLUMN scan_text TEXT NOT NULL DEFAULT '';
      ALTER TABLE assignments ADD COLUMN scan_language TEXT NOT NULL DEFAULT '';
      ALTER TABLE assignments ADD COLUMN scan_type TEXT NOT NULL DEFAULT '';
    `,
  },
  {
    version: 16,
    // Retires the old "Therapy" ACTIVITY CATEGORY, now that Therapy is its own section.
    //
    // Activities had a therapy category holding six seeded items, and the Activities screen listed
    // them behind a Therapy filter pill. Since the Therapy section exists — with a safety gate,
    // goals, a routine and practice tracking — a second, older list of therapy activities a tap away
    // from it is not a feature, it is two answers to the same question.
    //
    // The two statements are deliberately different, and the order matters:
    //  1. DELETE only the six TalkEasy shipped, matched by name, so the retired content goes.
    //  2. MOVE anything else still in that category to 'exercise' — those are activities a GROWN-UP
    //     created themselves, and a cleanup that silently deleted a family's own work would be a
    //     bug, not a tidy-up. They keep their name, icon, instructions and history, and simply
    //     appear under Exercise instead.
    //
    // The new Therapy section is untouched: it uses `therapy_sessions` and code content, and shares
    // nothing with this table.
    sql: `
      DELETE FROM therapy_activities
       WHERE category = 'therapy'
         AND name IN ('Stretching', 'Reach and grab', 'Reach up high', 'Sitting balance',
                      'Gentle yoga', 'Hand and leg massage');

      UPDATE therapy_activities SET category = 'exercise' WHERE category = 'therapy';
    `,
  },
  {
    version: 17,
    // The Rewards Shop. What a child OWNS is one row per item; what it COST is already in the star
    // ledger as a negative `star_events` row (source 'shop'), so there is no second balance to drift.
    // The PRIMARY KEY on item_id is what stops a double tap buying the same item twice. The
    // catalogue itself is code (`shop/catalog.ts`), not rows.
    sql: `
      CREATE TABLE IF NOT EXISTS shop_purchases (
        item_id      TEXT PRIMARY KEY,
        cost         INTEGER NOT NULL,
        purchased_at TEXT    NOT NULL
      );
    `,
  },
  {
    version: 18,
    // Real-money purchases and equipping, on the SAME inventory table.
    //  - `source` says how an item was obtained ('stars' | 'google' | 'apple'); existing rows are stars.
    //  - `order_id` is the STORE's own order id for a cash purchase. The unique index is what makes a
    //    replayed purchase (restore, second device) unable to grant twice. Star rows leave it NULL.
    //  - `shop_equipped` is what the child has chosen to wear, one row per slot, so a choice survives a
    //    restart and an item that is not owned can never be equipped.
    sql: `
      ALTER TABLE shop_purchases ADD COLUMN source   TEXT NOT NULL DEFAULT 'stars';
      ALTER TABLE shop_purchases ADD COLUMN order_id TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_purchases_order ON shop_purchases(order_id) WHERE order_id IS NOT NULL;
      CREATE TABLE IF NOT EXISTS shop_equipped (
        slot    TEXT PRIMARY KEY,
        item_id TEXT NOT NULL
      );
    `,
  },
  {
    version: 19,
    // Verified completion and one-claim-per-completion rewards.
    //  - `reward_claims` is the audit trail: one row per task completion, keyed by a UNIQUE `claim_key`,
    //    with the kind, the amount, and a status ('awaiting_parent' | 'credited' | 'declined').
    //  - `star_events.claim_key` ties the ledger row to its claim; the partial UNIQUE index means the same
    //    completion cannot put stars in the ledger twice even if the claim logic were wrong. Existing and
    //    manual events leave it NULL.
    sql: `
      CREATE TABLE IF NOT EXISTS reward_claims (
        claim_key   TEXT PRIMARY KEY,
        kind        TEXT    NOT NULL,
        reason      TEXT    NOT NULL DEFAULT '',
        amount      INTEGER NOT NULL,
        status      TEXT    NOT NULL,
        created_at  TEXT    NOT NULL,
        resolved_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_reward_claims_status ON reward_claims(status, created_at);
      ALTER TABLE star_events ADD COLUMN claim_key TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_star_events_claim ON star_events(claim_key) WHERE claim_key IS NOT NULL;
    `,
  },
  {
    version: 20,
    // The Space Collection: what a child has FOUND, and when.
    //  - one row per collectible (or category trophy), PRIMARY KEY item_id, so nothing is counted twice;
    //  - rows are only ever added, so an item can never be taken back;
    //  - `backfilled` marks items that were already earned before this table existed (their date is unknown);
    //  - `seen` is whether the child has looked at a new discovery yet.
    // The five original collectibles were DERIVED from practice and stored nowhere; the first sync records the
    // ones already earned, so nothing a child found is lost.
    sql: `
      CREATE TABLE IF NOT EXISTS collectible_discoveries (
        item_id       TEXT PRIMARY KEY,
        discovered_at TEXT    NOT NULL,
        seen          INTEGER NOT NULL DEFAULT 0,
        backfilled    INTEGER NOT NULL DEFAULT 0
      );
    `,
  },
  {
    version: 21,
    // TalkEasy is English-only and a fresh install seeds no Filipino subject or lesson, but phones that
    // installed an older build still carry the one built-in Filipino lesson ("Mga hayop (Animals)") and
    // its "Filipino" subject, which now read as out of place on Home.
    //
    // Removes ONLY what TalkEasy itself shipped: the built-in lesson (is_builtin = 1, so a lesson a
    // grown-up typed under that title survives), then the "Filipino" subject if nothing else is attached
    // to it (no lessons, assignments, events, schedule or materials). A subject a family really uses
    // stays. Nothing is re-created: seeding does not write either row.
    sql: `
      DELETE FROM lessons WHERE title = 'Mga hayop (Animals)' AND is_builtin = 1;

      DELETE FROM subjects
       WHERE LOWER(name) = 'filipino'
         AND NOT EXISTS (SELECT 1 FROM lessons         WHERE subject_id = subjects.id)
         AND NOT EXISTS (SELECT 1 FROM assignments     WHERE subject_id = subjects.id)
         AND NOT EXISTS (SELECT 1 FROM school_events   WHERE subject_id = subjects.id)
         AND NOT EXISTS (SELECT 1 FROM subject_schedule WHERE subject_id = subjects.id)
         AND NOT EXISTS (SELECT 1 FROM subject_materials WHERE subject_id = subjects.id);
    `,
  },
];

export const CURRENT_SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;
