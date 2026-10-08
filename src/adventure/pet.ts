import type { MapStageState } from './adventureMap';

/**
 * The Space Pet Companion: pure rules, no react-native, so `check:pet` can run them.
 *
 * THE PET IS PRESSURE-FREE BY CONSTRUCTION. Nothing here takes a clock, a date or a "days since":
 * the pet cannot get sad, sick or lose anything because a child was away, and no rule counts a gap.
 * Messages are always warm, never about perfection or failure.
 *
 * Reactions come from REAL recorded practice only (counts the practice tables already hold). The
 * first look at a profile in a session is a silent baseline, so opening the app, a screen or a
 * refreshed query never celebrates; only a count that actually went up does, and each increase is
 * consumed once.
 */
export type PetMood = 'idle' | 'happy' | 'celebrate' | 'wave';

export interface PetCounts {
  /** Different sounds practised in the Sounds hub (the same number Sound Explorer counts). */
  sounds: number;
  /** Speech practice exercises recorded. */
  exercises: number;
}

export type PetReaction = 'newSound' | 'happy' | null;

/**
 * What changed since the last look. `prev === null` is the first look: nothing to celebrate yet.
 * A repeat of an activity changes `exercises` but not `sounds`, so it can never fire `newSound`.
 */
export function reactionFor(prev: PetCounts | null, now: PetCounts): PetReaction {
  if (!prev) return null;
  if (now.sounds > prev.sounds) return 'newSound';
  if (now.exercises > prev.exercises) return 'happy';
  return null;
}

export const PET_MESSAGES = {
  idle: ["Let's keep exploring!", 'Hello, Explorer!', 'Ready when you are!'],
  happy: ['You did it!', 'Great job, Explorer!'],
  newSound: ['You learned a new sound!'],
} as const;

/** The line for a mood. `pick` is any whole number (a counter), so the choice is plain and testable. */
export function petMessage(reaction: PetReaction, pick = 0): string {
  const list = reaction === 'newSound' ? PET_MESSAGES.newSound : reaction === 'happy' ? PET_MESSAGES.happy : PET_MESSAGES.idle;
  return list[Math.abs(pick) % list.length];
}

export function moodFor(reaction: PetReaction): PetMood {
  return reaction === 'newSound' ? 'celebrate' : reaction === 'happy' ? 'happy' : 'idle';
}

// ---- cosmetics ----------------------------------------------------------------------------------

export type CosmeticSlot = 'head' | 'antenna' | 'neck' | 'body' | 'face' | 'cheeks' | 'back';

export interface CosmeticDef {
  id: string;
  name: string;
  slot: CosmeticSlot;
  /** What earns it, in words a child can follow. Always a real milestone, never a purchase. */
  hint: string;
  unlock: { kind: 'sounds'; atLeast: number } | { kind: 'stage'; stage: MapStageState['def']['id'] } | { kind: 'allStages' };
}

export const COSMETICS: CosmeticDef[] = [
  { id: 'explorer-hat', name: 'Explorer hat', slot: 'head', hint: 'Practise your first sound.', unlock: { kind: 'sounds', atLeast: 1 } },
  { id: 'star-antenna', name: 'Star antenna', slot: 'antenna', hint: 'Finish the First Words planet.', unlock: { kind: 'stage', stage: 'firstWords' } },
  { id: 'scarf', name: 'Colorful scarf', slot: 'neck', hint: 'Finish the Sound Explorer planet.', unlock: { kind: 'stage', stage: 'soundExplorer' } },
  { id: 'helmet', name: 'Space helmet', slot: 'head', hint: 'Finish the Word Builder planet.', unlock: { kind: 'stage', stage: 'wordBuilder' } },
  { id: 'space-suit', name: 'Special space suit', slot: 'body', hint: 'Finish the Talking Champion planet.', unlock: { kind: 'stage', stage: 'talkingChampion' } },
  // Astronaut Suits & Hats: new, separate from the helmet and suit above. Earned, never bought.
  { id: 'gold-visor', name: 'Gold Visor Helmet', slot: 'head', hint: 'Finish the First Words planet.', unlock: { kind: 'stage', stage: 'firstWords' } },
  { id: 'galaxy-suit', name: 'Galaxy Space Suit', slot: 'body', hint: 'Finish all four planets on the Adventure Map.', unlock: { kind: 'allStages' } },
  // Cute extras: all earned by practising sounds, never bought.
  { id: 'rosy-cheeks', name: 'Rosy cheeks', slot: 'cheeks', hint: 'Practise 2 different sounds.', unlock: { kind: 'sounds', atLeast: 2 } },
  { id: 'bunny-ears', name: 'Bunny ears', slot: 'head', hint: 'Practise 3 different sounds.', unlock: { kind: 'sounds', atLeast: 3 } },
  { id: 'heart-glasses', name: 'Heart glasses', slot: 'face', hint: 'Practise 4 different sounds.', unlock: { kind: 'sounds', atLeast: 4 } },
  { id: 'bow-tie', name: 'Bow tie', slot: 'neck', hint: 'Practise 5 different sounds.', unlock: { kind: 'sounds', atLeast: 5 } },
  { id: 'cat-ears', name: 'Kitty ears', slot: 'head', hint: 'Practise 6 different sounds.', unlock: { kind: 'sounds', atLeast: 6 } },
  { id: 'angel-wings', name: 'Angel wings', slot: 'back', hint: 'Practise 7 different sounds.', unlock: { kind: 'sounds', atLeast: 7 } },
  { id: 'star-glasses', name: 'Star glasses', slot: 'face', hint: 'Practise 8 different sounds.', unlock: { kind: 'sounds', atLeast: 8 } },
  { id: 'pink-bow', name: 'Pink bow', slot: 'head', hint: 'Practise 9 different sounds.', unlock: { kind: 'sounds', atLeast: 9 } },
  { id: 'heart-antenna', name: 'Heart antenna', slot: 'antenna', hint: 'Practise 10 different sounds.', unlock: { kind: 'sounds', atLeast: 10 } },
  { id: 'party-hat', name: 'Party hat', slot: 'head', hint: 'Practise 12 different sounds.', unlock: { kind: 'sounds', atLeast: 12 } },
  { id: 'butterfly-wings', name: 'Butterfly wings', slot: 'back', hint: 'Practise 14 different sounds.', unlock: { kind: 'sounds', atLeast: 14 } },
  { id: 'rainbow-antenna', name: 'Rainbow antenna', slot: 'antenna', hint: 'Practise 16 different sounds.', unlock: { kind: 'sounds', atLeast: 16 } },
  { id: 'flower-crown', name: 'Flower crown', slot: 'head', hint: 'Practise 18 different sounds.', unlock: { kind: 'sounds', atLeast: 18 } },
  { id: 'bell-collar', name: 'Jingle bell collar', slot: 'neck', hint: 'Practise 20 different sounds.', unlock: { kind: 'sounds', atLeast: 20 } },
  { id: 'fairy-wings', name: 'Fairy wings', slot: 'back', hint: 'Practise 24 different sounds.', unlock: { kind: 'sounds', atLeast: 24 } },
  { id: 'royal-crown', name: 'Royal crown', slot: 'head', hint: 'Practise 30 different sounds.', unlock: { kind: 'sounds', atLeast: 30 } },
];

/** The cosmetics earned so far, from the same stage states the Adventure Map shows. Grants nothing and stores nothing. */
export function unlockedCosmetics(stages: MapStageState[], sounds: number): Set<string> {
  const out = new Set<string>();
  for (const c of COSMETICS) {
    const u = c.unlock;
    const earned = u.kind === 'sounds' ? sounds >= u.atLeast : u.kind === 'allStages' ? stages.length > 0 && stages.every((s) => s.done) : stages.some((s) => s.def.id === u.stage && s.done);
    if (earned) out.add(c.id);
  }
  return out;
}

const KNOWN = new Set<string>(COSMETICS.map((c) => c.id));
const slotOf = (id: string): CosmeticSlot | undefined => COSMETICS.find((c) => c.id === id)?.slot;

/** The saved list ("a,b"), kept to known, unlocked items and at most one per slot. Unknown or locked ids are dropped, never an error. */
export function parseEquipped(saved: string, unlocked: ReadonlySet<string>): string[] {
  const seenSlots = new Set<CosmeticSlot>();
  const out: string[] = [];
  for (const id of saved.split(',').map((s) => s.trim()).filter(Boolean)) {
    const slot = slotOf(id);
    if (!KNOWN.has(id) || !unlocked.has(id) || !slot || seenSlots.has(slot)) continue;
    seenSlots.add(slot);
    out.push(id);
  }
  return out;
}

/** Wear an unlocked item (replacing what is in its slot) or take it off. A locked or unknown id changes nothing. */
export function toggleCosmetic(saved: string, id: string, unlocked: ReadonlySet<string>): string {
  const current = parseEquipped(saved, unlocked);
  if (!KNOWN.has(id) || !unlocked.has(id)) return current.join(',');
  if (current.includes(id)) return current.filter((x) => x !== id).join(',');
  const slot = slotOf(id);
  return [...current.filter((x) => slotOf(x) !== slot), id].join(',');
}

/** One pet accessory as the Rewards Shop lists it. Earned by practice, never bought, so there is no price. */
export interface PetShopEntry {
  id: CosmeticDef['id'];
  name: string;
  hint: string;
  status: 'equipped' | 'unlocked' | 'locked';
}

/** The Shop's Pet Accessories list, from the same unlocked and worn sets the dress-up screen uses. */
export function petShopEntries(unlocked: ReadonlySet<string>, equipped: readonly string[]): PetShopEntry[] {
  return COSMETICS.map((c) => ({
    id: c.id,
    name: c.name,
    hint: c.hint,
    status: equipped.includes(c.id) ? 'equipped' : unlocked.has(c.id) ? 'unlocked' : 'locked',
  }));
}
