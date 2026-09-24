import React from 'react';
import { Text } from 'react-native';
import { tileColor } from '@/constants/colors';
import { uiIcon } from '@/constants/uiIcons';
import { IconTile } from './IconTile';
import { isEmoji, isValidIcon } from './Icon';

interface Props {
  /** An interface emoji (mapped through UI_ICONS), a MaterialCommunityIcons name, or a picture emoji. */
  value: string;
  /** Box size of the IconTile. */
  size: number;
  /** Tint for a plain icon name (a mapped emoji brings its own). */
  tint?: string;
  muted?: boolean;
}

/**
 * The one way the interface shows a "section" icon. Interface emoji and icon names become the
 * app's IconTile (tinted rounded square, deep-tone line icon); anything else — a picture a parent
 * typed, a learning picture — is still drawn as the picture it is.
 */
export function Glyph({ value, size, tint, muted }: Props) {
  const mapped = uiIcon(value);
  if (mapped) return <IconTile name={mapped.icon} size={size} tint={tint ?? mapped.tint} muted={muted} />;
  if (!isEmoji(value) && isValidIcon(value)) return <IconTile name={value} size={size} tint={tint ?? tileColor('blue')} muted={muted} />;
  return (
    <Text style={{ fontSize: size * 0.62, lineHeight: size * 0.9, textAlign: 'center' }} allowFontScaling={false} accessible={false}>
      {value}
    </Text>
  );
}
