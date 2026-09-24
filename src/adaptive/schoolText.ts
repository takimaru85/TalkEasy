import { SCHOOL_GLYPHS, SCHOOL_UPEM, SINGLE_STOREY_A } from './schoolGlyphs';
import type { LetterStyle } from '@/i18n/types';

export interface SchoolTextLayout {
  /** Font units -> pixels. */
  scale: number;
  /** Rendered width in pixels, for centring. */
  width: number;
  /** Glyph outlines with their pen position in font units. */
  glyphs: { d: string; x: number }[];
}

const SPACE_UNITS = SCHOOL_GLYPHS[' ']?.a ?? 250;

/**
 * Lays out tracing text from the bundled letter outlines.
 *
 * `letterStyle` comes from the active locale (see src/i18n). 'standard' draws the ordinary
 * double-storey "a" — the US English default, and what every locale gets unless it asks
 * otherwise. 'single-storey' swaps in the Filipino elementary-school "a"; no other character
 * changes in either style.
 *
 * Drawn as paths rather than SVG <Text> because react-native-svg resolves font families against
 * fonts linked into the native app, so a runtime-loaded font is silently ignored.
 *
 * The caller draws a <G> translated to the baseline and scaled by `scale`, with one <Path>
 * per glyph translated by its `x`.
 */
export function layoutSchoolText(
  text: string,
  maxWidth: number,
  maxFontSize: number,
  letterStyle: LetterStyle = 'standard',
): SchoolTextLayout {
  const items = [...text].map((ch) => {
    if (ch === 'a' && letterStyle === 'single-storey') return SINGLE_STOREY_A;
    return SCHOOL_GLYPHS[ch] ?? { d: '', a: SPACE_UNITS };
  });
  const totalUnits = items.reduce((n, g) => n + g.a, 0) || 1;
  const scale = Math.min(maxFontSize / SCHOOL_UPEM, maxWidth / totalUnits);

  const glyphs: { d: string; x: number }[] = [];
  let pen = 0;
  for (const g of items) {
    if (g.d) glyphs.push({ d: g.d, x: pen });
    pen += g.a;
  }
  return { scale, width: totalUnits * scale, glyphs };
}
