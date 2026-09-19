/**
 * High-contrast palette. Tile colors are light so near-black text stays readable;
 * every tile also gets a dark border so edges are obvious.
 */
export const Colors = {
  background: '#FFFFFF',
  surface: '#F4F4F6',
  text: '#111111',
  textMuted: '#4A4A4A',
  textOnDark: '#FFFFFF',
  border: '#111111',
  primary: '#1F4FD8',
  primaryDark: '#163AA0',
  success: '#1B8A3D',
  danger: '#C62828',
  warning: '#E08A00',
  selected: '#FFD200',
  disabled: '#BDBDBD',
} as const;

/** Tile background colors offered in the parent color picker. */
export const TileColors: { key: string; value: string; name: string }[] = [
  { key: 'blue', value: '#BFE0FF', name: 'Blue' },
  { key: 'green', value: '#C4F2C8', name: 'Green' },
  { key: 'yellow', value: '#FFF3A8', name: 'Yellow' },
  { key: 'orange', value: '#FFD9B0', name: 'Orange' },
  { key: 'pink', value: '#FFC9DC', name: 'Pink' },
  { key: 'purple', value: '#DED0FF', name: 'Purple' },
  { key: 'teal', value: '#BDF0EA', name: 'Teal' },
  { key: 'grey', value: '#E4E4E4', name: 'Grey' },
];

export const DEFAULT_TILE_COLOR = TileColors[0].value;
