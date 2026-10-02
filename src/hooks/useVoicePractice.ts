import { useCallback } from 'react';
import { voicePracticeRepo, type VoiceAreaRow, type VoiceTodayRow } from '@/database';
import { activityCount } from '@/practice/engine';
import { PRACTICE_AREA_IDS, type PracticeAreaId, type PracticeAreaProgress } from '@/practice/types';
import { useDbQuery } from './useDbQuery';

/**
 * Voice & Communication practice, read back.
 *
 * `coverage` is HOW MUCH OF AN AREA HAS BEEN TRIED — distinct activities touched, over the number
 * the area contains. It is not a grade and cannot become one: it goes up by opening an activity
 * and working through it, whatever the child's voice did, and it never goes down. That is the only
 * honest bar an app can draw when it deliberately does not measure the child.
 */
export function useVoiceAreas(): { data: PracticeAreaProgress[]; loading: boolean } {
  const { data, loading } = useDbQuery<VoiceAreaRow[]>(() => voicePracticeRepo.byArea(), [], ['voicePractice']);

  const byId = new Map(data?.map((r) => [r.category, r]));
  const areas = PRACTICE_AREA_IDS.map<PracticeAreaProgress>((category) => {
    const row = byId.get(category);
    const total = activityCount(category);
    const activities = Math.min(row?.activities ?? 0, total);
    return {
      category,
      practised: row?.practised ?? 0,
      activities,
      coverage: total > 0 ? activities / total : 0,
    };
  });

  return { data: areas, loading };
}

/** What was practised today, newest area first — the Parent Mode summary. */
export function useVoiceToday(): { data: VoiceTodayRow[]; loading: boolean } {
  const { data, loading } = useDbQuery<VoiceTodayRow[]>(() => voicePracticeRepo.today(), [], ['voicePractice']);
  return { data: data ?? [], loading };
}

/** Records one worked-through exercise. Never a result — only that it happened. */
export function useRecordVoicePractice() {
  return useCallback(
    (activityId: string, category: PracticeAreaId, kind: string, item: string, durationMs: number) =>
      voicePracticeRepo
        .record({ activityId, category, kind: kind as never, item, durationMs })
        .catch(() => {
          // Practice must never be interrupted by bookkeeping.
        }),
    [],
  );
}
