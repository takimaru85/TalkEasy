import { adaptiveProgressRepo, lessonsRepo } from '@/database';
import { useProfile } from '@/context/ProfileContext';
import type { AdaptiveAttempt, AdaptiveProgress, HandwritingSession, LessonActivity, LessonWithSubject } from '@/adaptive/types';
import { useDbQuery } from './useDbQuery';

const NO_LESSONS: LessonWithSubject[] = [];
const NO_ACTIVITIES: LessonActivity[] = [];
const NO_ATTEMPTS: AdaptiveAttempt[] = [];
const NO_SESSIONS: HandwritingSession[] = [];
const EMPTY_PROGRESS: AdaptiveProgress = {
  learningPercent: 0, questionsAnswered: 0, correctAnswers: 0, lessonsCompleted: 0, lessonsTotal: 0,
  subjects: [], methods: [], handwritingSessions: 0, handwritingLevelsPractised: [], handwritingPercent: 0,
  speechAnswers: { count: 0, correct: 0 }, typingAnswers: { count: 0, correct: 0 },
};

export function useLessons(includeInactive = false) {
  const { profile } = useProfile();
  return useDbQuery(() => lessonsRepo.getAll(profile.id, includeInactive), NO_LESSONS, ['lessons', 'adaptive', 'subjects', 'profile'], [profile.id, includeInactive]);
}

export function useTodayLessons(isoDate: string) {
  const { profile } = useProfile();
  return useDbQuery(() => lessonsRepo.getToday(profile.id, isoDate), NO_LESSONS, ['lessons', 'adaptive', 'subjects', 'profile'], [profile.id, isoDate]);
}

export function useSubjectLessons(subjectId: number | null) {
  const { profile } = useProfile();
  return useDbQuery(() => lessonsRepo.getBySubject(profile.id, subjectId), NO_LESSONS, ['lessons', 'adaptive', 'subjects', 'profile'], [profile.id, subjectId]);
}

export function useLesson(id: number | undefined) {
  const { profile } = useProfile();
  return useDbQuery(
    () => (id === undefined ? Promise.resolve(null) : lessonsRepo.getById(profile.id, id)),
    null as LessonWithSubject | null,
    ['lessons', 'adaptive', 'subjects', 'profile'],
    [profile.id, id],
  );
}

export function useLessonActivities(lessonId: number | undefined) {
  return useDbQuery(
    () => (lessonId === undefined ? Promise.resolve(NO_ACTIVITIES) : lessonsRepo.getActivities(lessonId)),
    NO_ACTIVITIES,
    ['lessons'],
    [lessonId],
  );
}

export function useCompletedActivityIds(lessonId: number | undefined) {
  const { profile } = useProfile();
  return useDbQuery(
    () => (lessonId === undefined ? Promise.resolve(new Set<number>()) : adaptiveProgressRepo.getCompletedActivityIds(profile.id, lessonId)),
    new Set<number>(),
    ['adaptive', 'profile'],
    [profile.id, lessonId],
  );
}

export function useAdaptiveProgress() {
  const { profile } = useProfile();
  return useDbQuery(() => adaptiveProgressRepo.getProgress(profile.id), EMPTY_PROGRESS, ['adaptive', 'lessons', 'profile'], [profile.id]);
}

export function useRecentAttempts(limit = 30) {
  const { profile } = useProfile();
  return useDbQuery(() => adaptiveProgressRepo.getRecentAttempts(profile.id, limit), NO_ATTEMPTS, ['adaptive', 'profile'], [profile.id, limit]);
}

export function useHandwritingSessions(limit = 30) {
  const { profile } = useProfile();
  return useDbQuery(() => adaptiveProgressRepo.getHandwritingSessions(profile.id, limit), NO_SESSIONS, ['adaptive', 'profile'], [profile.id, limit]);
}
