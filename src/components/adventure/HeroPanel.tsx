import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, AdventureShadow, shade, type AdventureKey } from '@/theme/adventure';
import { GameIcon, type GameIconName } from './GameIcon';
import { GradientSurface } from './GradientSurface';
import { Mascot } from './Mascot';

interface Props {
  color: AdventureKey;
  art: GameIconName;
  title: string;
  subtitle?: string;
  /** Pip beside the art, cheering the child on. */
  mascot?: boolean;
  /** Anything below the text: syllable chips, a star count, a progress bar. */
  children?: React.ReactNode;
}

/**
 * The banner at the top of a section screen, in the section's own colour (Speech cyan, Lessons
 * green…): the big illustrated art, a line of encouragement and, optionally, Pip. It is what makes
 * each screen feel like its own world while sharing the home screen's language.
 *
 * Decorative outside the night sky: in high contrast it is simply not drawn, and the screen reads
 * as before.
 */
export function HeroPanel({ color, art, title, subtitle, mascot, children }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  if (!theme.night) return null;
  const c = Adventure[color];
  const artSize = Math.min(96, sizes.iconSize + 44);

  return (
    <View style={[styles.panel, AdventureShadow, { backgroundColor: c.to, borderColor: shade(c.from, 1.3), borderBottomColor: shade(c.to, 0.66) }]}>
      <GradientSurface from={c.from} to={c.to} direction="vertical" />
      <View style={styles.gloss} pointerEvents="none">
        <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.3} toOpacity={0} />
      </View>
      <View style={styles.row}>
        <GameIcon name={art} size={artSize} />
        <View style={styles.text}>
          <Text style={[styles.title, { fontSize: sizes.tileLabel + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={3}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {mascot ? <Mascot size={Math.min(84, sizes.iconSize + 30)} mood="cheer" space /> : null}
      </View>
      {children ? <View style={styles.below}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: AdventureRadius.hero,
    borderWidth: 1.5,
    borderBottomWidth: 6,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.black, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 2 },
  subtitle: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 20, color: 'rgba(255,255,255,0.92)' },
  below: { marginTop: SPACING.sm },
});
