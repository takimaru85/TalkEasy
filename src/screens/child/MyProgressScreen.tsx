import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChildScreen, Icon, PressableScale } from '@/components/common';
import { AdventureButton, HeroBanner } from '@/components/adventure';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useAchievements, useAdventure, useSizes } from '@/hooks';
import { useI18n } from '@/i18n';
import type { Strings } from '@/i18n/types';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureInkMuted, AdventureRadius, AdventureShadow, shade, type AdventureKey } from '@/theme/adventure';
import { fitFontSize } from '@/utils/fitText';

/**
 * My Progress — what the child has done, shown as things they can count.
 *
 * Deliberately not a dashboard. Six plain counts and a level bar, no percentages, no accuracy, no
 * charts: a number a child can point at ("I practised 14 words") tells them more than a graph,
 * and nothing here can read as a mark out of ten. The detailed breakdowns stay in Parent Mode.
 */
export function MyProgressScreen({ navigation }: RootScreenProps<'MyProgress'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const adventure = useAdventure();
  const { metrics, badges, earnedCount } = useAchievements();
  const { width } = useWindowDimensions();

  const columns = sizes.gridColumns >= 4 ? 4 : 2;
  const cardWidth = (width - sizes.horizontalPadding * 2 - SPACING.md * (columns - 1)) / columns;

  const stats: { labelKey: keyof Strings; value: number; icon: string; color: AdventureKey }[] = [
    { labelKey: 'advStatStars', value: metrics.stars, icon: 'star', color: 'sun' },
    { labelKey: 'advStatStreak', value: metrics.streak, icon: 'fire', color: 'coral' },
    { labelKey: 'advStatSounds', value: metrics.soundsPractised, icon: 'account-voice', color: 'sky' },
    { labelKey: 'advStatExercises', value: metrics.speechExercises, icon: 'microphone-outline', color: 'grape' },
    { labelKey: 'advStatWords', value: metrics.wordsPractised, icon: 'bookmark-multiple-outline', color: 'grass' },
    { labelKey: 'advStatTracing', value: metrics.tracingSessions, icon: 'pencil-outline', color: 'reef' },
  ];

  const labelSize = stats.reduce(
    (min, s) => Math.min(min, fitFontSize(t(s.labelKey), cardWidth - SPACING.md * 2, 14, 'word', 11)),
    14,
  );

  return (
    <ChildScreen title={t('advProgress')} art="progress" back>
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
        />

        <View style={[styles.grid, { gap: SPACING.md }]}>
          {stats.map((s) => {
            const c = Adventure[s.color];
            return (
              <View
                key={s.labelKey}
                style={[
                  styles.stat,
                  { width: cardWidth },
                  theme.highContrast
                    ? { backgroundColor: theme.colors.surface, borderWidth: theme.borderWidth, borderColor: theme.colors.border }
                    : theme.night
                      ? [AdventureShadow, { backgroundColor: c.to, borderWidth: 1.5, borderColor: c.from, borderBottomWidth: 5, borderBottomColor: shade(c.to, 0.68) }]
                      : [AdventureShadow, { backgroundColor: c.tint }],
                ]}
                accessibilityRole="text"
                accessibilityLabel={`${s.value} ${t(s.labelKey)}`}
              >
                <Icon name={s.icon} size={26} color={theme.highContrast ? theme.colors.text : theme.night ? '#FFFFFF' : c.ink} />
                <Text
                  style={[styles.value, { fontSize: sizes.heading, color: theme.highContrast ? theme.colors.text : theme.night ? '#FFFFFF' : c.ink }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  numberOfLines={1}
                >
                  {s.value}
                </Text>
                <Text
                  style={[styles.label, { fontSize: labelSize, color: theme.night ? 'rgba(255,255,255,0.9)' : AdventureInkMuted }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  numberOfLines={2}
                  textBreakStrategy="simple"
                >
                  {t(s.labelKey)}
                </Text>
              </View>
            );
          })}
        </View>

        <PressableScale
          onPress={() => navigation.navigate('Achievements')}
          accessibilityRole="button"
          accessibilityLabel={`${t('advAchievements')}. ${t('advBadgesOf', { done: earnedCount, total: badges.length })}`}
          hitSlop={4}
        >
          <View style={[styles.badgeRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]}>
            <Icon name="medal" size={28} color={theme.night ? Adventure.sun.from : Adventure.sun.ink} />
            <View style={styles.badgeText}>
              <Text style={[styles.badgeTitle, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                {t('advAchievements')}
              </Text>
              <Text style={[styles.badgeSub, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                {t('advBadgesOf', { done: earnedCount, total: badges.length })}
              </Text>
            </View>
            <Icon name="chevron-right" size={26} color={theme.colors.textMuted} />
          </View>
        </PressableScale>

        <AdventureButton
          label={t('advSeeAll')}
          icon="medal-outline"
          color="grape"
          onPress={() => navigation.navigate('Achievements')}
        />
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  stat: {
    borderRadius: AdventureRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    minHeight: 112,
  },
  value: { fontFamily: Fonts.black },
  label: { fontFamily: Fonts.bold, textAlign: 'center', alignSelf: 'stretch' },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: MIN_CHILD_TARGET,
    paddingHorizontal: SPACING.lg,
    borderRadius: AdventureRadius.card,
    borderWidth: 1.5,
  },
  badgeText: { flex: 1, gap: 1 },
  badgeTitle: { fontFamily: Fonts.black, fontSize: 16 },
  badgeSub: { fontFamily: Fonts.semibold, fontSize: 13 },
});
