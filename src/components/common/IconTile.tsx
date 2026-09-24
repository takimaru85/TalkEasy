import React from 'react';
import { StyleSheet, View } from 'react-native';
import { tileInk } from '@/constants/colors';
import { useTheme } from '@/theme';
import { Icon } from './Icon';

interface Props {
  name: string;
  /** Box size. The glyph is ~55% of it — generous padding reads calmer and more refined. */
  size: number;
  /** Soft tint (a TileColors value); the glyph is drawn in its matching deep ink. */
  tint: string;
  /** Muted grey, for finished items. */
  muted?: boolean;
}

/**
 * The app's icon style: a soft rounded square in a tint, the glyph in the deep tone of the same
 * hue. Used wherever an icon labels an item (My Day steps, Now / Next), matching the Talk cards.
 */
export function IconTile({ name, size, tint, muted }: Props) {
  const theme = useTheme();
  const bg = muted ? theme.colors.surfaceAlt : theme.tint(tint);
  const ink = muted ? theme.colors.textMuted : theme.highContrast ? theme.colors.text : tileInk(tint);
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.3),
          backgroundColor: bg,
          borderColor: theme.highContrast ? theme.colors.border : 'transparent',
          borderWidth: theme.highContrast ? 2 : 0,
        },
      ]}
    >
      <Icon name={name} size={Math.round(size * 0.55)} color={ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
