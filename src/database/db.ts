import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';
import { seedIfNeeded } from './seed';

export const DATABASE_NAME = 'talkeasy.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Returns the single shared database connection, opening + migrating + seeding it
 * on first call. Safe to call from anywhere; concurrent callers share the same promise.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndPrepare().catch((err) => {
      dbPromise = null; // allow retry on next call
      throw err;
    });
  }
  return dbPromise;
}

async function openAndPrepare(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  await seedIfNeeded(db);
  return db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= version) continue;
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(migration.sql);
      await txn.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    version = migration.version;
  }
}

/** ISO timestamp helper used by every repository. */
export function nowIso(): string {
  return new Date().toISOString();
}
