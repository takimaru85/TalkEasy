import { soundPracticeRepo } from '@/database';
import type { SoundPracticeStats } from '@/soundpractice/types';
import { useDbQuery } from './useDbQuery';

const NO_STATS: SoundPracticeStats = { soundsPracticed: 0, attempts: 0, practiceMs: 0 };

/** "Today's practice" — how much practice happened today. Never a score. */
export function useTodaySoundPractice() {
  return useDbQuery(() => soundPracticeRepo.todayStats(), NO_STATS, ['soundPractice']);
}

/** Attempts made on one sound today, for gentle encouragement on the practice screen. */
export function useSoundAttemptsToday(soundId: string) {
  return useDbQuery(() => soundPracticeRepo.attemptsToday(soundId), 0, ['soundPractice'], [soundId]);
}
