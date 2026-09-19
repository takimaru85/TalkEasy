import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BigButton, ChildScreen, Icon } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING, TAP_GUARD_MS } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { learningRepo } from '@/database';
import { useLearningConfigs, useSizes } from '@/hooks';
import { createRng, getActivity, getSubject } from '@/learning';
import type { Question } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';
import { speakWithSettings, stopSpeaking } from '@/services/speech';

type Phase = 'asking' | 'correct' | 'retry' | 'reveal' | 'done';

/**
 * Practice session: one question at a time, big answer buttons, spoken prompts.
 * A wrong tap gets one gentle "try again" (mis-taps are common with motor difficulties);
 * a second wrong tap reveals the answer. Score counts first-try correct answers.
 * The next question appears automatically — no "Next" button to find.
 */
export function LearnActivityScreen({ navigation, route }: RootScreenProps<'LearnActivity'>) {
  const sizes = useSizes();
  const { settings } = useSettings();
  const { data: configs, loading: configsLoading } = useLearningConfigs();
  const activity = getActivity(route.params.activityKey);
  const subject = activity ? getSubject(activity.subjectKey) : undefined;

  const difficulty = configs.get(route.params.activityKey)?.difficulty ?? settings.learningDifficulty;
  const [seed, setSeed] = useState(() => Date.now());
  const questions = useMemo<Question[]>(
    () => (activity && !configsLoading ? activity.generate(difficulty, createRng(seed)) : []),
    [activity, difficulty, seed, configsLoading],
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('asking');
  const [chosen, setChosen] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(true);
  const [score, setScore] = useState(0);
  const lastTap = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions[index];

  const say = useCallback((text: string) => speakWithSettings(text, settings), [settings]);

  // Read each new question aloud.
  useEffect(() => {
    if (q && phase === 'asking') say(q.speak ?? q.prompt.replace(/____/g, 'blank'));
  }, [q, phase, say]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    stopSpeaking();
  }, []);

  const haptic = (ok: boolean) => {
    if (!settings.hapticsEnabled) return;
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
  };

  const advance = (nextScore: number) => {
    timer.current = setTimeout(() => {
      if (index + 1 >= questions.length) {
        setPhase('done');
        if (activity) {
          learningRepo
            .recordSession({ activityKey: activity.key, subjectKey: activity.subjectKey, difficulty, correct: nextScore, total: questions.length })
            .catch(() => {});
        }
        say(nextScore === questions.length ? 'Amazing! You got them all!' : nextScore >= questions.length / 2 ? 'Good job!' : 'Good try! Let\'s practise again.');
      } else {
        setIndex((i) => i + 1);
        setChosen(null);
        setFirstTry(true);
        setPhase('asking');
      }
    }, phase === 'reveal' ? 2200 : 1500);
  };

  const answer = (i: number) => {
    const now = Date.now();
    if (now - lastTap.current < TAP_GUARD_MS) return;
    lastTap.current = now;
    if (!q || (phase !== 'asking' && phase !== 'retry')) return;

    setChosen(i);
    if (i === q.answer) {
      const nextScore = firstTry ? score + 1 : score;
      setScore(nextScore);
      setPhase('correct');
      haptic(true);
      say(q.explain ?? 'Yes! Correct!');
      advance(nextScore);
    } else if (firstTry) {
      setFirstTry(false);
      setPhase('retry');
      haptic(false);
      say('Not quite. Try again.');
    } else {
      setPhase('reveal');
      haptic(false);
      const correct = q.options[q.answer];
      say(`The answer is ${correct.speak ?? correct.label}.`);
      advance(score);
    }
  };

  const restart = () => {
    setSeed(Date.now());
    setIndex(0);
    setScore(0);
    setChosen(null);
    setFirstTry(true);
    setPhase('asking');
  };

  if (!activity || !subject) return <ChildScreen title="Learn" back />;

  if (phase === 'done') {
    const pct = questions.length ? score / questions.length : 0;
    const starText = pct >= 0.99 ? '⭐⭐⭐' : pct >= 0.66 ? '⭐⭐' : pct >= 0.34 ? '⭐' : '💪';
    return (
      <ChildScreen title={activity.title} back>
        <View style={[styles.done, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Text style={styles.doneStars} allowFontScaling={false}>{starText}</Text>
          <Text style={[styles.doneTitle, { fontSize: sizes.phrase }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {score} out of {questions.length}
          </Text>
          <Text style={[styles.doneSub, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {pct >= 0.99 ? 'Amazing!' : pct >= 0.5 ? 'Good job!' : 'Good try! Practise again.'}
          </Text>
          <BigButton label="Play again" icon="replay" minHeight={88} onPress={restart} />
          <BigButton label="Back" icon="arrow-left" variant="secondary" minHeight={72} onPress={() => navigation.goBack()} />
        </View>
      </ChildScreen>
    );
  }

  if (!q) return <ChildScreen title={activity.title} back />;

  const twoWide = q.options.length >= 3 && q.options.every((o) => o.label.length <= 12);

  return (
    <ChildScreen title={activity.title} back>
      <View style={styles.progress} accessibilityLabel={`Question ${index + 1} of ${questions.length}`}>
        {questions.map((_, i) => (
          <View key={i} style={[styles.dot, i < index && styles.dotDone, i === index && styles.dotNow]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: subject.color }]}>
          {q.promptEmoji ? (
            <Text style={[styles.promptEmoji, { fontSize: q.promptEmoji.length > 6 ? sizes.iconSize - 6 : sizes.iconSize + 28 }]} allowFontScaling={false}>
              {q.promptEmoji}
            </Text>
          ) : null}
          <Text style={[styles.prompt, { fontSize: q.prompt.length > 60 ? sizes.body + 4 : sizes.phrase - 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {q.prompt}
          </Text>
          <Pressable onPress={() => say(q.speak ?? q.prompt)} accessibilityRole="button" accessibilityLabel="Hear the question again" hitSlop={6} style={styles.hear}>
            <Icon name="volume-high" size={30} color={Colors.textOnDark} />
            <Text style={styles.hearText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Hear again</Text>
          </Pressable>
        </View>

        {phase === 'retry' ? (
          <Text style={[styles.feedback, styles.feedbackRetry, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Not quite — try again!</Text>
        ) : phase === 'correct' ? (
          <Text style={[styles.feedback, styles.feedbackOk, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>✅ Correct!</Text>
        ) : phase === 'reveal' ? (
          <Text style={[styles.feedback, styles.feedbackRetry, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>The answer is highlighted.</Text>
        ) : (
          <Text style={[styles.feedback, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Tap your answer</Text>
        )}

        <View style={[styles.options, twoWide && styles.optionsGrid, { gap: sizes.gap }]}>
          {q.options.map((o, i) => {
            const isCorrect = i === q.answer;
            const isChosen = i === chosen;
            const showCorrect = (phase === 'correct' && isChosen) || (phase === 'reveal' && isCorrect);
            const showWrong = (phase === 'retry' || phase === 'reveal') && isChosen && !isCorrect;
            return (
              <Pressable
                key={`${index}-${i}`}
                onPress={() => answer(i)}
                accessibilityRole="button"
                accessibilityLabel={o.speak ?? o.label}
                accessibilityState={{ selected: isChosen }}
                hitSlop={4}
                style={({ pressed }) => [
                  styles.option,
                  { minHeight: Math.max(sizes.tileHeight * 0.7, 88), width: twoWide ? '48%' : '100%' },
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                  pressed && phase === 'asking' && styles.pressed,
                ]}
              >
                {o.emoji ? <Text style={[styles.optionEmoji, { fontSize: sizes.iconSize }]} allowFontScaling={false}>{o.emoji}</Text> : null}
                <Text style={[styles.optionLabel, { fontSize: o.label.length > 18 ? sizes.body + 2 : sizes.tileLabel + 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={3} adjustsFontSizeToFit>
                  {o.label}
                </Text>
                {showCorrect ? <Icon name="check-circle" size={34} color={Colors.success} /> : null}
                {showWrong ? <Icon name="close-circle" size={34} color={Colors.danger} /> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: SPACING.xs },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#DADADA', borderWidth: 1, borderColor: Colors.border },
  dotDone: { backgroundColor: Colors.success },
  dotNow: { backgroundColor: Colors.selected, transform: [{ scale: 1.25 }] },
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  card: {
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  promptEmoji: { textAlign: 'center', lineHeight: 96 },
  prompt: { fontWeight: '800', color: Colors.text, textAlign: 'center', lineHeight: 40 },
  hear: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: 56,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.button,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.primaryDark,
  },
  hearText: { color: Colors.textOnDark, fontWeight: '800', fontSize: 18 },
  feedback: { textAlign: 'center', fontWeight: '800', color: Colors.textMuted },
  feedbackOk: { color: Colors.success },
  feedbackRetry: { color: Colors.warning },
  options: { gap: SPACING.md },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  optionCorrect: { backgroundColor: '#C4F2C8', borderColor: Colors.success, borderWidth: 5 },
  optionWrong: { backgroundColor: '#FFE0E0', borderColor: Colors.danger, borderWidth: 5 },
  pressed: { backgroundColor: Colors.selected },
  optionEmoji: { lineHeight: 72 },
  optionLabel: { fontWeight: '800', color: Colors.text, textAlign: 'center', flexShrink: 1 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  doneStars: { fontSize: 64, lineHeight: 80 },
  doneTitle: { fontWeight: '900', color: Colors.text },
  doneSub: { color: Colors.textMuted, fontWeight: '700' },
});
