import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { collectionRepo } from '@/database';
import { useCollection } from '@/hooks';
import { useCollectionMetrics } from '@/hooks/useCollectionMetrics';
import { useDbQuery } from '@/hooks/useDbQuery';
import { evaluateSpaceCollection, type CollectibleState, type CollectionState } from '@/collection/evaluate';
import type { Discovery } from '@/database/collectionStore';

/**
 * The Space Collection, evaluated ONCE for the whole app and recorded as it grows.
 *
 * Mounted at the root so a discovery is recorded when it happens (and carries the real date), not whenever the
 * child next opens the collection screen. Evaluating is pure; the only side effect is the idempotent
 * `record` of ids the metrics say are earned (see database/collectionStore.ts), so running it on every change
 * is safe, a replay cannot add a duplicate, and nothing is ever removed.
 */
interface Value {
  state: CollectionState;
  /** Ids found since the child last looked (celebrated on the collection screen, then marked seen). */
  unseen: string[];
  discoveries: Map<string, Discovery>;
  markSeen: (ids: string[]) => Promise<void>;
}

const EMPTY = evaluateSpaceCollection({ speechPractice: 0, baRowSyllables: 0, tracingSessions: 0, missionDays: 0, talkTaps: 0, sounds: 0, words: 0, quizzes: 0, lessons: 0, practiceSessions: 0, routineSteps: 0, offlineConfirmed: 0, stars: 0, streak: 0 }, new Map());
const Ctx = createContext<Value>({ state: EMPTY, unseen: [], discoveries: new Map(), markSeen: async () => {} });
const NONE: Discovery[] = [];

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const metrics = useCollectionMetrics();
  const { data: rows } = useDbQuery(() => collectionRepo.getDiscoveries(), NONE, ['collection']);
  const discoveries = useMemo(() => new Map(rows.map((d) => [d.id, d])), [rows]);
  const state = useMemo(() => evaluateSpaceCollection(metrics, new Map(rows.map((d) => [d.id, d.discoveredAt]))), [metrics, rows]);

  // Record whatever is earned and not yet recorded. Keyed on the joined ids so it re-runs only when the set changes.
  const missing = useMemo(() => state.earnedIds.filter((id) => !discoveries.has(id)), [state.earnedIds, discoveries]);
  const key = missing.join(',');
  useEffect(() => {
    if (missing.length) void collectionRepo.record(missing).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const unseen = useMemo(() => rows.filter((d) => !d.seen).map((d) => d.id), [rows]);
  const markSeen = useCallback((ids: string[]) => collectionRepo.markSeen(ids), []);
  const value = useMemo(() => ({ state, unseen, discoveries, markSeen }), [state, unseen, discoveries, markSeen]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSpaceCollection(): Value {
  return useContext(Ctx);
}

/**
 * What the Home strip shows. In the Space world that is the FULL Space Collection (found / 46, five pictures:
 * the newest finds first); any other world keeps its own five (`items` is null, and the screen draws the world's
 * own collectibles). Decided here so no screen names a world.
 */
export function useCollectionStrip(): { found: number; total: number; items: CollectibleState[] | null } {
  const world = useCollection();
  const space = useSpaceCollection();
  return useMemo(() => {
    if (world.world.id !== 'space') return { found: world.found, total: world.items.length, items: null };
    const items = [...space.state.items].sort((a, b) => Number(b.found) - Number(a.found) || (b.discoveredAt ?? '').localeCompare(a.discoveredAt ?? '') || b.progress - a.progress).slice(0, 5);
    return { found: space.state.found, total: space.state.total, items };
  }, [world, space.state]);
}
