import type { PurchaseSource } from '@/database/shopPurchase';

/**
 * The seam where REAL-MONEY shop purchases connect to the platform store.
 *
 * NOTHING HERE SIMULATES A PURCHASE. The only provider in this build is `unavailableCashProvider`,
 * which says so and sells nothing: ownership is granted solely by `shopRepo.grantCash`, and that is
 * only ever called from a provider that has the STORE'S confirmation (an order id). A button tap
 * cannot reach it.
 *
 * Connecting Google Play Billing / StoreKit is one new file implementing `CashShopProvider` and one
 * line in `shop/index.ts`; no screen changes. What that needs is listed in AGENTS.md ("REAL-MONEY
 * SHOP PURCHASES"): a maintained billing library in the project (the `expo-in-app-purchases`
 * package `subscription/storeProvider.ts` imports is NOT installed and is deprecated), a dev build,
 * the products created in both consoles, and a decision about server-side receipt verification.
 *
 * These are DIGITAL goods used inside the app, so they MUST go through Google Play Billing / Apple
 * In-App Purchase. No payment link, no card form, no third-party gateway.
 */
export type CashOutcome =
  /** The store confirmed the purchase. `orderId` is the store's own id, the dedupe key. */
  | { kind: 'purchased'; orderId: string; source: Exclude<PurchaseSource, 'stars'> }
  /** The family backed out. An ordinary thing to do: not an error. */
  | { kind: 'cancelled' }
  /** The store is holding it (a slow payment, a parental approval). NOT owned yet; it arrives later. */
  | { kind: 'pending' }
  | { kind: 'failed'; reason: string }
  /** No store billing in this build (Expo Go, the web, or billing not set up). */
  | { kind: 'unavailable' };

export interface CashShopProvider {
  /** For Parent Mode, so it is always clear which provider is in force. */
  readonly name: string;
  readonly canPurchase: boolean;
  /** Localised prices from the store keyed by productId. Empty when unavailable. */
  getPrices(productIds: string[]): Promise<Record<string, string>>;
  purchase(productId: string): Promise<CashOutcome>;
  /** Purchases this store account already made, for a new phone or a reinstall. Each carries its order id. */
  restore(): Promise<{ productId: string; orderId: string; source: Exclude<PurchaseSource, 'stars'> }[]>;
}

export const unavailableCashProvider: CashShopProvider = {
  name: 'No store billing in this build',
  canPurchase: false,
  async getPrices() {
    return {};
  },
  async purchase() {
    return { kind: 'unavailable' };
  },
  async restore() {
    return [];
  },
};
