import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { fitFontSize } from '@/utils/fitText';
import { Fonts } from '@/theme';
import { Adventure, AdventureNight } from '@/theme/adventure';

interface Props {
  /** Font size of the wordmark; everything else scales from it. */
  size: number;
  tagline?: string;
}

/**
 * The TalkEasy wordmark: "Talk" in white, "Easy" in gold, with a rocket lifting off the final
 * letter and a small star trail.
 *
 * Built from type and vectors rather than an image — it re-colours itself, stays sharp at any
 * density, costs nothing to ship, and scales with the child's text-size setting instead of
 * pixellating. The two-tone split is what makes it a mark rather than a title: "Talk" is the
 * thing the child does, "Easy" is the promise.
 *
 * "Talk" and "Easy" are TWO SIBLING Texts, not two coloured spans inside one Text with
 * numberOfLines={1}. Android measures nested spans of a custom font with letter spacing a few
 * pixels narrower than it draws them, and a one-line Text then drops the glyph that "doesn't fit"
 * — it showed "TalkEas" on Android phones and tablets while the browser showed "TalkEasy". Each
 * single-style Text is measured exactly, nothing limits the line count, and the size is fitted
 * to the screen width up front (adjustsFontSizeToFit is ignored by Android here anyway).
 */
export function TalkEasyLogo({ size, tagline }: Props) {
  const { width } = useWindowDimensions();
  // Room for the word beside the rocket, with the screen's side padding either side.
  const room = width - SPACING.lg * 4 - size * 0.62;
  const fontSize = fitFontSize('TalkEasy', room, size, 'line', Math.round(size * 0.6));
  const rocket = fontSize * 0.62;
  const wordStyle = [styles.word, { fontSize, lineHeight: Math.round(fontSize * 1.12) }];

  return (
    <View style={styles.wrap} accessibilityRole="header" accessibilityLabel={`TalkEasy${tagline ? `. ${tagline}` : ''}`}>
      <View style={styles.row}>
        <Text style={[wordStyle, styles.talk]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessible={false}>
          Talk
        </Text>
        <Text style={[wordStyle, styles.easy]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessible={false}>
          Easy
        </Text>

        <Svg width={rocket} height={rocket} viewBox="0 0 40 40" accessible={false} style={styles.rocket}>
          {/* Rocket body */}
          <Path d="M20 3 C26 9 28 17 28 23 L12 23 C12 17 14 9 20 3 Z" fill="#FFFFFF" />
          <Circle cx="20" cy="14" r="3.6" fill={Adventure.sky.to} />
          {/* Fins */}
          <Path d="M12 20 L6 28 L12 26 Z" fill={Adventure.coral.to} />
          <Path d="M28 20 L34 28 L28 26 Z" fill={Adventure.coral.to} />
          {/* Flame */}
          <Path d="M16 24 L20 36 L24 24 Z" fill={Adventure.sun.from} />
          <Path d="M18 24 L20 31 L22 24 Z" fill="#FFF3C4" />
        </Svg>
      </View>

      {tagline ? (
        <Text style={[styles.tagline, { fontSize: Math.max(12, size * 0.3) }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
          {tagline}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  // A dark offset behind the letters reads as extrusion, and the glow lifts the mark off the
  // sky. Both are type effects rather than an image, so the logo stays crisp at any size.
  word: {
    fontFamily: Fonts.black,
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(5,8,30,0.85)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  talk: { color: '#FFFFFF' },
  easy: { color: Adventure.sun.from, paddingRight: 2 },
  rocket: { marginLeft: -2, marginTop: -2 },
  tagline: { fontFamily: Fonts.bold, color: AdventureNight.inkMuted, letterSpacing: 0.3, textShadowColor: 'rgba(5,8,30,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
});
