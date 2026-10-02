/**
 * Sizes on the My Progress screen that depend on the room available. Pure — no react-native — so
 * `check:layout` can run the same arithmetic the screen does, at every supported width.
 */

/** Inner padding of a statistic card, all four sides. */
export const STAT_PAD = 12;
/** Space between a statistic's picture and its words. */
export const STAT_GAP = 8;

/**
 * Below this card width the picture goes ABOVE the words instead of beside them. Beside a 52pt
 * picture a 138pt card (a 320pt phone) leaves 54pt, and a 165pt card (375pt) 70pt, for "activities", which does not fit at a size
 * a child can read — and shrinking the words until they do is the wrong answer.
 */
export const STAT_STACK_BELOW = 170;

export function statStacked(cardWidth: number): boolean {
  return cardWidth < STAT_STACK_BELOW;
}

/** The picture on a statistic: beside the words, about 38% of the card; above them, a third. */
export function statArtSize(cardWidth: number): number {
  return statStacked(cardWidth)
    ? Math.round(Math.min(52, Math.max(36, cardWidth * 0.34)))
    : Math.round(Math.min(64, Math.max(40, cardWidth * 0.38)));
}

/** The width the number and its label have to share. */
export function statTextWidth(cardWidth: number): number {
  return statStacked(cardWidth) ? cardWidth - STAT_PAD * 2 : cardWidth - STAT_PAD * 2 - statArtSize(cardWidth) - STAT_GAP;
}

// ---- the achievements row -----------------------------------------------------------------------
const MEDAL = 52;
const CHEVRON = 26;
/** Room the title and "4 of 8 badges" must keep, so they never get squeezed out by the previews. */
export const ACHIEVEMENT_TEXT_MIN = 112;
const ROW_GAP = 12;
const ROW_PAD = 24;
export const CHIP = 38;
const CHIP_GAP = 6;

/**
 * How many earned badges fit in the preview, beside the medal, the words and the chevron.
 *
 * The words come first: the previews take only what is left, so a narrow phone shows one or none
 * rather than a title cut down to "Achi…". Never more than four (the row is a preview, not the
 * collection) and never more than the child has actually earned.
 */
export function badgePreviewCount(rowWidth: number, earned: number): number {
  const room = rowWidth - ROW_PAD - MEDAL - CHEVRON - ACHIEVEMENT_TEXT_MIN - ROW_GAP * 3;
  const fit = Math.floor((room + CHIP_GAP) / (CHIP + CHIP_GAP));
  return Math.max(0, Math.min(4, earned, fit));
}

// ---- the badge grid (Achievements) --------------------------------------------------------------------
/** Inner padding of a badge card. */
export const BADGE_PAD = 12;
/** Space between a badge picture and its words. */
export const BADGE_GAP = 8;
/** Below this card width the picture goes above the words, as with the statistics. */
export const BADGE_STACK_BELOW = 170;

export function badgeStacked(cardWidth: number): boolean {
  return cardWidth < BADGE_STACK_BELOW;
}

export function badgeArtSize(cardWidth: number): number {
  return badgeStacked(cardWidth)
    ? Math.round(Math.min(52, Math.max(36, cardWidth * 0.32)))
    : Math.round(Math.min(72, Math.max(48, cardWidth * 0.36)));
}

/** The width a badge's name, label and progress share. */
export function badgeTextWidth(cardWidth: number): number {
  return badgeStacked(cardWidth) ? cardWidth - BADGE_PAD * 2 : cardWidth - BADGE_PAD * 2 - badgeArtSize(cardWidth) - BADGE_GAP;
}
