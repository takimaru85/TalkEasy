import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';

interface Props {
  label: string;
  onPress: () => void;
  icon?: string;
  variant?: Variant;
  disabled?: boolean;
  /** Minimum height; defaults to the child-safe minimum. */
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** Stretch to fill available width (default true). */
  fullWidth?: boolean;
  compact?: boolean;
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: Colors.primary, fg: Colors.textOnDark, border: Colors.primaryDark },
  secondary: { bg: Colors.surface, fg: Colors.text, border: Colors.border },
  danger: { bg: Colors.danger, fg: Colors.textOnDark, border: '#8E1B1B' },
  success: { bg: Colors.success, fg: Colors.textOnDark, border: '#0F5E28' },
  outline: { bg: Colors.background, fg: Colors.text, border: Colors.border },
};

/**
 * Generic large button. Used for all secondary actions in child mode and everything in
 * parent mode. Never smaller than MIN_CHILD_TARGET unless `minHeight` says otherwise.
 */
export function BigButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  minHeight = MIN_CHILD_TARGET,
  style,
  accessibilityLabel,
  fullWidth = true,
  compact = false,
}: Props) {
  const sizes = useSizes();
  const v = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight,
          backgroundColor: disabled ? Colors.disabled : v.bg,
          borderColor: disabled ? '#9E9E9E' : v.border,
          opacity: pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: compact ? SPACING.md : SPACING.xl,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={compact ? 26 : 32} color={v.fg} /> : null}
        <Text
          style={[styles.label, { color: v.fg, fontSize: compact ? sizes.buttonLabel - 2 : sizes.buttonLabel }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.button,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
