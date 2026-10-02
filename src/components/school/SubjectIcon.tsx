import React from 'react';
import { ColorArt } from '@/components/adventure/ColorArt';
import { Icon } from '@/components/common/Icon';
import { subjectArtFor } from '@/school/subjectArt';

/**
 * A subject's icon: the colourful illustration for TalkEasy's own subjects, and the icon a grown-up
 * picked for any subject of their own, exactly as they chose it. Child screens only — Parent Mode
 * stays plain on purpose.
 */
export function SubjectIcon({ icon, size, color }: { icon: string; size: number; color: string }) {
  const art = subjectArtFor(icon);
  // Drawn a little larger than a line icon: an illustration has its own padding inside the 64 grid.
  return art ? <ColorArt name={art} size={Math.round(size * 1.15)} /> : <Icon name={icon} size={size} color={color} />;
}
