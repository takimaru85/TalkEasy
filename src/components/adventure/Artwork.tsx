import React from 'react';
import type { CardArt } from '@/adventure/themes';
import { GameIcon } from './GameIcon';
import { WorldArt } from './WorldArt';
import { ThemeArt } from './ThemeArt';

interface Props {
  art: CardArt;
  size: number;
}

/**
 * Draws a themed illustration whatever set it comes from.
 *
 * A theme names its art as `{ kind, name }` rather than as a bare string, so a card can be
 * illustrated by the shared GameIcon set (which Space keeps), by a themed drawing, or by a
 * collectible the world already owns — and the screen renders all three the same way. This is the
 * single place that knows there is more than one art set, which is why a screen never has to.
 */
export function Artwork({ art, size }: Props) {
  // A LAST LINE OF DEFENCE. An <svg> given a negative width is invalid and draws nothing at all,
  // silently — which is exactly how the three "More to explore" icons vanished while their labels
  // looked perfectly fine, and why it took so long to spot. Sizes here are derived from the window,
  // and the window is not always a real number on the first frame, so the one place every drawing
  // passes through refuses to hand an impossible size to an SVG.
  const safe = Number.isFinite(size) && size > 0 ? size : 1;
  switch (art.kind) {
    case 'game':
      return <GameIcon name={art.name} size={safe} />;
    case 'world':
      return <WorldArt name={art.name} size={safe} />;
    case 'theme':
      return <ThemeArt name={art.name} size={safe} />;
  }
}
