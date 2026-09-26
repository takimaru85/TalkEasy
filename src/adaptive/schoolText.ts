import { SCHOOL_GLYPHS, SCHOOL_UPEM, SINGLE_STOREY_A, type SchoolGlyph } from './schoolGlyphs';
import type { LetterStyle } from '@/i18n/types';

export interface SchoolTextLayout {
  /** Font units -> pixels. */
  scale: number;
  /** Rendered width in pixels, for centring. */
  width: number;
  /** Glyph outlines with their pen position and advance in font units. */
  glyphs: { ch: string; d: string; x: number; adv: number }[];
}

const SPACE_UNITS = SCHOOL_GLYPHS[' ']?.a ?? 250;

/**
 * School-print substitutions used when `letterStyle` is 'single-storey' — the letters a child is
 * taught to WRITE differently from the way a typeface prints them.
 *
 * - "a": a circle and a stem, not Nunito's double-storey bowl.
 * - "l": a plain bar. Nunito's lowercase "l" finishes with a curved tail (its outline runs the
 *   full advance width and is all curves), which a child copying it would draw as a hook. The bar
 *   used instead is the font's OWN uppercase "I" — same stroke weight, same height, no tail — so
 *   nothing has to be drawn or bundled to get it.
 */
const SCHOOL_PRINT: Record<string, SchoolGlyph> = {
  a: SINGLE_STOREY_A,
  l: SCHOOL_GLYPHS['I'],
};

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
    const print = letterStyle === 'single-storey' ? SCHOOL_PRINT[ch] : undefined;
    const glyph = print ?? SCHOOL_GLYPHS[ch] ?? { d: '', a: SPACE_UNITS };
    return { ch, ...glyph };
  });
  const totalUnits = items.reduce((n, g) => n + g.a, 0) || 1;
  const scale = Math.min(maxFontSize / SCHOOL_UPEM, maxWidth / totalUnits);

  const glyphs: { ch: string; d: string; x: number; adv: number }[] = [];
  let pen = 0;
  for (const g of items) {
    if (g.d) glyphs.push({ ch: g.ch, d: g.d, x: pen, adv: g.a });
    pen += g.a;
  }
  return { scale, width: totalUnits * scale, glyphs };
}
