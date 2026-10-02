import { settingsRepo } from '@/database';
import { parseStatus, serializeStatus } from './access';
import type { StorePrices } from './products';
import type { SubscriptionProvider } from './provider';
import { FREE_STATUS, type SubscriptionStatus } from './types';

/**
 * The development provider, used until real billing is connected.
 *
 * IT SELLS NOTHING. `canPurchase` is false and `purchase()` refuses, so there is no code path here
 * that could take a payment or pretend to — a fake checkout is worse than none, because it teaches
 * the UI a flow that will not exist and can convince a parent they have paid.
 *
 * What it DOES do is let the Free and Plus states be switched in Parent Mode, so every locked and
 * unlocked screen can be built and checked properly before a store account exists. The state is
 * recorded with `source: 'mock'`, which Parent Mode shows plainly, so a developer entitlement can
 * never be mistaken for a real one.
 *
 * No network. Nothing leaves the device.
 */
export const mockProvider: SubscriptionProvider = {
  name: 'Development (no billing connected)',
  canPurchase: false,

  async getStatus(): Promise<SubscriptionStatus> {
    try {
      const settings = await settingsRepo.getAll();
      return parseStatus(settings.subscriptionStatus);
    } catch {
      return FREE_STATUS;
    }
  },

  async getPrices(): Promise<StorePrices> {
    // No store, so no real prices. The paywall falls back to its placeholders and says so.
    return {};
  },

  async purchase(): Promise<SubscriptionStatus> {
    // Deliberately a no-op: see the note above. The paywall checks `canPurchase` first and explains
    // that billing is not connected yet rather than opening a checkout that cannot complete.
    return this.getStatus();
  },

  async restore(): Promise<SubscriptionStatus> {
    // Nothing to restore from without a store account; the stored state is already the truth here.
    return this.getStatus();
  },
};

/**
 * Switches the development entitlement. PARENT MODE ONLY, and only while the mock provider is in
 * force — once real billing is connected this has no business running, which is why it is exported
 * separately from the provider interface rather than being a method on it.
 */
export async function setMockPlan(plan: 'free' | 'plus'): Promise<SubscriptionStatus> {
  const status: SubscriptionStatus =
    plan === 'plus'
      ? { plan: 'plus', source: 'mock', productId: null, expiresAt: null, verifiedAt: new Date().toISOString() }
      : FREE_STATUS;
  await settingsRepo.set('subscriptionStatus', serializeStatus(status));
  return status;
}
