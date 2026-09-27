import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Adventure, Fonts, useTheme } from '@/theme';
import { Icon } from './Icon';

interface Props {
  text: string;
  /** Line-icon name before the text. */
  icon?: string;
}

/**
 * The small capitalised label above a strip of cards ("RECENT", "USED A LOT"). On the night sky it
 * is gold, like the stars on the home screen; elsewhere it stays the quiet muted grey it always was.
 */
export function SectionLabel({ text, icon }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const color = theme.night ? Adventure.sun.from : theme.colors.textMuted;
  return (
    <View style={styles.row} accessibilityRole="header">
      {icon ? <Icon name={icon} size={sizes.body} color={color} /> : null}
      <Text style={[styles.text, { fontSize: sizes.body - 2, color }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {text.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  text: { fontFamily: Fonts.black, letterSpacing: 1 },
});
