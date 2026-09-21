import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, ChildScreen, EmptyState, PressableScale, ProgressBar, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useAdaptiveProgress, useSizes, useSpeak, useToday, useTodayLessons } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';

/**
 * Adaptive Learning dashboard: "Hi, Brayden!", today's schoolwork (one big card per lesson
 * with Start / Continue / ✅ Completed), Writing Practice, Speak Your Answer, and learning
 * progress. Handwriting progress is shown separately from learning progress on purpose.
 */
export function AdaptiveHomeScreen({ navigation }: RootScreenProps<'AdaptiveHome'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { displayName } = useProfile();
  const { isoDate } = useToday();
  const { data: lessons, loading } = useTodayLessons(isoDate);
  const { data: progress } = useAdaptiveProgress();
  const { speakFeedback } = useSpeak();

  const doneToday = lessons.filter((l) => l.activityCount > 0 && l.completedCount >= l.activityCount).length;
  const encouragement =
    progress.learningPercent >= 80 ? 'Great job! 🌟' : progress.learningPercent >= 50 ? "You're making progress! 👏" : progress.questionsAnswered > 0 ? 'Keep going! 💪' : "Let's start! 🚀";

  return (
    <ChildScreen title="Lessons" emoji="🎓">
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <Text style={[styles.hi, { fontSize: sizes.heading + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          👋 Hi, {displayName}!
        </Text>

        <SectionTitle title="Today's schoolwork" emoji="📝" trailing={lessons.length ? `${doneToday} / ${lessons.length}` : undefined} />
        {!loading && lessons.length === 0 ? (
          <EmptyState icon="school-outline" title="No lessons yet" message="A parent or teacher can add lessons in Parent Mode." />
        ) : null}
        {lessons.map((l) => {
          const complete = l.activityCount > 0 && l.completedCount >= l.activityCount;
          const started = l.completedCount > 0 && !complete;
          return (
            <PressableScale
              key={l.id}
              onPress={() => {
                speakFeedback(`${l.subjectName}. ${l.title}`);
                navigation.navigate('AdaptiveLesson', { lessonId: l.id });
              }}
              accessibilityRole="button"
              accessibilityLabel={`${l.subjectName}: ${l.title}. ${complete ? 'Completed' : started ? `Continue, ${l.completedCount} of ${l.activityCount} done` : 'Start'}`}
            >
              <Card color={complete ? theme.colors.surfaceAlt : l.subjectColor} style={styles.lessonCard}>
                <Text style={[styles.lessonEmoji, { fontSize: sizes.iconSize - 6 }]} allowFontScaling={false}>{complete ? '✅' : l.subjectIcon}</Text>
                <View style={styles.lessonText}>
                  <Text style={[styles.lessonSubject, { fontSize: sizes.body - 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{l.subjectName}</Text>
                  <Text style={[styles.lessonTitle, { fontSize: sizes.tileLabel + 1, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{l.title}</Text>
                  {l.activityCount > 0 ? <Text style={[styles.lessonMeta, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{l.completedCount} / {l.activityCount} questions</Text> : null}
                </View>
                <View style={[styles.cta, { backgroundColor: complete ? theme.colors.success : theme.colors.primary }]}>
                  <Text style={styles.ctaText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{complete ? 'Done' : started ? 'Continue' : 'Start'}</Text>
                </View>
              </Card>
            </PressableScale>
          );
        })}

        <SectionTitle title="Practice" emoji="✨" />
        <View style={styles.row}>
          <BigButton label="Writing practice" icon="pencil" variant="secondary" minHeight={92} onPress={() => navigation.navigate('WritingPractice')} style={styles.half} />
          <BigButton label="Speak your answer" icon="microphone" variant="secondary" minHeight={92} onPress={() => navigation.navigate('SpeakPractice')} style={styles.half} />
        </View>
        <BigButton label="All subjects" icon="book-open-variant" variant="outline" minHeight={64} onPress={() => navigation.navigate('AdaptiveSubjects')} />

        <SectionTitle title="Progress" emoji="📈" />
        <Card>
          <Text style={[styles.progressLabel, { color: theme.colors.text, fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Learning</Text>
          <ProgressBar value={progress.learningPercent / 100} label={`${progress.learningPercent}%`} color={theme.colors.success} accessibilityLabel={`Learning progress ${progress.learningPercent} percent`} />
          <Text style={[styles.encourage, { color: theme.colors.text, fontSize: sizes.body + 1 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{encouragement}</Text>
          <Text style={[styles.progressLabel, { color: theme.colors.textMuted, fontSize: sizes.body - 2, marginTop: SPACING.sm }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Writing practice: {progress.handwritingSessions} session{progress.handwritingSessions === 1 ? '' : 's'} · {progress.handwritingLevelsPractised.length} of 7 levels tried
          </Text>
        </Card>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  hi: { fontFamily: Fonts.black, textAlign: 'center' },
  lessonCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  lessonEmoji: { lineHeight: 60 },
  lessonText: { flex: 1, gap: 2 },
  lessonSubject: { fontFamily: Fonts.bold },
  lessonTitle: { fontFamily: Fonts.extrabold },
  lessonMeta: { fontFamily: Fonts.semibold, fontSize: 14 },
  cta: { minHeight: 56, minWidth: 96, paddingHorizontal: SPACING.md, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 18 },
  row: { flexDirection: 'row', gap: SPACING.sm },
  half: { flex: 1 },
  progressLabel: { fontFamily: Fonts.bold, marginBottom: 6 },
  encourage: { fontFamily: Fonts.extrabold, marginTop: SPACING.sm, textAlign: 'center' },
});
