import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
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
  return (
    <View style={styles.wrap}>
      <Icon name={icon} size={72} color={Colors.textMuted} />
      <Text style={[styles.title, { fontSize: sizes.heading - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {title}
      </Text>
      {message ? (
        <Text style={[styles.message, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  title: { fontWeight: '800', color: Colors.text, textAlign: 'center' },
  message: { color: Colors.textMuted, textAlign: 'center' },
});
