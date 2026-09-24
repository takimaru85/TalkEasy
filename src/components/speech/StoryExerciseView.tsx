import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import type { StoryExercise } from '@/speechpractice/types';
import { Fonts, useTheme } from '@/theme';
import { ChooseExerciseView } from './ChooseExerciseView';
import type { PracticeKit } from './kit';

/**
 * Story Practice: a few picture pages read aloud, then simple Who / What / Where questions.
 * The child moves through pages with a button, at their own pace; every page can be heard again.
 */
export function StoryExerciseView({ exercise, kit }: { exercise: StoryExercise; kit: PracticeKit }) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const [page, setPage] = useState(0);
  const [question, setQuestion] = useState(-1);
  const [solved, setSolved] = useState(false);
  const reading = question < 0;
  const current = exercise.pages[page];

  // Read each page aloud as it opens.
  useEffect(() => {
    if (reading && current) kit.play([{ id: `${exercise.id}-p${page}`, text: current.text }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, reading]);

  if (reading) {
    const last = page === exercise.pages.length - 1;
    return (
      <View style={styles.wrap}>
        <Text style={[styles.title, { fontSize: sizes.heading - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
          {exercise.title}
        </Text>
        <Card color={theme.colors.primarySoft} style={styles.page}>
          <Text style={[styles.picture, { fontSize: sizes.iconSize + 16, lineHeight: sizes.iconSize + 36 }]} allowFontScaling={false} accessible={false}>
            {current.picture}
          </Text>
          <Text style={[styles.text, { fontSize: sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {current.text}
          </Text>
          <Text style={[styles.pageNo, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('spPage', { n: page + 1, total: exercise.pages.length })}
          </Text>
        </Card>
        <BigButton label={t('actionHearAgain')} icon="volume-high" variant="secondary" minHeight={72} onPress={() => kit.play([{ id: 'page', text: current.text }])} />
        <View style={styles.row}>
          {page > 0 ? (
            <BigButton label={t('actionBack')} icon="arrow-left" variant="outline" minHeight={72} style={styles.half} onPress={() => setPage(page - 1)} />
          ) : null}
          <BigButton
            label={last ? t('spQuestionTime') : t('actionNext')}
            icon={last ? 'comment-question' : 'arrow-right'}
            minHeight={72}
            style={styles.half}
            onPress={() => {
              kit.attempt(current.text);
              if (last) {
                setQuestion(0);
                kit.speakUi(t('spQuestionTime'));
              } else setPage(page + 1);
            }}
          />
        </View>
      </View>
    );
  }

  const q = exercise.questions[question];
  const lastQuestion = question === exercise.questions.length - 1;
  return (
    <View style={styles.wrap}>
      <SectionTitle title={t('spQuestionTime')} emoji="💬" trailing={t('spProgress', { n: question + 1, total: exercise.questions.length })} />
      <ChooseExerciseView
        key={q.id}
        exercise={q}
        kit={kit}
        onSolved={() => {
          setSolved(true);
          if (lastQuestion) kit.finish();
        }}
      />
      {!lastQuestion ? (
        <BigButton
          label={t('actionNextQuestion')}
          icon="arrow-right"
          variant={solved ? 'success' : 'outline'}
          minHeight={72}
          onPress={() => {
            setSolved(false);
            setQuestion(question + 1);
            kit.play(exercise.questions[question + 1].listen);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.md },
  title: { fontFamily: Fonts.black, textAlign: 'center' },
  page: { alignItems: 'center', gap: SPACING.sm },
  picture: { textAlign: 'center' },
  text: { fontFamily: Fonts.black, textAlign: 'center' },
  pageNo: { fontFamily: Fonts.semibold, fontSize: 14 },
  row: { flexDirection: 'row', gap: SPACING.sm },
  half: { flex: 1 },
});
