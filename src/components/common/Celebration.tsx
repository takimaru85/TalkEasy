import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { Motion } from '@/theme/tokens';

interface Props {
  /** Bump this value to play the burst again. 0 = hidden. */
  trigger: number;
  emoji?: string;
}

const PIECES = [
  { x: -120, y: -140, r: -25 }, { x: -60, y: -190, r: 15 }, { x: 0, y: -210, r: 0 },
  { x: 60, y: -190, r: -15 }, { x: 120, y: -140, r: 25 }, { x: -150, y: -60, r: -40 },
  { x: 150, y: -60, r: 40 }, { x: -90, y: -100, r: 10 }, { x: 90, y: -100, r: -10 },
];

/**
 * Short star burst shown on a win (correct answer streak, routine complete, reward earned).
 * ~0.9 s, non-interactive, and entirely skipped in reduced-motion mode — the spoken/text
 * feedback still happens, so the celebration is never the only signal.
 */
export function Celebration({ trigger, emoji = '⭐' }: Props) {
  const theme = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trigger || theme.reducedMotion) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: theme.duration(Motion.celebrate), useNativeDriver: true }).start();
  }, [trigger, progress, theme]);

  if (!trigger || theme.reducedMotion) return null;

  return (
    <View pointerEvents="none" style={styles.layer} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {PIECES.map((p, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.piece,
            {
              opacity: progress.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.x] }) },
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.y] }) },
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.r}deg`] }) },
                { scale: progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.2, 0.9] }) },
              ],
            },
          ]}
        >
          {i % 3 === 0 ? emoji : i % 3 === 1 ? '✨' : '🎉'}
        </Animated.Text>
      ))}
      <Text style={styles.hidden}>{' '}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  piece: { position: 'absolute', fontSize: 34 },
  hidden: { opacity: 0 },
});
