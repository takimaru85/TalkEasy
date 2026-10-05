import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ScreenContainer, ScreenHeader, SectionTitle, StatTile } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useAchievements, useAdventureMap, useSizes, useTodayAdventure } from '@/hooks';
import { useI18n } from '@/i18n';
import {
  CAREGIVER_TIPS,
  PRACTICE_VS_PROGRESS,
  SUPPLEMENT_NOTICE,
  isEmptyHistory,
  overviewSentence,
  suggestionSentence,
} from '@/adventure/parentOverview';
import type { ParentScreenProps } from '@/navigation/types';

/**
 * Practice overview for caregivers: what the app has recorded, an optional idea for today and a few
 * home tips. Every number is a count the child's practice already produced (useAchievements and the
 * Adventure Map hook); nothing is scored, compared or turned into an assessment, and there is no
 * streak, so a missed day never shows up as a loss.
 */
export function PracticeOverviewScreen({ navigation }: ParentScreenProps<'PracticeOverview'>) {
  const sizes = useSizes();
  const { t } = useI18n();
  const { metrics, loading } = useAchievements();
  const { stages, ready } = useAdventureMap();
  const today = useTodayAdventure();

  const counts = {
    words: metrics.wordsPractised,
    sounds: metrics.soundsPractised,
    speechExercises: metrics.speechExercises,
    tracingSessions: metrics.tracingSessions,
  };
  const empty = isEmptyHistory(counts);
  const body = { fontSize: sizes.body - 2 };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Practice overview" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={[styles.text, body]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {loading ? 'Loading…' : overviewSentence(counts)}
        </Text>

        {!loading && !empty ? (
          <>
            <SectionTitle title="Practice recorded" emoji="📊" />
            <View style={styles.stats}>
              <StatTile label="Different words" value={counts.words} color="#C4F2C8" emoji="🔤" />
              <StatTile label="Different sounds" value={counts.sounds} color="#BFE0FF" emoji="🔊" />
              <StatTile label="Speech exercises" value={counts.speechExercises} color="#E8DFFF" emoji="🎤" />
              <StatTile label="Tracing sessions" value={counts.tracingSessions} color="#FFF3A8" emoji="✏️" />
            </View>
          </>
        ) : null}

        {ready ? (
          <>
            <SectionTitle title="Space Adventure Map" emoji="🚀" />
            {stages.map((s) => (
              <Text key={s.def.id} style={[styles.text, body]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {`${t(s.def.titleKey)}: ${s.count} of ${s.def.goal}${s.done ? ' ✓' : ''}`}
              </Text>
            ))}
          </>
        ) : null}

        <Text style={[styles.note, body]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{PRACTICE_VS_PROGRESS}</Text>

        <SectionTitle title="An idea for today (optional)" emoji="🌤️" />
        <Text style={[styles.text, body]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {suggestionSentence(today.activities, today.estimatedMinutes)}
        </Text>
        <BigButton label="Open Practice Time" onPress={() => navigation.navigate('PracticeSession')} />

        <SectionTitle title="Tips for practising at home" emoji="💡" />
        {CAREGIVER_TIPS.map((tip) => (
          <Text key={tip} style={[styles.text, body]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{`• ${tip}`}</Text>
        ))}

        <Text style={[styles.note, body]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{SUPPLEMENT_NOTICE}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  text: { color: Colors.text },
  note: { color: Colors.textMuted },
});
