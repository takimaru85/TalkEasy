import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Motion } from '@/theme/tokens';

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed (default 0.97). */
  pressedScale?: number;
  children?: React.ReactNode;
}

/**
 * Pressable with a short, subtle scale-down on press. The one place tap animation lives,
 * so "reduced motion" turns it off everywhere at once.
 */
export function PressableScale({ style, pressedScale = 0.97, children, onPressIn, onPressOut, disabled, ...rest }: Props) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const to = (value: number) =>
    Animated.timing(scale, { toValue: value, duration: theme.duration(Motion.tap), useNativeDriver: true }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={(e) => {
          if (!disabled) to(pressedScale);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          to(1);
          onPressOut?.(e);
        }}
        style={styles.fill}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /**
   * flexGrow, NOT flex. `flex: 1` also sets flexBasis to 0, and inside a parent whose height
   * comes from its content that resolves to a ZERO-height pressable: the button still paints,
   * because its inner view has a minHeight and nothing clips it, but the touch target is a
   * sliver, so taps land on what you can see and miss it. flexGrow fills the parent when there
   * is definite room and falls back to the content height when there is not.
   */
  fill: { flexGrow: 1 },
});
