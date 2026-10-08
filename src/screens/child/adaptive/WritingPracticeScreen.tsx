import React from 'react';
import type { ColorArtName } from '@/components/adventure/ColorArt';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, ChildScreen, ProgressBar } from '@/components/common';
import { MissionCard } from '@/components/adventure/MissionCard';
import { WRITING_LEVELS } from '@/adaptive/handwriting';
import { useSubscription } from '@/context/SubscriptionContext';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useAdaptiveProgress, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme, type AdventureKey } from '@/theme';
import { useI18n } from '@/i18n';

const Separator = () => <View style={styles.separator} />;

/** One colour per level, so neighbouring missions never share a hue. */
const LEVEL_COLORS: AdventureKey[] = ['grape', 'sky', 'magenta', 'grass', 'coral', 'lagoon', 'sun'];

/**
 * Writing practice ("Learn & Trace"): every level as a mission card. Levels already tried show a
 * gold star medal. Levels open one at a time: level N unlocks when level N-1 has been done (levels already done stay open).
 */
export function WritingPracticeScreen({ navigation }: RootScreenProps<'WritingPractice'>) {
  const sizes = useSizes();
  const { t } = useI18n();
  const theme = useTheme();
  const { data: progress } = useAdaptiveProgress();
  const { speakFeedback } = useSpeak();
  const tried = new Set(progress.handwritingLevelsPractised);
  // The level to do next: the first one not tried yet. Every level stays open; this only points.
  const nextLevel = WRITING_LEVELS.find((l) => !tried.has(l.level))?.level;
  const { can } = useSubscription();

  return (
    <ChildScreen title={theme.night ? t('traceTitle') : t('titleWritingPractice')} emoji="✏️" art="trace" subtitle={theme.night ? t('traceSub') : undefined} back>
      {/* A virtualised list: 100 cards, each with an illustration and a gradient, drawn all at once ran a phone out of memory. */}
      <FlatList
        data={WRITING_LEVELS}
        keyExtractor={(l) => String(l.level)}
        initialNumToRender={8}
        windowSize={5}
        maxToRenderPerBatch={6}
        removeClippedSubviews
        contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <Card padding={SPACING.md} style={{ marginBottom: SPACING.sm + 2 }}>
            <Text style={[styles.intro, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('traceIntro')}
            </Text>
            <ProgressBar value={tried.size / WRITING_LEVELS.length} label={`${tried.size} / ${WRITING_LEVELS.length}`} color={theme.colors.selected} accessibilityLabel={`${tried.size} of ${WRITING_LEVELS.length} levels tried`} />
          </Card>
        }
        renderItem={({ item: l, index: i }) => {
          const plusLocked = !can('writing', i).allowed;
          // One step at a time: a level opens once the one before it has been done (a level already done stays open).
          const stepLocked = !tried.has(l.level) && i > 0 && !tried.has(WRITING_LEVELS[i - 1].level);
          const locked = plusLocked || stepLocked;
          return (
          <MissionCard
            key={l.level}
            locked={locked}
            eyebrow={`LEVEL ${l.level}`}
            title={l.title}
            subtitle={stepLocked ? `Finish level ${l.level - 1} first.` : l.description}
            colorArt={`level:${l.art}` as ColorArtName}
            glyph={l.emoji}
            color={LEVEL_COLORS[i % LEVEL_COLORS.length]}
            done={tried.has(l.level)}
            doneLabel={t('traceDone')}
            compact={tried.has(l.level)}
            current={l.level === nextLevel}
            currentLabel={t('traceUpNext')}
            onPress={() => {
              if (plusLocked) return navigation.navigate('Plus');
              if (stepLocked) return speakFeedback(`Finish level ${l.level - 1} first`);
              speakFeedback(l.title);
              navigation.navigate('WritingCanvas', { level: l.level });
            }}
            accessibilityLabel={`Level ${l.level}, ${l.title}. ${l.description}${tried.has(l.level) ? '. Practised' : l.level === nextLevel ? '. Up next' : ''}${plusLocked ? '. Needs TalkEasy Plus' : ''}${stepLocked ? `. Locked. Finish level ${l.level - 1} first` : ''}`}
          />
          );
        }}
      />
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, paddingBottom: SPACING.xl },
  separator: { height: SPACING.sm + 2 },
  intro: { fontFamily: Fonts.bold, marginBottom: SPACING.sm, textAlign: 'center' },
});
