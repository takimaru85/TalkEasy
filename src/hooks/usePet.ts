import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  COSMETICS,
  moodFor,
  parseEquipped,
  petMessage,
  reactionFor,
  toggleCosmetic,
  unlockedCosmetics,
  type PetCounts,
  type PetMood,
  type PetReaction,
} from '@/adventure/pet';
import { useProfile } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import type { AdventureMap } from './useTodayAdventure';

/**
 * Last counts seen per profile, for this app session. Module-level so a screen that unmounts and
 * remounts does not forget what it already reacted to. The first look only records a baseline, so
 * opening the app never celebrates; a later increase is consumed ONCE and the baseline moves up.
 * Nothing here is saved and nothing here reads a clock.
 */
const lastSeen = new Map<number, PetCounts>();

/** How long a reaction stays up once the child is looking at the screen. */
const REACTION_MS = 6000;

export interface PetState {
  mood: PetMood;
  message: string;
  reaction: PetReaction;
  /** Bumps once per genuine reaction, so a visual burst can play exactly once for it. */
  burst: number;
}

/** The pet's current mood and message, from REAL practice counts (the Adventure Map hook's). */
export function usePetReaction(map: AdventureMap): PetState {
  const { profile } = useProfile();
  const focused = useIsFocused();
  const [reaction, setReaction] = useState<PetReaction>(null);
  const [burst, setBurst] = useState(0);
  const pick = useRef(0);

  useEffect(() => {
    if (!map.ready) return;
    const now: PetCounts = { sounds: map.sounds, exercises: map.exercises };
    const prev = lastSeen.get(profile.id) ?? null;
    lastSeen.set(profile.id, now);
    const r = reactionFor(prev, now);
    if (!r) return;
    pick.current += 1;
    setReaction(r);
    setBurst((n) => n + 1);
  }, [map.ready, map.sounds, map.exercises, profile.id]);

  // The reaction fades only while the child can see it (the Home screen stays mounted under others).
  useEffect(() => {
    if (!reaction || !focused) return;
    const timer = setTimeout(() => setReaction(null), REACTION_MS);
    return () => clearTimeout(timer);
  }, [reaction, focused]);

  return { mood: moodFor(reaction), message: petMessage(reaction, pick.current), reaction, burst };
}

/** What the pet is wearing, what is unlocked, and a way to wear or remove an unlocked item. */
export function usePetWardrobe(map: AdventureMap) {
  const { settings, updateSetting } = useSettings();
  const unlocked = useMemo(() => unlockedCosmetics(map.stages, map.sounds), [map.stages, map.sounds]);
  // Until the counts have loaded every item looks locked, so the saved outfit is shown as saved rather
  // than briefly stripped, and nothing is written (a tap then would drop worn items).
  const equipped = useMemo(
    () => parseEquipped(settings.petCosmetics, map.ready ? unlocked : new Set(COSMETICS.map((c) => c.id))),
    [settings.petCosmetics, unlocked, map.ready],
  );
  const toggle = useCallback(
    (id: string) => {
      if (!map.ready) return;
      void updateSetting('petCosmetics', toggleCosmetic(settings.petCosmetics, id, unlocked));
    },
    [settings.petCosmetics, unlocked, updateSetting, map.ready],
  );
  return { unlocked, equipped, toggle };
}
