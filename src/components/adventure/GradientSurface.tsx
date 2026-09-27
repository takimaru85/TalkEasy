import React, { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface Props {
  from: string;
  to: string;
  /** Diagonal by default; 'vertical' for wide banners where a diagonal reads as a smudge. */
  direction?: 'diagonal' | 'vertical';
  opacity?: number;
  /** Per-stop opacity, e.g. a white gloss that fades out (1 -> 0). */
  fromOpacity?: number;
  toOpacity?: number;
}

/**
 * Fills its parent with a two-stop gradient.
 *
 * Drawn with react-native-svg rather than pulling in a gradient library — the app already depends
 * on SVG for the tracing guides, and "no unnecessary dependencies" is a standing rule here. The
 * parent supplies the shape: give it a borderRadius and `overflow: 'hidden'` and the gradient
 * takes that shape.
 */
export function GradientSurface({ from, to, direction = 'diagonal', opacity, fromOpacity = 1, toOpacity = 1 }: Props) {
  // Gradients resolve by id document-wide in react-native-svg, so each surface needs its own.
  const id = `grad-${useId().replace(/:/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} accessible={false} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2={direction === 'vertical' ? '0' : '1'} y2="1">
          <Stop offset="0" stopColor={from} stopOpacity={fromOpacity} />
          <Stop offset="1" stopColor={to} stopOpacity={toOpacity} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </Svg>
  );
}
