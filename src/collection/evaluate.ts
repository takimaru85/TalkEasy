import { CATEGORIES, COLLECTION, trophyId, type Collectible, type CollectionCategory, type CollectionMetric, type Condition } from './registry';

export type CollectionMetrics = Record<CollectionMetric, number>;

export const NO_COLLECTION_METRICS: CollectionMetrics = {
  speechPractice: 0, baRowSyllables: 0, tracingSessions: 0, missionDays: 0, talkTaps: 0, sounds: 0, words: 0,
  quizzes: 0, lessons: 0, practiceSessions: 0, routineSteps: 0, offlineConfirmed: 0, stars: 0, streak: 0,
};

export interface CollectibleState extends Collectible {
  found: boolean;
  /** Where the child is on its metric condition, capped at the target (0 for milestone conditions). */
  current: number;
  target: number;
  progress: number;
  /** ISO time it was recorded, when it was. */
  discoveredAt: string | null;
}

export interface CollectionState {
  items: CollectibleState[];
  found: number;
  total: number;
  /** Categories fully found, each earning its trophy. */
  completeCategories: CollectionCategory[];
  /** Ids (collectibles AND trophies) the metrics say are earned, to be recorded. */
  earnedIds: string[];
}

/**
 * Which collectibles are found. Pure.
 *
 * A collectible is found if it was ALREADY RECORDED (`discovered`: nothing is ever taken back) or its
 * condition holds now. Conditions on the collection itself (reach N found, finish a category) depend on
 * the others, so the pass repeats until nothing new turns up — each pass can only ADD, so it always stops.
 */
export function evaluateSpaceCollection(metrics: CollectionMetrics, discovered: ReadonlyMap<string, string>): CollectionState {
  const found = new Set<string>(COLLECTION.filter((c) => discovered.has(c.id)).map((c) => c.id));
  const holds = (cond: Condition): boolean => {
    if (cond.kind === 'metric') return (metrics[cond.metric] ?? 0) >= cond.at;
    if (cond.kind === 'collected') return found.size >= cond.at;
    return COLLECTION.filter((c) => c.category === cond.category).every((c) => found.has(c.id));
  };
  for (let guard = 0; guard < COLLECTION.length + 2; guard++) {
    let added = false;
    for (const c of COLLECTION) {
      if (!found.has(c.id) && holds(c.condition)) {
        found.add(c.id);
        added = true;
      }
    }
    if (!added) break;
  }
  const items = COLLECTION.map<CollectibleState>((c) => {
    const isFound = found.has(c.id);
    const metric = c.condition.kind === 'metric' ? c.condition : null;
    const target = metric ? metric.at : c.condition.kind === 'collected' ? c.condition.at : 0;
    const current = metric ? Math.min(metrics[metric.metric] ?? 0, metric.at) : c.condition.kind === 'collected' ? Math.min(found.size, c.condition.at) : 0;
    return { ...c, found: isFound, current: isFound && metric ? metric.at : current, target, progress: target > 0 ? Math.min(1, (isFound ? target : current) / target) : isFound ? 1 : 0, discoveredAt: discovered.get(c.id) ?? null };
  });
  const complete = CATEGORIES.filter((cat) => COLLECTION.filter((c) => c.category === cat.id).every((c) => found.has(c.id))).map((c) => c.id);
  const earnedIds = [...found, ...complete.map(trophyId)];
  return { items, found: found.size, total: COLLECTION.length, completeCategories: complete, earnedIds };
}
