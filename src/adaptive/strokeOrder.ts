/**
 * Stroke order for the tracing guides — which stroke comes first, where it starts and which way
 * it goes, drawn as numbered arrows over the grey outline (see components/adaptive/StrokeArrows).
 *
 * Coordinates are NORMALISED so one table serves every size and both letter styles:
 *   x: 0 = the glyph's left edge, 1 = its advance width.
 *   y: 0 = cap/ascender top, 1 = the baseline. So the x-height top is ~0.30 and a descender
 *      reaches ~1.28. The renderer multiplies x by the glyph's own advance and maps y through
 *      CAP_HEIGHT, so an arrow lands on the letter whatever the text size.
 *
 * The polylines approximate each stroke rather than trace the outline exactly: what a child needs
 * is where to start, which way to move and what order to do it in. Order follows the sequence
 * taught in elementary handwriting — verticals top to bottom, circles anticlockwise from the top,
 * horizontals left to right.
 *
 * Only characters that actually appear in a tracing guide need an entry (`check:adaptive` fails
 * if a level uses a character that is missing from here).
 */

import type { LetterStyle } from '@/i18n/types';

export type StrokePoint = readonly [number, number];

export interface StrokeGuide {
  /** Polyline through the stroke, in normalised glyph space, in the order it is written. */
  points: readonly StrokePoint[];
}

/**
 * Cap height of the bundled outlines, in font units — measured from the "H" glyph, whose box
 * runs from y = -714 to the baseline. `check:adaptive` re-measures it so regenerating the font
 * cannot silently put every arrow in the wrong place.
 */
export const CAP_HEIGHT = 714;

/** Top of a lowercase x-height letter, as a fraction of cap height. */
const X = 0.3;

const UPPERCASE: Record<string, readonly StrokeGuide[]> = {
  A: [
    { points: [[0.5, 0.02], [0.14, 0.98]] },
    { points: [[0.5, 0.02], [0.86, 0.98]] },
    { points: [[0.27, 0.68], [0.73, 0.68]] },
  ],
  B: [
    { points: [[0.2, 0.02], [0.2, 0.98]] },
    { points: [[0.2, 0.02], [0.62, 0.05], [0.76, 0.24], [0.6, 0.46], [0.2, 0.5]] },
    { points: [[0.2, 0.5], [0.68, 0.54], [0.82, 0.74], [0.64, 0.95], [0.2, 0.98]] },
  ],
  C: [{ points: [[0.82, 0.2], [0.62, 0.03], [0.3, 0.09], [0.16, 0.5], [0.3, 0.91], [0.62, 0.97], [0.82, 0.8]] }],
  D: [
    { points: [[0.2, 0.02], [0.2, 0.98]] },
    { points: [[0.2, 0.02], [0.58, 0.06], [0.82, 0.3], [0.82, 0.7], [0.58, 0.94], [0.2, 0.98]] },
  ],
  E: [
    { points: [[0.2, 0.02], [0.2, 0.98]] },
    { points: [[0.2, 0.02], [0.8, 0.02]] },
    { points: [[0.2, 0.5], [0.7, 0.5]] },
    { points: [[0.2, 0.98], [0.8, 0.98]] },
  ],
  L: [
    { points: [[0.24, 0.02], [0.24, 0.98]] },
    { points: [[0.24, 0.98], [0.8, 0.98]] },
  ],
  M: [
    { points: [[0.14, 0.02], [0.14, 0.98]] },
    { points: [[0.14, 0.02], [0.5, 0.66]] },
    { points: [[0.5, 0.66], [0.86, 0.02]] },
    { points: [[0.86, 0.02], [0.86, 0.98]] },
  ],
  O: [{ points: [[0.5, 0.02], [0.2, 0.15], [0.1, 0.5], [0.2, 0.85], [0.5, 0.98], [0.8, 0.85], [0.9, 0.5], [0.8, 0.15], [0.5, 0.02]] }],
  S: [{ points: [[0.8, 0.18], [0.58, 0.03], [0.3, 0.08], [0.24, 0.28], [0.46, 0.45], [0.7, 0.57], [0.76, 0.77], [0.6, 0.95], [0.3, 0.96], [0.18, 0.82]] }],
  T: [
    { points: [[0.12, 0.04], [0.88, 0.04]] },
    { points: [[0.5, 0.04], [0.5, 0.98]] },
  ],
};

const LOWERCASE: Record<string, readonly StrokeGuide[]> = {
  // Double-storey "a": the bowl, then the stem. The single-storey form is a different shape
  // and has its own entry (SINGLE_STOREY_A_STROKES).
  a: [
    { points: [[0.78, 0.44], [0.6, X], [0.32, 0.34], [0.2, 0.56], [0.24, 0.82], [0.46, 0.95], [0.7, 0.89], [0.78, 0.78]] },
    { points: [[0.78, 0.32], [0.78, 0.98]] },
  ],
  c: [{ points: [[0.78, 0.45], [0.58, 0.31], [0.3, 0.37], [0.2, 0.62], [0.3, 0.9], [0.58, 0.97], [0.78, 0.86]] }],
  d: [
    { points: [[0.72, 0.45], [0.54, 0.31], [0.28, 0.37], [0.18, 0.62], [0.28, 0.9], [0.54, 0.97], [0.72, 0.85]] },
    { points: [[0.76, 0.02], [0.76, 0.98]] },
  ],
  e: [
    { points: [[0.2, 0.63], [0.78, 0.63]] },
    { points: [[0.78, 0.63], [0.74, 0.4], [0.5, 0.3], [0.26, 0.41], [0.18, 0.64], [0.28, 0.9], [0.56, 0.97], [0.76, 0.87]] },
  ],
  g: [
    { points: [[0.74, 0.45], [0.56, 0.31], [0.3, 0.37], [0.2, 0.6], [0.3, 0.86], [0.56, 0.93], [0.74, 0.82]] },
    { points: [[0.76, 0.32], [0.76, 1.12], [0.6, 1.27], [0.34, 1.23]] },
  ],
  l: [{ points: [[0.5, 0.02], [0.5, 0.98]] }],
  m: [
    { points: [[0.14, 0.32], [0.14, 0.98]] },
    { points: [[0.14, 0.44], [0.3, 0.31], [0.46, 0.44], [0.46, 0.98]] },
    { points: [[0.46, 0.44], [0.64, 0.31], [0.8, 0.44], [0.8, 0.98]] },
  ],
  n: [
    { points: [[0.22, 0.32], [0.22, 0.98]] },
    { points: [[0.22, 0.45], [0.42, 0.31], [0.66, 0.39], [0.74, 0.58], [0.74, 0.98]] },
  ],
  o: [{ points: [[0.5, 0.3], [0.26, 0.41], [0.16, 0.64], [0.26, 0.89], [0.5, 0.98], [0.74, 0.89], [0.84, 0.64], [0.74, 0.41], [0.5, 0.3]] }],
  s: [{ points: [[0.76, 0.42], [0.56, 0.3], [0.3, 0.35], [0.26, 0.51], [0.48, 0.61], [0.7, 0.71], [0.72, 0.86], [0.52, 0.97], [0.26, 0.92], [0.2, 0.82]] }],
  t: [
    { points: [[0.46, 0.08], [0.46, 0.86], [0.62, 0.98], [0.78, 0.93]] },
    { points: [[0.2, 0.36], [0.78, 0.36]] },
  ],
  u: [
    { points: [[0.2, 0.32], [0.2, 0.78], [0.33, 0.94], [0.57, 0.94], [0.72, 0.8]] },
    { points: [[0.74, 0.32], [0.74, 0.98]] },
  ],
};

const DIGITS: Record<string, readonly StrokeGuide[]> = {
  '0': [{ points: [[0.5, 0.03], [0.24, 0.16], [0.16, 0.5], [0.24, 0.85], [0.5, 0.97], [0.76, 0.85], [0.84, 0.5], [0.76, 0.16], [0.5, 0.03]] }],
  '1': [
    { points: [[0.26, 0.21], [0.52, 0.03]] },
    { points: [[0.52, 0.03], [0.52, 0.98]] },
  ],
  '2': [{ points: [[0.2, 0.24], [0.34, 0.06], [0.62, 0.05], [0.78, 0.23], [0.68, 0.47], [0.22, 0.95], [0.82, 0.95]] }],
  '3': [{ points: [[0.2, 0.2], [0.36, 0.05], [0.64, 0.07], [0.74, 0.26], [0.5, 0.46], [0.74, 0.62], [0.7, 0.86], [0.44, 0.97], [0.2, 0.88]] }],
  '4': [
    { points: [[0.64, 0.04], [0.16, 0.68], [0.86, 0.68]] },
    { points: [[0.64, 0.04], [0.64, 0.98]] },
  ],
  '5': [
    { points: [[0.3, 0.06], [0.3, 0.44], [0.56, 0.4], [0.76, 0.57], [0.72, 0.84], [0.46, 0.97], [0.22, 0.89]] },
    { points: [[0.3, 0.06], [0.78, 0.06]] },
  ],
  '6': [{ points: [[0.76, 0.1], [0.5, 0.04], [0.28, 0.25], [0.22, 0.6], [0.34, 0.9], [0.6, 0.96], [0.78, 0.77], [0.68, 0.56], [0.4, 0.52], [0.24, 0.65]] }],
  '7': [{ points: [[0.18, 0.06], [0.82, 0.06], [0.42, 0.98]] }],
  '8': [{ points: [[0.5, 0.04], [0.28, 0.15], [0.3, 0.38], [0.5, 0.5], [0.72, 0.62], [0.72, 0.87], [0.5, 0.97], [0.28, 0.87], [0.28, 0.62], [0.5, 0.5], [0.7, 0.38], [0.72, 0.15], [0.5, 0.04]] }],
  '9': [{ points: [[0.76, 0.4], [0.6, 0.51], [0.36, 0.45], [0.3, 0.23], [0.46, 0.05], [0.7, 0.11], [0.78, 0.31], [0.76, 0.7], [0.6, 0.94], [0.34, 0.96]] }],
};

export const LETTER_STROKES: Record<string, readonly StrokeGuide[]> = { ...UPPERCASE, ...LOWERCASE, ...DIGITS };

/**
 * The school-print "a" — a round bowl and a straight stem, which is how a child is taught to
 * WRITE the letter whatever the printed text uses. One closed circle anticlockwise from the top
 * right (where the stem will meet it), then the stem straight down.
 */
export const SINGLE_STOREY_A_STROKES: readonly StrokeGuide[] = [
  { points: [[0.7, 0.38], [0.5, 0.3], [0.26, 0.41], [0.17, 0.64], [0.27, 0.89], [0.5, 0.97], [0.71, 0.87], [0.78, 0.64], [0.72, 0.42]] },
  { points: [[0.78, 0.3], [0.78, 0.98]] },
];

/**
 * Stroke order for one character, or null when it has none (spaces, punctuation).
 *
 * `letterStyle` matters for exactly one character: a school-print "a" is a circle plus a stem,
 * which is not the order the double-storey "a" is written in.
 */
export function strokesFor(ch: string, letterStyle: LetterStyle = 'standard'): readonly StrokeGuide[] | null {
  if (ch === 'a' && letterStyle === 'single-storey') return SINGLE_STOREY_A_STROKES;
  return LETTER_STROKES[ch] ?? null;
}
