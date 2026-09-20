import { Platform } from 'react-native';
import type { ThemeColorKey } from '@/types/models';

/**
 * Design tokens for the child-facing UI.
 *
 * - `ACCENTS`: the child's favourite colour becomes the app accent (primary buttons, header
 *   tint, progress, selected states). Each accent has a strong, a dark and a soft tint.
 * - `Fonts`: Nunito (bundled, offline). Weight is chosen by family name because custom fonts on
 *   Android ignore `fontWeight`.
 * - `Radius`, `Shadow`, `Motion`: shared shape, depth and animation timings.
 */
export interface Accent {
  key: ThemeColorKey;
  name: string;
  emoji: string;
  strong: string;
  dark: string;
  soft: string;
  /** Very light page tint used behind cards. */
  page: string;
}

export const ACCENTS: Record<ThemeColorKey, Accent> = {
  blue: { key: 'blue', name: 'Blue', emoji: '💙', strong: '#3B7DED', dark: '#2559B8', soft: '#DCEBFF', page: '#F3F7FF' },
  green: { key: 'green', name: 'Green', emoji: '💚', strong: '#2E9E5B', dark: '#1F7A43', soft: '#DDF5E3', page: '#F2FBF5' },
  yellow: { key: 'yellow', name: 'Yellow', emoji: '💛', strong: '#E8A100', dark: '#B57D00', soft: '#FFF1C2', page: '#FFFBEE' },
  purple: { key: 'purple', name: 'Purple', emoji: '💜', strong: '#7C5CE6', dark: '#5B3FC0', soft: '#E8DFFF', page: '#F7F4FF' },
  coral: { key: 'coral', name: 'Coral', emoji: '🧡', strong: '#F06A5B', dark: '#C64A3D', soft: '#FFD9D3', page: '#FFF5F3' },
  teal: { key: 'teal', name: 'Teal', emoji: '🩵', strong: '#1FA39A', dark: '#147A73', soft: '#D3F3F0', page: '#F0FBFA' },
  orange: { key: 'orange', name: 'Orange', emoji: '🍊', strong: '#F0862B', dark: '#C1651A', soft: '#FFE3C7', page: '#FFF7F0' },
};

export const ACCENT_KEYS = Object.keys(ACCENTS) as ThemeColorKey[];

/** Nunito families (see src/theme/fonts.ts for loading). */
export const Fonts = {
  regular: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const Radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

/** Soft depth for cards; stronger for floating elements. */
export const Shadow = {
  card: Platform.select({
    ios: { shadowColor: '#16213A', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 3 },
    default: {},
  }),
  raised: Platform.select({
    ios: { shadowColor: '#16213A', shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
    android: { elevation: 6 },
    default: {},
  }),
} as const;

/** Animation timings (ms). All become 0 when reduced motion is on. */
export const Motion = {
  tap: 120,
  settle: 180,
  celebrate: 900,
} as const;
