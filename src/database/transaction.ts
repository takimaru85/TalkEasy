import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Runs `work` in a transaction: EXCLUSIVE wherever the driver supports it.
 *
 * Both shipping platforms take the exclusive lock, which is what makes a migration safe if
 * anything else touches the file while it runs — so on a device nothing about this changed.
 *
 * expo-sqlite's web build (SQLite compiled to WebAssembly) has no `withExclusiveTransactionAsync`
 * at all, and the app failed to start in a browser because of it. Web is a DEVELOPMENT
 * convenience — a way to click through the screens on this machine — and it is single-tab with
 * its own private database, so a plain transaction is sufficient there.
 *
 * It TRIES the exclusive transaction and falls back only when the driver says it does not support
 * one. Checking `typeof db.withExclusiveTransactionAsync === 'function'` looks like the tidier
 * test and is wrong: the web build DEFINES the method and throws when you call it, so the check
 * passes and the app still fails to start. (That mistake survived a round of testing because the
 * database had already been migrated, so this function was never reached.)
 *
 * The fallback is safe because the unsupported error is thrown BEFORE any statement runs — there
 * is no half-applied migration to re-apply. Any other error is re-thrown untouched, so a genuine
 * migration failure is never quietly retried without its lock.
 *
 * It lives in its own file with a TYPE-ONLY import of expo-sqlite so that importing it does not
 * drag `react-native` into the module graph: the node-based `check:db` cannot transform
 * react-native, and putting this in db.ts broke that check.
 */
function isUnsupported(err: unknown): boolean {
  return /not supported|not implemented|is not a function/i.test(
    err instanceof Error ? err.message : String(err),
  );
}

export async function inTransaction(
  db: SQLiteDatabase,
  work: (txn: SQLiteDatabase) => Promise<void>,
): Promise<void> {
  try {
    await db.withExclusiveTransactionAsync(work);
    return;
  } catch (err) {
    if (!isUnsupported(err)) throw err;
  }
  await db.withTransactionAsync(() => work(db));
}
