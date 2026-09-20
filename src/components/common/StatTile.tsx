import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts } from '@/theme';

interface Props {
  label: string;
  value: string | number;
  color?: string;
  emoji?: string;
  onPress?: () => void;
}

/** Big number + caption, for the parent dashboard / progress screens. */
export function StatTile({ label, value, color = Colors.surface, emoji, onPress }: Props) {
  const sizes = useSizes();
  const body = (
    <View style={[styles.tile, { backgroundColor: color }]}>
      {emoji ? <Text style={styles.emoji} allowFontScaling={false}>{emoji}</Text> : null}
      <Text style={[styles.value, { fontSize: sizes.heading + 6 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {value}
      </Text>
      <Text style={[styles.label, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
  if (!onPress) return <View style={styles.wrap}>{body}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, flexBasis: '30%' },
  pressed: { opacity: 0.8 },
  tile: {
    minHeight: MIN_PARENT_TARGET * 2,
    borderRadius: RADIUS.button,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    gap: 2,
  },
  emoji: { fontSize: 24, lineHeight: 30 },
  value: { fontFamily: Fonts.black, color: Colors.text },
  label: { color: Colors.textMuted, fontFamily: Fonts.bold, textAlign: 'center' },
});
