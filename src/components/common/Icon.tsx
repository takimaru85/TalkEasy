import React from 'react';
import { Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { DEFAULT_ICON } from '@/constants/icons';

type GlyphName = keyof typeof MaterialCommunityIcons.glyphMap;

interface Props {
  name: string;
  size: number;
  color?: string;
}

const ASCII = /^[\x20-\x7E]*$/;

/** True when `name` is an emoji / non-ASCII pictogram rather than a glyph name. */
export function isEmoji(name: string): boolean {
  return name.length > 0 && name.length <= 8 && !ASCII.test(name);
}

/**
 * Renders either a bundled MaterialCommunityIcons glyph or an emoji (both work offline).
 * Falls back to a default glyph if a stored name no longer exists, so a typo in a custom
 * tile never crashes the app.
 */
export function Icon({ name, size, color = '#111111' }: Props) {
  if (isEmoji(name)) {
    return (
      <Text
        style={{ fontSize: size * 0.86, lineHeight: size * 1.1, textAlign: 'center' }}
        allowFontScaling={false}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {name}
      </Text>
    );
  }
  const safeName = (name in MaterialCommunityIcons.glyphMap ? name : DEFAULT_ICON) as GlyphName;
  return <MaterialCommunityIcons name={safeName} size={size} color={color} />;
}

export function isValidIcon(name: string): boolean {
  return isEmoji(name) || name in MaterialCommunityIcons.glyphMap;
}
