import type { CashOffer } from './catalog';

/**
 * PREMIUM THEMES for the Rewards Shop: a scene (the sky and landscape behind every child screen) plus the
 * glow colours the glass cards sit on. Pure data, so prices and offers are CONFIGURATION, not code: change a
 * number here and the shop, the confirmation and `check:themes` all follow.
 *
 * HOW THIS RELATES TO THE ADVENTURE WORLDS. The four adventure worlds (Space, Dinosaurs, Animals,
 * Vehicles; `adventure/worlds.ts`) are the child's free interest worlds and are NEVER gated — that is a
 * product rule. Space Explorer IS the default world, free for everyone. A premium theme is an extra scene
 * layered over whichever world the child chose: it replaces the BACKDROP only; where things are, what they
 * are called and what they do never change. Equip nothing and the child sees their world exactly as before.
 *
 * Every scene stays DARK and calm, like the free worlds, so the white text and glass cards read the same
 * everywhere; only the scenery and its colour cast change.
 */
export type ThemeId = 'moon' | 'nebula' | 'planet' | 'cosmic' | 'ocean' | 'forest' | 'dino' | 'dream';

/** 'space' themes belong to the Space Explorer universe and keep the space icons and mascot style; 'other' do not. */
export type ThemeFamily = 'space' | 'other';

export interface ThemeBackground {
  /** File name inside `assets/backgrounds/`. */
  file: string;
  scrim: number;
}

export interface PremiumTheme {
  id: ThemeId;
  family: ThemeFamily;
  /** The shop item id (`theme-<id>`). */
  itemId: string;
  name: string;
  description: string;
  /** Star price. Absent = cannot be redeemed with stars. */
  stars?: number;
  /** Cash offer. Absent = cannot be bought with money. */
  cash?: CashOffer;
  /**
   * The supplied background ARTWORK (a file in `assets/backgrounds/`). When present it IS the theme's
   * background everywhere; `scrim` is how much of a dark veil (0..1) goes over it so white text and the glass
   * cards stay readable on the brighter pictures. Themes without one (the older vector scenes) draw `ThemeScene`.
   * The `require()` for each file lives in `components/adventure/themeBackgrounds.ts`, because `check:themes`
   * runs in Node where an asset import does not resolve; the check asserts the file is on disk.
   */
  background?: ThemeBackground;
  /** The sky colour under the picture (shown until it loads, and if it ever fails) and the two glows. */
  palette: { top: string; bottom: string; glowA: string; glowB: string };
}

/** The free default. Not sold, always owned, and what a child sees when no premium theme is on. */
export const DEFAULT_THEME = {
  name: 'Space Explorer',
  description: 'Galaxies, planets and rockets. Free for everyone.',
  /** Shown when the child is in the Space world with no premium theme on. */
  background: { file: 'space-explorer.webp', scrim: 0.2 } as ThemeBackground,
} as const;

export const PREMIUM_THEMES: PremiumTheme[] = [
  // ---- the Space Explorer universe ----
  {
    id: 'moon',
    family: 'space',
    itemId: 'theme-moon',
    name: 'Moon Base',
    description: 'A lunar surface, distant craters, a little space station and cool silver-blue light.',
    stars: 1000,
    background: { file: 'moon-base.webp', scrim: 0.3 },
    palette: { top: '#1B2A4A', bottom: '#080E20', glowA: '#5A7FB8', glowB: '#8A9BBE' },
  },
  {
    id: 'nebula',
    family: 'space',
    itemId: 'theme-nebula',
    name: 'Nebula Dreams',
    description: 'Soft purple, blue and pink nebula clouds with glowing stars and far-away galaxies.',
    stars: 1500,
    background: { file: 'nebula-dreams.webp', scrim: 0.45 },
    palette: { top: '#34205E', bottom: '#120A30', glowA: '#C04FA8', glowB: '#4F6FE0' },
  },
  {
    id: 'planet',
    family: 'space',
    itemId: 'theme-planet',
    name: 'Planet Explorer',
    description: 'Colourful planets, rings, moons and orbital paths in deep space.',
    stars: 2000,
    background: { file: 'planet-explorer.webp', scrim: 0.4 },
    palette: { top: '#16285A', bottom: '#080E2A', glowA: '#E08A3A', glowB: '#2FA8A0' },
  },
  {
    id: 'cosmic',
    family: 'space',
    itemId: 'theme-cosmic',
    name: 'Cosmic Adventure',
    description: 'Rich galaxy scenery with comets, colourful cosmic ribbons and a special-edition sparkle.',
    stars: 3000,
    background: { file: 'cosmic-adventure.webp', scrim: 0.45 },
    palette: { top: '#2A1A5E', bottom: '#0A0E2E', glowA: '#2FC8D8', glowB: '#D05AB8' },
  },
  // ---- other worlds ----
  {
    id: 'ocean',
    family: 'other',
    itemId: 'theme-ocean',
    name: 'Ocean Explorer',
    description: 'Ocean backgrounds, fish, bubbles and sea creatures.',
    stars: 1500,
    cash: { productId: 'talkeasy.theme.ocean', fallbackPrice: '₱99' },
    background: { file: 'ocean-explorer.webp', scrim: 0.3 },
    palette: { top: '#0E3B5C', bottom: '#041A2E', glowA: '#12889A', glowB: '#1B5FB0' },
  },
  {
    id: 'forest',
    family: 'other',
    itemId: 'theme-forest',
    name: 'Magic Forest',
    description: 'Magical forests, friendly animals and enchanted mushrooms.',
    stars: 2000,
    background: { file: 'magic-forest.webp', scrim: 0.3 },
    palette: { top: '#183B2E', bottom: '#07180F', glowA: '#2E8B57', glowB: '#6A3FA8' },
  },
  {
    id: 'dino',
    family: 'other',
    itemId: 'theme-dino',
    name: 'Dino World',
    description: 'Dinosaur friends, jungle backgrounds and fossil icons.',
    stars: 2500,
    cash: { productId: 'talkeasy.theme.dino', fallbackPrice: '₱149' },
    background: { file: 'dino-world.webp', scrim: 0.45 },
    palette: { top: '#24402A', bottom: '#0D1A10', glowA: '#C8651E', glowB: '#2F8F4E' },
  },
  {
    id: 'dream',
    family: 'other',
    itemId: 'theme-dream',
    name: 'Dreamland',
    description: 'Rainbow colours, clouds, magical characters and sweet hills.',
    stars: 3000,
    cash: { productId: 'talkeasy.theme.dream', fallbackPrice: '₱199' },
    background: { file: 'dreamland.webp', scrim: 0.45 },
    palette: { top: '#3A2A6E', bottom: '#150F33', glowA: '#C45AA8', glowB: '#4A8FD8' },
  },
];

export function getPremiumTheme(id: string | null | undefined): PremiumTheme | undefined {
  return PREMIUM_THEMES.find((t) => t.id === id);
}

export function themeForItem(itemId: string): PremiumTheme | undefined {
  return PREMIUM_THEMES.find((t) => t.itemId === itemId);
}

/** The slot in `shop_equipped` that holds the active premium theme. */
export const THEME_SLOT = 'theme';

/**
 * Which premium theme is ACTIVE, given what is equipped and what is owned. A theme counts only if it is
 * still owned and this build knows it; anything else is null — the child's own free world — so a theme
 * can never be on without having been paid for, and an unknown id can never blank a screen.
 */
export function activeThemeFrom(equipped: Record<string, string>, owned: readonly string[]): ThemeId | null {
  const itemId = equipped[THEME_SLOT];
  if (!itemId || !owned.includes(itemId)) return null;
  return themeForItem(itemId)?.id ?? null;
}
