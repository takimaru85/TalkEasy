import { rewardsRepo } from '@/database';
import { useDbQuery } from './useDbQuery';
import { useStarSummary } from './useRewards';

/**
 * The game layer: level, explorer title, progress to the next level, and the daily streak.
 *
 * Every number here is DERIVED from what the app already records — stars earned, and the dates
 * they were earned on. Nothing new is stored, so a child who has been using TalkEasy for weeks
 * opens the new home screen with a level and a streak that are already true, and there is no
 * counter that can drift away from reality.
 */

/** Stars needed to finish each level. Early levels are short so the first one lands quickly. */
const LEVEL_STEP = 20;

/** Level titles, in order. The last one repeats once a child is past the list. */
const TITLES = [
  'First Steps',
  'Sound Finder',
  'Speech Explorer',
  'Word Collector',
  'Story Seeker',
  'Super Speaker',
];

export interface AdventureProgress {
  /** 1-based. */
  level: number;
  /** The explorer title for this level. */
  title: string;
  /** Stars earned inside the current level. */
  starsIntoLevel: number;
  /** Stars the current level takes. */
  starsPerLevel: number;
  /** 0..1 through the current level. */
  progress: number;
  /** Consecutive days up to today (or yesterday, so a streak survives until bedtime). */
  streak: number;
  /** The balance on the Home counter (earned minus spent). */
  totalStars: number;
  /** Everything ever earned. Level and badges count from this, so spending never lowers them. */
  lifetimeStars: number;
  earnedToday: number;
}

/** Days in a row ending today or yesterday; `dates` is newest-first 'YYYY-MM-DD'. */
export function streakFrom(dates: readonly string[], today = new Date()): number {
  if (dates.length === 0) return 0;
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const set = new Set(dates);

  // Start at today; if nothing yet today, start at yesterday, so the streak does not appear to
  // break just because the child has not practised YET.
  const cursor = new Date(today);
  if (!set.has(iso(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(iso(cursor))) return 0;
  }

  let streak = 0;
  while (set.has(iso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Level, title and progress for a star total. */
export function levelFor(totalStars: number): Pick<AdventureProgress, 'level' | 'title' | 'starsIntoLevel' | 'starsPerLevel' | 'progress'> {
  const level = Math.floor(Math.max(0, totalStars) / LEVEL_STEP) + 1;
  const starsIntoLevel = Math.max(0, totalStars) % LEVEL_STEP;
  return {
    level,
    title: TITLES[Math.min(level - 1, TITLES.length - 1)],
    starsIntoLevel,
    starsPerLevel: LEVEL_STEP,
    progress: starsIntoLevel / LEVEL_STEP,
  };
}

const NO_DATES: string[] = [];

export function useAdventure(): AdventureProgress {
  const { data: stars } = useStarSummary();
  const { data: dates } = useDbQuery(() => rewardsRepo.getEarnedDates(), NO_DATES, ['rewards']);

  return {
    ...levelFor(stars.lifetime),
    streak: streakFrom(dates),
    totalStars: stars.total,
    lifetimeStars: stars.lifetime,
    earnedToday: stars.earnedToday,
  };
}
