import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import { SVG_DECORATIVE } from '@/utils/svgA11y';
import type { VoiceShape } from '@/practice/types';

interface Props {
  shape: VoiceShape;
  width: number;
  height?: number;
  color?: string;
  /** Drawn faded, for the shape a child has not heard yet. */
  dim?: boolean;
}

/**
 * A picture of what a voice does.
 *
 * This is a DIAGRAM OF THE MODEL, never a measurement of the child. The app does not analyse
 * anyone's voice (see src/voicecomm/types.ts), so there is no such thing here as "your line"
 * versus "the right line" — the trace shows the pattern the child is being invited to try, and
 * that is all it can ever show. Anything that drew a child's own contour next to this would be
 * scoring them.
 *
 * Eleven shapes, each drawn so it reads at a glance without reading any words: pitch as a line
 * that climbs or falls, loudness as size, speed as how spread out the marks are, height as where
 * the line sits. Pure vector, fixed geometry, no animation — the same rules as the rest of the
 * app's art.
 */
export function VoiceShapeTrace({ shape, width, height, color = '#7343D8', dim }: Props) {
  const h = height ?? Math.round(width * 0.46);
  const o = dim ? 0.3 : 1;

  return (
    <Svg width={width} height={h} viewBox="0 0 100 46" {...SVG_DECORATIVE} pointerEvents="none">
      {/* The line brightens left to right, so the eye reads it in the direction the voice moves.
          It starts at 0.78, not lower: the beginning of the shape has to be plainly visible. */}
      <Defs>
        <LinearGradient id="vst" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity="0.78" />
          <Stop offset="1" stopColor={color} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      {/* A baseline, so a line that sits high or low has something to sit against. */}
      <Rect x={4} y={22.4} width={92} height={1.2} rx={0.6} fill={color} opacity={0.16 * o} />
      <G opacity={o}>{draw(shape, color)}</G>
    </Svg>
  );
}

const STROKE = { stroke: 'url(#vst)', strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

function draw(shape: VoiceShape, color: string): React.ReactNode {
  switch (shape) {
    case 'rise':
      return (
        <>
          <Path d="M10 34 Q40 34 68 12" {...STROKE} />
          <Arrow x={72} y={9} angle={-38} color={color} />
        </>
      );
    case 'fall':
      return (
        <>
          <Path d="M10 12 Q40 12 68 34" {...STROKE} />
          <Arrow x={72} y={37} angle={38} color={color} />
        </>
      );
    case 'rise-fall':
      return (
        <>
          <Path d="M8 32 Q30 6 50 8 Q66 10 76 32" {...STROKE} />
          <Arrow x={79} y={36} angle={54} color={color} />
        </>
      );
    case 'fall-rise':
      return (
        <>
          <Path d="M8 12 Q28 38 48 38 Q66 38 76 14" {...STROKE} />
          <Arrow x={79} y={10} angle={-54} color={color} />
        </>
      );
    case 'flat':
      return (
        <>
          <Path d="M10 23 L74 23" {...STROKE} />
          <Arrow x={78} y={23} angle={0} color={color} />
        </>
      );

    // Height: the same flat line, high up or low down, with a marker on the baseline to compare to.
    case 'high':
      return (
        <>
          <Path d="M12 10 L80 10" {...STROKE} />
          <Circle cx={12} cy={10} r={4} fill={color} />
          <Path d="M12 18 L12 21" stroke={color} strokeWidth={2} strokeDasharray="2 2" strokeLinecap="round" />
        </>
      );
    case 'low':
      return (
        <>
          <Path d="M12 37 L80 37" {...STROKE} />
          <Circle cx={12} cy={37} r={4} fill={color} />
          <Path d="M12 25 L12 28" stroke={color} strokeWidth={2} strokeDasharray="2 2" strokeLinecap="round" />
        </>
      );

    // Loudness: bar height. Big bars shout, small bars whisper.
    case 'loud':
    case 'soft': {
      const big = shape === 'loud';
      const heights = big ? [20, 32, 26, 34, 22] : [6, 9, 7, 10, 6];
      return (
        <G>
          {heights.map((bh, i) => (
            <Rect key={i} x={16 + i * 15} y={23 - bh / 2} width={7} height={bh} rx={3.5} fill={color} />
          ))}
        </G>
      );
    }

    // Speed: how far apart the beats are. Crowded is fast, spread out is slow.
    case 'fast':
    case 'slow': {
      const xs = shape === 'fast' ? [30, 40, 50, 60, 70] : [16, 34, 52, 70];
      return (
        <G>
          <Path d={`M${xs[0]} 23 L${xs[xs.length - 1]} 23`} stroke={color} strokeWidth={2} opacity={0.35} strokeLinecap="round" />
          {xs.map((x, i) => (
            <Circle key={i} cx={x} cy={23} r={shape === 'fast' ? 4.5 : 6} fill={color} />
          ))}
        </G>
      );
    }
  }
}

/** A small arrowhead, pointing along `angle` degrees. */
function Arrow({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  return <Polygon points="0,-5.5 10,0 0,5.5" fill={color} transform={`translate(${x} ${y}) rotate(${angle})`} />;
}
