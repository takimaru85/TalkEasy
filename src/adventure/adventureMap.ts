import type { AdventureKey } from '@/theme/adventure';
import type { Strings } from '@/i18n/types';

/**
 * The Space Adventure Map: four stages, each tied to one real practice destination and one counted
 * metric. Pure — no react-native — so it can be checked without a device.
 *
 * Progress is `min(count, goal)` of a number the practice tables already record; opening a screen
 * never moves it. Nothing is locked: a stage is "current" when it is the first unfinished one, and
 * every stage can be opened at any time.
 */
export type MapMetric = 'wordsPractised' | 'soundsPractised' | 'targetSteps' | 'speechExercises';

export type MapRoute =
  | { screen: 'SpeechStage'; stageId: string }
  | { screen: 'SoundTarget' };

export interface MapStageDef {
  id: 'firstWords' | 'soundExplorer' | 'wordBuilder' | 'talkingChampion';
  titleKey: keyof Strings;
  metric: MapMetric;
  goal: number;
  color: AdventureKey;
  route: MapRoute;
}

export const MAP_STAGES: MapStageDef[] = [
  { id: 'firstWords', titleKey: 'advMapFirstWords', metric: 'wordsPractised', goal: 5, color: 'sun', route: { screen: 'SpeechStage', stageId: 'words' } },
  { id: 'soundExplorer', titleKey: 'advMapSoundExplorer', metric: 'soundsPractised', goal: 5, color: 'sky', route: { screen: 'SpeechStage', stageId: 'sounds' } },
  { id: 'wordBuilder', titleKey: 'advMapWordBuilder', metric: 'targetSteps', goal: 12, color: 'grass', route: { screen: 'SoundTarget' } },
  { id: 'talkingChampion', titleKey: 'advMapChampion', metric: 'speechExercises', goal: 30, color: 'grape', route: { screen: 'SpeechStage', stageId: 'sentences' } },
];

export type MapCounts = Record<MapMetric, number>;

export interface MapStageState {
  def: MapStageDef;
  count: number;
  done: boolean;
  /** The first unfinished stage. */
  current: boolean;
}

export function evaluateMap(counts: MapCounts): MapStageState[] {
  let currentSet = false;
  return MAP_STAGES.map((def) => {
    const count = Math.min(Math.max(0, counts[def.metric]), def.goal);
    const done = count >= def.goal;
    const current = !done && !currentSet;
    if (current) currentSet = true;
    return { def, count, done, current };
  });
}

/**
 * Sound Explorer counts DIFFERENT SOUND ITEMS practised in the Sounds hub, from every table the
 * hub's activities actually write to — they do not share one:
 *   Sound Practice screen          -> sound_practice_attempts (item = the letter)
 *   Listen/Say (VoiceActivity)     -> voice_practice_events   (activity soundListen / soundSay)
 *   Sounds/Matching/Imitation      -> speech_practice_events  (activity sounds / matching / imitation)
 * Items are compared upper-cased so one sound practised in two places counts once. Target-journey
 * step keys (`ba:listen`) are excluded; those belong to Word Builder.
 */
export const SOUND_EXPLORER_SQL = `
SELECT COUNT(*) AS n FROM (
  SELECT UPPER(item) AS k FROM sound_practice_attempts WHERE item <> ''
  UNION
  SELECT UPPER(item) FROM voice_practice_events
   WHERE activity_id IN ('soundListen', 'soundSay') AND item <> ''
  UNION
  SELECT UPPER(item) FROM speech_practice_events
   WHERE activity_id IN ('sounds', 'matching', 'imitation') AND kind IN ('exercise', 'attempt')
     AND item <> '' AND instr(item, ':') = 0
)`;

/** Stage ids that are complete now and were not when the child last looked — each celebrates once. */
export function newlyCompleted(seen: ReadonlySet<string>, stages: MapStageState[]): string[] {
  return stages.filter((s) => s.done && !seen.has(s.def.id)).map((s) => s.def.id);
}

/** Different real words practised. Excludes the target journey's scoped step keys (`ba:listen`). */
export const PLAIN_WORDS_SQL =
  "SELECT COUNT(DISTINCT LOWER(item)) AS n FROM speech_practice_events WHERE item <> '' AND instr(item, ':') = 0";
