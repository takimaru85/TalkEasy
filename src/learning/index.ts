import { ENGLISH } from './content/english';
import { MATH } from './content/math';
import { SCIENCE } from './content/science';
import { AP } from './content/ap';
import { ESP } from './content/esp';
import type { LearningActivity, LearningSubject, LearningSubjectKey } from './types';
import { LEVEL_ACTIVITY_MAP } from './levels';

/**
 * Registry of Grade 2 learning content. Order here is the order shown to the child.
 * Adding a subject or activity = add it to the content files and this list; nothing else.
 */
export const LEARNING_SUBJECTS: LearningSubject[] = [ENGLISH, MATH, SCIENCE, AP, ESP];

export const LEARNING_SUBJECT_MAP: Record<LearningSubjectKey, LearningSubject> = Object.fromEntries(
  LEARNING_SUBJECTS.map((s) => [s.key, s]),
) as Record<LearningSubjectKey, LearningSubject>;

const ACTIVITY_MAP = new Map<string, LearningActivity>(
  LEARNING_SUBJECTS.flatMap((s) => s.activities.map((a) => [a.key, a] as const)),
);

export function getActivity(key: string): LearningActivity | undefined {
  // Level activities (`english.l012`) are not in a subject's list, so they are looked up here.
  return ACTIVITY_MAP.get(key) ?? LEVEL_ACTIVITY_MAP.get(key);
}

export function getSubject(key: string): LearningSubject | undefined {
  return LEARNING_SUBJECT_MAP[key as LearningSubjectKey];
}

export { SUBJECT_LEVELS, LEVEL_COUNT, levelsFor } from './levels';
export type { LevelDef } from './levels';
export { createRng, QUESTIONS_PER_SESSION } from './engine';
export type { LearningActivity, LearningSubject, LearningSubjectKey, Option, Question } from './types';
