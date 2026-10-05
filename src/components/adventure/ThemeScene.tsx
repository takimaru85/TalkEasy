import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BACKGROUND_SOURCES } from './themeBackgrounds';
import { getPremiumTheme, type ThemeId } from '@/shop/themes';

interface Props {
  theme: ThemeId;
  width: number;
  height: number;
  /** Absolute full-bleed (the app backdrop) or a plain block (a preview card). */
  fill?: boolean;
}

/**
 * The background of a premium theme: ITS SUPPLIED PICTURE, drawn as it was made. There are no hand-drawn
 * stand-ins any more; every theme in `shop/themes.ts` names a file. An unknown theme id or a missing
 * picture draws nothing here, and the caller (`WorldBackground`) falls back to the child's own world, so a
 * broken theme can never blank a screen.
 */
export function ThemeScene({ theme, width: w, height: h, fill = true }: Props) {
  const t = getPremiumTheme(theme);
  if (!t?.background || !(w > 0) || !(h > 0)) return null;
  return <BackgroundPicture file={t.background.file} scrim={t.background.scrim} base={t.palette.bottom} width={w} height={h} fill={fill} />;
}

/**
 * A supplied background picture, filled to the area WITHOUT stretching: `cover` keeps the artwork's
 * proportions and trims the overflow evenly from both sides (the pictures are 9:16, so a taller phone trims
 * a little from the sides and a squarer one a little from the top and bottom). Under it is the theme's sky
 * colour, so a picture that is slow to decode or fails to load leaves a dark calm sky rather than a hole. Over
 * it is a veil of `scrim`, only as strong as the brighter pictures need for white text to stay readable.
 * It takes no touches and is hidden from screen readers.
 */
export function BackgroundPicture({ file, scrim, base, width, height, fill = true }: { file: string; scrim: number; base: string; width: number; height: number; fill?: boolean }) {
  const source = BACKGROUND_SOURCES[file];
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[fill ? StyleSheet.absoluteFill : { width, height, overflow: 'hidden' }, { backgroundColor: base }]}
    >
      {source ? <Image source={source} resizeMode="cover" style={StyleSheet.absoluteFill} accessibilityIgnoresInvertColors /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(6,10,36,${scrim})` }]} />
    </View>
  );
}
