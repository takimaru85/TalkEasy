import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureInk, AdventureInkMuted, AdventureRadius, AdventureShadow } from '@/theme/adventure';
import { fitFontSize } from '@/utils/fitText';
import type { EarnedBadge } from '@/adventure/badges';
import { GradientSurface } from './GradientSurface';

interface Props {
  badge: EarnedBadge;
  /** Card width in px, so the title can be fitted to it. */
  width: number;
  /** "3 / 10" — already formatted by the caller, which owns the wording. */
  progressLabel: string;
  earnedLabel: string;
}

/**
 * One collectible badge.
 *
 * An unearned badge is shown in full, greyed, WITH how far along the child is — never hidden
 * behind a question mark. A locked mystery is a tease; a visible target with a half-filled bar is
 * an invitation, and it tells a grown-up what to practise next.
 *
 * Earned and unearned differ by colour, by the medal/outline icon AND by the words underneath, so
 * the state never rests on colour alone.
 */
export function BadgeCard({ badge, width, progressLabel, earnedLabel }: Props) {
  const theme = useTheme();
  const c = Adventure[badge.color];
  const earned = badge.earned;
  const plain = theme.highContrast;

  const inner = width - SPACING.md * 2;
  const titleSize = fitFontSize(badge.title, inner, 16, 'word', 11);

  return (
    <View
      style={[
        styles.card,
        { width },
        plain
          ? { backgroundColor: theme.colors.surface, borderWidth: theme.borderWidth, borderColor: theme.colors.border }
          : [AdventureShadow, { backgroundColor: earned ? 'transparent' : theme.colors.surface }],
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${badge.title}. ${badge.description} ${earned ? earnedLabel : progressLabel}`}
    >
      {earned && !plain ? <GradientSurface from={c.from} to={c.to} /> : null}

      <View style={[styles.disc, { backgroundColor: earned ? 'rgba(255,255,255,0.28)' : c.tint }]}>
        <Icon
          name={earned ? 'medal' : badge.icon}
          size={30}
          color={earned && !plain ? '#FFFFFF' : plain ? theme.colors.text : c.ink}
        />
      </View>

      <Text
        style={[styles.title, { fontSize: titleSize, color: earned && !plain ? '#FFFFFF' : theme.night ? theme.colors.text : AdventureInk }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        numberOfLines={2}
        textBreakStrategy="simple"
      >
        {badge.title}
      </Text>

      {earned ? (
        <Text
          style={[styles.state, { color: earned && !plain ? '#FFFFFF' : theme.night ? theme.colors.textMuted : AdventureInkMuted }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={1}
        >
          {earnedLabel}
        </Text>
      ) : (
        <>
          <View style={[styles.track, { backgroundColor: c.tint }]}>
            <View style={[styles.fill, { width: `${Math.round(badge.progress * 100)}%`, backgroundColor: c.to }]} />
          </View>
          <Text style={[styles.state, { color: theme.night ? theme.colors.textMuted : AdventureInkMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
            {progressLabel}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: AdventureRadius.card,
    overflow: 'hidden',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    minHeight: 150,
  },
  disc: { width: 52, height: 52, borderRadius: AdventureRadius.disc, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  state: { fontFamily: Fonts.bold, fontSize: 12, textAlign: 'center', alignSelf: 'stretch' },
  track: { height: 8, borderRadius: 999, alignSelf: 'stretch', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});
