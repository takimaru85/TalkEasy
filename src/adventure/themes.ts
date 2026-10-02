import type { AdventureKey } from '@/theme/adventure';
import type { GameIconName } from '@/components/adventure/GameIcon';
import type { WorldArtName, WorldId } from './worlds';

/**
 * Adventure THEMES — the visual world each adventure puts the child in.
 *
 * `worlds.ts` owns what an adventure MEANS: its name, its five collectibles and the milestones
 * that unlock them. This file owns what it LOOKS like: the character in the hero, the illustration
 * on every destination card, that card's colour, and the small marks in its corner.
 *
 * Why the split matters: a world's collectibles are progress (switching worlds must never lose
 * any), while a theme is pure presentation (switching themes must never change what is where).
 * Keeping them in separate files keeps that line visible.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: the Home screen reads a theme, it never names one. There
 * is no `if (world === 'dinosaurs')` in a screen, and no DinosaurHomeScreen. Adding a theme is a
 * new entry in THEMES plus its art module — the screens do not change, and `check:themes` fails
 * if an entry is incomplete.
 *
 * What a theme may NOT change: where anything is. Speech Practice, Learn & Trace, Talk, My Words,
 * Play & Learn, Lessons and the Daily Mission keep the same position, order and labels in every
 * theme, because a child who has learned the layout must not have to learn it again. A theme
 * changes the drawing on a card, never the card's job.
 */

/** The seven destinations on the Home screen, in the order they appear. */
export type CardSlot = 'mission' | 'speech' | 'trace' | 'talk' | 'words' | 'play' | 'lessons' | 'voice';

export const CARD_SLOTS: CardSlot[] = ['mission', 'speech', 'trace', 'talk', 'words', 'play', 'lessons', 'voice'];

/** The four compact "More to Explore" tiles. */
export type ExploreSlot = 'myday' | 'school' | 'activities' | 'feelings';

export const EXPLORE_SLOTS: ExploreSlot[] = ['myday', 'school', 'activities', 'feelings'];

/** Illustrations drawn by components/adventure/ThemeArt, one set per themed world. */
export type ThemeArtName =
  | `dino-${CardSlot}`
  | `animal-${CardSlot}`
  | `vehicle-${CardSlot}`
  | 'dino-hero'
  | 'animal-hero'
  | 'vehicle-hero';

/**
 * Where a card's illustration comes from. Three sources on purpose:
 *  - `game` — the shared GameIcon set, which Space keeps exactly as it was (zero visual change for
 *    a child already using the app);
 *  - `theme` — a themed illustration from this file's art modules;
 *  - `world` — a collectible from WorldArt, so a theme can reuse a prize it already owns.
 */
export type CardArt =
  | { kind: 'game'; name: GameIconName }
  | { kind: 'theme'; name: ThemeArtName }
  | { kind: 'world'; name: WorldArtName };

export const game = (name: GameIconName): CardArt => ({ kind: 'game', name });
export const themed = (name: ThemeArtName): CardArt => ({ kind: 'theme', name });
export const worldly = (name: WorldArtName): CardArt => ({ kind: 'world', name });

export interface ThemedCard {
  art: CardArt;
  /** The card's hue. Seven distinct hues per theme, so no two cards are confused at a glance. */
  color: AdventureKey;
  /**
   * Two or three tiny marks for a free corner (Material Community icon names). The first is drawn
   * larger. Never behind text — the card places them.
   */
  decor: string[];
}

/** The character in the hero panel. Each is drawn by components/adventure/ThemeMascot. */
export type MascotName = 'pip' | 'rexy' | 'leo' | 'bibi';

export interface AdventureTheme {
  id: WorldId;
  /** For Parent Mode and the chooser. Not shown to a child as a label. */
  name: string;
  mascot: MascotName;
  /** The hero panel's accent: the mission meter fill and the hero's rim. */
  accent: AdventureKey;
  /** Illustration on the START ADVENTURE button. */
  startArt: CardArt;
  /** Every destination. A slot missing here is a build failure, not a fallback. */
  cards: Record<CardSlot, ThemedCard>;
  /**
   * Optional per-theme art for the four compact explore tiles. These are utility navigation rather
   * than destinations, so a theme that says nothing keeps the shared GameIcon set.
   */
  explore?: Partial<Record<ExploreSlot, CardArt>>;
  /**
   * What the child's companion is called in this world, for prompts that address it directly
   * ("Your dinosaur's turn!"). English content, like the practice sentences.
   */
  companion: string;
  /** Places in this world, for the hero's subtitle line. Presentation only — nothing navigates here. */
  locations: string[];
}

/**
 * SPACE — the original. Every value here is exactly what the Home screen hard-coded before themes
 * existed, so a child already in Space sees no change at all. It is also the reference entry: a
 * new theme is this shape with different art.
 */
const space: AdventureTheme = {
  id: 'space',
  name: 'Space Adventure',
  mascot: 'pip',
  accent: 'grape',
  startArt: game('mission'),
  cards: {
    mission: { art: game('mission'), color: 'lagoon', decor: ['orbit', 'star-four-points', 'star-four-points'] },
    speech: { art: game('speech'), color: 'sun', decor: ['waveform', 'star-four-points', 'message-outline'] },
    trace: { art: game('trace'), color: 'grape', decor: ['alpha-a', 'alpha-b', 'star-four-points'] },
    talk: { art: game('talk'), color: 'sky', decor: ['waveform', 'star-four-points'] },
    words: { art: game('words'), color: 'magenta', decor: ['star-four-points', 'cards-outline'] },
    play: { art: game('play'), color: 'coral', decor: ['star-four-points', 'gamepad-variant-outline'] },
    lessons: { art: game('lessons'), color: 'grass', decor: ['book-open-variant', 'star-four-points'] },
    voice: { art: game('practice'), color: 'reef', decor: ['music-note', 'star-four-points'] },
  },
  companion: 'rocket',
  locations: ['the Moon', 'Saturn', 'the star fields'],
};

/**
 * DINOSAURS — a prehistoric valley. Warm volcanic light, jungle green, fossil bone and egg shell.
 * The creatures are round and smiling by the same rule as WorldArt: friendly, never fierce.
 */
const dinosaurs: AdventureTheme = {
  id: 'dinosaurs',
  name: 'Dinosaur Adventure',
  mascot: 'rexy',
  accent: 'grass',
  startArt: themed('dino-mission'),
  cards: {
    mission: { art: themed('dino-mission'), color: 'sun', decor: ['egg-easter', 'star-four-points', 'star-four-points'] },
    speech: { art: themed('dino-speech'), color: 'coral', decor: ['waveform', 'star-four-points', 'message-outline'] },
    trace: { art: themed('dino-trace'), color: 'grape', decor: ['alpha-a', 'paw', 'star-four-points'] },
    talk: { art: themed('dino-talk'), color: 'grass', decor: ['waveform', 'star-four-points'] },
    words: { art: themed('dino-words'), color: 'magenta', decor: ['star-four-points', 'bone'] },
    play: { art: themed('dino-play'), color: 'lagoon', decor: ['star-four-points', 'gamepad-variant-outline'] },
    lessons: { art: themed('dino-lessons'), color: 'sky', decor: ['book-open-variant', 'leaf'] },
    voice: { art: themed('dino-voice'), color: 'reef', decor: ['music-note', 'star-four-points'] },
  },
  companion: 'dinosaur',
  locations: ['Volcano Ridge', 'the Fern Valley', 'the Fossil Caves'],
};

/** ANIMALS — a moonlit safari. Savanna gold, jungle green and warm animal fur. */
const animals: AdventureTheme = {
  id: 'animals',
  name: 'Animal Adventure',
  mascot: 'leo',
  accent: 'sun',
  startArt: themed('animal-mission'),
  cards: {
    mission: { art: themed('animal-mission'), color: 'grass', decor: ['paw', 'star-four-points', 'star-four-points'] },
    speech: { art: themed('animal-speech'), color: 'sun', decor: ['waveform', 'star-four-points', 'message-outline'] },
    trace: { art: themed('animal-trace'), color: 'grape', decor: ['alpha-a', 'butterfly', 'star-four-points'] },
    talk: { art: themed('animal-talk'), color: 'coral', decor: ['waveform', 'star-four-points'] },
    words: { art: themed('animal-words'), color: 'magenta', decor: ['star-four-points', 'cards-outline'] },
    play: { art: themed('animal-play'), color: 'lagoon', decor: ['star-four-points', 'gamepad-variant-outline'] },
    lessons: { art: themed('animal-lessons'), color: 'sky', decor: ['book-open-variant', 'tree'] },
    voice: { art: themed('animal-voice'), color: 'reef', decor: ['music-note', 'star-four-points'] },
  },
  companion: 'puppy',
  locations: ['the Watering Hole', 'Tall Grass Plain', 'the Jungle Canopy'],
};

/** VEHICLES — a city at night. Road yellow, signal red, headlight white and rail steel. */
const vehicles: AdventureTheme = {
  id: 'vehicles',
  name: 'Vehicle Adventure',
  mascot: 'bibi',
  accent: 'sky',
  startArt: themed('vehicle-mission'),
  cards: {
    mission: { art: themed('vehicle-mission'), color: 'coral', decor: ['road-variant', 'star-four-points', 'star-four-points'] },
    speech: { art: themed('vehicle-speech'), color: 'sun', decor: ['waveform', 'star-four-points', 'message-outline'] },
    trace: { art: themed('vehicle-trace'), color: 'grape', decor: ['alpha-a', 'road-variant', 'star-four-points'] },
    talk: { art: themed('vehicle-talk'), color: 'sky', decor: ['waveform', 'star-four-points'] },
    words: { art: themed('vehicle-words'), color: 'magenta', decor: ['star-four-points', 'cards-outline'] },
    play: { art: themed('vehicle-play'), color: 'lagoon', decor: ['star-four-points', 'gamepad-variant-outline'] },
    lessons: { art: themed('vehicle-lessons'), color: 'grass', decor: ['book-open-variant', 'traffic-light'] },
    voice: { art: themed('vehicle-voice'), color: 'reef', decor: ['music-note', 'star-four-points'] },
  },
  companion: 'car',
  locations: ['the Train Station', 'Harbour Road', 'the Airport'],
};

export const THEMES: Record<WorldId, AdventureTheme> = { space, dinosaurs, animals, vehicles };

/** The theme for a world. Total by construction — every world has one, checked by `check:themes`. */
export function themeFor(world: WorldId): AdventureTheme {
  return THEMES[world];
}
