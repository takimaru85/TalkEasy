import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BigButton, Card, Celebration, ChildScreen, Icon } from '@/components/common';
import { MAX_FONT_SCALE, SPACING, TAP_GUARD_MS } from '@/constants/sizes';
import { useProfile, personalize } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { learningRepo } from '@/database';
import { useAwardStars, useLearningConfigs, useSizes } from '@/hooks';
import { createRng, getActivity, getSubject } from '@/learning';
import type { Question } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';
import { speakWithSettings, stopSpeaking } from '@/services/speech';
import { Fonts, Radius, useTheme } from '@/theme';

type Phase = 'asking' | 'correct' | 'retry' | 'reveal' | 'done';

/**
 * Practice session: one question at a time, big answer cards, spoken prompts.
 * A wrong tap gets one gentle "try again" (mis-taps are common with motor difficulties);
 * a second wrong tap reveals the answer. Score counts first-try correct answers.
 * Correct answers are celebrated with the child's name; finishing earns stars.
 */
export function LearnActivityScreen({ navigation, route }: RootScreenProps<'LearnActivity'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { settings } = useSettings();
  const { profile, displayName } = useProfile();
  const { data: configs, loading: configsLoading } = useLearningConfigs();
  const award = useAwardStars();
  const activity = getActivity(route.params.activityKey);
  const subject = activity ? getSubject(activity.subjectKey) : undefined;

  const difficulty = configs.get(route.params.activityKey)?.difficulty ?? profile.difficulty;
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
  const [burst, setBurst] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const lastTap = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions[index];

  const say = useCallback(
    (text: string, force = false) => {
      if (!force && !settings.soundEnabled) return Promise.resolve();
      return speakWithSettings(text, settings);
    },
    [settings],
  );

  // Read each new question aloud (questions are content, so they always speak).
  useEffect(() => {
    if (q && phase === 'asking') say(q.speak ?? q.prompt.replace(/____/g, 'blank'), true);
  }, [q, phase, say]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    stopSpeaking();
  }, []);

  const haptic = (ok: boolean) => {
    if (!settings.hapticsEnabled) return;
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
  };

  const finish = async (finalScore: number) => {
    setPhase('done');
    if (!activity) return;
    learningRepo
      .recordSession({ activityKey: activity.key, subjectKey: activity.subjectKey, difficulty, correct: finalScore, total: questions.length })
      .catch(() => {});
    let earned = await award('learning', activity.title);
    if (finalScore === questions.length) earned += await award('perfect', `${activity.title} (perfect)`);
    setStarsEarned(earned);
    setBurst((b) => b + 1);
    const line =
      finalScore === questions.length
        ? `Amazing, ${displayName}! You got them all!`
        : finalScore >= questions.length / 2
          ? personalize(profile.rewards.celebrationMessage, displayName).replace(/[^\w\s'!.,]/g, '')
          : `Good try, ${displayName}! Let's practise again.`;
    say(`${line}${earned > 0 ? ` You earned ${earned} star${earned === 1 ? '' : 's'}.` : ''}`);
  };

  const advance = (nextScore: number) => {
    timer.current = setTimeout(() => {
      if (index + 1 >= questions.length) {
        finish(nextScore);
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
      say(q.explain ? `${q.explain} Great job, ${displayName}!` : `Yes! Great job, ${displayName}!`);
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
    setStarsEarned(0);
    setPhase('asking');
  };

  if (!activity || !subject) return <ChildScreen title="Learn" back />;

  if (phase === 'done') {
    const pct = questions.length ? score / questions.length : 0;
    const starText = pct >= 0.99 ? '⭐⭐⭐' : pct >= 0.66 ? '⭐⭐' : pct >= 0.34 ? '⭐' : '💪';
    return (
      <ChildScreen title={activity.title} back>
        <Celebration trigger={burst} />
        <View style={[styles.done, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Text style={styles.doneStars} allowFontScaling={false}>{starText}</Text>
          <Text style={[styles.doneTitle, { fontSize: sizes.phrase, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {pct >= 0.99 ? `Amazing, ${displayName}!` : pct >= 0.5 ? `Great job, ${displayName}!` : `Good try, ${displayName}!`}
          </Text>
          <Text style={[styles.doneSub, { fontSize: sizes.body + 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {score} out of {questions.length} correct{starsEarned > 0 ? ` · +${starsEarned} ⭐` : ''}
          </Text>
          <BigButton label="Play again" icon="replay" minHeight={88} onPress={restart} />
          <BigButton label="Back" icon="arrow-left" variant="outline" minHeight={72} onPress={() => navigation.goBack()} />
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
          <View key={i} style={[styles.dot, { backgroundColor: i < index ? theme.colors.success : i === index ? theme.colors.selected : theme.colors.surfaceAlt, borderColor: theme.highContrast ? theme.colors.border : 'transparent', borderWidth: theme.highContrast ? 1 : 0 }, i === index && styles.dotNow]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]} keyboardShouldPersistTaps="handled">
        <Card color={subject.color} style={styles.card}>
          {q.promptEmoji ? (
            <Text style={[styles.promptEmoji, { fontSize: q.promptEmoji.length > 6 ? sizes.iconSize - 6 : sizes.iconSize + 28 }]} allowFontScaling={false}>
              {q.promptEmoji}
            </Text>
          ) : null}
          <Text style={[styles.prompt, { fontSize: q.prompt.length > 60 ? sizes.body + 4 : sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {q.prompt}
          </Text>
          <Pressable onPress={() => say(q.speak ?? q.prompt, true)} accessibilityRole="button" accessibilityLabel="Hear the question again" hitSlop={6} style={[styles.hear, { backgroundColor: theme.colors.primary }]}>
            <Icon name="volume-high" size={28} color="#FFFFFF" />
            <Text style={styles.hearText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Hear again</Text>
          </Pressable>
        </Card>

        <Text
          style={[
            styles.feedback,
            { fontSize: sizes.body + 2, color: phase === 'correct' ? theme.colors.success : phase === 'asking' ? theme.colors.textMuted : theme.colors.danger },
          ]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLiveRegion="polite"
        >
          {phase === 'retry' ? '↻ Not quite — try again!' : phase === 'correct' ? `✅ Correct! Great job, ${displayName}!` : phase === 'reveal' ? '💡 The answer is highlighted.' : 'Tap your answer'}
        </Text>

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
                  theme.shadow,
                  {
                    minHeight: Math.max(sizes.tileHeight * 0.7, 88),
                    width: twoWide ? '48%' : '100%',
                    backgroundColor: showCorrect ? theme.colors.successSoft : showWrong ? '#FFE0E0' : theme.colors.surface,
                    borderColor: showCorrect ? theme.colors.success : showWrong ? theme.colors.danger : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
                    borderWidth: showCorrect || showWrong ? 4 : theme.highContrast ? theme.borderWidth : 1.5,
                  },
                  pressed && phase === 'asking' && { backgroundColor: theme.tint(theme.colors.primarySoft) },
                ]}
              >
                {o.emoji ? <Text style={[styles.optionEmoji, { fontSize: sizes.iconSize }]} allowFontScaling={false}>{o.emoji}</Text> : null}
                <Text style={[styles.optionLabel, { fontSize: o.label.length > 18 ? sizes.body + 2 : sizes.tileLabel + 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={3} adjustsFontSizeToFit>
                  {o.label}
                </Text>
                {showCorrect ? <Icon name="check-circle" size={34} color={theme.colors.success} /> : null}
                {showWrong ? <Icon name="close-circle" size={34} color={theme.colors.danger} /> : null}
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
  dot: { width: 14, height: 14, borderRadius: 7 },
  dotNow: { transform: [{ scale: 1.25 }] },
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  card: { alignItems: 'center', gap: SPACING.sm },
  promptEmoji: { textAlign: 'center', lineHeight: 96 },
  prompt: { fontFamily: Fonts.extrabold, textAlign: 'center', lineHeight: 40 },
  hear: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: 56, paddingHorizontal: SPACING.lg, borderRadius: Radius.pill },
  hearText: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 18 },
  feedback: { textAlign: 'center', fontFamily: Fonts.extrabold },
  options: { gap: SPACING.md },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: Radius.lg },
  optionEmoji: { lineHeight: 72 },
  optionLabel: { fontFamily: Fonts.extrabold, textAlign: 'center', flexShrink: 1 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  doneStars: { fontSize: 64, lineHeight: 80 },
  doneTitle: { fontFamily: Fonts.black, textAlign: 'center' },
  doneSub: { fontFamily: Fonts.bold },
});
