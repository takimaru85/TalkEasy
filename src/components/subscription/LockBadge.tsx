import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { Fonts, Radius, useTheme } from '@/theme';

/**
 * The small mark on something that needs Plus.
 *
 * QUIET ON PURPOSE. A child meets these while looking for something to do, and a lock that shouts
 * turns their own app into a shop window. It is a padlock and the word "Plus" — enough for a
 * grown-up to understand at a glance, not enough to feel like an advert.
 *
 * Never colour alone: the padlock carries the meaning, so it still reads in high contrast and for
 * a child who cannot tell the tint apart. The label is included in the parent row's accessibility
 * text rather than being announced separately, so a screen reader says "Words, needs Plus" once.
 */
export function LockBadge({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  const night = theme.night;
  const fg = night ? '#FFD84D' : theme.colors.textMuted;
  const bg = night ? 'rgba(255,216,77,0.14)' : theme.colors.surfaceAlt;
  const border = night ? 'rgba(255,216,77,0.4)' : theme.colors.borderSoft;

  return (
    <View
      style={[styles.badge, compact && styles.compact, { backgroundColor: bg, borderColor: border }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Icon name="lock" size={compact ? 12 : 14} color={fg} />
      {compact ? null : (
        <Text style={[styles.label, { color: fg }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Plus
        </Text>
      )}
    </View>
  );
}

/** The phrase a locked row adds to its accessibility label. One wording, used everywhere. */
export const LOCKED_A11Y = 'needs TalkEasy Plus';

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  compact: { paddingHorizontal: 5, paddingVertical: 4 },
  label: { fontFamily: Fonts.black, fontSize: 11, letterSpacing: 0.4 },
});
