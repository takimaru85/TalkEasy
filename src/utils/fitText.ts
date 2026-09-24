import { PixelRatio } from 'react-native';
import { MAX_FONT_SCALE } from '@/constants/sizes';

/**
 * Average glyph width of bold/black Nunito, as a fraction of the font size. Slightly generous so
 * the estimate errs on the side of fitting.
 */
const CHAR_EM = 0.64;

/**
 * The largest font size (≤ `base`) at which `text` fits in `width` pixels.
 *
 * Android ignores `adjustsFontSizeToFit` in many layouts and breaks a too-wide word mid-word
 * ("Complete / d"), so sizes are computed instead. `mode: 'line'` fits the whole text on one
 * line (headers); `mode: 'word'` only guarantees the longest word never has to break (labels
 * that may wrap between words). The OS font scale is included, capped like every Text in the app.
 */
export function fitFontSize(text: string, width: number, base: number, mode: 'line' | 'word' = 'line', min = 12): number {
  if (width <= 0 || !text) return base;
  const scale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SCALE);
  const chars = mode === 'line' ? text.length : Math.max(...text.split(/\s+/).map((w) => w.length));
  const fits = width / (Math.max(chars, 1) * CHAR_EM * scale);
  return Math.max(min, Math.min(base, Math.floor(fits)));
}
