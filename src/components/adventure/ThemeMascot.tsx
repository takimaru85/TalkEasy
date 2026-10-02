import React from 'react';
import type { MascotName } from '@/adventure/themes';
import { Mascot } from './Mascot';
import { ThemeArt } from './ThemeArt';

interface Props {
  mascot: MascotName;
  size: number;
  /** Space only: Pip wears the helmet. Ignored by the other companions, who need no suit. */
  space?: boolean;
}

/**
 * The companion in the hero panel, by theme.
 *
 * Pip is the Space companion and stays exactly as they were, helmet and all — a child already
 * using TalkEasy sees no change. The other worlds have their own character, because a mascot in a
 * hat is a costume, and this brief asked for a different world rather than a different hat:
 *
 *   dinosaurs -> Rexy, a round T-Rex hatchling
 *   animals   -> Leo, a lion cub
 *   vehicles  -> Bibi, a little bus
 *
 * Mascot is imported from its FILE, never the adventure barrel, which imports back into common.
 */
export function ThemeMascot({ mascot, size, space }: Props) {
  if (mascot === 'pip') return <Mascot size={size} mood="cheer" space={space} />;
  const name = mascot === 'rexy' ? 'dino-hero' : mascot === 'leo' ? 'animal-hero' : 'vehicle-hero';
  return <ThemeArt name={name} size={size} />;
}
