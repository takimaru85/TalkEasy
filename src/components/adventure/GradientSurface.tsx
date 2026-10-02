import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
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
  /**
   * Where the `to` colour is reached, 0..1 down/across the surface (default 1). A gloss that fades
   * out over the top 60% is `toOffset={0.6}` on a FULL-size surface — never a 60%-tall box, whose
   * percentage height Yoga and the browser resolve differently (see SIZING below).
   */
  toOffset?: number;
}

/**
 * Fills its parent with a two-stop gradient.
 *
 * Drawn with react-native-svg rather than pulling in a gradient library — the app already depends
 * on SVG for the tracing guides, and "no unnecessary dependencies" is a standing rule here. The
 * parent supplies the shape: give it a borderRadius and `overflow: 'hidden'` and the gradient
 * takes that shape.
 *
 * SIZING — the one layout rule that differs between web and a phone:
 * a percentage size on an ABSOLUTELY positioned box is resolved against the parent's padding box
 * by the browser (Expo web) but against the parent's CONTENT box by Yoga (iOS / Android). The SVG
 * used to be the absolute child itself with width "100%", so on a padded card it came out two
 * paddings narrow on a phone: an un-painted strip down the right edge of every card, chip and
 * game button, while web looked perfect.
 *
 * So the two jobs are split. A plain absoluteFill View takes the parent's inner box — offsets
 * (top/left/right/bottom 0), not percentages, which both engines agree on. The SVG is an ordinary
 * in-flow child of that View, which has no padding, so its "100%" means the same box everywhere.
 * No measuring and no state: onLayout-based sizing was tried and drew nothing until a layout event
 * arrived, which a paused or busy screen can delay.
 */
export function GradientSurface({ from, to, direction = 'diagonal', opacity, fromOpacity = 1, toOpacity = 1, toOffset = 1 }: Props) {
  // Gradients resolve by id document-wide in react-native-svg, so each surface needs its own.
  const id = `grad-${useId().replace(/:/g, '')}`;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" pointerEvents="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2={direction === 'vertical' ? '0' : '1'} y2="1">
            <Stop offset="0" stopColor={from} stopOpacity={fromOpacity} />
            <Stop offset={toOffset} stopColor={to} stopOpacity={toOpacity} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
      </Svg>
    </View>
  );
}
