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

/** The deep "ink" that pairs with each soft tint: icons are drawn in it, on the tint. */
const TILE_INK: Record<string, string> = {
  '#DCEBFF': '#2A63C9',
  '#DDF5E3': '#23804A',
  '#FFF1C2': '#A87400',
  '#FFE3C7': '#C25E12',
  '#FFD9D3': '#C4443A',
  '#FFDBEA': '#B23C74',
  '#E8DFFF': '#6A4CC7',
  '#D3F3F0': '#16827A',
  '#ECEEF2': '#4E596E',
};

/**
 * Ink for a soft tile colour — the same hue, dark enough for icon contrast (>= 3.4:1 on its tint and >= 4:1 on white; WCAG asks 3:1 for graphics).
 * A colour outside the palette is darkened by keeping its hue and dropping the lightness.
 */
export function tileInk(soft: string): string {
  const known = TILE_INK[soft.toUpperCase()];
  if (known) return known;
  const m = /^#?([0-9a-f]{6})$/i.exec(soft.trim());
  if (!m) return Colors.text;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.02) return Colors.textMuted;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return `hsl(${Math.round(h * 60 + 360) % 360}, 60%, 36%)`;
}
