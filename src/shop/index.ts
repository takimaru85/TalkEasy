import { unavailableCashProvider, type CashShopProvider } from './cashProvider';

/**
 * Chooses the cash provider. Today there is only the honest "unavailable" one. When a store billing
 * library is added, return its provider here when its native module is present, exactly as
 * `subscription/index.ts` does for Plus: a release build must never fall back to a fake.
 */
export function getCashProvider(): CashShopProvider {
  return unavailableCashProvider;
}
