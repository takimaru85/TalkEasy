import React from 'react';
import { G, Path, Rect } from 'react-native-svg';

/**
 * Small shared pieces for the colourful icon sets (categories, subjects, writing levels, therapy).
 * Same grid and rules as `kit.tsx`: 64 units, light from the top-left, outlines in a darker shade of
 * the object's own hue.
 */

/** A plump heart filling roughly 4..60 x 6..56. */
export const HEART_PATH =
  'M32 56 C10 40 4 28 4 20 C4 11 11 6 19 6 C25 6 29 9 32 14 C35 9 39 6 45 6 C53 6 60 11 60 20 C60 28 54 40 32 56 Z';

/**
 * A pencil lying along the local y axis, tip DOWN at (0, tip), so a group can rotate and move it.
 * Colours are fixed: a yellow body, a wooden point with a dark lead, a pink eraser.
 */
export function PencilArt({ transform, tip = 0, len = 24 }: { transform?: string; tip?: number; len?: number }) {
  const top = tip - len;
  return (
    <G transform={transform}>
      <Rect x={-3.2} y={top + 4} width={6.4} height={len - 7} rx={1.4} fill="#FFD84D" stroke="#B97809" strokeWidth={1.4} />
      <Path d={`M-3.2 ${tip - 3} L0 ${tip} L3.2 ${tip - 3} Z`} fill="#F2C48A" stroke="#B97809" strokeWidth={1.2} strokeLinejoin="round" />
      <Path d={`M-1.2 ${tip - 1.2} L0 ${tip} L1.2 ${tip - 1.2} Z`} fill="#3A3A55" />
      <Rect x={-3.2} y={top} width={6.4} height={5} rx={1.6} fill="#FF9CCB" stroke="#A82A5E" strokeWidth={1.2} />
      <Rect x={-3.2} y={top + 4} width={6.4} height={1.8} fill="#C9D4E8" />
      <Path d={`M-1.2 ${top + 8} V${tip - 5}`} stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
    </G>
  );
}

/** A glossy bead / ball: a gradient disc with an outline and a highlight. */
export function Bead({ cx, cy, r, fill, ink }: { cx: number; cy: number; r: number; fill: string; ink: string }) {
  return (
    <G>
      <Path
        d={`M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`}
        fill={fill}
        stroke={ink}
        strokeWidth={1.6}
      />
      <Path
        d={`M${cx - r * 0.55} ${cy - r * 0.35} Q${cx - r * 0.3} ${cy - r * 0.7} ${cx + r * 0.05} ${cy - r * 0.62}`}
        stroke="#FFFFFF"
        strokeWidth={Math.max(1, r * 0.22)}
        strokeLinecap="round"
        fill="none"
        opacity={0.8}
      />
    </G>
  );
}
