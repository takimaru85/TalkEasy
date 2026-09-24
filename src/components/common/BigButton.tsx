import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, useTheme } from '@/theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

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
  const theme = useTheme();
  const c = theme.colors;

  const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: c.primary, fg: '#FFFFFF', border: c.primaryDark },
    secondary: { bg: theme.tint(c.primarySoft), fg: c.text, border: theme.highContrast ? c.border : c.primarySoft },
    danger: { bg: c.danger, fg: '#FFFFFF', border: c.danger },
    success: { bg: c.success, fg: '#FFFFFF', border: c.success },
    outline: { bg: c.surface, fg: c.text, border: c.border },
  };
  const v = palette[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      hitSlop={6}
      style={[{ alignSelf: fullWidth ? 'stretch' : 'flex-start' }, style]}
    >
      <View
        style={[
          styles.base,
          theme.highContrast ? {} : variant === 'primary' || variant === 'success' || variant === 'danger' ? theme.shadow : {},
          {
            minHeight,
            backgroundColor: disabled ? '#C9CED9' : v.bg,
            borderColor: disabled ? '#9AA1AE' : v.border,
            borderWidth: theme.highContrast ? theme.borderWidth : variant === 'outline' ? 2 : 1.5,
            paddingHorizontal: compact ? SPACING.md : SPACING.xl,
          },
        ]}
      >
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={compact ? 26 : 30} color={disabled ? '#5B6478' : v.fg} /> : null}
          <Text
            style={[styles.label, { color: disabled ? '#3A3F4A' : v.fg, fontSize: compact ? sizes.buttonLabel - 2 : sizes.buttonLabel }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            numberOfLines={2}
          >
            {label}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  // maxWidth + flexShrink: a long label wraps inside the button instead of running past its edge.
  content: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, maxWidth: '100%' },
  label: { fontFamily: Fonts.extrabold, textAlign: 'center', flexShrink: 1 },
});
