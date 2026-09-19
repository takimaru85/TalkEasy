import { learningRepo } from '@/database';
import type { LearningActivityConfig, LearningProgressEntry, LearningSubjectStats } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NO_CONFIG = new Map<string, LearningActivityConfig>();
const NO_BEST = new Map<string, number>();
const NO_PROGRESS: LearningProgressEntry[] = [];
const NO_STATS: LearningSubjectStats[] = [];

export function useLearningConfigs() {
  return useDbQuery(() => learningRepo.getConfigs(), NO_CONFIG, ['learning']);
}

export function useLearningBest() {
  return useDbQuery(() => learningRepo.getActivityBest(), NO_BEST, ['learning']);
}

export function useRecentLearning(limit = 30) {
  return useDbQuery(() => learningRepo.getRecent(limit), NO_PROGRESS, ['learning'], [limit]);
}

export function useLearningStats() {
  return useDbQuery(() => learningRepo.getSubjectStats(), NO_STATS, ['learning']);
}
