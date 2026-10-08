import type { LearningSubjectKey } from '../types';
import { LEVELS_PER_SUBJECT, type LevelDef } from './bank';
import { englishLevels } from './english';
import { mathLevels } from './math';
import { scienceLevels } from './science';
import { apLevels } from './ap';
import { espLevels } from './esp';

export { LEVELS_PER_SUBJECT, LEVELS_PER_TOPIC, levelKey } from './bank';
export type { LevelDef } from './bank';

/** The 100 levels of every Play & Learn subject, in the order a child plays them. */
export const SUBJECT_LEVELS: Record<LearningSubjectKey, LevelDef[]> = {
  english: englishLevels(),
  math: mathLevels(),
  science: scienceLevels(),
  ap: apLevels(),
  esp: espLevels(),
};

export const LEVEL_ACTIVITY_MAP = new Map<string, LevelDef>(
  Object.values(SUBJECT_LEVELS).flatMap((levels) => levels.map((l) => [l.key, l] as const)),
);

export function levelsFor(subject: LearningSubjectKey): LevelDef[] {
  return SUBJECT_LEVELS[subject] ?? [];
}

export { LEVELS_PER_SUBJECT as LEVEL_COUNT };
