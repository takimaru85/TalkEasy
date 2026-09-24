import { useWindowDimensions } from 'react-native';
import { useSizes } from '@/hooks/useSizes';

/**
 * How answer cards are laid out, in real pixels (percent widths plus the grid gap overflowed on
 * phones and pushed the last card onto its own row).
 *
 * - Phone: 2 or 4 choices → two big picture cards per row; 3 choices → one full-width row each
 *   (three side by side would be too small to tap and read).
 * - Tablet / landscape: everything on one row when it fits (up to 4), picture cards.
 */
export function useChoiceLayout(count: number): { width: number; pictureMode: boolean } {
  const sizes = useSizes();
  const { width: windowWidth } = useWindowDimensions();
  const available = windowWidth - sizes.horizontalPadding * 2;
  const wide = sizes.gridColumns > 2;

  const columns = wide ? Math.min(count, 4) : count === 3 ? 1 : 2;
  const width = Math.floor((available - sizes.gap * (columns - 1)) / columns) - 1;
  return { width, pictureMode: columns > 1 };
}
