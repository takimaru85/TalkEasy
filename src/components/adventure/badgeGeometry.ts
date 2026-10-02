/**
 * Where the discovery badge sits on its card. Pure numbers, no react-native, so `check:layout` can
 * work out whether it clears the card's icon at the narrowest supported width.
 *
 * The badge is a small tilted sticker on the top-right corner of a card, overlapping the top edge.
 * It must never touch the icon or the label, because it is a decoration and a decoration that
 * covers the thing it decorates is worse than none.
 */
export const BADGE = {
  /** Pill height. */
  height: 20,
  /** Narrowest the pill gets (the label sets the rest). */
  minWidth: 50,
  /** How far the pill rises ABOVE the card's top edge. */
  rise: 14,
  /** Distance from the card's right edge. */
  inset: 2,
  /** Sticker tilt, degrees (counter-clockwise). */
  tilt: 8,
  /**
   * The furthest any ray or sparkle reaches past the card's RIGHT edge, in points — measured at the
   * peak of the float, with the stroke's rounded cap. Must stay under the gap to the next card.
   */
  reachRight: 6,
  /**
   * Android elevation of the badge's OUTER wrapper. It has to beat the card's own shell (the Home
   * screen gives it `elevation: 3`), because Android draws by elevation FIRST and tree order only
   * second: a wrapper with no elevation is drawn UNDER an elevated sibling however late it comes in
   * the tree, which cut the lower edge of the sticker off along the card's top border. Elevation on
   * the inner pill (for its glow) does not help — it only orders the pill inside its own parent.
   * No shadow is cast: the wrapper has no background of its own.
   */
  elevation: 8,
} as const;

/**
 * How far the lowest point of the tilted pill reaches INTO the card, measured from the card's top
 * edge. The low end of a tilted pill drops by half its width times sin(tilt).
 */
export function badgeDepth(): number {
  const drop = BADGE.height - BADGE.rise;
  const tilt = (BADGE.minWidth / 2) * Math.sin((BADGE.tilt * Math.PI) / 180);
  return drop + tilt;
}
