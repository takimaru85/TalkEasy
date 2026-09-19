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
];

export const CURRENT_SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;
