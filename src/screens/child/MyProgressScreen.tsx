import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChildScreen, Icon, PressableScale } from '@/components/common';
import { SpaceAdventureMap } from '@/components/adventure/SpaceAdventureMap';
import { BadgeChip, ColorArt, GradientSurface, HeroBanner, StatCard } from '@/components/adventure';
import type { ColorArtName } from '@/components/adventure';
import { badgePreviewCount, statTextWidth } from '@/adventure/progressLayout';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, MIN_SUPPORTED_WIDTH, SPACING } from '@/constants/sizes';
import { useAchievements, useAdventure, useSizes } from '@/hooks';
import { useI18n } from '@/i18n';
import type { Strings } from '@/i18n/types';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, AdventureShadow, type AdventureKey } from '@/theme/adventure';
import { fitFontSize } from '@/utils/fitText';

/**
 * My Progress — what the child has done, shown as things they can count.
 *
 * Deliberately not a dashboard. Six plain counts and a level bar, no percentages, no accuracy, no
 * charts: a number a child can point at ("I practised 14 words") tells them more than a graph,
 * and nothing here can read as a mark out of ten. The detailed breakdowns stay in Parent Mode.
 *
 * EVERY NUMBER ON THIS SCREEN IS COUNTED, NONE IS WRITTEN IN. They come from `useAchievements` and
 * `useAdventure`, which count from the practice tables, so a child who had been using TalkEasy long
 * before this screen existed sees their real totals. The look is the only thing that is designed
 * here; `check:layout` fails if a number is typed in.
 */
export function MyProgressScreen({ navigation }: RootScreenProps<'MyProgress'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const adventure = useAdventure();
  const { metrics, badges, earnedCount } = useAchievements();
  const { width } = useWindowDimensions();

  // Floored: the window reports 0 on a first frame, and a negative width reaches an <svg> as an
  // invalid size that draws nothing (see MIN_SUPPORTED_WIDTH).
  const contentWidth = Math.max(MIN_SUPPORTED_WIDTH, width) - sizes.horizontalPadding * 2;
  const columns = sizes.gridColumns >= 4 ? 4 : 2;
  const cardWidth = Math.floor((contentWidth - SPACING.md * (columns - 1)) / columns);

  const stats: { labelKey: keyof Strings; value: number; art: ColorArtName; color: AdventureKey }[] = [
    { labelKey: 'advStatStars', value: metrics.stars, art: 'stat:stars', color: 'sun' },
    { labelKey: 'advStatStreak', value: metrics.streak, art: 'stat:streak', color: 'coral' },
    { labelKey: 'advStatSounds', value: metrics.soundsPractised, art: 'stat:sounds', color: 'sky' },
    { labelKey: 'advStatExercises', value: metrics.speechExercises, art: 'stat:speech', color: 'grape' },
    { labelKey: 'advStatWords', value: metrics.wordsPractised, art: 'stat:words', color: 'grass' },
    { labelKey: 'advStatTracing', value: metrics.tracingSessions, art: 'stat:tracing', color: 'reef' },
  ];

  // One label size for all six, fitted to the longest in the room a card leaves it.
  const labelSize = stats.reduce(
    (min, s) => Math.min(min, fitFontSize(t(s.labelKey), statTextWidth(cardWidth), 15, 'word', 11)),
    15,
  );

  const goAchievements = () => navigation.navigate('Achievements');
  const earned = badges.filter((b) => b.earned);
  const previews = earned.slice(0, badgePreviewCount(contentWidth, earned.length));
  const plain = theme.highContrast;
  const grape = Adventure.grape;

  return (
    <ChildScreen title={t('advProgress')} subtitle={t('advProgressSub')} art="progress" back>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner
          headline={adventure.title}
          subtitle={t('advKeepGoing')}
          levelLabel={t('advLevel', { n: adventure.level })}
          title={adventure.title}
          progress={adventure.progress}
          progressLabel={t('advStarsOf', { done: adventure.starsIntoLevel, total: adventure.starsPerLevel })}
          // Settings live in Parent Mode, behind the PIN, exactly as on the Home screen.
          onSettings={() => navigation.navigate('ParentPin')}
          settingsLabel={t('advParentSettings')}
        />

        <SpaceAdventureMap />

        <View style={[styles.grid, { gap: SPACING.md }]}>
          {stats.map((s) => (
            <StatCard key={s.labelKey} value={s.value} label={t(s.labelKey)} art={s.art} color={s.color} width={cardWidth} labelSize={labelSize} />
          ))}
        </View>

        <PressableScale
          onPress={goAchievements}
          accessibilityRole="button"
          accessibilityLabel={`${t('advAchievements')}. ${t('advBadgesOf', { done: earnedCount, total: badges.length })}`}
          hitSlop={4}
        >
          <View
            style={[
              styles.badgeRow,
              plain
                ? { backgroundColor: theme.colors.surface, borderWidth: theme.borderWidth, borderColor: theme.colors.border }
                : [AdventureShadow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft, borderWidth: 1.5 }],
            ]}
          >
            <ColorArt name="stat:medal" size={52} />
            <View style={styles.badgeText}>
              <Text style={[styles.badgeTitle, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                {t('advAchievements')}
              </Text>
              <Text style={[styles.badgeSub, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                {t('advBadgesOf', { done: earnedCount, total: badges.length })}
              </Text>
            </View>
            {previews.length > 0 ? (
              <View style={styles.previews}>
                {previews.map((b) => (
                  <BadgeChip key={b.id} icon={b.icon} color={b.color} />
                ))}
              </View>
            ) : null}
            <Icon name="chevron-right" size={26} color={theme.colors.textMuted} />
          </View>
        </PressableScale>

        <PressableScale
          onPress={goAchievements}
          accessibilityRole="button"
          accessibilityLabel={`${t('advSeeAll')}. ${t('advSeeAllSub')}`}
          hitSlop={4}
        >
          <View
            style={[
              styles.cta,
              plain ? { backgroundColor: grape.to, borderWidth: theme.borderWidth, borderColor: theme.colors.border } : AdventureShadow,
            ]}
          >
            {plain ? null : (
              <>
                <GradientSurface from={grape.from} to={grape.to} />
                <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.28} toOpacity={0} toOffset={0.5} />
              </>
            )}
            {/* In a View: on web a bare SVG would paint under the absolutely positioned gradient. */}
            <View>
              <ColorArt name="stat:trophy" size={64} />
            </View>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                {t('advSeeAll')}
              </Text>
              <Text style={styles.ctaSub} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                {t('advSeeAllSub')}
              </Text>
            </View>
            <View style={styles.ctaArrow}>
              <Icon name="chevron-right" size={26} color="#FFFFFF" />
            </View>
          </View>
        </PressableScale>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: MIN_CHILD_TARGET + 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: AdventureRadius.card,
  },
  badgeText: { flex: 1, minWidth: 0, gap: 1 },
  badgeTitle: { fontFamily: Fonts.black, fontSize: 18 },
  badgeSub: { fontFamily: Fonts.semibold, fontSize: 14 },
  previews: { flexDirection: 'row', gap: 6 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: MIN_CHILD_TARGET + 28,
    padding: SPACING.md,
    borderRadius: AdventureRadius.card,
    overflow: 'hidden',
  },
  ctaText: { flex: 1, minWidth: 0, gap: 2 },
  ctaTitle: { fontFamily: Fonts.black, fontSize: 21, color: '#FFFFFF' },
  ctaSub: { fontFamily: Fonts.bold, fontSize: 14, color: '#FFFFFF', opacity: 0.92 },
  ctaArrow: {
    width: MIN_CHILD_TARGET - 18,
    height: MIN_CHILD_TARGET - 18,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(40,20,120,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
