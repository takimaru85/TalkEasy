import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Icon } from './Icon';

interface Props {
  title: string;
  onBack?: () => void;
  /** Icon/label for the left button (defaults to a back arrow). Child screens pass 'home'. */
  backIcon?: string;
  backLabel?: string;
  /** Right-hand action (e.g. the parent lock button on child screens). */
  rightIcon?: string;
  rightLabel?: string;
  onRightPress?: () => void;
}

/**
 * Header with optional back button (left) and one optional action (right).
 * Both controls are square, at least 64pt, and always in the same position.
 */
export function ScreenHeader({ title, onBack, backIcon = 'arrow-left', backLabel, rightIcon, rightLabel, onRightPress }: Props) {
  const sizes = useSizes();
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel ?? 'Back'}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Icon name={backIcon} size={backLabel ? 30 : 34} color={Colors.text} />
            {backLabel ? (
              <Text style={styles.iconLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {backLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      <Text
        style={[styles.title, { fontSize: sizes.heading }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>

      <View style={[styles.side, styles.sideRight]}>
        {rightIcon && onRightPress ? (
          <Pressable
            onPress={onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightLabel ?? 'Menu'}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Icon name={rightIcon} size={30} color={Colors.text} />
            {rightLabel ? (
              <Text style={styles.iconLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {rightLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: MIN_CHILD_TARGET + SPACING.sm * 2,
  },
  side: { width: MIN_CHILD_TARGET + 8, alignItems: 'flex-start' },
  sideRight: { alignItems: 'flex-end' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
    color: Colors.text,
  },
  iconButton: {
    width: MIN_CHILD_TARGET + 8,
    height: MIN_CHILD_TARGET,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: { fontSize: 12, fontWeight: '700', color: Colors.text, marginTop: -2 },
  pressed: { opacity: 0.7 },
});
