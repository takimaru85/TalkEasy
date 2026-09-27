import { useCallback } from 'react';
import { adaptiveProgressRepo, buttonsRepo, soundPracticeRepo, speechPracticeRepo } from '@/database';
import { useProfile } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import {
  BA_ROW,
  DAILY_MISSION_TARGET,
  WORLDS,
  effectiveWorld,
  evaluateCollection,
  type CollectedItem,
  type CollectionMetrics,
  type WorldDefinition,
  type WorldId,
} from '@/adventure/worlds';
import { useDbQuery } from './useDbQuery';

export interface AdventureWorldState {
  world: WorldDefinition;
  /** The grown-up left the choice to the child. */
  childChooses: boolean;
  /** The child has not picked yet (only meaningful when `childChooses`). */
  unchosen: boolean;
  /** Save the child's pick. Does nothing when the grown-up has fixed the world. */
  chooseWorld: (id: WorldId) => Promise<void>;
}

/**
 * The world in effect: the grown-up's fixed choice, else the child's pick, else Space — the
 * world TalkEasy has always had, so an existing child sees no change until someone chooses.
 */
export function useAdventureWorld(): AdventureWorldState {
  const { settings, updateSetting } = useSettings();
  const childChooses = settings.adventureTheme === 'child';
  const id = effectiveWorld(settings.adventureTheme, settings.adventureWorld);

  const chooseWorld = useCallback(
    async (w: WorldId) => {
      if (!childChooses) return;
      await updateSetting('adventureWorld', w);
    },
    [childChooses, updateSetting],
  );

  return { world: WORLDS[id], childChooses, unchosen: childChooses && settings.adventureWorld === '', chooseWorld };
}

const NO_METRICS: CollectionMetrics = { speechPractice: 0, baRowSyllables: 0, tracingSessions: 0, missionDays: 0, talkTaps: 0 };

/**
 * The child's collection in the current world, counted from practice that really happened —
 * nothing is stored, exactly like the badges (see adventure/badges.ts).
 */
export function useCollection(): { world: WorldDefinition; items: CollectedItem[]; found: number; metrics: CollectionMetrics } {
  const { profile } = useProfile();
  const { world } = useAdventureWorld();
  const { data: metrics } = useDbQuery(
    async () => {
      const [sound, speech, syllables, adaptive, missionDays, talkTaps] = await Promise.all([
        soundPracticeRepo.lifetime(),
        speechPracticeRepo.lifetime(),
        speechPracticeRepo.distinctItems('syllables', BA_ROW),
        adaptiveProgressRepo.getProgress(profile.id),
        soundPracticeRepo.missionDays(DAILY_MISSION_TARGET),
        buttonsRepo.totalTaps(),
      ]);
      return {
        speechPractice: sound.attempts + speech.exercises,
        baRowSyllables: syllables,
        tracingSessions: adaptive.handwritingSessions,
        missionDays,
        talkTaps,
      } satisfies CollectionMetrics;
    },
    NO_METRICS,
    ['soundPractice', 'speechPractice', 'adaptive', 'recent'],
    [profile.id],
  );
  const items = evaluateCollection(world.id, metrics);
  return { world, items, found: items.filter((i) => i.found).length, metrics };
}
