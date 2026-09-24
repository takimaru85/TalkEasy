import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ChildScreen, Glyph, Icon as LineIcon, PressableScale, ProgressBar } from '@/components/common';
import { WRITING_LEVELS } from '@/adaptive/handwriting';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useAdaptiveProgress, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';
import { useI18n } from '@/i18n';

/** Writing practice: seven levels as big cards. Levels already tried show a ⭐. */
export function WritingPracticeScreen({ navigation }: RootScreenProps<'WritingPractice'>) {
  const sizes = useSizes();
  const { t } = useI18n();
  const theme = useTheme();
  const { data: progress } = useAdaptiveProgress();
  const { speakFeedback } = useSpeak();
  const tried = new Set(progress.handwritingLevelsPractised);

  return (
    <ChildScreen title={t('titleWritingPractice')} emoji="✏️" back>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <Card>
          <Text style={[styles.intro, { fontSize: sizes.body + 1, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Practice with your finger. Any size is fine — this is just for fun and to get stronger.
          </Text>
          <ProgressBar value={tried.size / WRITING_LEVELS.length} label={`${tried.size} / ${WRITING_LEVELS.length}`} color={theme.colors.selected} accessibilityLabel={`${tried.size} of ${WRITING_LEVELS.length} levels tried`} />
        </Card>
        {WRITING_LEVELS.map((l) => (
          <PressableScale key={l.level} onPress={() => { speakFeedback(l.title); navigation.navigate('WritingCanvas', { level: l.level }); }} accessibilityRole="button" accessibilityLabel={`Level ${l.level}, ${l.title}. ${l.description}${tried.has(l.level) ? '. Practised' : ''}`}>
            <Card style={styles.row} padding={SPACING.md}>
              <Glyph value={l.emoji} size={60} />
              <View style={styles.text}>
                <Text style={[styles.level, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>LEVEL {l.level}</Text>
                <Text style={[styles.title, { fontSize: sizes.tileLabel + 1, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{l.title}</Text>
                <Text style={[styles.desc, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{l.description}</Text>
              </View>
              <LineIcon name={tried.has(l.level) ? 'star' : 'play-circle-outline'} size={32} color={tried.has(l.level) ? '#E0A800' : theme.colors.primary} />
            </Card>
          </PressableScale>
        ))}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  intro: { fontFamily: Fonts.semibold, marginBottom: SPACING.sm, lineHeight: 28 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  badge: { width: 64, height: 64, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  badgeEmoji: { fontSize: 32, lineHeight: 40 },
  text: { flex: 1, gap: 2 },
  level: { fontFamily: Fonts.black, fontSize: 13, letterSpacing: 1 },
  title: { fontFamily: Fonts.extrabold },
  desc: { fontFamily: Fonts.semibold, fontSize: 15 },
  star: { fontSize: 26 },
});
