import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, tileInk } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts } from '@/theme';
import { fitFontSize } from '@/utils/fitText';
import { Glyph } from './Glyph';

interface Props {
  label: string;
  value: string | number;
  /** Soft tint: colours the icon square and the number (in its deep tone). */
  color?: string;
  /** An interface emoji or a line-icon name, drawn as the app's icon tile. */
  emoji?: string;
  onPress?: () => void;
}

/**
 * Big number + caption, for the parent dashboard / progress screens. A white card with a soft
 * shadow; the colour lives in the icon and the number (the tint's deep tone), not in a filled box.
 */
export function StatTile({ label, value, color, emoji, onPress }: Props) {
  const sizes = useSizes();
  // Size the caption so its longest word never breaks mid-word in a narrow tile.
  const [width, setWidth] = useState(0);
  const labelSize = fitFontSize(label, width - SPACING.sm * 2 - 4, sizes.body - 3, 'word', 11);
  const ink = color ? tileInk(color) : Colors.text;
  const body = (
    <View style={styles.tile} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {emoji ? <Glyph value={emoji} size={36} tint={color} /> : null}
      <Text style={[styles.value, { fontSize: sizes.heading + 4, color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.label, { fontSize: labelSize }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
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
    borderRadius: RADIUS.tile,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    gap: 4,
    shadowColor: '#1B2A4A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  value: { fontFamily: Fonts.black },
  label: { color: Colors.textMuted, fontFamily: Fonts.bold, textAlign: 'center' },
});
