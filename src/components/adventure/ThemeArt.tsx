import React, { useId } from 'react';
import Svg, { Defs, Ellipse, G, LinearGradient, Stop } from 'react-native-svg';
import type { CardSlot, ThemeArtName } from '@/adventure/themes';
import { drawDino, drawRexy } from './art/dinoArt';
import { drawAnimal, drawLeo } from './art/animalArt';
import { drawVehicle, drawBibi } from './art/vehicleArt';
import type { Drawn, Fill, Grad } from './art/kit';

interface Props {
  name: ThemeArtName;
  size: number;
}

/**
 * Themed card and hero artwork, drawn by the active adventure theme's art module.
 *
 * One component for every theme rather than one per theme: the name carries the theme, so the Home
 * screen renders `<ThemeArt name={card.art.name} />` and never learns which world it is in. Adding
 * a theme means adding an art module and a branch here — not touching a screen.
 *
 * Vector, not bitmaps, for the same reasons the rest of TalkEasy is: it stays crisp from a 320pt
 * phone to a tablet, costs no decode time or texture memory, adds about a kilobyte of path data
 * per drawing instead of a WebP per density bucket, and needs no lazy loading because only the
 * active theme's drawings are ever rendered.
 */
export function ThemeArt({ name, size }: Props) {
  // Gradient ids resolve document-wide in react-native-svg, so every instance needs its own.
  const base = `ta${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const grad: Grad = (id, top, bottom) => (
    <LinearGradient key={id} id={`${base}${id}`} x1="0" y1="0" x2="0.35" y2="1">
      <Stop offset="0" stopColor={top} />
      <Stop offset="1" stopColor={bottom} />
    </LinearGradient>
  );
  const g: Fill = (id) => `url(#${base}${id})`;

  const drawn = resolve(name, grad, g);
  // The mascots are drawn on a taller grid than the cards: a standing character needs the room.
  const box = name.endsWith('-hero') ? '0 0 64 100' : '0 0 64 64';
  const shadow = name.endsWith('-hero') ? { cy: 95, rx: 22 } : { cy: 59.5, rx: 18 };

  return (
    <Svg width={size} height={size} viewBox={box} accessible={false} pointerEvents="none">
      <Defs>{drawn.defs}</Defs>
      <Ellipse cx={32} cy={shadow.cy} rx={shadow.rx} ry={2.6} fill="#000000" opacity={0.2} />
      {drawn.art}
    </Svg>
  );
}

/**
 * Name to drawing. The name is `<theme>-<slot>`, so this splits once rather than listing every
 * combination — a new slot in `CardSlot` reaches all three themes without another branch here.
 */
function resolve(name: ThemeArtName, grad: Grad, g: Fill): Drawn {
  const dash = name.indexOf('-');
  const theme = name.slice(0, dash);
  const slot = name.slice(dash + 1);

  if (slot === 'hero') {
    return theme === 'dino' ? drawRexy(grad, g) : theme === 'animal' ? drawLeo(grad, g) : drawBibi(grad, g);
  }
  const card = slot as CardSlot;
  return theme === 'dino' ? drawDino(card, grad, g) : theme === 'animal' ? drawAnimal(card, grad, g) : drawVehicle(card, grad, g);
}
