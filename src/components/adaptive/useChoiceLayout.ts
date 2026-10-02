import { useWindowDimensions } from 'react-native';
import { useSizes } from '@/hooks/useSizes';

/**
 * How answer cards are laid out: how many per row, and roughly how wide each one is.
 *
 * - Phone: 2 or 4 choices → two big picture cards per row; 3 choices → one full-width row each
 *   (three side by side would be too small to tap and read).
 * - Tablet / landscape: everything on one row when it fits (up to 4), picture cards.
 *
 * COLUMNS ARE THE ANSWER, NOT THE WIDTH. The width is derived from the window and is therefore a
 * good estimate rather than a fact — the row it lands in can be a different size (a screen rotates,
 * the app is put in split screen, a parent view adds padding), and when the two disagree a wrapping
 * row silently re-packs: three full-width cards become two on one line and an orphan on the next,
 * with the third card's picture hanging off the edge. That is why `ChoiceGrid` lays the cards out
 * in explicit rows of `columns` instead of letting them wrap, and why the width is passed on only
 * as the room a label has to fit into.
 */
export function useChoiceLayout(count: number): { width: number; pictureMode: boolean; columns: number } {
  const sizes = useSizes();
  const { width: windowWidth } = useWindowDimensions();
  const available = windowWidth - sizes.horizontalPadding * 2;
  const wide = sizes.gridColumns > 2;

  const columns = Math.max(1, wide ? Math.min(count, 4) : count === 3 ? 1 : 2);
  const width = Math.floor((available - sizes.gap * (columns - 1)) / columns) - 1;
  return { width, pictureMode: columns > 1, columns };
}
