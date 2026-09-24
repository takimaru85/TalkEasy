import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Icon } from '@/components/common';
import type { SpeechItem } from '@/speechpractice/types';
import { useTheme } from '@/theme';

interface Props {
  item: SpeechItem;
  size: number;
}

/** A practice item's picture: the parent's photo if there is one, else its emoji or icon. */
export function ItemPicture({ item, size }: Props) {
  const theme = useTheme();
  if (item.imageUri) {
    return (
      <Image
        source={{ uri: item.imageUri }}
        style={[styles.photo, { width: size * 1.3, height: size * 1.3, borderRadius: size * 0.65, borderColor: theme.colors.border }]}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
    );
  }
  if (!item.picture) return null;
  return <Icon name={item.picture} size={size} color={theme.colors.text} raw />;
}

const styles = StyleSheet.create({
  photo: { borderWidth: 2 },
});
