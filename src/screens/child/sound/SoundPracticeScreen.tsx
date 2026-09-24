import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ChildScreen, PressableScale, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes, useTodaySoundPractice } from '@/hooks';
import { SOUND_EXERCISES } from '@/soundpractice/content';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';

/** Whole minutes, rounded up once any practice has happened, so "0 min" never follows real work. */
function minutes(ms: number): number {
  return ms > 0 ? Math.max(1, Math.round(ms / 60000)) : 0;
}

/**
 * Sound Practice — pick a sound.
 *
 * A plain grid of large letters. No scores, no locks, no streaks: every sound is always
 * available, and the child can practise the same one as often as they like.
 */
export function SoundPracticeScreen({ navigation }: RootScreenProps<'SoundPractice'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { data: stats } = useTodaySoundPractice();

  const tileWidth = `${Math.floor(100 / sizes.gridColumns) - 2}%` as const;

  return (
    <ChildScreen title={t('sectionSoundPractice')} emoji="🎯">
      <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <Text style={[styles.subtitle, { fontSize: sizes.body + 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('soundChooseSound')}
        </Text>

        <View style={[styles.grid, { gap: sizes.gap }]}>
          {SOUND_EXERCISES.map((ex) => (
            <PressableScale
              key={ex.id}
              onPress={() => navigation.navigate('SoundPracticeDetail', { soundId: ex.id })}
              accessibilityRole="button"
              accessibilityLabel={`${ex.sound}. ${t('soundPracticeCta')}`}
              style={{ width: tileWidth }}
            >
              <Card color={theme.colors.primarySoft} style={[styles.tile, { minHeight: Math.max(sizes.tileHeight, 124) }]}>
                <Text style={[styles.letter, { fontSize: sizes.heading + 22, color: theme.colors.text }]} allowFontScaling={false}>
                  {ex.sound}
                </Text>
                <Text style={styles.tileEmoji} allowFontScaling={false}>{ex.emoji}</Text>
                <Text style={[styles.practice, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('soundPracticeCta')}
                </Text>
              </Card>
            </PressableScale>
          ))}
        </View>

        <SectionTitle title={t('soundTodaysPractice')} emoji="📋" />
        <Card>
          <StatLine label={t('soundStatSounds')} value={String(stats.soundsPracticed)} />
          <StatLine label={t('soundStatAttempts')} value={String(stats.attempts)} />
          <StatLine label={t('soundStatTime')} value={`${minutes(stats.practiceMs)} min`} />
        </Card>

        {/* Parent information, kept below the practice grid so the child's part stays simple. */}
        <Card color={theme.colors.surfaceAlt}>
          <Text style={[styles.grownUpTitle, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            👪 {t('soundForGrownUps')}
          </Text>
          <Text style={[styles.grownUpBody, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('soundGrownUpNote')}
          </Text>
          <Text style={[styles.grownUpBody, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('soundNotTherapy')}
          </Text>
        </Card>
      </ScrollView>
    </ChildScreen>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  const sizes = useSizes();
  const theme = useTheme();
  return (
    <View style={styles.statRow} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.statLabel, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>
      <Text style={[styles.statValue, { fontSize: sizes.body + 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  subtitle: { fontFamily: Fonts.semibold, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  letter: { fontFamily: Fonts.black },
  tileEmoji: { fontSize: 22, lineHeight: 28 },
  practice: { fontFamily: Fonts.semibold, fontSize: 14 },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  statLabel: { fontFamily: Fonts.semibold, flexShrink: 1 },
  statValue: { fontFamily: Fonts.black },
  grownUpTitle: { fontFamily: Fonts.extrabold, marginBottom: SPACING.sm },
  grownUpBody: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 21, marginBottom: SPACING.sm },
});
