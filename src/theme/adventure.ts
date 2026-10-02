/**
 * The TalkEasy adventure design system.
 *
 * A game-feeling layer that sits ON TOP of the existing theme rather than replacing it: the
 * child-facing screens use these bold gradient surfaces, while Parent Mode keeps the calm
 * original palette so a grown-up can tell at a glance which side of the app they are on.
 *
 * Gradients are drawn with react-native-svg (already a dependency) instead of adding a gradient
 * library — every colour here is a two-stop pair plus an "ink" tone dark enough to read on the
 * lighter stop.
 *
 * Colours are TalkEasy's own: a sky-and-sunshine set chosen so the six quests are told apart by
 * hue AND by icon, never by colour alone.
 */

export interface AdventureColor {
  /** Lighter stop (top-left). */
  from: string;
  /** Deeper stop (bottom-right). */
  to: string;
  /** Text/icon tone that reads on a pale tint of this colour. */
  ink: string;
  /** Very light wash for cards and discs. */
  tint: string;
}

export const Adventure = {
  sky: { from: '#5BAEFF', to: '#2A6FD6', ink: '#12447F', tint: '#DEEDFF' },
  grass: { from: '#5BD98A', to: '#1F9E55', ink: '#136237', tint: '#DCF6E5' },
  sun: { from: '#FFD166', to: '#F0930C', ink: '#8A5406', tint: '#FFF0CC' },
  coral: { from: '#FF8E7C', to: '#E9513C', ink: '#95291B', tint: '#FFE2DC' },
  grape: { from: '#B694FF', to: '#7343D8', ink: '#4A248F', tint: '#EBE2FF' },
  reef: { from: '#4FDCCE', to: '#0E9E93', ink: '#0A5F58', tint: '#D8F7F3' },
  // Added when the cards became solid: seven destinations need seven distinct hues, so no two
  // cards can be confused by colour at a glance.
  lagoon: { from: '#49E3FF', to: '#0B8FC4', ink: '#07566F', tint: '#D6F6FF' },
  tangerine: { from: '#FFB347', to: '#F26B0F', ink: '#7A3205', tint: '#FFE6CC' },
  magenta: { from: '#FF7BB8', to: '#D02E77', ink: '#8A1A4A', tint: '#FFDFEE' },
} as const;

export type AdventureKey = keyof typeof Adventure;

/** Page background behind the adventure screens — a soft daylight sky. */
export const AdventureBackdrop = { from: '#EAF4FF', to: '#F7FBFF' };

/** Ink used for headings on pale backgrounds. */
export const AdventureInk = '#13233F';
export const AdventureInkMuted = '#5A6C8C';

/**
 * Shape language: generously rounded, so nothing has a sharp corner a child could read as
 * "serious". Bigger than the base theme's radii on purpose.
 */
export const AdventureRadius = {
  card: 26,
  hero: 32,
  pill: 999,
  disc: 22,
} as const;

/**
 * A raised, slightly "pressable" depth. Kept modest: heavy shadows cost fill-rate on the cheap
 * Android devices this app has to stay smooth on.
 */
export const AdventureShadow = {
  shadowColor: '#0E2A55',
  shadowOpacity: 0.16,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 5,
} as const;

/**
 * The night sky the home screen sits on — a deep indigo-to-violet that makes the accent colours
 * glow instead of merely sitting there.
 *
 * Every child screen sits on it: AdventureZone applies NightTheme (ThemeContext), which swaps the
 * palette to white text on this sky and turns soft tints into their solid colours. Parent Mode is
 * outside the zone and keeps its light surface. High contrast opts out of the night palette.
 */
export const AdventureNight = {
  top: '#1D2554',
  bottom: '#0B1030',
  /** Soft glow blooms behind the content. */
  glowA: '#4B3A9E',
  glowB: '#1C6FA8',
  /** Glass card over the sky. */
  card: 'rgba(255,255,255,0.09)',
  cardStrong: 'rgba(255,255,255,0.14)',
  border: 'rgba(255,255,255,0.18)',
  ink: '#FFFFFF',
  inkMuted: '#A9B5DD',
} as const;

/**
 * A darker (factor < 1) or lighter (factor > 1) version of a hex colour — for the 3D "lip" under a
 * game button and for rims, so every card derives its depth from its own hue.
 */
export function shade(hex: string, factor: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex) ?? /^#?([0-9a-f]{6})$/i.exec(hslToHex(hex) ?? '');
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (v: number) =>
    Math.max(0, Math.min(255, Math.round(factor < 1 ? v * factor : v + (255 - v) * (factor - 1))))
      .toString(16)
      .padStart(2, '0');
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

/** "hsl(h, s%, l%)" as #rrggbb (tileInk returns hsl for a custom colour), or null. */
function hslToHex(color: string): string | null {
  const m = /^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i.exec(color.trim());
  if (!m) return null;
  const h = Number(m[1]) / 360;
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    const u = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    const v = u < 1 / 6 ? p + (q - p) * 6 * u : u < 1 / 2 ? q : u < 2 / 3 ? p + (q - p) * (2 / 3 - u) * 6 : p;
    return Math.round(v * 255).toString(16).padStart(2, '0');
  };
  return `#${f(h + 1 / 3)}${f(h)}${f(h - 1 / 3)}`;
}
