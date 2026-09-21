import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SpeechAnswer } from '@/components/adaptive';
import { BigButton, Card, Celebration, ChildScreen } from '@/components/common';
import { matchesFreeAnswer } from '@/adaptive/answers';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useSizes, useSpeak } from '@/hooks';
import { isSpeechRecognitionAvailable } from '@/services/speechRecognition';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';

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
      speakFeedback(`Answer recorded. Great job, ${displayName}!`);
    } else speakFeedback("Let's try that one again.");
  };

  const nextQuestion = () => {
    setResult(null);
    setIndex((i) => i + 1);
    speakFeedback(PROMPTS[(index + 1) % PROMPTS.length].question);
  };

  return (
    <ChildScreen title="Speak your answer" emoji="🎤" back>
      <Celebration trigger={burst} />
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <Card color={theme.colors.primarySoft} style={styles.qCard}>
          <Text style={styles.emoji} allowFontScaling={false}>{prompt.emoji}</Text>
          <Text style={[styles.question, { fontSize: sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{prompt.question}</Text>
          <BigButton label="Hear again" icon="volume-high" variant="secondary" minHeight={56} fullWidth={false} onPress={() => speakFeedback(prompt.question)} />
        </Card>

        {result ? (
          <Card>
            <Text style={[styles.recorded, { color: result.ok === false ? theme.colors.danger : theme.colors.success, fontSize: sizes.body + 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {result.ok === false ? '↻ Not quite — try again' : '✅ Answer recorded'}
            </Text>
            {result.text ? (
              <Text style={[styles.answer, { fontSize: sizes.phrase, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Answer: {result.text.toUpperCase()}
              </Text>
            ) : null}
            <BigButton label={result.ok === false ? 'Try again' : 'Next question'} icon={result.ok === false ? 'replay' : 'arrow-right'} minHeight={72} onPress={result.ok === false ? () => setResult(null) : nextQuestion} />
          </Card>
        ) : (
          <SpeechAnswer
            key={index}
            onUseAnswer={(t) => finish(t, prompt.answers.length ? matchesFreeAnswer(t, prompt.answers) : null)}
            onAssistedResult={(ok) => finish('', ok)}
          />
        )}

        {!available ? (
          <Text style={[styles.note, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Tip for parents: speech-to-text works in the installed app (not Expo Go) and runs on the device only.
          </Text>
        ) : null}
        <BigButton label="Done for now" variant="outline" minHeight={56} onPress={() => navigation.goBack()} />
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  qCard: { alignItems: 'center', gap: SPACING.sm },
  emoji: { fontSize: 56, lineHeight: 70 },
  question: { fontFamily: Fonts.black, textAlign: 'center' },
  recorded: { fontFamily: Fonts.extrabold, textAlign: 'center', marginBottom: SPACING.sm },
  answer: { fontFamily: Fonts.black, textAlign: 'center', marginBottom: SPACING.md },
  note: { fontFamily: Fonts.semibold, fontSize: 14, textAlign: 'center' },
});
