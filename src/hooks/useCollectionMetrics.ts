import { adaptiveProgressRepo, buttonsRepo, rewardsRepo, soundPracticeRepo, speechPracticeRepo } from '@/database';
import { useProfile } from '@/context/ProfileContext';
import { BA_ROW, DAILY_MISSION_TARGET } from '@/adventure/worlds';
import { NO_COLLECTION_METRICS, type CollectionMetrics } from '@/collection/evaluate';
import { useAdventure } from './useAdventure';
import { useDbQuery } from './useDbQuery';

/**
 * Everything a collectible's condition can ask about, COUNTED from verified practice. Nothing is typed in
 * and nothing is stored here. Reward-claim counts are CREDITED claims only: a task a grown-up must confirm
 * counts once confirmed, and a screen merely opened or a Done button merely tapped counts for nothing.
 */
export function useCollectionMetrics(): CollectionMetrics {
  const { profile } = useProfile();
  const adventure = useAdventure();
  const { data } = useDbQuery(
    async () => {
      const [sound, speech, syllables, adaptive, missionDays, talkTaps, claims, soundsExplored] = await Promise.all([
        soundPracticeRepo.lifetime(),
        speechPracticeRepo.lifetime(),
        speechPracticeRepo.distinctItems('syllables', BA_ROW),
        adaptiveProgressRepo.getProgress(profile.id),
        soundPracticeRepo.missionDays(DAILY_MISSION_TARGET),
        buttonsRepo.totalTaps(),
        rewardsRepo.getCreditedClaimCounts(),
        speechPracticeRepo.soundsExplored(),
      ]);
      return {
        speechPractice: sound.attempts + speech.exercises,
        baRowSyllables: syllables,
        tracingSessions: adaptive.handwritingSessions,
        missionDays,
        talkTaps,
        sounds: Math.max(sound.sounds, soundsExplored),
        words: speech.words,
        quizzes: claims.quiz ?? 0,
        lessons: claims.lesson ?? 0,
        practiceSessions: claims.practice ?? 0,
        routineSteps: claims.routine ?? 0,
        offlineConfirmed: (claims.offline ?? 0) + (claims.assignment ?? 0),
        stars: 0,
        streak: 0,
      } satisfies CollectionMetrics;
    },
    NO_COLLECTION_METRICS,
    ['soundPractice', 'speechPractice', 'voicePractice', 'adaptive', 'recent', 'claims', 'rewards'],
    [profile.id],
  );
  return { ...data, stars: adventure.lifetimeStars, streak: adventure.streak };
}
