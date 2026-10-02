/**
 * The TalkEasy icon system — shared rules, so every icon looks like one designer drew it.
 *
 * These are ICONS, not illustrations. They follow the same grid and lighting as the themed card art
 * in `components/adventure/art/kit.tsx`, but with far less detail: an icon has to survive being
 * 24–32pt on a phone, where a third tonal layer or a second object turns into mush. Where the card
 * art is a little scene, an icon is one object, read in a glance.
 *
 * THE RULES, which every drawing in this folder obeys:
 *
 *  1. A 64-unit grid, the object filling roughly 8..56 — the same grid as every other TalkEasy
 *     drawing, so an icon and a card illustration can sit on one screen without arguing.
 *  2. ONE colour in, tonal depth out. An icon is handed the ink colour its surface wants and builds
 *     every layer from it by opacity. That is what keeps the set cohesive on a blue card, a green
 *     card and a purple one, and it is why there is no palette here to drift out of sync with the
 *     app's. It also means an icon can never fail contrast against a card it was not designed for.
 *  3. Light from the top-left: the lit face is the lightest layer, the turned-away face the darkest.
 *     Consistent across the set, so the icons share a perspective rather than each inventing one.
 *  4. Rounded geometry, no strokes. Shapes are filled with generous corner radii; outlining each
 *     shape would double the visual weight at 24pt and make the set look like a line-icon library.
 *  5. One accent at most — a sparkle or a highlight. Two is noise.
 */

/**
 * The four tonal layers. Opacities of the SAME ink, never separate colours.
 *
 * THE RULE THAT IS EASY TO GET WRONG — and which these icons got wrong first time round. The ink is
 * usually WHITE on a saturated card, and opacity ADDS light: a low-opacity shape painted on top of
 * the body does not darken it, it makes it brighter still. So a "shadow" drawn over a shape is not
 * a shadow at all, and three icons came out as featureless white blobs because of it.
 *
 * Therefore:
 *  - A separation INSIDE a mass is a GAP. Leave the card showing through between the lid and the
 *    box, the back and the seat. That is the only subtraction available, and it is a crisp one.
 *  - Anything painted ON the body must be BRIGHTER than it — which is why `body` sits well below
 *    `lit`, leaving room above it for a sheen, a band or a highlight to register.
 *  - `detail` and `shade` are for pieces that sit on the CARD beside the body — cutlery, feet, a
 *    tassel, a cast shadow — where a lower opacity really does read as further away.
 */
export const Tone = {
  /** The face the light hits, and any mark drawn on top of the body. */
  lit: 1,
  /** The main mass of the object. Well below `lit`, so a highlight on it still registers. */
  body: 0.74,
  /** A separate piece sitting beside the body: cutlery, a handle, a tassel. */
  detail: 0.52,
  /** A piece that recedes: feet, a far edge, a cast shadow. Never painted over the body. */
  shade: 0.32,
} as const;

export interface TalkEasyIconProps {
  /** Drawn size in points. The system is designed to stay legible down to 24. */
  size?: number;
  /**
   * The ink. Every tonal layer is this colour at a different opacity, so one value is all an icon
   * needs and the result always sits correctly on whatever surface supplied it.
   */
  color?: string;
}

/** The size an icon is drawn at when a caller does not say. */
export const DEFAULT_ICON_SIZE = 28;
