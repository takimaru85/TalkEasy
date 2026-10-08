import * as SQLite from 'expo-sqlite';
import { inTransaction } from './transaction';
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

/**
 * On the web the database is a file in the browser's origin-private file system, and only ONE
 * context may hold its sync access handle. After a reload (or hot reload) the previous page's
 * handle is released a moment late, so the first open can fail with NoModificationAllowedError.
 * Retry briefly; a second open TAB keeps the lock, so that case gets a plain explanation.
 */
function isHandleBusy(err: unknown): boolean {
  const text = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  return /NoModificationAllowed|createSyncAccessHandle|Access Handle/i.test(text);
}

async function openWithRetry(): Promise<SQLite.SQLiteDatabase> {
  const attempts = 12;
  for (let i = 0; ; i++) {
    try {
      return await SQLite.openDatabaseAsync(DATABASE_NAME);
    } catch (err) {
      if (!isHandleBusy(err)) throw err;
      if (i >= attempts - 1) {
        throw new Error(
          'TalkEasy is already open in another browser tab or window. Close the other one, then reload this page.',
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 250 + i * 150));
    }
  }
}

async function openAndPrepare(): Promise<SQLite.SQLiteDatabase> {
  const db = await openWithRetry();
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
    await inTransaction(db, async (txn) => {
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
