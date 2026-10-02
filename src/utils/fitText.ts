import { PixelRatio } from 'react-native';
import { MAX_FONT_SCALE } from '@/constants/sizes';

/**
 * Average glyph width of bold/black Nunito, as a fraction of the font size. Slightly generous so
 * the estimate errs on the side of fitting.
 */
const CHAR_EM = 0.64;

/**
 * Average glyph width for TEXT IN CAPITALS, which is materially wider than mixed case — there are
 * no narrow x-height letters and no descenders to pull the average down.
 *
 * Measured the hard way: "START ADVENTURE" was being fitted with the mixed-case average, came out
 * a third too big for its button, and shipped as "START ADVENTU…". Every all-caps label in the app
 * had the same latent bug; the short ones ("LET'S GO!") happened to fit anyway.
 */
const CAPS_EM = 0.74;

/** Capitals-only text, ignoring digits, spaces and punctuation. Two letters or more. */
function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^A-Za-z]/g, '');
  return letters.length >= 2 && letters === letters.toUpperCase();
}

/** The glyph-width fraction to use for this text. */
export function emFor(text: string): number {
  return isAllCaps(text) ? CAPS_EM : CHAR_EM;
}

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
  const fits = width / (Math.max(chars, 1) * emFor(text) * scale);
  return Math.max(min, Math.min(base, Math.floor(fits)));
}

/**
 * Estimated width of `text` at `fontSize`, using the same glyph model as `fitFontSize` and the
 * same capped OS font scale.
 *
 * For deciding LAYOUT, not for drawing: a row that has to choose between one line and two needs to
 * know what its fixed contents cost before Yoga measures them, and onLayout comes too late to
 * choose without a visible reflow. Slightly generous, so the decision errs towards more room.
 */
export function textWidth(text: string, fontSize: number): number {
  const scale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SCALE);
  return text.length * emFor(text) * fontSize * scale;
}
