/**
 * Base palette (light theme). Soft pastel surfaces, near-black text, one friendly primary.
 * Runtime theming (favourite colour, high contrast) lives in src/theme — components should
 * prefer `useTheme()` for anything the child sees; these constants are the neutral defaults.
 */
export const Colors = {
  background: '#F7F8FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F6',
  text: '#16213A',
  textMuted: '#5B6478',
  textOnDark: '#FFFFFF',
  border: '#16213A',
  borderSoft: '#D9DEE8',
  primary: '#3B7DED',
  primaryDark: '#2559B8',
  primarySoft: '#DCEBFF',
  success: '#2E9E5B',
  successSoft: '#DDF5E3',
  danger: '#D64545',
  dangerSoft: '#FFE0E0',
  warning: '#E8A100',
  selected: '#FFD84D',
  disabled: '#C9CED9',
} as const;

/** Soft tile tints offered in the parent colour picker, consistent per category. */
export const TileColors: { key: string; value: string; name: string }[] = [
  { key: 'blue', value: '#DCEBFF', name: 'Blue' },
  { key: 'green', value: '#DDF5E3', name: 'Green' },
  { key: 'yellow', value: '#FFF1C2', name: 'Yellow' },
  { key: 'orange', value: '#FFE3C7', name: 'Orange' },
  { key: 'coral', value: '#FFD9D3', name: 'Coral' },
  { key: 'pink', value: '#FFDBEA', name: 'Pink' },
  { key: 'purple', value: '#E8DFFF', name: 'Purple' },
  { key: 'teal', value: '#D3F3F0', name: 'Teal' },
  { key: 'grey', value: '#ECEEF2', name: 'Grey' },
];

export const DEFAULT_TILE_COLOR = TileColors[0].value;

export function tileColor(key: string): string {
  return TileColors.find((t) => t.key === key)?.value ?? DEFAULT_TILE_COLOR;
}
