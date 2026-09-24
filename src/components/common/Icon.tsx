import React from 'react';
import { Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { DEFAULT_ICON } from '@/constants/icons';
import { uiIcon } from '@/constants/uiIcons';

type GlyphName = keyof typeof MaterialCommunityIcons.glyphMap;

interface Props {
  name: string;
  size: number;
  color?: string;
  /** Draw an emoji as the picture it is (learning pictures), never as its interface line icon. */
  raw?: boolean;
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
export function Icon({ name, size, color = '#111111', raw = false }: Props) {
  // Interface emoji (📖 for a subject, 🎨 for a category…) are drawn as the app's line icons.
  const mapped = !raw && isEmoji(name) ? uiIcon(name) : null;
  if (mapped) return <MaterialCommunityIcons name={mapped.icon as GlyphName} size={size} color={color} />;
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
