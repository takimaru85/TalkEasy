import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import {
  accessToItem,
  accessToItemOwnAuthored,
  currentPlan,
  lockedCount,
  parseStatus,
  subscription,
  type Access,
  type GatedArea,
  type Plan,
  type StorePrices,
  type SubscriptionStatus,
} from '@/subscription';
import { PLUS_GATING_ENABLED } from '@/subscription/release';

interface SubscriptionContextValue {
  /** The stored record. */
  status: SubscriptionStatus;
  /** The plan in force now, after checking any expiry. What screens should use. */
  plan: Plan;
  isPlus: boolean;
  /** Localised store prices, keyed by productId. Empty until billing is connected. */
  prices: StorePrices;
  /** False while the provider cannot sell (no billing connected yet). */
  canPurchase: boolean;
  /** Whether the item at `index` in an ordered area can be opened. */
  can: (area: GatedArea, index: number) => Access;
  /** As `can`, but content a grown-up made themselves is always theirs. */
  canOwnAuthored: (area: GatedArea, index: number, ownAuthored: boolean) => Access;
  /** How many of `total` items are behind Plus. */
  locked: (area: GatedArea, total: number) => number;
  purchase: (productId: string) => Promise<void>;
  restore: () => Promise<void>;
}

const FALLBACK: SubscriptionContextValue = {
  status: { plan: 'free', source: 'none', productId: null, expiresAt: null, verifiedAt: null },
  plan: 'free',
  isPlus: false,
  prices: {},
  canPurchase: false,
  can: () => ({ allowed: true, reason: null }),
  canOwnAuthored: () => ({ allowed: true, reason: null }),
  locked: () => 0,
  purchase: async () => {},
  restore: async () => {},
};

const SubscriptionContext = createContext<SubscriptionContextValue>(FALLBACK);

/**
 * The family's entitlement, for the whole app.
 *
 * The STATUS rides on settings rather than having a loader of its own: it is already stored there,
 * already reloaded when anything writes to settings, and already in memory before the first screen
 * paints. That matters — a gate that resolves late shows a child an unlocked activity for a frame
 * and then snatches it away.
 *
 * Only the store PRICES are fetched here, once, because they are the one part that has to come from
 * outside. Everything else is a pure read.
 */
export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [prices, setPrices] = useState<StorePrices>({});

  const status = useMemo(() => parseStatus(settings.subscriptionStatus), [settings.subscriptionStatus]);
  // Re-derived whenever the record changes. An expiry that passes mid-session is picked up the next
  // time anything touches settings, which is soon enough for a plan measured in months.
  // Billing is not connected in this release, so nothing is gated (see subscription/release.ts).
  const plan = useMemo(() => (PLUS_GATING_ENABLED ? currentPlan(status, new Date()) : 'plus'), [status]);

  useEffect(() => {
    let alive = true;
    subscription
      .getPrices()
      .then((p) => {
        if (alive) setPrices(p);
      })
      .catch(() => {
        // No prices is a displayable state (the paywall falls back and says so), never an error.
      });
    return () => {
      alive = false;
    };
  }, []);

  const purchase = useCallback(async (productId: string) => {
    // The provider writes the resulting entitlement; settings then notify and the plan re-derives.
    await subscription.purchase(productId);
  }, []);

  const restore = useCallback(async () => {
    await subscription.restore();
  }, []);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      status,
      plan,
      isPlus: plan === 'plus',
      prices,
      canPurchase: subscription.canPurchase,
      can: (area, index) => accessToItem(area, index, plan),
      canOwnAuthored: (area, index, ownAuthored) => accessToItemOwnAuthored(area, index, plan, ownAuthored),
      locked: (area, total) => lockedCount(area, total, plan),
      purchase,
      restore,
    }),
    [status, plan, prices, purchase, restore],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  return useContext(SubscriptionContext);
}
