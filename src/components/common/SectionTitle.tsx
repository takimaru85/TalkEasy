import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fonts, useTheme } from '@/theme';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Glyph } from './Glyph';

interface Props {
  title: string;
  emoji?: string;
  /** Small trailing text, e.g. a count. */
  trailing?: string;
}

/** Large section heading used on child and parent screens. */
export function SectionTitle({ title, emoji, trailing }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityRole="header">
      {emoji ? <Glyph value={emoji} size={Math.round(sizes.heading + 6)} /> : null}
      <Text style={[styles.title, { fontSize: sizes.heading - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {title}
      </Text>
      {trailing ? <Text style={[styles.trailing, { fontSize: sizes.body - 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{trailing}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  emoji: { lineHeight: 40 },
  title: { flex: 1, fontFamily: Fonts.extrabold },
  trailing: { fontFamily: Fonts.bold },
});
