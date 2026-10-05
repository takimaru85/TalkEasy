import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { grantCashPurchase, purchaseItem, toggleEquip, BADGE_SLOT, type EquipResult, type GrantResult, type PurchaseResult, type PurchaseSource } from '../shopPurchase';
import { getShopItem } from '@/shop/catalog';
import { THEME_SLOT, themeForItem } from '@/shop/themes';
import { AVATAR_SLOT, avatarForItem } from '@/shop/avatars';

export const shopRepo = {
  async getOwned(): Promise<string[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ item_id: string }>('SELECT item_id FROM shop_purchases ORDER BY purchased_at');
    return rows.map((r) => r.item_id);
  },

  /** The item worn in each slot, e.g. { badge: 'sticker-paw' }. */
  async getEquipped(): Promise<Record<string, string>> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ slot: string; item_id: string }>('SELECT slot, item_id FROM shop_equipped');
    return Object.fromEntries(rows.map((r) => [r.slot, r.item_id]));
  },

  /** Redeems an item with stars, or says why not. Nothing is deducted unless it was bought. */
  async buy(itemId: string): Promise<PurchaseResult> {
    const item = getShopItem(itemId);
    if (!item || item.stars === undefined) return 'insufficient'; // not sold for stars
    const db = await getDb();
    const result = await purchaseItem(db, item.id, item.name, item.stars, nowIso());
    if (result === 'bought') notify('rewards');
    return result;
  },

  /** Records a purchase the STORE confirmed. Called only by a cash provider holding an order id. */
  async grantCash(itemId: string, source: Exclude<PurchaseSource, 'stars'>, orderId: string): Promise<GrantResult> {
    if (!getShopItem(itemId)?.cash) throw new Error('Not a cash item: ' + itemId);
    const db = await getDb();
    const result = await grantCashPurchase(db, itemId, source, orderId, nowIso());
    if (result === 'granted') notify('rewards');
    return result;
  },

  async toggleEquip(itemId: string): Promise<EquipResult> {
    const db = await getDb();
    // A theme and an avatar each have their own slot; everything else is the badge beside the child's name.
    const slot = themeForItem(itemId) ? THEME_SLOT : avatarForItem(itemId) ? AVATAR_SLOT : BADGE_SLOT;
    const result = await toggleEquip(db, itemId, slot);
    if (result !== 'notOwned') notify('rewards');
    return result;
  },
};
