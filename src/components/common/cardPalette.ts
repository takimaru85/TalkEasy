import { Colors, tileInk } from '@/constants/colors';
import { shade, useTheme } from '@/theme';

export interface CardPalette {
  /** Draw on the night sky (the child zone). */
  night: boolean;
  /** Card surface: background, rim, and — at night — the darker 3D base of a game button. */
  cardStyle: {
    backgroundColor: string;
    borderColor?: string;
    borderBottomColor?: string;
    borderWidth?: number;
    borderBottomWidth?: number;
  };
  /** Text / icon colour on the card, and a quieter one for secondary lines. */
  ink: string;
  inkMuted: string;
}

/**
 * How a card with a soft tile colour should be drawn where it is used.
 *
 * Shared components (assignment and subject cards, calendar rows) appear both in the child zone and
 * in Parent Mode. In the child zone the pale tint becomes the SOLID colour it stands for, with white
 * text and a darker base underneath — the space-adventure card. In Parent Mode nothing changes: the
 * pale tint with dark text it always had.
 */
export function useCardPalette(soft: string): CardPalette {
  const theme = useTheme();
  if (theme.night) {
    const bg = tileInk(soft);
    return {
      night: true,
      cardStyle: { backgroundColor: bg, borderColor: shade(bg, 1.3), borderBottomColor: shade(bg, 0.68), borderWidth: 1.5, borderBottomWidth: 5 },
      ink: '#FFFFFF',
      inkMuted: 'rgba(255,255,255,0.86)',
    };
  }
  return { night: false, cardStyle: { backgroundColor: soft }, ink: Colors.text, inkMuted: Colors.textMuted };
}
