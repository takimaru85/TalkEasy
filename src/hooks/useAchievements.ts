import { adaptiveProgressRepo, soundPracticeRepo, speechPracticeRepo } from '@/database';
import { useProfile } from '@/context/ProfileContext';
import { evaluateBadges, type AchievementMetrics, type EarnedBadge } from '@/adventure/badges';
import { useAdventure } from './useAdventure';
import { useDbQuery } from './useDbQuery';

const NO_METRICS: AchievementMetrics = {
  soundAttempts: 0,
  soundsPractised: 0,
  speechExercises: 0,
  speechActivities: 0,
  wordsPractised: 0,
  tracingSessions: 0,
  stars: 0,
  streak: 0,
};

/**
 * Everything the progress and achievement screens show, counted from what the child has actually
 * done. Nothing is stored: no badge table, no "unlocked_at", no counter to drift out of step with
 * the practice behind it — which also means these screens are already true for a child who has
 * been using TalkEasy since before badges existed.
 */
export function useAchievements(): { metrics: AchievementMetrics; badges: EarnedBadge[]; earnedCount: number; loading: boolean } {
  const { profile } = useProfile();
  const adventure = useAdventure();

  const { data, loading } = useDbQuery(
    async () => {
      const [sound, speech, adaptive, soundsExplored] = await Promise.all([
        soundPracticeRepo.lifetime(),
        speechPracticeRepo.lifetime(),
        adaptiveProgressRepo.getProgress(profile.id),
        speechPracticeRepo.soundsExplored(),
      ]);
      return {
        soundAttempts: sound.attempts,
        soundsPractised: Math.max(sound.sounds, soundsExplored),
        speechExercises: speech.exercises,
        speechActivities: speech.activities,
        wordsPractised: speech.words,
        tracingSessions: adaptive.handwritingSessions,
        stars: 0,
        streak: 0,
      } satisfies AchievementMetrics;
    },
    NO_METRICS,
    ['soundPractice', 'speechPractice', 'voicePractice', 'adaptive'],
    [profile.id],
  );

  // Stars and streak come from the adventure hook, which already watches the rewards topic.
  const metrics: AchievementMetrics = { ...data, stars: adventure.lifetimeStars, streak: adventure.streak };
  const badges = evaluateBadges(metrics);

  return { metrics, badges, earnedCount: badges.filter((b) => b.earned).length, loading };
}
