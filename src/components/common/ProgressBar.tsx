import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme, Fonts } from '@/theme';
import { Motion } from '@/theme/tokens';
import { MAX_FONT_SCALE } from '@/constants/sizes';

interface Props {
  /** 0..1 */
  value: number;
  /** Text shown at the right, e.g. "3 / 7". Always paired with the bar so colour is not the only cue. */
  label?: string;
  color?: string;
  height?: number;
  accessibilityLabel?: string;
}

/** Animated progress bar (animation off in reduced-motion mode). */
export function ProgressBar({ value, label, color, height = 16, accessibilityLabel }: Props) {
  const theme = useTheme();
  const anim = useRef(new Animated.Value(Math.min(1, Math.max(0, value)))).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(1, Math.max(0, value)),
      duration: theme.duration(Motion.settle * 2),
      useNativeDriver: false,
    }).start();
  }, [value, anim, theme]);

  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
    >
      <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: theme.colors.surfaceAlt, borderColor: theme.highContrast ? theme.colors.border : 'transparent', borderWidth: theme.highContrast ? 2 : 0 }]}>
        <Animated.View
          style={{
            height: '100%',
            borderRadius: height / 2,
            backgroundColor: color ?? theme.colors.primary,
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        />
      </View>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, overflow: 'hidden' },
  label: { fontFamily: Fonts.extrabold, fontSize: 16, minWidth: 48, textAlign: 'right' },
});
