import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, useTheme } from '@/theme';
import { fitFontSize } from '@/utils/fitText';
import { Icon } from './Icon';
import { Glyph } from './Glyph';

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
  /** Optional icon before the title: an interface emoji or a line-icon name. */
  emoji?: string;
  /** Tint for `emoji` when it is a plain icon name. */
  emojiTint?: string;
}

/**
 * Header with optional back button (left) and one optional action (right).
 * Both controls are pill-shaped, at least 64pt, and always in the same position.
 */
export function ScreenHeader({ title, onBack, backIcon = 'arrow-left', backLabel, rightIcon, rightLabel, onRightPress, emoji, emojiTint }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  // Room left for the title between the two buttons; the title is sized to fit it on one line.
  const [titleWidth, setTitleWidth] = useState(0);
  const titleSize = fitFontSize(title, titleWidth - (emoji ? 42 : 0), sizes.heading, 'line', 18);
  const buttonStyle = [
    styles.iconButton,
    theme.shadow,
    { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.border : theme.colors.borderSoft, borderWidth: theme.highContrast ? theme.borderWidth : 1 },
  ];

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel ?? 'Back'}
            hitSlop={8}
            style={({ pressed }) => [buttonStyle, pressed && styles.pressed]}
          >
            <Icon name={backIcon} size={backLabel ? 28 : 32} color={theme.colors.text} />
            {backLabel ? (
              <Text style={[styles.iconLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {backLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      <View style={styles.titleWrap} onLayout={(e) => setTitleWidth(e.nativeEvent.layout.width)}>
        {emoji ? <Glyph value={emoji} size={34} tint={emojiTint} /> : null}
        <Text
          style={[styles.title, { fontSize: titleSize, color: theme.colors.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          accessibilityRole="header"
        >
          {title}
        </Text>
      </View>

      <View style={[styles.side, styles.sideRight]}>
        {rightIcon && onRightPress ? (
          <Pressable
            onPress={onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightLabel ?? 'Menu'}
            hitSlop={8}
            style={({ pressed }) => [buttonStyle, pressed && styles.pressed]}
          >
            <Icon name={rightIcon} size={28} color={theme.colors.text} />
            {rightLabel ? (
              <Text style={[styles.iconLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
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
  side: { width: MIN_CHILD_TARGET + 12, alignItems: 'flex-start' },
  sideRight: { alignItems: 'flex-end' },
  titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: SPACING.sm },
  emoji: { fontSize: 24, lineHeight: 30 },
  title: { fontFamily: Fonts.black, textAlign: 'center', flexShrink: 1 },
  iconButton: {
    width: MIN_CHILD_TARGET + 12,
    height: MIN_CHILD_TARGET,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: { fontFamily: Fonts.bold, fontSize: 12, marginTop: -2 },
  pressed: { opacity: 0.7 },
});
