import { useCallback } from 'react';
import { rewardsRepo, shopRepo } from '@/database';
import { useProfile } from '@/context/ProfileContext';
import type { Reward, StarEvent, StarSummary } from '@/types/models';
import { starsFor, type ClaimKind, type ClaimStatus } from '@/rewards/verification';
import { useDbQuery } from './useDbQuery';

const NO_REWARDS: Reward[] = [];
const NO_EVENTS: StarEvent[] = [];
const EMPTY: StarSummary = { total: 0, lifetime: 0, earnedToday: 0, nextReward: null };

export function useRewardList() {
  return useDbQuery(() => rewardsRepo.getRewards(), NO_REWARDS, ['rewards']);
}

export function useStarSummary() {
  return useDbQuery(() => rewardsRepo.getSummary(), EMPTY, ['rewards']);
}

export function useStarHistory(limit = 30) {
  return useDbQuery(() => rewardsRepo.getHistory(limit), NO_EVENTS, ['rewards'], [limit]);
}

const NO_OWNED: string[] = [];

/** The shop items the child owns. Refreshes with the star ledger, because a purchase changes both. */
export function useShopOwned() {
  return useDbQuery(() => shopRepo.getOwned(), NO_OWNED, ['rewards']);
}

const NO_EQUIPPED: Record<string, string> = {};

/** What the child is wearing, by slot. */
export function useShopEquipped() {
  return useDbQuery(() => shopRepo.getEquipped(), NO_EQUIPPED, ['rewards']);
}

/**
 * Claims the stars for a completed task. This is the ONLY way a screen earns stars: the screen names the
 * KIND of task and the unique key of this completion; the amount comes from the grown-up's settings here,
 * never from the screen, and a repeated claim for the same key is a no-op.
 *
 * Resolves with the stars credited NOW (0 for a repeat, for a task awaiting a grown-up, or when the kind is
 * switched off) and the outcome, so a screen can say the right thing.
 */
export function useClaimStars() {
  const { profile } = useProfile();
  const rates = profile.rewards;
  return useCallback(
    async (kind: ClaimKind, key: string, reason: string): Promise<{ stars: number; outcome: 'credited' | 'awaiting_parent' | 'duplicate' }> => {
      const r = await rewardsRepo.claim(kind, key, reason, starsFor(kind, rates));
      return { stars: r.outcome === 'credited' ? r.amount : 0, outcome: r.outcome };
    },
    [rates],
  );
}

/** The status of one claim (null = never claimed), live. */
export function useClaimStatus(key: string | null) {
  return useDbQuery(() => (key ? rewardsRepo.getClaimStatus(key) : Promise.resolve(null)), null as ClaimStatus | null, ['claims'], [key]);
}

const NO_CLAIMS: { key: string; kind: string; reason: string; amount: number; createdAt: string }[] = [];

/** Tasks waiting for a grown-up's confirmation, live. */
export function useAwaitingClaims() {
  return useDbQuery(() => rewardsRepo.getAwaitingClaims(), NO_CLAIMS, ['claims']);
}
