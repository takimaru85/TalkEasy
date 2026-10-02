/**
 * What a family is entitled to. Pure types — no React, no storage, no network.
 *
 * TalkEasy has exactly TWO plans. Resist adding a third: every extra plan multiplies the places a
 * screen has to think about access, and this app's job is practice, not tier management.
 */
export type Plan = 'free' | 'plus';

/**
 * Where the subscription came from.
 *
 * 'mock' is the development state used until real billing is connected; it is deliberately a
 * distinct value rather than pretending to be a store purchase, so nothing can mistake a developer
 * toggle for a real entitlement and no production code path treats the two the same.
 */
export type PlanSource = 'none' | 'mock' | 'apple' | 'google';

/**
 * The stored subscription record.
 *
 * NOT a boolean. A real store receipt carries a product, an expiry and a moment it was checked, and
 * a plan that cannot express those has nowhere to put them when billing is connected — which is how
 * an app ends up with `isPremium = true` written somewhere a child could reach. `plan` here is what
 * was last verified; whether it is still in force is decided by `currentPlan()`, which looks at the
 * clock.
 */
export interface SubscriptionStatus {
  plan: Plan;
  source: PlanSource;
  /** Store product identifier, when there is one. */
  productId: string | null;
  /** ISO date the entitlement lapses; null means it does not expire (or is not known yet). */
  expiresAt: string | null;
  /** ISO date the entitlement was last confirmed. */
  verifiedAt: string | null;
}

/** The free plan, and what an unreadable or missing record falls back to. */
export const FREE_STATUS: SubscriptionStatus = {
  plan: 'free',
  source: 'none',
  productId: null,
  expiresAt: null,
  verifiedAt: null,
};

/**
 * The parts of TalkEasy that have a free allowance.
 *
 * ONLY LEARNING CONTENT IS LISTED HERE, and that is a product rule rather than an oversight:
 *
 * - Talk / Communicate is the child's VOICE. A child asking for the bathroom must never meet a
 *   paywall mid-sentence, so communication tiles, Feelings and My Day are never gated.
 * - Adventure worlds are the motivation layer. Locking the scenery a child is already inside takes
 *   something away from them rather than offering something to a grown-up.
 * - Parent Mode tools stay open, so a grown-up can always see how their child is doing.
 *
 * Adding a gated area = one entry here plus one line in GATED_AREAS. Screens never name a plan.
 */
export type GatedArea = 'lessons' | 'speechPractice' | 'writing' | 'listenTalk' | 'therapy';

/** Why something is not available, so a screen can say the right thing. */
export type LockReason = 'plus';

export interface Access {
  /** Whether the thing can be opened right now. */
  allowed: boolean;
  /** Set when it cannot, so the caller can offer the right next step. */
  reason: LockReason | null;
}

export const ALLOWED: Access = { allowed: true, reason: null };
export const NEEDS_PLUS: Access = { allowed: false, reason: 'plus' };
