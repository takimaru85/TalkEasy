import React, { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { SVG_DECORATIVE } from '@/utils/svgA11y';
import { AdventureNight } from '@/theme/adventure';

/**
 * Fixed positions rather than Math.random(): the sky must be identical on every render, or the
 * stars would jump every time the screen re-renders (which it does on every star earned).
 * x, y are fractions of the surface; r is the radius in viewport units; o is the opacity.
 */
const STARS = [
  { x: 0.08, y: 0.06, r: 1.6, o: 0.9 }, { x: 0.22, y: 0.13, r: 1.0, o: 0.55 },
  { x: 0.37, y: 0.04, r: 1.3, o: 0.75 }, { x: 0.53, y: 0.11, r: 0.9, o: 0.5 },
  { x: 0.68, y: 0.05, r: 1.7, o: 0.95 }, { x: 0.83, y: 0.12, r: 1.1, o: 0.6 },
  { x: 0.94, y: 0.07, r: 1.4, o: 0.8 }, { x: 0.13, y: 0.24, r: 1.2, o: 0.65 },
  { x: 0.31, y: 0.29, r: 0.9, o: 0.45 }, { x: 0.46, y: 0.22, r: 1.5, o: 0.85 },
  { x: 0.62, y: 0.27, r: 1.0, o: 0.5 }, { x: 0.78, y: 0.21, r: 1.3, o: 0.7 },
  { x: 0.91, y: 0.28, r: 0.9, o: 0.45 }, { x: 0.05, y: 0.4, r: 1.4, o: 0.7 },
  { x: 0.26, y: 0.44, r: 1.0, o: 0.5 }, { x: 0.57, y: 0.41, r: 1.2, o: 0.6 },
  { x: 0.72, y: 0.46, r: 0.9, o: 0.4 }, { x: 0.88, y: 0.43, r: 1.5, o: 0.8 },
  { x: 0.17, y: 0.58, r: 1.1, o: 0.55 }, { x: 0.41, y: 0.62, r: 0.9, o: 0.4 },
  { x: 0.66, y: 0.57, r: 1.3, o: 0.65 }, { x: 0.95, y: 0.61, r: 1.0, o: 0.5 },
  { x: 0.09, y: 0.75, r: 1.2, o: 0.55 }, { x: 0.35, y: 0.79, r: 0.9, o: 0.4 },
  { x: 0.6, y: 0.74, r: 1.4, o: 0.7 }, { x: 0.84, y: 0.8, r: 1.0, o: 0.45 },
  { x: 0.2, y: 0.91, r: 1.1, o: 0.5 }, { x: 0.5, y: 0.94, r: 0.9, o: 0.35 },
  { x: 0.76, y: 0.9, r: 1.2, o: 0.55 },
];

interface Props {
  /** Surface height in px, so the stars spread over the whole page rather than a square. */
  height: number;
  width: number;
}

/**
 * The night sky behind the adventure screens: an indigo-to-violet wash, two soft colour blooms
 * and a scatter of stars.
 *
 * Deliberately static — no animation loop. A drifting starfield would run a timer for as long as
 * the screen is open, and this app has to stay smooth on cheap Android hardware while the child's
 * real work (speech, tracing) is going on. Depth comes from the blooms, not from motion.
 */
export function Starfield({ height, width }: Props) {
  const id = useId().replace(/:/g, '');

  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={height} {...SVG_DECORATIVE} pointerEvents="none">
      <Defs>
        <LinearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={AdventureNight.top} />
          <Stop offset="1" stopColor={AdventureNight.bottom} />
        </LinearGradient>
        <RadialGradient id={`a${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={AdventureNight.glowA} stopOpacity="0.55" />
          <Stop offset="1" stopColor={AdventureNight.glowA} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`b${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={AdventureNight.glowB} stopOpacity="0.45" />
          <Stop offset="1" stopColor={AdventureNight.glowB} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#sky${id})`} />
      <Circle cx={width * 0.18} cy={height * 0.12} r={width * 0.55} fill={`url(#a${id})`} />
      <Circle cx={width * 0.92} cy={height * 0.34} r={width * 0.5} fill={`url(#b${id})`} />

      {STARS.map((s, i) => (
        <Circle key={i} cx={s.x * width} cy={s.y * height} r={s.r} fill="#FFFFFF" opacity={s.o} />
      ))}
    </Svg>
  );
}
