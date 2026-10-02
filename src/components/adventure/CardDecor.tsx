import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import { sparklePath } from './art/kit';

/**
 * Faint space decoration for the inside of a blue card: a small ringed planet and a few stars.
 *
 * Drawn UNDER the card's words and kept low-contrast, so it gives the card atmosphere without
 * competing with the numbers on it. Fill the card with it (it is absolute, offsets only, and the
 * card clips), and put it BEFORE the content in the tree.
 */
export function CardDecor() {
  const planet = `cd${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
      {/* The box is filled by offsets; the percentage sits on the in-flow SVG. */}
      <Svg width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio="xMaxYMid slice">
        <Defs>
          <LinearGradient id={planet} x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor="#9BF0DC" />
            <Stop offset="1" stopColor="#2FB8A0" />
          </LinearGradient>
        </Defs>
        <Circle cx={292} cy={118} r={21} fill={`url(#${planet})`} opacity={0.5} />
        <Ellipse cx={292} cy={118} rx={36} ry={7.5} fill="none" stroke="#D5FFF4" strokeWidth={3} opacity={0.45} transform="rotate(-18 292 118)" />
        <Path d={sparklePath(246, 30, 6)} fill="#FFE066" opacity={0.9} />
        <Path d={sparklePath(210, 156, 4.5)} fill="#FFFFFF" opacity={0.6} />
        <Path d={sparklePath(310, 60, 4)} fill="#FFFFFF" opacity={0.6} />
        <Path d={sparklePath(118, 18, 4)} fill="#FFFFFF" opacity={0.5} />
      </Svg>
    </View>
  );
}
