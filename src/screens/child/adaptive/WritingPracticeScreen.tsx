import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ChildScreen, ProgressBar } from '@/components/common';
import { MissionCard } from '@/components/adventure/MissionCard';
import { WRITING_LEVELS } from '@/adaptive/handwriting';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useAdaptiveProgress, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme, type AdventureKey } from '@/theme';
import { useI18n } from '@/i18n';

/** One colour per level, so neighbouring missions never share a hue. */
const LEVEL_COLORS: AdventureKey[] = ['grape', 'sky', 'magenta', 'grass', 'coral', 'lagoon', 'sun'];

/**
 * Writing practice ("Learn & Trace"): seven levels as mission cards. Levels already tried show a
 * gold star medal. Every level stays open — nothing is locked, as before.
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

  return (
    <ChildScreen title={theme.night ? t('traceTitle') : t('titleWritingPractice')} emoji="✏️" art="trace" subtitle={theme.night ? t('traceSub') : undefined} back>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <Card padding={SPACING.md}>
          <Text style={[styles.intro, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('traceIntro')}
          </Text>
          <ProgressBar value={tried.size / WRITING_LEVELS.length} label={`${tried.size} / ${WRITING_LEVELS.length}`} color={theme.colors.selected} accessibilityLabel={`${tried.size} of ${WRITING_LEVELS.length} levels tried`} />
        </Card>
        {WRITING_LEVELS.map((l, i) => (
          <MissionCard
            key={l.level}
            eyebrow={`LEVEL ${l.level}`}
            title={l.title}
            subtitle={l.description}
            glyph={l.emoji}
            color={LEVEL_COLORS[i % LEVEL_COLORS.length]}
            done={tried.has(l.level)}
            doneLabel={t('traceDone')}
            compact={tried.has(l.level)}
            current={l.level === nextLevel}
            currentLabel={t('traceUpNext')}
            onPress={() => { speakFeedback(l.title); navigation.navigate('WritingCanvas', { level: l.level }); }}
            accessibilityLabel={`Level ${l.level}, ${l.title}. ${l.description}${tried.has(l.level) ? '. Practised' : l.level === nextLevel ? '. Up next' : ''}`}
          />
        ))}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.sm + 2, paddingBottom: SPACING.xl },
  intro: { fontFamily: Fonts.bold, marginBottom: SPACING.sm, textAlign: 'center' },
});
