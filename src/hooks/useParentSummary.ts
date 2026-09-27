import { summaryRepo, weekRange, type WeeklySummary } from '@/database';
import { useProfile } from '@/context/ProfileContext';
import { useDbQuery } from './useDbQuery';

const EMPTY_WEEK: WeeklySummary = {
  speechSessions: 0,
  wordsPracticed: 0,
  soundsPracticed: 0,
  lessonsCompleted: 0,
  assignmentsDone: 0,
  assignmentsTotal: 0,
  learningActivities: 0,
  handwritingSessions: 0,
  starsEarned: 0,
  routinePercent: null,
  routineDays: 0,
  routineSteps: 0,
  topSound: null,
  newWords: 0,
  topSpeechActivity: null,
  topLearnActivity: null,
};

const TOPICS = ['speechPractice', 'soundPractice', 'adaptive', 'assignments', 'learning', 'rewards', 'routines', 'lessons'] as const;

/** One week's activity summary (0 = this week, 1 = last week). */
export function useWeeklySummary(offset = 0) {
  const { profile } = useProfile();
  const range = weekRange(offset);
  const query = useDbQuery(() => summaryRepo.weekly(range, profile.id), EMPTY_WEEK, [...TOPICS], [offset, profile.id, range.startIso]);
  return { ...query, range };
}

const EMPTY_TODAY = { assignmentsDoneToday: 0, speechToday: 0, learningToday: 0 };

/** The dashboard's "Today's progress" counts that no other hook already gives. */
export function useTodaySummary() {
  return useDbQuery(() => summaryRepo.today(), EMPTY_TODAY, [...TOPICS]);
}

/** Stars earned this week and this month (spent stars are not subtracted). */
export function useStarsEarned() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekStart = weekRange(0).startIso;
  return useDbQuery(
    async () => ({ week: await summaryRepo.starsEarnedSince(weekStart), month: await summaryRepo.starsEarnedSince(monthStart) }),
    { week: 0, month: 0 },
    ['rewards'],
    [weekStart, monthStart],
  );
}
