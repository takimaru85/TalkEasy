import { requireOptionalNativeModule } from 'expo-modules-core';
import { settingsRepo } from '@/database';
import { parseStatus, serializeStatus } from './access';
import { PLUS_PRODUCTS, type StorePrices } from './products';
import type { SubscriptionProvider } from './provider';
import { FREE_STATUS, type PlanSource, type SubscriptionStatus } from './types';

/**
 * Real billing, through the device's app store.
 *
 * ONE FILE SERVES BOTH STORES. `expo-in-app-purchases` wraps Google Play Billing on Android and
 * StoreKit on iOS behind one API, so a "googlePlayProvider" would have been a lie on an iPhone.
 * Everything store-specific that remains is noted where it matters.
 *
 * WHAT THIS DOES AND DOES NOT PROVE. Purchases are confirmed by the store and cached on the device.
 * There is NO server-side verification, because TalkEasy has no server — see "VERIFYING PROPERLY"
 * below for exactly what to add when there is one. That makes this honest for a small paid app and
 * NOT sufficient against a determined attacker: a rooted device can fake an entitlement. The thing
 * being protected is a few locked practice activities, and the alternative — building and running a
 * backend that a children's offline app otherwise has no need for — costs more than it saves today.
 * The status record already carries `source` and `verifiedAt` so that upgrade changes this file
 * only.
 *
 * THIS IS THE ONLY PLACE IN TALKEASY THAT TOUCHES THE NETWORK, and it does so only through the
 * store's own SDK: no TalkEasy server, no analytics, and nothing about a child ever leaves the
 * device. The purchase flow sees a product id and the store account — never a child's name,
 * practice, recordings or progress. docs/google-play-data-safety.md is updated to match.
 */

/** Product ids we recognise. A purchase of anything else is ignored rather than trusted. */
const OUR_PRODUCTS = new Set(PLUS_PRODUCTS.map((p) => p.productId));

/** The slice of expo-in-app-purchases this file uses. */
interface Iap {
  connectAsync: () => Promise<void>;
  getProductsAsync: (ids: string[]) => Promise<{ responseCode: number; results?: { productId: string; price: string }[] }>;
  getPurchaseHistoryAsync: (options?: unknown) => Promise<{ responseCode: number; results?: Purchase[] }>;
  purchaseItemAsync: (id: string, details?: unknown) => Promise<void>;
  setPurchaseListener: (cb: (result: { responseCode: number; results?: Purchase[] }) => void) => void;
  finishTransactionAsync: (purchase: Purchase, consume: boolean) => Promise<void>;
  IAPResponseCode: { OK: number; USER_CANCELED: number; ERROR: number; DEFERRED: number };
  InAppPurchaseState: { PURCHASING: number; PURCHASED: number; FAILED: number; RESTORED?: number };
}

interface Purchase {
  acknowledged: boolean;
  productId: string;
  purchaseState: number;
  purchaseTime: number;
  orderId: string;
}

/**
 * Whether this build can sell anything.
 *
 * Probed through the Expo module registry — `expo-in-app-purchases` IS an Expo module, so unlike the
 * ML Kit text recogniser this is the right lookup. Absent in Expo Go and on the web, where the app
 * falls back to the development provider and nothing breaks.
 */
export function isStoreBillingAvailable(): boolean {
  try {
    return requireOptionalNativeModule('ExpoInAppPurchases') != null;
  } catch {
    return false;
  }
}

let iap: Iap | null = null;
let connecting: Promise<Iap | null> | null = null;

/** Connects once. The store SDK requires `connectAsync` before anything else. */
async function connect(): Promise<Iap | null> {
  if (iap) return iap;
  if (connecting) return connecting;
  if (!isStoreBillingAvailable()) return null;

  connecting = (async () => {
    try {
      // Required lazily: importing the package when the native half is missing throws at import
      // time and would take the whole app down in Expo Go.
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const mod = require('expo-in-app-purchases') as Iap;
      await mod.connectAsync();
      mod.setPurchaseListener(handlePurchases(mod));
      iap = mod;
      return mod;
    } catch {
      return null;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}

/**
 * Handles every purchase the store reports.
 *
 * SET ONCE, GLOBALLY, AT CONNECT. Purchases do not only arrive from a tap: a renewal, a purchase
 * made on another device, or one that completed after the app was killed all come through here. A
 * listener attached to a screen would miss those and the family would pay without being upgraded.
 *
 * ACKNOWLEDGING IS NOT OPTIONAL. Google automatically REFUNDS any purchase that is not acknowledged
 * within three days, so `finishTransactionAsync` must run for every completed purchase — and with
 * `consume: false`, because a subscription is not a consumable. Consuming one would let it be
 * bought again and would wreck the entitlement.
 */
function handlePurchases(mod: Iap) {
  return (result: { responseCode: number; results?: Purchase[] }) => {
    if (result.responseCode !== mod.IAPResponseCode.OK) return; // cancelled or failed: nothing to do
    void (async () => {
      for (const purchase of result.results ?? []) {
        if (!OUR_PRODUCTS.has(purchase.productId)) continue;
        if (purchase.purchaseState !== mod.InAppPurchaseState.PURCHASED) continue;
        await writeStatus(statusFrom(purchase));
        if (!purchase.acknowledged) {
          // false = acknowledge, never consume. See the note above.
          await mod.finishTransactionAsync(purchase, false).catch(() => {});
        }
      }
    })();
  };
}

function storeSource(): PlanSource {
  // The store that actually sold it. Recorded so Parent Mode can say where an entitlement came from
  // and so a development entitlement can never be mistaken for a paid one.
  return process.env.EXPO_OS === 'ios' ? 'apple' : 'google';
}

function statusFrom(purchase: Purchase): SubscriptionStatus {
  return {
    plan: 'plus',
    source: storeSource(),
    productId: purchase.productId,
    // NOT KNOWN CLIENT-SIDE. The expiry lives in the Play Developer / App Store Server API, which
    // needs a server. Null means "no expiry known", and `currentPlan()` treats that as active — so
    // a lapsed subscription is noticed when the store stops returning it from the purchase history
    // (checked on every launch via getStatus) rather than to the minute. Server verification fixes
    // this; see VERIFYING PROPERLY at the top of this file.
    expiresAt: null,
    verifiedAt: new Date().toISOString(),
  };
}

async function writeStatus(status: SubscriptionStatus): Promise<void> {
  try {
    await settingsRepo.set('subscriptionStatus', serializeStatus(status));
  } catch {
    // A failed write must not break a purchase the family has already made; the next launch
    // re-reads the purchase history and recovers.
  }
}

async function storedStatus(): Promise<SubscriptionStatus> {
  try {
    const settings = await settingsRepo.getAll();
    return parseStatus(settings.subscriptionStatus);
  } catch {
    return FREE_STATUS;
  }
}

/** The active entitlement in the store's purchase history, if there is one. */
async function fromHistory(mod: Iap): Promise<SubscriptionStatus | null> {
  const history = await mod.getPurchaseHistoryAsync();
  if (history.responseCode !== mod.IAPResponseCode.OK) return null;
  const active = (history.results ?? [])
    .filter((p) => OUR_PRODUCTS.has(p.productId))
    .sort((a, b) => b.purchaseTime - a.purchaseTime)[0];
  return active ? statusFrom(active) : null;
}

export const storeProvider: SubscriptionProvider = {
  name: 'App store billing',
  canPurchase: true,

  /**
   * The entitlement, re-checked against the store.
   *
   * Asks the store first and falls back to what was stored. That order matters BOTH ways: it is how
   * a subscription cancelled elsewhere eventually stops unlocking things, and how a child keeps
   * their activities on a plane, where the store cannot be reached and the cached answer is the
   * only one available. An offline app must never lock a paying family out because the network is
   * down.
   */
  async getStatus(): Promise<SubscriptionStatus> {
    const mod = await connect();
    if (!mod) return storedStatus();
    try {
      const live = await fromHistory(mod);
      if (live) {
        await writeStatus(live);
        return live;
      }
      // The store answered and has no purchase for us: the subscription is genuinely gone.
      await writeStatus(FREE_STATUS);
      return FREE_STATUS;
    } catch {
      // The store could not be reached. Trust the cache rather than removing access.
      return storedStatus();
    }
  },

  /** Localised prices, straight from the store — the only prices a family may ever be shown. */
  async getPrices(): Promise<StorePrices> {
    const mod = await connect();
    if (!mod) return {};
    try {
      const res = await mod.getProductsAsync([...OUR_PRODUCTS]);
      if (res.responseCode !== mod.IAPResponseCode.OK) return {};
      return Object.fromEntries((res.results ?? []).map((p) => [p.productId, p.price]));
    } catch {
      return {};
    }
  },

  /**
   * Opens the store's purchase sheet.
   *
   * Resolves with the status as it stands AFTER the sheet closes; the entitlement itself is written
   * by the listener, which is the only place a purchase is ever believed. Cancelling is not an
   * error — it resolves with the unchanged status, because deciding not to buy is an ordinary thing
   * to do and must never look like a failure.
   */
  async purchase(productId: string): Promise<SubscriptionStatus> {
    const mod = await connect();
    if (!mod || !OUR_PRODUCTS.has(productId)) return storedStatus();
    try {
      // Google requires the product's details to have been fetched before it can be bought.
      await mod.getProductsAsync([productId]);
      await mod.purchaseItemAsync(productId);
    } catch {
      // Includes cancellation on some platforms.
    }
    return storedStatus();
  },

  /** Restores a subscription bought on this store account — required by Apple, and needed after a new phone. */
  async restore(): Promise<SubscriptionStatus> {
    const mod = await connect();
    if (!mod) return storedStatus();
    try {
      const live = await fromHistory(mod);
      if (live) {
        await writeStatus(live);
        return live;
      }
      return storedStatus();
    } catch {
      return storedStatus();
    }
  },
};

/**
 * VERIFYING PROPERLY, when there is a server to do it with:
 *
 *  1. Send the purchase token (Android) or receipt (iOS) from `handlePurchases` to your server.
 *  2. The server asks Google's `purchases.subscriptions.get` / Apple's App Store Server API whether
 *     it is genuine and still active, and returns the answer WITH ITS EXPIRY.
 *  3. Store that answer here, expiry included. `currentPlan()` already lapses an expired record, so
 *     nothing above this file changes.
 *
 * What must NOT happen: trusting a receipt the device validated itself, or writing `plan: 'plus'`
 * from anything a client can forge. That is why the record carries `source` and `verifiedAt` — so a
 * locally-trusted entitlement is always distinguishable from a verified one.
 */
