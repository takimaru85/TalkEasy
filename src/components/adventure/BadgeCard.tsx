import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE } from '@/constants/sizes';
import { BADGE_GAP, BADGE_PAD, badgeArtSize, badgeStacked, badgeTextWidth } from '@/adventure/progressLayout';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, AdventureShadow, shade } from '@/theme/adventure';
import { fitFontSize } from '@/utils/fitText';
import type { EarnedBadge } from '@/adventure/badges';
import { ColorArt, type ColorArtName } from './ColorArt';
import { GradientSurface } from './GradientSurface';

interface Props {
  badge: EarnedBadge;
  /** The illustration this badge wears (see `adventure/badgeArt.ts`). */
  art: ColorArtName;
  /** Card width in px, so the name can be fitted to what is left beside the picture. */
  width: number;
  /** "3 / 10" — already formatted by the caller, which owns the wording. */
  progressLabel: string;
  earnedLabel: string;
}

/**
 * One collectible badge.
 *
 * EARNED: a bright gradient card in the badge's own colour, a big illustration, and an "Earned!"
 * pill. NOT YET: a dark navy card, the same illustration in a ring, and a bar with how far along the
 * child is. An unearned badge is shown in full WITH its target — never hidden behind a question
 * mark. A locked mystery is a tease; a visible target with a part-filled bar is an invitation, and
 * it tells a grown-up what to practise next.
 *
 * Earned and unearned differ by colour, by the card, AND by the words (an "Earned!" pill versus
 * "3 / 10"), so the state never rests on colour alone. On a narrow card the picture goes above the
 * words rather than squeezing them.
 */
export function BadgeCard({ badge, art, width, progressLabel, earnedLabel }: Props) {
  const theme = useTheme();
  const c = Adventure[badge.color];
  const earned = badge.earned;
  const plain = theme.highContrast;
  const stacked = badgeStacked(width);
  const artSize = badgeArtSize(width);
  const titleSize = fitFontSize(badge.title, badgeTextWidth(width), 16, 'word', 11);
  const ink = earned && !plain ? '#FFFFFF' : plain ? theme.colors.text : '#FFFFFF';
  const pct = `${Math.round(badge.progress * 100)}%`;

  return (
    <View
      style={[
        styles.card,
        { width },
        stacked ? styles.stacked : null,
        plain
          ? { backgroundColor: theme.colors.surface, borderWidth: theme.borderWidth, borderColor: theme.colors.border }
          : earned
            ? [AdventureShadow, { backgroundColor: c.to, borderWidth: 1.5, borderColor: c.from, borderBottomWidth: 5, borderBottomColor: shade(c.to, 0.66) }]
            : [AdventureShadow, { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: 'rgba(126,150,255,0.35)' }],
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${badge.title}. ${badge.description} ${earned ? earnedLabel : progressLabel}`}
    >
      {earned && !plain ? (
        <>
          <GradientSurface from={c.from} to={c.to} />
          {/* Gloss: fades out half way down, the highlight every game card carries. */}
          <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.28} toOpacity={0} toOffset={0.5} />
        </>
      ) : null}

      {/* In a View, so on web it paints ABOVE the absolutely positioned gradient (a bare SVG sits
          underneath it and the picture disappears). Unearned: the picture sits in a ring. */}
      <View style={earned ? null : [styles.ring, { width: artSize + 12, height: artSize + 12, borderColor: c.from }]}>
        <ColorArt name={art} size={earned ? artSize : artSize - 4} />
      </View>

      <View style={[styles.text, stacked ? styles.textStacked : null]}>
        <Text
          style={[styles.title, stacked ? styles.centred : null, { fontSize: titleSize, color: ink }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={2}
          textBreakStrategy="simple"
        >
          {badge.title}
        </Text>

        {earned ? (
          <View style={[styles.pill, plain ? { borderColor: theme.colors.text } : { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.75)' }]}>
            <Text style={[styles.pillText, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {earnedLabel}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.track}>
              <View style={[styles.fill, { width: pct as `${number}%`, backgroundColor: plain ? theme.colors.text : c.from }]} />
            </View>
            <Text style={[styles.state, { color: plain ? theme.colors.text : 'rgba(255,255,255,0.78)' }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {progressLabel}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BADGE_GAP,
    padding: BADGE_PAD,
    minHeight: 112,
    borderRadius: AdventureRadius.card,
    overflow: 'hidden',
  },
  stacked: { flexDirection: 'column', justifyContent: 'center', gap: 6, minHeight: 150 },
  ring: {
    borderRadius: 999,
    borderWidth: 3,
    backgroundColor: 'rgba(10,18,70,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0, gap: 6, justifyContent: 'center' },
  textStacked: { flex: 0, alignSelf: 'stretch', alignItems: 'center' },
  centred: { textAlign: 'center', alignSelf: 'stretch' },
  title: { fontFamily: Fonts.black },
  pill: { alignSelf: 'stretch', borderWidth: 2, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8, alignItems: 'center' },
  pillText: { fontFamily: Fonts.extrabold, fontSize: 14 },
  track: { height: 10, borderRadius: 999, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.82)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  state: { fontFamily: Fonts.bold, fontSize: 14, textAlign: 'center', alignSelf: 'stretch' },
});
