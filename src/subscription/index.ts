import { mockProvider } from './mockProvider';
import type { SubscriptionProvider } from './provider';
import { isStoreBillingAvailable, storeProvider } from './storeProvider';

/**
 * The provider the app uses — chosen by what the build can actually do.
 *
 * REAL BILLING WHEN THE STORE SDK IS IN THE BUILD, the development provider otherwise. That choice
 * is made here rather than by a flag someone has to remember to flip, so a release build cannot ship
 * with the mock and a developer cannot be locked out of Expo Go by the store SDK being absent.
 *
 * Nothing above this line knows which one answered: screens, locks and the paywall talk only to
 * `SubscriptionProvider`.
 */
export const subscription: SubscriptionProvider = isStoreBillingAvailable() ? storeProvider : mockProvider;

export { setMockPlan } from './mockProvider';
export { isStoreBillingAvailable, storeProvider } from './storeProvider';
export { builtinLessonIndexes } from './lessons';
export {
  accessToItem,
  accessToItemOwnAuthored,
  currentPlan,
  freeCount,
  hasLockedContent,
  isPlus,
  lockedCount,
  parseStatus,
  serializeStatus,
} from './access';
export { ALWAYS_FREE, GATED_AREAS, PLUS_BENEFITS } from './catalog';
export { PLUS_PRODUCTS, displayPrice, productFor, type BillingPeriod, type PlusProduct, type StorePrices } from './products';
export type { SubscriptionProvider } from './provider';
export {
  ALLOWED,
  FREE_STATUS,
  NEEDS_PLUS,
  type Access,
  type GatedArea,
  type LockReason,
  type Plan,
  type PlanSource,
  type SubscriptionStatus,
} from './types';
