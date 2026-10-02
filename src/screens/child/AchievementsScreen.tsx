import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ChildScreen } from '@/components/common';
import { AchievementSummary, BadgeCard, GalaxyFooter } from '@/components/adventure';
import { BADGE_ART } from '@/adventure/badgeArt';
import { MIN_SUPPORTED_WIDTH, SPACING } from '@/constants/sizes';
import { useAchievements, useSizes } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';

/**
 * The badge shelf.
 *
 * Earned badges come first so the child sees what they have before what they have not, and every
 * unearned badge still shows its target and a progress bar — nothing is hidden behind a question
 * mark. Nothing here can be lost: badges are recomputed from real practice, so one never
 * disappears because a counter was reset.
 *
 * EVERY COUNT ON THIS SCREEN COMES FROM `useAchievements`: the earned and total badge counts in the
 * summary, and each badge's own progress. The design is the only thing that is new.
 */
export function AchievementsScreen({ navigation }: RootScreenProps<'Achievements'>) {
  const sizes = useSizes();
  const { t } = useI18n();
  const { badges, earnedCount } = useAchievements();
  const { width } = useWindowDimensions();

  // Floored: the window reports 0 on a first frame (see MIN_SUPPORTED_WIDTH).
  const contentWidth = Math.max(MIN_SUPPORTED_WIDTH, width) - sizes.horizontalPadding * 2;
  const columns = sizes.gridColumns >= 4 ? 4 : sizes.gridColumns >= 3 ? 3 : 2;
  const cardWidth = Math.floor((contentWidth - SPACING.md * (columns - 1)) / columns);

  // Earned first, then the closest to being earned — the next one to aim at is near the top.
  const ordered = [...badges].sort((a, b) => Number(b.earned) - Number(a.earned) || b.progress - a.progress);

  return (
    <ChildScreen
      title={t('advAchievements')}
      subtitle={t('advAchievementsSub')}
      art="progress"
      back
      // Settings live in Parent Mode, behind the PIN, exactly as on Home and My Progress.
      rightIcon="cog"
      rightAccessibilityLabel={t('advParentSettings')}
      onRightPress={() => navigation.navigate('ParentPin')}
    >
      <View style={styles.flex}>
        {/* The moon and clouds are a backdrop: first in the tree, so the content paints over them. */}
        <GalaxyFooter />
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <AchievementSummary
            earned={earnedCount}
            total={badges.length}
            countLabel={t('advBadgesOf', { done: earnedCount, total: badges.length })}
            subtitle={t('advKeepGoing')}
          />

          <View style={[styles.grid, { gap: SPACING.md }]}>
            {ordered.map((b) => (
              <BadgeCard
                key={b.id}
                badge={b}
                art={BADGE_ART[b.id] ?? 'stat:medal'}
                width={cardWidth}
                earnedLabel={t('advEarned')}
                progressLabel={`${b.current} / ${b.target}`}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
