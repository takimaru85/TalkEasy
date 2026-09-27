import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChildScreen } from '@/components/common';
import { BadgeCard, Mascot } from '@/components/adventure';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useAchievements, useSizes } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts } from '@/theme';
import { useTheme } from '@/theme';

/**
 * The badge shelf.
 *
 * Earned badges come first so the child sees what they have before what they have not, and every
 * unearned badge still shows its target and a progress bar — nothing is hidden behind a question
 * mark. Nothing here can be lost: badges are recomputed from real practice, so one never
 * disappears because a counter was reset.
 */
export function AchievementsScreen(_props: RootScreenProps<'Achievements'>) {
  const theme = useTheme();
  const sizes = useSizes();
  const { t } = useI18n();
  const { badges, earnedCount } = useAchievements();
  const { width } = useWindowDimensions();

  const columns = sizes.gridColumns >= 4 ? 4 : sizes.gridColumns >= 3 ? 3 : 2;
  const cardWidth = (width - sizes.horizontalPadding * 2 - SPACING.md * (columns - 1)) / columns;

  // Earned first, then the closest to being earned — the next one to aim at is near the top.
  const ordered = [...badges].sort((a, b) => Number(b.earned) - Number(a.earned) || b.progress - a.progress);

  return (
    <ChildScreen title={t('advAchievements')} art="progress" back>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Mascot size={72} mood={earnedCount > 0 ? 'cheer' : 'happy'} />
          <View style={styles.headerText}>
            <Text style={[styles.count, { fontSize: sizes.heading - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('advBadgesOf', { done: earnedCount, total: badges.length })}
            </Text>
            <Text style={[styles.sub, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
              {t('advKeepGoing')}
            </Text>
          </View>
        </View>

        <View style={[styles.grid, { gap: SPACING.md }]}>
          {ordered.map((b) => (
            <BadgeCard
              key={b.id}
              badge={b}
              width={cardWidth}
              earnedLabel={t('advEarned')}
              progressLabel={`${b.current} / ${b.target}`}
            />
          ))}
        </View>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  headerText: { flex: 1, gap: 2 },
  count: { fontFamily: Fonts.black, alignSelf: 'stretch' },
  sub: { fontFamily: Fonts.semibold, fontSize: 14, alignSelf: 'stretch' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
