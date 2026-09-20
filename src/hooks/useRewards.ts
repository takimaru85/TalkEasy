import { useCallback } from 'react';
import { rewardsRepo } from '@/database';
import { useProfile } from '@/context/ProfileContext';
import type { Reward, StarEvent, StarSource, StarSummary } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NO_REWARDS: Reward[] = [];
const NO_EVENTS: StarEvent[] = [];
const EMPTY: StarSummary = { total: 0, earnedToday: 0, nextReward: null };

export function useRewardList() {
  return useDbQuery(() => rewardsRepo.getRewards(), NO_REWARDS, ['rewards']);
}

export function useStarSummary() {
  return useDbQuery(() => rewardsRepo.getSummary(), EMPTY, ['rewards']);
}

export function useStarHistory(limit = 30) {
  return useDbQuery(() => rewardsRepo.getHistory(limit), NO_EVENTS, ['rewards'], [limit]);
}

export type StarEventKind = 'learning' | 'perfect' | 'routine' | 'activity' | 'assignment';

/**
 * Awards stars according to the parent's reward preferences.
 * Returns the number of stars granted (0 when that event type is switched off).
 */
export function useAwardStars() {
  const { profile } = useProfile();
  const prefs = profile.rewards;

  return useCallback(
    async (kind: StarEventKind, reason: string): Promise<number> => {
      const amount =
        kind === 'learning' ? prefs.starsPerLearningSession
        : kind === 'perfect' ? prefs.starsPerPerfectSession
        : kind === 'routine' ? prefs.starsPerRoutineStep
        : kind === 'activity' ? prefs.starsPerActivity
        : prefs.starsPerAssignment;
      const source: StarSource = kind === 'perfect' ? 'learning' : kind;
      if (amount > 0) await rewardsRepo.addStars(amount, reason, source);
      return amount;
    },
    [prefs],
  );
}
