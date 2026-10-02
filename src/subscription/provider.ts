import type { StorePrices } from './products';
import type { SubscriptionStatus } from './types';

/**
 * The seam where real billing will be connected.
 *
 * Everything above this line — screens, gating, the context — talks to this interface and knows
 * nothing about Apple, Google, or any billing library. Connecting real subscriptions is therefore
 * ONE new file implementing this, plus one line choosing it in `index.ts`: no screen changes, no
 * gating changes.
 *
 * Why an interface rather than calling a store SDK directly: a store SDK cannot run in Expo Go,
 * cannot run on the web preview, and cannot run in the check scripts. An app that calls one
 * directly from its screens can no longer be developed or tested anywhere else.
 *
 * NOTE ON TALKEASY'S HARD RULES: this app has no network code, no accounts and no cloud SDKs, and
 * the mock provider below keeps it that way. Connecting Apple or Google WILL introduce the first
 * network calls in TalkEasy. That is a deliberate, documented exception for billing only — it must
 * never become a route for a child's practice data to leave the device.
 */
export interface SubscriptionProvider {
  /** A name for Parent Mode, so it is always clear which provider is in force. */
  readonly name: string;
  /** Whether this provider can actually sell anything (false for the mock). */
  readonly canPurchase: boolean;

  /** The entitlement this device currently has. Never throws; returns Free on any failure. */
  getStatus(): Promise<SubscriptionStatus>;

  /** Localised prices from the store, keyed by productId. Empty when unavailable. */
  getPrices(): Promise<StorePrices>;

  /**
   * Starts a purchase and resolves with the resulting entitlement.
   *
   * Resolves with the UNCHANGED status when the family cancels — cancelling is an ordinary thing to
   * do and must not surface as an error.
   */
  purchase(productId: string): Promise<SubscriptionStatus>;

  /**
   * Restores a subscription already bought with this store account.
   *
   * Required by Apple's guidelines, and the thing a parent needs after changing phone.
   */
  restore(): Promise<SubscriptionStatus>;
}

/**
 * How a real provider should verify a purchase, recorded here so the next person does not have to
 * guess at it:
 *
 * 1. The store SDK returns a signed receipt / purchase token.
 * 2. That token goes to a server you control, which asks Apple or Google whether it is genuine and
 *    still active. The ANSWER from that server is what becomes `SubscriptionStatus`.
 * 3. The device caches the answer (with its expiry) so the app still works offline — which this app
 *    must, since it is used by children who may have no connection.
 *
 * What must NOT happen: trusting a receipt the device itself validated, or writing `plan: 'plus'`
 * from anything a client can forge. The cached status here is a CONVENIENCE for offline use, not
 * the authority — which is why `SubscriptionStatus` carries `verifiedAt` and `source`.
 */
export const VERIFICATION_NOTES = 'See provider.ts — purchases must be verified server-side.';
