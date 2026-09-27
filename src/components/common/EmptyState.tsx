import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdventureInk, Fonts, useIsAdventure, useTheme } from '@/theme';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Icon } from './Icon';
// Imported from the file, not the adventure barrel: the barrel pulls in QuestCard, which imports
// back into components/common and would make a cycle.
import { Mascot } from '@/components/adventure/Mascot';

interface Props {
  icon: string;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const adventure = useIsAdventure();
  return (
    <View style={styles.wrap}>
      {adventure ? <Mascot size={96} /> : <Icon name={icon} size={72} color={theme.colors.textMuted} />}
      <Text style={[styles.title, { fontSize: sizes.heading - 2, color: adventure && !theme.highContrast && !theme.night ? AdventureInk : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
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
