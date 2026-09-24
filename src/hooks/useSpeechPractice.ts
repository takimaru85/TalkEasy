import { buttonsRepo, speechPracticeRepo } from '@/database';
import type { ActivityPracticeRow, MyWord, PracticeDay, SpeechPracticeStats } from '@/speechpractice/types';
import { useDbQuery } from './useDbQuery';

const NO_STATS: SpeechPracticeStats = { activitiesCompleted: 0, wordsPracticed: 0, attempts: 0, practiceMs: 0 };
const NO_ROWS: ActivityPracticeRow[] = [];
const NO_DAYS: PracticeDay[] = [];
const NO_WORDS: MyWord[] = [];

/** "Today's practice" across Speech Practice and Sound Practice. Never a score. */
export function useTodaySpeechPractice() {
  return useDbQuery(() => speechPracticeRepo.todayStats(), NO_STATS, ['speechPractice', 'soundPractice']);
}

/** Today, per activity (Parent Mode). */
export function useSpeechPracticeByActivity() {
  return useDbQuery(() => speechPracticeRepo.todayByActivity(), NO_ROWS, ['speechPractice', 'soundPractice']);
}

/** Practice History: the last `days` days. */
export function useSpeechPracticeHistory(days = 7) {
  return useDbQuery(() => speechPracticeRepo.history(days), NO_DAYS, ['speechPractice', 'soundPractice'], [days]);
}

/** My Words: the Talk cards a parent marked for practice. Same rows as Talk — never a copy. */
export function useMyWords() {
  return useDbQuery(
    async () =>
      (await buttonsRepo.getPracticeWords()).map((b) => ({ id: b.id, label: b.label, phrase: b.phrase, icon: b.icon, imageUri: b.imageUri })),
    NO_WORDS,
    ['buttons'],
  );
}
