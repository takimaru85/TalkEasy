import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, useTheme } from '@/theme';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong' | 'hint';

interface Props {
  label: string;
  emoji?: string;
  state?: ChoiceState;
  onPress: () => void;
  disabled?: boolean;
  /** Picture-first layout: big emoji above a small label. */
  pictureMode?: boolean;
  width?: number | `${number}%`;
  accessibilityLabel?: string;
}

/**
 * A large selectable answer card (replaces tiny radio buttons). State is shown with a border,
 * a background tint AND an icon/text so it is never colour-only.
 */
export function ChoiceCard({ label, emoji, state = 'idle', onPress, disabled, pictureMode, width = '100%', accessibilityLabel }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const c = theme.colors;
  const palette = {
    idle: { bg: c.surface, border: theme.highContrast ? c.border : c.borderSoft, width: theme.highContrast ? theme.borderWidth : 1.5 },
    selected: { bg: theme.tint(c.primarySoft), border: c.primary, width: 4 },
    correct: { bg: theme.tint(c.successSoft), border: c.success, width: 4 },
    wrong: { bg: theme.tint('#FFE0E0'), border: c.danger, width: 4 },
    hint: { bg: theme.tint('#FFF1C2'), border: c.selected, width: 4 },
  }[state];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: state === 'selected', disabled }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.card,
        theme.shadow,
        {
          width,
          minHeight: pictureMode ? Math.max(sizes.tileHeight, 130) : Math.max(sizes.tileHeight * 0.65, 88),
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: palette.width,
          flexDirection: pictureMode ? 'column' : 'row',
        },
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      {emoji ? (
        <Text style={[styles.emoji, { fontSize: pictureMode ? sizes.iconSize + 16 : sizes.iconSize - 6, lineHeight: pictureMode ? sizes.iconSize + 36 : sizes.iconSize + 10 }]} allowFontScaling={false}>
          {emoji}
        </Text>
      ) : null}
      <Text
        style={[styles.label, { fontSize: pictureMode ? sizes.body + 2 : sizes.tileLabel + 2, color: c.text }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        numberOfLines={3}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
      {state !== 'idle' ? (
        // In picture mode the badge sits in the corner, so it never makes one card taller than the rest.
        <View style={pictureMode ? styles.badgeCorner : undefined}>
          {state === 'correct' ? <Icon name="check-circle" size={32} color={c.success} /> : null}
          {state === 'wrong' ? <Icon name="close-circle" size={32} color={c.danger} /> : null}
          {state === 'hint' ? <Text style={styles.hintMark} allowFontScaling={false}>💡</Text> : null}
          {state === 'selected' ? <Icon name="check-bold" size={28} color={c.primary} /> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: Radius.lg,
  },
  emoji: { textAlign: 'center' },
  label: { fontFamily: Fonts.extrabold, textAlign: 'center', flexShrink: 1 },
  hintMark: { fontSize: 26 },
  badgeCorner: { position: 'absolute', top: SPACING.sm, right: SPACING.sm },
});

export function ChoiceGrid({ children }: { children: React.ReactNode }) {
  const sizes = useSizes();
  return <View style={[styles2.grid, { gap: sizes.gap }]}>{children}</View>;
}

const styles2 = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
