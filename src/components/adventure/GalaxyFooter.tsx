import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import { sparklePath } from './art/kit';

/**
 * A moon, soft purple clouds, a small planet and a few stars along the bottom of a screen.
 *
 * BACKGROUND ONLY: it is absolute, takes no touches, hides from screen readers, and must be placed
 * BEFORE the scrolling content in the tree so the content paints over it (on web, positioned
 * elements paint in tree order). It is a fixed backdrop, not part of the scroll, like the stars
 * behind it. Sized by offsets with the percentage on the in-flow SVG.
 */
export function GalaxyFooter() {
  const id = `gf${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={styles.box} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 390 170" preserveAspectRatio="xMidYMax slice">
        <Defs>
          <LinearGradient id={`${id}m`} x1="0" y1="0" x2="0.2" y2="1">
            <Stop offset="0" stopColor="#FFE9A8" />
            <Stop offset="1" stopColor="#F0A24A" />
          </LinearGradient>
          <LinearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#8466F0" />
            <Stop offset="1" stopColor="#4A3AB8" />
          </LinearGradient>
          <LinearGradient id={`${id}p`} x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor="#6FB8FF" />
            <Stop offset="1" stopColor="#2A5FD0" />
          </LinearGradient>
        </Defs>
        {/* the moon, rising from the bottom edge */}
        <Circle cx={195} cy={235} r={120} fill={`url(#${id}m)`} opacity={0.95} />
        <Ellipse cx={160} cy={132} rx={16} ry={5} fill="#E08A3C" opacity={0.45} />
        <Ellipse cx={226} cy={140} rx={20} ry={6} fill="#E08A3C" opacity={0.4} />
        <Ellipse cx={196} cy={152} rx={12} ry={4} fill="#E08A3C" opacity={0.4} />
        {/* clouds */}
        <Path d="M-10 170 V138 Q4 118 28 128 Q40 104 70 116 Q92 106 108 128 Q130 124 138 148 V170 Z" fill={`url(#${id}c)`} opacity={0.85} />
        <Path d="M260 170 V146 Q272 124 296 134 Q312 112 340 124 Q366 116 384 138 Q398 146 400 160 V170 Z" fill={`url(#${id}c)`} opacity={0.85} />
        {/* a small ringed planet */}
        <Circle cx={344} cy={78} r={14} fill={`url(#${id}p)`} opacity={0.9} />
        <Ellipse cx={344} cy={78} rx={25} ry={5.5} fill="none" stroke="#B8DCFF" strokeWidth={2.4} opacity={0.75} transform="rotate(-20 344 78)" />
        {/* stars */}
        <Path d={sparklePath(30, 70, 9)} fill="#FFE066" opacity={0.95} />
        <Path d={sparklePath(208, 56, 7)} fill="#FFE066" opacity={0.9} />
        <Path d={sparklePath(112, 40, 4)} fill="#FFFFFF" opacity={0.6} />
        <Path d={sparklePath(300, 30, 4.5)} fill="#FFFFFF" opacity={0.6} />
        <Path d={sparklePath(372, 150, 6)} fill="#FFE066" opacity={0.9} />
        <Path d={sparklePath(60, 20, 3.4)} fill="#FFFFFF" opacity={0.5} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // Offsets only: bottom-anchored and a fixed height, never a percentage on an absolute box.
  box: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 170 },
});
