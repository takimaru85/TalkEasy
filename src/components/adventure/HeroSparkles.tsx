import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Adventure } from '@/theme/adventure';

interface Props {
  /** Box the decoration fills, centred on the mascot. */
  size: number;
}

/**
 * The air around Pip: sound waves leaving his mic side, a few small stars, and two sparkles.
 *
 * It exists to place the mascot INSIDE the world rather than on top of it, and it is all
 * on-theme — the waves are speech leaving him, which is what the whole app is about. Drawn
 * behind the mascot at low opacity and marked non-interactive, so it never competes with his
 * face or swallows a tap.
 *
 * Static, like the rest of the sky: motion here would run a timer for as long as Home is open.
 */
export function HeroSparkles({ size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={styles.layer} accessible={false} pointerEvents="none">
      {/* Sound waves on the mic side — speech, leaving the speaker. */}
      <G opacity={0.55}>
        <Path d="M20 50 q-7 -9 0 -18" stroke={Adventure.sky.from} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Path d="M14 54 q-11 -13 0 -26" stroke={Adventure.sky.from} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.7} />
        <Path d="M8 58 q-15 -17 0 -34" stroke={Adventure.sky.from} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.45} />
      </G>

      {/* A couple of stars, sized differently so the cluster does not look stamped. */}
      <Path d="M84 22 l1.7 3.5 3.8 0.6 -2.8 2.7 0.7 3.8 -3.4 -1.8 -3.4 1.8 0.7 -3.8 -2.8 -2.7 3.8 -0.6 Z" fill={Adventure.sun.from} opacity={0.9} />
      <Path d="M90 60 l1.2 2.5 2.7 0.4 -2 1.9 0.5 2.7 -2.4 -1.3 -2.4 1.3 0.5 -2.7 -2 -1.9 2.7 -0.4 Z" fill={Adventure.sun.from} opacity={0.65} />
      <Path d="M14 18 l1 2.1 2.3 0.3 -1.7 1.6 0.4 2.3 -2 -1.1 -2 1.1 0.4 -2.3 -1.7 -1.6 2.3 -0.3 Z" fill="#FFFFFF" opacity={0.6} />

      {/* Two soft motes, to give the air some weight. */}
      <Circle cx={78} cy={82} r={2.2} fill={Adventure.reef.from} opacity={0.5} />
      <Circle cx={24} cy={86} r={1.6} fill="#FFFFFF" opacity={0.4} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute' },
});
