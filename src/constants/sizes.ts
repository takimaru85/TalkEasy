import type { SizeOption } from '@/types/models';

/** Absolute minimums — nothing the child can tap is ever smaller than this. */
export const MIN_CHILD_TARGET = 64;
export const MIN_PARENT_TARGET = 56;

/** Ignore a second tap on the same tile within this window (tremor / double-tap guard). */
export const TAP_GUARD_MS = 500;

/** Cap OS font scaling so very large system fonts cannot break the tile layout. */
export const MAX_FONT_SCALE = 1.3;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const RADIUS = {
  tile: 20,
  button: 16,
  input: 12,
} as const;

interface ButtonSizePreset {
  tileHeight: number;
  iconSize: number;
  columns: number;
}

interface TextSizePreset {
  tileLabel: number;
  phrase: number;
  body: number;
  heading: number;
  buttonLabel: number;
}

export const BUTTON_SIZE_PRESETS: Record<SizeOption, ButtonSizePreset> = {
  medium: { tileHeight: 120, iconSize: 48, columns: 3 },
  large: { tileHeight: 150, iconSize: 60, columns: 2 },
  xlarge: { tileHeight: 190, iconSize: 76, columns: 2 },
};

export const TEXT_SIZE_PRESETS: Record<SizeOption, TextSizePreset> = {
  medium: { tileLabel: 20, phrase: 30, body: 18, heading: 26, buttonLabel: 20 },
  large: { tileLabel: 24, phrase: 36, body: 20, heading: 30, buttonLabel: 22 },
  xlarge: { tileLabel: 28, phrase: 42, body: 22, heading: 34, buttonLabel: 24 },
};

export const SIZE_OPTION_LABELS: Record<SizeOption, string> = {
  medium: 'Medium',
  large: 'Large',
  xlarge: 'Extra large',
};
