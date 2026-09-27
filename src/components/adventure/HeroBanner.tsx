import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, AdventureShadow } from '@/theme/adventure';
import { GradientSurface } from './GradientSurface';
import { Mascot } from './Mascot';

interface Props {
  headline: string;
  subtitle: string;
  /** "Level 4" */
  levelLabel: string;
  /** "Speech Explorer" */
  title: string;
  /** 0..1 through the current level. */
  progress: number;
  /** "12 / 20 stars" */
  progressLabel: string;
}

/**
 * The top of the home screen: Pip, a greeting, and how far along the child is.
 *
 * This is the "you are on a journey" moment. It shows progress as a bar and a level name rather
 * than a statistic, because "Level 4 · Speech Explorer" means something to a child and
 * "38 activities completed" does not.
 */
export function HeroBanner({ headline, subtitle, levelLabel, title, progress, progressLabel }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.hero,
        theme.highContrast
          ? { backgroundColor: Adventure.sky.to, borderWidth: theme.borderWidth, borderColor: theme.colors.border }
          : AdventureShadow,
      ]}
    >
      {theme.highContrast ? null : <GradientSurface from={Adventure.sky.from} to={Adventure.sky.to} />}

      <View style={styles.row}>
        <Mascot size={Math.min(96, sizes.iconSize + 40)} mood="cheer" />
        <View style={styles.text}>
          <Text
            style={[styles.headline, { fontSize: sizes.heading + 4 }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {headline}
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View
        style={styles.progressBlock}
        accessibilityRole="progressbar"
        accessibilityLabel={`${levelLabel}, ${title}. ${progressLabel}`}
        accessibilityValue={{ now: Math.round(clamped * 100), min: 0, max: 100 }}
      >
        <View style={styles.progressTop}>
          <Text style={styles.level} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
            {levelLabel} · {title}
          </Text>
          <Text style={styles.progressLabel} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
            {progressLabel}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(clamped * 100)}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: AdventureRadius.hero,
    overflow: 'hidden',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  text: { flex: 1, gap: 2 },
  headline: { fontFamily: Fonts.black, color: '#FFFFFF', letterSpacing: 0.6, alignSelf: 'stretch' },
  subtitle: { fontFamily: Fonts.bold, color: '#FFFFFF', opacity: 0.93, fontSize: 15, alignSelf: 'stretch' },
  progressBlock: { gap: 6 },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  level: { fontFamily: Fonts.extrabold, color: '#FFFFFF', fontSize: 14, flexShrink: 1 },
  progressLabel: { fontFamily: Fonts.bold, color: '#FFFFFF', opacity: 0.9, fontSize: 13 },
  track: { height: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.32)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: '#FFFFFF' },
});
