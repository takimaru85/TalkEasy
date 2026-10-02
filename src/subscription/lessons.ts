/**
 * Where a lesson sits in the free allowance.
 *
 * Lessons are the one gated area with MIXED AUTHORSHIP: TalkEasy ships four, and a grown-up can add
 * as many of their own as they like. Only the built-in ones have an allowance, so the position that
 * matters is a lesson's place among the BUILT-IN lessons alone.
 *
 * Counting this way means a family's own lessons can never push a built-in one across the free
 * line, and a parent who adds twenty lessons still sees the same two built-in ones open. Numbering
 * the whole list instead would make the free allowance depend on how much homework a parent had
 * typed in that week, which is nobody's idea of a plan.
 */
export function builtinLessonIndexes<T extends { id: number; isBuiltin: boolean }>(
  lessons: readonly T[],
): Map<number, number> {
  const map = new Map<number, number>();
  let n = 0;
  for (const lesson of lessons) {
    if (lesson.isBuiltin) map.set(lesson.id, n++);
  }
  return map;
}
