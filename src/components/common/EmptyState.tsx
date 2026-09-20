import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fonts, useTheme } from '@/theme';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Icon } from './Icon';

interface Props {
  icon: string;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <Icon name={icon} size={72} color={theme.colors.textMuted} />
      <Text style={[styles.title, { fontSize: sizes.heading - 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {title}
      </Text>
      {message ? (
        <Text style={[styles.message, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  title: { fontFamily: Fonts.extrabold, textAlign: 'center' },
  message: { fontFamily: Fonts.semibold, textAlign: 'center' },
});
