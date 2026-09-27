import type { AdventureKey } from '@/theme/adventure';

/**
 * The badges a child can earn.
 *
 * Every one is measured against something the app ALREADY records — attempts, exercises, stars,
 * streak days — so a badge is earned by practice that really happened and can never disagree with
 * it. Nothing is stored: `useAchievements` recomputes them, which also means a child who has been
 * using TalkEasy for weeks opens this screen with badges already unlocked.
 *
 * They are all counting badges on purpose. Not one of them is awarded for being CORRECT: this app
 * never grades a child's speech, and a badge for accuracy would quietly turn practice into a test.
 */

/** The counters a badge can be measured against. */
export interface AchievementMetrics {
  /** Sound Practice attempts, all time. */
  soundAttempts: number;
  /** Different sounds practised, all time. */
  soundsPractised: number;
  /** Speech Practice exercises, all time. */
  speechExercises: number;
  /** Different Speech Practice activities tried. */
  speechActivities: number;
  /** Different words/items practised. */
  wordsPractised: number;
  /** Handwriting/tracing sessions finished. */
  tracingSessions: number;
  /** Stars earned, all time. */
  stars: number;
  /** Consecutive days of practice. */
  streak: number;
}

export type MetricKey = keyof AchievementMetrics;

export interface BadgeDefinition {
  id: string;
  title: string;
  /** What earns it, in words a grown-up can read to the child. */
  description: string;
  icon: string;
  color: AdventureKey;
  metric: MetricKey;
  /** The count that unlocks it. */
  target: number;
}

export const BADGES: BadgeDefinition[] = [
  { id: 'first-word', title: 'First Word', description: 'Finish your first speech activity.', icon: 'flag-outline', color: 'grass', metric: 'speechExercises', target: 1 },
  { id: 'sound-explorer', title: 'Sound Explorer', description: 'Practise 10 different sounds.', icon: 'compass-outline', color: 'sky', metric: 'soundsPractised', target: 10 },
  { id: 'speech-star', title: 'Speech Star', description: 'Finish 25 speech activities.', icon: 'star-outline', color: 'sun', metric: 'speechExercises', target: 25 },
  { id: 'word-collector', title: 'Word Collector', description: 'Practise 20 different words.', icon: 'bookmark-multiple-outline', color: 'coral', metric: 'wordsPractised', target: 20 },
  { id: 'super-speaker', title: 'Super Speaker', description: 'Try 5 different speech activities.', icon: 'account-voice', color: 'grape', metric: 'speechActivities', target: 5 },
  { id: 'steady-hand', title: 'Steady Hand', description: 'Finish 10 tracing pages.', icon: 'pencil-outline', color: 'reef', metric: 'tracingSessions', target: 10 },
  { id: 'star-collector', title: 'Star Collector', description: 'Earn 100 stars.', icon: 'star-circle-outline', color: 'sun', metric: 'stars', target: 100 },
  { id: 'day-after-day', title: 'Day After Day', description: 'Practise 3 days in a row.', icon: 'fire', color: 'coral', metric: 'streak', target: 3 },
];

export interface EarnedBadge extends BadgeDefinition {
  /** Where the child is now, capped at the target. */
  current: number;
  earned: boolean;
  /** 0..1 towards the target. */
  progress: number;
}

/** Measures every badge against the metrics. Pure, so it is easy to test and cheap to re-run. */
export function evaluateBadges(metrics: AchievementMetrics): EarnedBadge[] {
  return BADGES.map((b) => {
    const value = metrics[b.metric];
    const current = Math.min(value, b.target);
    return { ...b, current, earned: value >= b.target, progress: b.target > 0 ? current / b.target : 0 };
  });
}
