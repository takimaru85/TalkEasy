import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, AdventureShadow } from '@/theme/adventure';
import { CardDecor } from './CardDecor';
import { ColorArt } from './ColorArt';
import { GradientSurface } from './GradientSurface';
import { Mascot } from './Mascot';

interface Props {
  /** Badges earned — the real count. */
  earned: number;
  /** Badges that exist — the real total. */
  total: number;
  /** "4 of 8 badges", already worded by the caller, which owns the language. */
  countLabel: string;
  subtitle: string;
}

const BAR = '#FFD84D';

/**
 * The top of Achievements: Pip, how many badges the child has out of how many there are, and a bar
 * for it.
 *
 * Counts, not a score: "4 of 8" is a thing a child can point at, and the bar is just that fraction
 * drawn. Nothing here is typed in — the caller passes the real earned and total counts.
 */
export function AchievementSummary({ earned, total, countLabel, subtitle }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const plain = theme.highContrast;
  const progress = total > 0 ? Math.max(0, Math.min(1, earned / total)) : 0;

  return (
    <View
      style={[
        styles.card,
        plain ? { backgroundColor: Adventure.sky.to, borderWidth: theme.borderWidth, borderColor: theme.colors.border } : AdventureShadow,
      ]}
    >
      {plain ? null : (
        <>
          <GradientSurface from={Adventure.sky.from} to={Adventure.sky.to} />
          <CardDecor />
        </>
      )}
      {/* In a View, so on web it paints ABOVE the absolutely positioned gradient (a bare SVG sits underneath it). */}
      <View>
        <Mascot size={Math.min(92, sizes.iconSize + 44)} mood={earned > 0 ? 'cheer' : 'happy'} />
      </View>
      <View style={styles.text}>
        <Text
          style={[styles.count, { fontSize: sizes.heading + 8 }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
        >
          {countLabel}
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
          {subtitle}
        </Text>
        <View
          style={styles.barRow}
          accessibilityRole="progressbar"
          accessibilityLabel={countLabel}
          accessibilityValue={{ now: Math.round(progress * 100), min: 0, max: 100 }}
        >
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          {/* In a View, so on web it paints above the gradient (a bare SVG sits underneath it). */}
          <View>
            <ColorArt name="stat:stars" size={30} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: AdventureRadius.hero,
    overflow: 'hidden',
  },
  text: { flex: 1, minWidth: 0, gap: 4 },
  count: { fontFamily: Fonts.black, color: '#FFFFFF', alignSelf: 'stretch' },
  subtitle: { fontFamily: Fonts.bold, color: '#FFFFFF', opacity: 0.93, fontSize: 14, alignSelf: 'stretch' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  track: { flex: 1, height: 16, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.4)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: BAR },
});
