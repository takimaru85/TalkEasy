import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, type AdventureKey } from '@/theme/adventure';

interface Props {
  icon: string;
  value: string;
  /** Read out instead of the bare number: "12 stars" rather than "12". */
  label: string;
  color: AdventureKey;
}

/**
 * A single headline number — stars, streak, level — as a compact pill.
 *
 * The icon is not decoration: with three pills side by side, it is what tells a pre-reader which
 * number is which. The accessible label carries the units, so a screen reader says "12 stars"
 * and not just "12".
 */
export function StatPill({ icon, value, label, color }: Props) {
  const theme = useTheme();
  const c = Adventure[color];
  const background = theme.highContrast ? theme.colors.surface : c.tint;
  const ink = theme.highContrast ? theme.colors.text : c.ink;

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: background },
        theme.highContrast && { borderWidth: theme.borderWidth, borderColor: theme.colors.border },
      ]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Icon name={icon} size={19} color={ink} />
      <Text style={[styles.value, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: AdventureRadius.pill,
  },
  value: { fontFamily: Fonts.black, fontSize: 16 },
});
