import { DEFAULT_THERAPY } from '@/constants/defaults';

/**
 * Which activity icons get the new colourful category illustration, and which keep what a grown-up
 * chose.
 *
 * Every activity stores a Material icon NAME, and Parent Mode lets a grown-up pick any of them. The
 * list's disc now draws an illustration for the activity's CATEGORY (a palette for Art, a book for
 * Reading...) instead of that stock glyph — but only when the icon is one of TalkEasy's own
 * (the ones the seeded activities use, plus the default a new activity starts with). An icon a
 * grown-up deliberately picked from outside that set is their choice and is left exactly as they
 * made it. Nothing is rewritten in the database either way.
 *
 * Pure (no react-native) so `check:db` can compare it with the seeded activities.
 */
export const NEW_ACTIVITY_DEFAULT_ICON = 'arm-flex';

export const STOCK_ACTIVITY_ICONS: ReadonlySet<string> = new Set([
  ...DEFAULT_THERAPY.map((a) => a.icon),
  NEW_ACTIVITY_DEFAULT_ICON,
]);

/** True when this activity should show its category illustration rather than its stored glyph. */
export function usesCategoryArt(icon: string): boolean {
  return STOCK_ACTIVITY_ICONS.has(icon);
}
