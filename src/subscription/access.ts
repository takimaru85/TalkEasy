import { GATED_AREAS } from './catalog';
import { ALLOWED, FREE_STATUS, NEEDS_PLUS, type Access, type GatedArea, type Plan, type SubscriptionStatus } from './types';

/**
 * Who may open what. Pure functions — no React, no storage, no clock of their own.
 *
 * `now` is always passed in rather than read from `Date`, so the checks can prove what happens the
 * minute a subscription lapses instead of hoping.
 */

/**
 * The plan in force RIGHT NOW.
 *
 * A stored record saying 'plus' is a claim about the past: it was true when it was written. If its
 * expiry has passed, the family is on Free again whatever the record says. Doing this in one place
 * means no screen has to remember to check an expiry, and none of them can forget.
 */
export function currentPlan(status: SubscriptionStatus | null | undefined, now: Date): Plan {
  if (!status || status.plan !== 'plus') return 'free';
  if (!status.expiresAt) return 'plus'; // no expiry known yet (or a lifetime entitlement)
  const expires = Date.parse(status.expiresAt);
  if (Number.isNaN(expires)) return 'plus'; // an unreadable date must not silently remove access
  return expires > now.getTime() ? 'plus' : 'free';
}

export function isPlus(status: SubscriptionStatus | null | undefined, now: Date): boolean {
  return currentPlan(status, now) === 'plus';
}

/** How many items of an area the free plan opens. */
export function freeCount(area: GatedArea): number {
  return GATED_AREAS[area].freeCount;
}

/**
 * Whether the item at `index` (0-based, in the area's own order) can be opened.
 *
 * Plus opens everything. Free opens the first `freeCount`.
 */
export function accessToItem(area: GatedArea, index: number, plan: Plan): Access {
  if (plan === 'plus') return ALLOWED;
  return index < GATED_AREAS[area].freeCount ? ALLOWED : NEEDS_PLUS;
}

/**
 * Content a grown-up created on this device is ALWAYS theirs.
 *
 * A parent who types in tonight's homework, or scans it, must never be told their own lesson is a
 * premium feature. The free allowance applies to the content TalkEasy ships with; it never applies
 * to a family's own. Screens pass this for any list that mixes the two.
 */
export function accessToItemOwnAuthored(area: GatedArea, index: number, plan: Plan, ownAuthored: boolean): Access {
  return ownAuthored ? ALLOWED : accessToItem(area, index, plan);
}

/** How many of `total` items are locked, for "3 more with Plus" style wording. */
export function lockedCount(area: GatedArea, total: number, plan: Plan): number {
  if (plan === 'plus') return 0;
  return Math.max(0, total - GATED_AREAS[area].freeCount);
}

/**
 * Whether an area has anything locked at all — so a screen can skip the lock wording entirely
 * rather than showing "0 more with Plus".
 */
export function hasLockedContent(area: GatedArea, total: number, plan: Plan): boolean {
  return lockedCount(area, total, plan) > 0;
}

/** A readable record from whatever was stored; anything unusable falls back to Free. */
export function parseStatus(raw: string | null | undefined): SubscriptionStatus {
  if (!raw) return FREE_STATUS;
  try {
    const v = JSON.parse(raw) as Partial<SubscriptionStatus>;
    if (v.plan !== 'free' && v.plan !== 'plus') return FREE_STATUS;
    return {
      plan: v.plan,
      source: v.source === 'mock' || v.source === 'apple' || v.source === 'google' ? v.source : 'none',
      productId: typeof v.productId === 'string' ? v.productId : null,
      expiresAt: typeof v.expiresAt === 'string' ? v.expiresAt : null,
      verifiedAt: typeof v.verifiedAt === 'string' ? v.verifiedAt : null,
    };
  } catch {
    return FREE_STATUS;
  }
}

export function serializeStatus(status: SubscriptionStatus): string {
  return JSON.stringify(status);
}
