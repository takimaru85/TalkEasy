import type { AdventureKey } from '@/theme/adventure';

/**
 * Choose Your Adventure — the child's interest world.
 *
 * A world changes the MOTIVATION layer only: the scenery behind the screens, the collectibles a
 * child earns and a little of the Home artwork. It never changes what is where — Speech Practice,
 * Learn & Trace, Talk, My Words, Lessons and Play & Learn keep the same place, colour and order in
 * every world, so the app stays predictable.
 *
 * The worlds are interests ANY child might pick. Nothing here assumes what a child likes: the
 * grown-up can pick for them or leave the choice to the child (Parent Mode → Settings).
 */
export type WorldId = 'space' | 'dinosaurs' | 'animals' | 'vehicles';

/** Parent setting: a fixed world, or 'child' to let the child choose. */
export type AdventureThemeSetting = WorldId | 'child';

export const WORLD_IDS: WorldId[] = ['space', 'dinosaurs', 'animals', 'vehicles'];

export function isWorldId(v: unknown): v is WorldId {
  return typeof v === 'string' && (WORLD_IDS as string[]).includes(v);
}

/** Illustration keys drawn by components/adventure/WorldArt. */
export type WorldArtName =
  // world emblems
  | 'world-space' | 'world-dinosaurs' | 'world-animals' | 'world-vehicles'
  // space
  | 'star' | 'earth' | 'moon' | 'saturn' | 'rocket'
  // dinosaurs
  | 'egg' | 'fossil' | 'brontosaurus' | 't-rex' | 'triceratops'
  // animals
  | 'dog' | 'cat' | 'monkey' | 'dolphin' | 'lion'
  // vehicles
  | 'car' | 'fire-truck' | 'tractor' | 'train';

export interface Collectible {
  id: string;
  name: string;
  art: WorldArtName;
}

export interface WorldDefinition {
  id: WorldId;
  name: string;
  tagline: string;
  emblem: WorldArtName;
  /** The world's card colour on the chooser and its accent elsewhere. */
  color: AdventureKey;
  /** What the collection is called ("My Space Collection"). */
  collectionName: string;
  /** Five collectibles, one per milestone, in the same order as MILESTONES. */
  collectibles: [Collectible, Collectible, Collectible, Collectible, Collectible];
  /** Artwork on the Daily Mission card. */
  missionArt: WorldArtName;
}

export const WORLDS: Record<WorldId, WorldDefinition> = {
  space: {
    id: 'space',
    name: 'Space',
    tagline: 'Explore planets and stars',
    emblem: 'world-space',
    color: 'grape',
    collectionName: 'Space collection',
    collectibles: [
      { id: 'space-star', name: 'Star', art: 'star' },
      { id: 'space-earth', name: 'Earth', art: 'earth' },
      { id: 'space-moon', name: 'Moon', art: 'moon' },
      { id: 'space-saturn', name: 'Saturn', art: 'saturn' },
      { id: 'space-rocket', name: 'Rocket', art: 'rocket' },
    ],
    missionArt: 'rocket',
  },
  dinosaurs: {
    id: 'dinosaurs',
    name: 'Dinosaurs',
    tagline: 'Discover prehistoric friends',
    emblem: 'world-dinosaurs',
    color: 'grass',
    collectionName: 'Dinosaur collection',
    collectibles: [
      { id: 'dino-egg', name: 'Egg', art: 'egg' },
      { id: 'dino-fossil', name: 'Fossil', art: 'fossil' },
      { id: 'dino-brontosaurus', name: 'Brontosaurus', art: 'brontosaurus' },
      { id: 'dino-t-rex', name: 'T-Rex', art: 't-rex' },
      { id: 'dino-triceratops', name: 'Triceratops', art: 'triceratops' },
    ],
    missionArt: 'egg',
  },
  animals: {
    id: 'animals',
    name: 'Animals',
    tagline: 'Meet animals and learn sounds',
    emblem: 'world-animals',
    color: 'coral',
    collectionName: 'Animal collection',
    collectibles: [
      { id: 'animal-dog', name: 'Dog', art: 'dog' },
      { id: 'animal-cat', name: 'Cat', art: 'cat' },
      { id: 'animal-monkey', name: 'Monkey', art: 'monkey' },
      { id: 'animal-dolphin', name: 'Dolphin', art: 'dolphin' },
      { id: 'animal-lion', name: 'Lion', art: 'lion' },
    ],
    missionArt: 'lion',
  },
  vehicles: {
    id: 'vehicles',
    name: 'Vehicles',
    tagline: 'Explore cars, trucks and trains',
    emblem: 'world-vehicles',
    color: 'sky',
    collectionName: 'Vehicle collection',
    collectibles: [
      { id: 'vehicle-car', name: 'Car', art: 'car' },
      { id: 'vehicle-fire-truck', name: 'Fire truck', art: 'fire-truck' },
      { id: 'vehicle-tractor', name: 'Tractor', art: 'tractor' },
      { id: 'vehicle-train', name: 'Train', art: 'train' },
      { id: 'vehicle-rocket', name: 'Rocket', art: 'rocket' },
    ],
    missionArt: 'train',
  },
};

/**
 * What a child does to find each collectible. Like the badges, every milestone is measured against
 * practice the app ALREADY records, and not one of them is about being right: saying a syllable,
 * finishing a tracing page, using Talk. The same five milestones apply in every world — only the
 * prize changes — so switching worlds never loses progress: the new world's collection is already
 * as full as the old one was.
 */
export interface CollectionMetrics {
  /** Sound Practice attempts + Speech Practice exercises, all time. */
  speechPractice: number;
  /** Which of BA BE BI BO BU the child has practised in the Syllables activity (0..5). */
  baRowSyllables: number;
  /** Tracing pages finished. */
  tracingSessions: number;
  /** Days on which the Daily Mission (5 different sounds) was completed. */
  missionDays: number;
  /** Talk cards spoken, all time. */
  talkTaps: number;
}

export interface Milestone {
  metric: keyof CollectionMetrics;
  target: number;
  /** Where it is earned — shown under a locked collectible so the child knows what to do. */
  activity: string;
  /** How, in words a grown-up can read aloud. */
  hint: string;
  icon: string;
}

export const MILESTONES: [Milestone, Milestone, Milestone, Milestone, Milestone] = [
  { metric: 'speechPractice', target: 1, activity: 'Speech Practice', hint: 'Practise your first sound.', icon: 'microphone-outline' },
  { metric: 'baRowSyllables', target: 5, activity: 'Speech Practice', hint: 'Say BA, BE, BI, BO and BU.', icon: 'format-letter-case' },
  { metric: 'tracingSessions', target: 1, activity: 'Learn & Trace', hint: 'Finish a tracing page.', icon: 'pencil-outline' },
  { metric: 'missionDays', target: 1, activity: 'Daily Mission', hint: "Complete a Daily Mission.", icon: 'rocket-launch-outline' },
  { metric: 'talkTaps', target: 10, activity: 'Talk', hint: 'Say 10 things with Talk.', icon: 'message-text-outline' },
];

export interface CollectedItem extends Collectible {
  milestone: Milestone;
  found: boolean;
  /** Where the child is, capped at the target. */
  current: number;
  progress: number;
}

/** The world's collection, measured against the metrics. Pure — cheap to re-run, easy to test. */
export function evaluateCollection(world: WorldId, metrics: CollectionMetrics): CollectedItem[] {
  return WORLDS[world].collectibles.map((c, i) => {
    const m = MILESTONES[i];
    const value = metrics[m.metric];
    const current = Math.min(value, m.target);
    return { ...c, milestone: m, found: value >= m.target, current, progress: m.target > 0 ? current / m.target : 0 };
  });
}

/**
 * The world in effect for a pair of settings: the grown-up's fixed choice, else the child's pick,
 * else Space — the world TalkEasy always had, so nothing changes until someone chooses.
 */
export function effectiveWorld(theme: AdventureThemeSetting, childPick: WorldId | ''): WorldId {
  return theme === 'child' ? childPick || 'space' : theme;
}

/** The syllables of the "BA row" milestone, exactly as the Syllables activity logs them. */
export const BA_ROW = ['BA', 'BE', 'BI', 'BO', 'BU'] as const;

/** Distinct sounds that complete the Daily Mission on one day (matches the Home card). */
export const DAILY_MISSION_TARGET = 5;
