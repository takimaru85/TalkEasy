import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BigButton, Celebration, ChildScreen } from '@/components/common';
import { LEARN_ACTIVITY_ART } from '@/learning/activityArt';
import { AnswerChoiceCard, AnswerChoiceGrid, AnswerFeedback, ProgressIndicator, QuestionCard, illustratedSet, useChoiceLayout } from '@/components/adaptive';
import { MAX_FONT_SCALE, SPACING, TAP_GUARD_MS } from '@/constants/sizes';
import { useProfile, personalize } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { learningRepo } from '@/database';
import { useAwardStars, useLearningConfigs, useSizes } from '@/hooks';
import { createRng, getActivity, getSubject } from '@/learning';
import type { Question } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';
import { speakWithSettings, stopSpeaking } from '@/services/speech';
import { Fonts, useTheme } from '@/theme';

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
  // The same balanced answer grid as Lessons and Speech Practice.
  const layout = useChoiceLayout(q?.options.length ?? 0);
  // When feedback appears it sits under the answers; bring it into view on short phones.
  const scrollRef = useRef<ScrollView>(null);
  const feedbackShown = phase === 'correct' || phase === 'retry' || phase === 'reveal';
  useEffect(() => {
    if (feedbackShown) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: theme.duration(1) > 0 }), 60);
  }, [feedbackShown, phase, theme]);

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

  const hasPictures = q.options.some((o) => !!o.emoji);
  const illustrated = illustratedSet(q.options.map((o) => o.emoji));
  const feedback =
    phase === 'correct' ? { kind: 'correct' as const, text: `Correct! Great job, ${displayName}!` }
    : phase === 'retry' ? { kind: 'retry' as const, text: 'Not quite — try again!' }
    : phase === 'reveal' ? { kind: 'reveal' as const, text: `The answer is: ${q.options[q.answer]?.label ?? ''}` }
    : null;

  return (
    <ChildScreen title={activity.title} emoji={subject.emoji} colorArt={LEARN_ACTIVITY_ART[activity.key]} back>
      <View style={[styles.progress, { paddingHorizontal: sizes.horizontalPadding }]}>
        <ProgressIndicator current={index + 1} total={questions.length} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]} keyboardShouldPersistTaps="handled">
        <QuestionCard question={q.prompt} image={q.promptEmoji} color={subject.color} onHear={() => say(q.speak ?? q.prompt, true)} />

        <Text style={[styles.kicker, { color: theme.night ? '#FFD166' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
          CHOOSE YOUR ANSWER
        </Text>

        <AnswerChoiceGrid columns={layout.columns}>
          {q.options.map((o, i) => {
            const isCorrect = i === q.answer;
            const isChosen = i === chosen;
            const showCorrect = (phase === 'correct' && isChosen) || (phase === 'reveal' && isCorrect);
            const showWrong = (phase === 'retry' || phase === 'reveal') && isChosen && !isCorrect;
            return (
              <AnswerChoiceCard
                key={`${index}-${i}`}
                label={o.label}
                emoji={o.emoji}
                accessibilityLabel={o.speak ?? o.label}
                pictureMode={hasPictures && layout.pictureMode}
                illustrated={illustrated}
                width={layout.width}
                disabled={phase === 'correct' || phase === 'reveal'}
                state={showCorrect ? 'correct' : showWrong ? 'wrong' : 'idle'}
                onPress={() => answer(i)}
              />
            );
          })}
        </AnswerChoiceGrid>

        <AnswerFeedback kind={feedback?.kind ?? null} text={feedback?.text ?? ''} />
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  progress: { paddingBottom: SPACING.xs },
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  kicker: { fontFamily: Fonts.black, fontSize: 13, letterSpacing: 1.2, textAlign: 'center', marginBottom: -SPACING.xs },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  doneStars: { fontSize: 64, lineHeight: 80 },
  doneTitle: { fontFamily: Fonts.black, textAlign: 'center' },
  doneSub: { fontFamily: Fonts.bold },
});
