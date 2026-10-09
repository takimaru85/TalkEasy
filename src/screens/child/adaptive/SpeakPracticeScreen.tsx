import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SpeechAnswer } from '@/components/adaptive';
import { BigButton, Card, Celebration, ChildScreen, Icon, PressableScale } from '@/components/common';
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
  const { t, speechTag } = useI18n();
  const theme = useTheme();
  const { displayName } = useProfile();
  const { speakFeedback } = useSpeak();
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ text: string; ok: boolean | null } | null>(null);
  const [burst, setBurst] = useState(0);
  const prompt = PROMPTS[index % PROMPTS.length];
  const available = isSpeechRecognitionAvailable(speechTag);

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
    <ChildScreen title={t('titleSpeakAnswer')} emoji="🎤" art="speech" back>
      <Celebration trigger={burst} />
      <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
      {/* A plain View, sized by its own content. It used to be a Card + BigButton in a flex column, and on a phone that
          card grew to fill the whole screen and pushed the answer controls out of view. */}
      <View
        style={[
          styles.qCard,
          {
            backgroundColor: theme.night ? 'rgba(40,86,200,0.96)' : theme.tint(theme.colors.primarySoft),
            // A hard ceiling: emoji + two lines of question + the button + gaps + padding. Whatever the phone's layout engine
            // decides, the card can never grow past what it actually holds.
            maxHeight: 70 + Math.round((sizes.phrase - 4) * 1.4) * 2 + 56 + SPACING.sm * 2 + SPACING.lg * 2 + 8,
          },
        ]}
      >
        <Text style={styles.emoji} allowFontScaling={false}>{prompt.emoji}</Text>
        <Text style={[styles.question, { fontSize: sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{prompt.question}</Text>
        <PressableScale
          onPress={() => speakFeedback(prompt.question)}
          accessibilityRole="button"
          accessibilityLabel={t('actionHearAgain')}
          hitSlop={6}
        >
          <View style={styles.hear}>
            <Icon name="volume-high" size={26} color="#FFFFFF" />
            <Text style={styles.hearText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('actionHearAgain')}</Text>
          </View>
        </PressableScale>
      </View>

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
            Tip for parents: speech-to-text works only in the installed app (not Expo Go), on phones that support offline speech recognition. The audio is processed on the phone only.
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
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  qCard: { alignSelf: 'stretch', flexGrow: 0, flexShrink: 0, alignItems: 'center', gap: SPACING.sm, padding: SPACING.lg, borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  hear: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.xl, borderRadius: 999, borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)' },
  hearText: { fontFamily: Fonts.extrabold, fontSize: 20, color: '#FFFFFF' },
  emoji: { fontSize: 56, lineHeight: 70 },
  question: { fontFamily: Fonts.black, textAlign: 'center' },
  recorded: { fontFamily: Fonts.extrabold, textAlign: 'center', marginBottom: SPACING.sm },
  answer: { fontFamily: Fonts.black, textAlign: 'center', marginBottom: SPACING.md },
  note: { fontFamily: Fonts.semibold, fontSize: 14, textAlign: 'center' },
});
