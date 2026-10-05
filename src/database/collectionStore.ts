/**
 * Recording what a child has FOUND. Free of expo-sqlite so `check:db` runs the real SQL.
 *
 * A discovery is one row keyed by the collectible id (or `trophy-<category>`): the PRIMARY KEY is what stops
 * the same item being counted twice, and INSERT OR IGNORE makes recording idempotent, so the sync can run
 * as often as it likes. Rows are only ever ADDED: nothing here deletes or lowers a discovery, which is how
 * a missed day, a replayed activity or a reset counter can never take an item away.
 *
 * THE FIRST SYNC IS A BACKFILL. A child who used TalkEasy before this collection existed already earned
 * things; those are recorded once with `backfilled = 1` and `seen = 1` (we do not know when, and a pile of
 * "new!" banners for old news would be noise). A sentinel row marks that the first sync happened. Everything
 * found after that carries the real moment and is unseen until the child looks.
 */
export interface StoreDb {
  getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]>;
  runAsync(sql: string, ...params: unknown[]): Promise<unknown>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export const SEED_SENTINEL = '__seeded__';

export interface Discovery {
  id: string;
  discoveredAt: string;
  seen: boolean;
  backfilled: boolean;
}

export async function getDiscoveries(db: StoreDb): Promise<Discovery[]> {
  const rows = await db.getAllAsync<{ item_id: string; discovered_at: string; seen: number; backfilled: number }>('SELECT item_id, discovered_at, seen, backfilled FROM collectible_discoveries WHERE item_id <> ?', SEED_SENTINEL);
  return rows.map((r) => ({ id: r.item_id, discoveredAt: r.discovered_at, seen: r.seen === 1, backfilled: r.backfilled === 1 }));
}

/** Records the ids not yet recorded; returns the ones that were NEW this call. */
export async function recordDiscoveries(db: StoreDb, ids: readonly string[], nowIso: string): Promise<string[]> {
  const fresh: string[] = [];
  await db.withTransactionAsync(async () => {
    const seeded = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM collectible_discoveries WHERE item_id = ?', SEED_SENTINEL);
    const backfill = (seeded?.c ?? 0) === 0;
    for (const id of ids) {
      const have = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM collectible_discoveries WHERE item_id = ?', id);
      if ((have?.c ?? 0) > 0) continue;
      await db.runAsync('INSERT OR IGNORE INTO collectible_discoveries (item_id, discovered_at, seen, backfilled) VALUES (?, ?, ?, ?)', id, nowIso, backfill ? 1 : 0, backfill ? 1 : 0);
      fresh.push(id);
    }
    if (backfill) await db.runAsync('INSERT OR IGNORE INTO collectible_discoveries (item_id, discovered_at, seen, backfilled) VALUES (?, ?, 1, 1)', SEED_SENTINEL, nowIso);
  });
  return fresh;
}

export async function markSeen(db: StoreDb, ids: readonly string[]): Promise<void> {
  for (const id of ids) await db.runAsync('UPDATE collectible_discoveries SET seen = 1 WHERE item_id = ?', id);
}
