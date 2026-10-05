/**
 * Shop inventory against the same ledger as every other star. Kept free of expo-sqlite so `check:db`
 * can run the real SQL: the repository wraps these with `getDb()` and `notify`.
 *
 * STARS: ONE TRANSACTION, because a redemption is three facts that must stand or fall together: was
 * it already owned, was the balance enough, and did the stars leave as the item arrived. The balance
 * is the ledger's own sum read INSIDE the transaction, so there is no cached number to go stale; the
 * item row's PRIMARY KEY is the last line of defence against a double tap.
 *
 * CASH: `grantCashPurchase` is only ever called by the billing layer AFTER the store has confirmed a
 * purchase. It is idempotent on the store's order id, so the same purchase arriving twice (a restore,
 * a renewal-style replay, a second device) can neither grant twice nor be mistaken for a new one.
 * Tapping a button never reaches it.
 */
export interface ShopDb {
  getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null>;
  runAsync(sql: string, ...params: unknown[]): Promise<unknown>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export type PurchaseResult = 'bought' | 'owned' | 'insufficient';
export type GrantResult = 'granted' | 'owned';
export type EquipResult = 'equipped' | 'unequipped' | 'notOwned';
export type PurchaseSource = 'stars' | 'google' | 'apple';

/** One slot for now: the badge shown beside the child's name. Slots are strings so more can be added without a migration. */
export const BADGE_SLOT = 'badge';

export async function purchaseItem(db: ShopDb, itemId: string, title: string, cost: number, nowIso: string): Promise<PurchaseResult> {
  let result: PurchaseResult = 'insufficient';
  await db.withTransactionAsync(async () => {
    const owned = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM shop_purchases WHERE item_id = ?', itemId);
    if ((owned?.c ?? 0) > 0) {
      result = 'owned';
      return;
    }
    const sum = await db.getFirstAsync<{ t: number | null }>('SELECT SUM(amount) AS t FROM star_events');
    if ((sum?.t ?? 0) < cost) {
      result = 'insufficient';
      return;
    }
    await db.runAsync('INSERT INTO star_events (amount, reason, source, created_at) VALUES (?, ?, ?, ?)', -Math.round(cost), `Shop: ${title}`, 'shop', nowIso);
    await db.runAsync("INSERT INTO shop_purchases (item_id, cost, purchased_at, source, order_id) VALUES (?, ?, ?, 'stars', NULL)", itemId, Math.round(cost), nowIso);
    result = 'bought';
  });
  return result;
}

/**
 * Records an item the STORE has confirmed. No stars move. `orderId` is the store's own order /
 * transaction id: a replay of the same order is 'owned', never a second grant.
 */
export async function grantCashPurchase(db: ShopDb, itemId: string, source: Exclude<PurchaseSource, 'stars'>, orderId: string, nowIso: string): Promise<GrantResult> {
  if (!orderId) throw new Error('A cash purchase needs the store order id; nothing is granted without one.');
  let result: GrantResult = 'owned';
  await db.withTransactionAsync(async () => {
    const seen = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM shop_purchases WHERE order_id = ? OR item_id = ?', orderId, itemId);
    if ((seen?.c ?? 0) > 0) return;
    await db.runAsync('INSERT INTO shop_purchases (item_id, cost, purchased_at, source, order_id) VALUES (?, 0, ?, ?, ?)', itemId, nowIso, source, orderId);
    result = 'granted';
  });
  return result;
}

/** Equips an owned item in its slot (replacing what was there); equipping the equipped item takes it off. */
export async function toggleEquip(db: ShopDb, itemId: string, slot: string = BADGE_SLOT): Promise<EquipResult> {
  let result: EquipResult = 'notOwned';
  await db.withTransactionAsync(async () => {
    const owned = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM shop_purchases WHERE item_id = ?', itemId);
    if ((owned?.c ?? 0) === 0) return;
    const current = await db.getFirstAsync<{ item_id: string }>('SELECT item_id FROM shop_equipped WHERE slot = ?', slot);
    if (current?.item_id === itemId) {
      await db.runAsync('DELETE FROM shop_equipped WHERE slot = ?', slot);
      result = 'unequipped';
    } else {
      await db.runAsync('INSERT OR REPLACE INTO shop_equipped (slot, item_id) VALUES (?, ?)', slot, itemId);
      result = 'equipped';
    }
  });
  return result;
}
