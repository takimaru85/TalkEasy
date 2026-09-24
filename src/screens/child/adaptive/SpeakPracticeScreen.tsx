import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SpeechAnswer } from '@/components/adaptive';
import { BigButton, Card, Celebration, ChildScreen } from '@/components/common';
import { matchesFreeAnswer } from '@/adaptive/answers';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useSizes, useSpeak } from '@/hooks';
import { isSpeechRecognitionAvailable } from '@/services/speechRecognition';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { useI18n } from '@/i18n';

const PROMPTS: { question: string; emoji: string; answers: string[] }[] = [
  { question: 'What is 5 + 5?', emoji: '🖐️🖐️', answers: ['10', 'ten'] },
  { question: 'What animal says woof?', emoji: '🐶', answers: ['dog', 'aso', 'puppy'] },
  { question: 'What colour is the sun?', emoji: '☀️', answers: ['yellow', 'orange'] },
  { question: 'Say your name.', emoji: '🙂', answers: [] },
  { question: 'What do plants drink?', emoji: '🌱', answers: ['water', 'rain'] },
  { question: 'How many fingers on one hand?', emoji: '🖐️', answers: ['5', 'five'] },
];

/**
 * Speak Your Answer practice: short questions answered out loud. With speech-to-text the
 * transcript is shown and confirmed; without it a grown-up taps ✓. Answers are checked
 * kindly — a sentence that contains the answer counts.
 */
export function SpeakPracticeScreen({ navigation }: RootScreenProps<'SpeakPractice'>) {
  const sizes = useSizes();
  const { t } = useI18n();
  const theme = useTheme();
  const { displayName } = useProfile();
  const { speakFeedback } = useSpeak();
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ text: string; ok: boolean | null } | null>(null);
  const [burst, setBurst] = useState(0);
  const prompt = PROMPTS[index % PROMPTS.length];
  const available = isSpeechRecognitionAvailable();

  const finish = (text: string, ok: boolean | null) => {
    setResult({ text, ok });
    if (ok !== false) {
      setBurst((b) => b + 1);
      speakFeedback(`${t('answerRecorded')}. ${t('greatJob', { name: displayName })}`);
    } else speakFeedback(t('letsTryAgain'));
  };

  const nextQuestion = () => {
    setResult(null);
    setIndex((i) => i + 1);
    speakFeedback(PROMPTS[(index + 1) % PROMPTS.length].question);
  };

  return (
    <ChildScreen title={t('titleSpeakAnswer')} emoji="🎤" back>
      <Celebration trigger={burst} />
      <View style={[styles.questionWrap, { paddingHorizontal: sizes.horizontalPadding }]}>
        <Card color={theme.colors.primarySoft} style={styles.qCard}>
          <Text style={styles.emoji} allowFontScaling={false}>{prompt.emoji}</Text>
          <Text style={[styles.question, { fontSize: sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{prompt.question}</Text>
          <BigButton label={t('actionHearAgain')} icon="volume-high" variant="secondary" minHeight={56} fullWidth={false} style={styles.centred} onPress={() => speakFeedback(prompt.question)} />
        </Card>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        {result ? (
          <Card>
            <Text style={[styles.recorded, { color: result.ok === false ? theme.colors.danger : theme.colors.success, fontSize: sizes.body + 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {result.ok === false ? `↻ ${t('answerNotQuite')}` : `✅ ${t('answerRecorded')}`}
            </Text>
            {result.text ? (
              <Text style={[styles.answer, { fontSize: sizes.phrase, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('answerLabel')}: {result.text.toUpperCase()}
              </Text>
            ) : null}
            <BigButton label={result.ok === false ? t('actionTryAgain') : t('actionNextQuestion')} icon={result.ok === false ? 'replay' : 'arrow-right'} minHeight={72} onPress={result.ok === false ? () => setResult(null) : nextQuestion} />
          </Card>
        ) : (
          <SpeechAnswer
            key={index}
            onUseAnswer={(text) => finish(text, prompt.answers.length ? matchesFreeAnswer(text, prompt.answers) : null)}
            onAssistedResult={(ok) => finish('', ok)}
          />
        )}

        {!available ? (
          <Text style={[styles.note, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Tip for parents: speech-to-text works in the installed app (not Expo Go) and runs on the device only.
          </Text>
        ) : null}
        <BigButton label={t('actionDoneForNow')} variant="outline" minHeight={56} onPress={() => navigation.goBack()} />
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // flexGrow 0 + flexShrink 0: the question sizes to its own content and never borrows
  // height from the answer controls below it.
  questionWrap: { flexGrow: 0, flexShrink: 0, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  qCard: { alignItems: 'center', gap: SPACING.sm },
  centred: { alignSelf: 'center' },
  emoji: { fontSize: 56, lineHeight: 70 },
  question: { fontFamily: Fonts.black, textAlign: 'center' },
  recorded: { fontFamily: Fonts.extrabold, textAlign: 'center', marginBottom: SPACING.sm },
  answer: { fontFamily: Fonts.black, textAlign: 'center', marginBottom: SPACING.md },
  note: { fontFamily: Fonts.semibold, fontSize: 14, textAlign: 'center' },
});
