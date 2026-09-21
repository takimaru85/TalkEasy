import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AnswerMethodPicker, BigKeyboard, ChoiceCard, ChoiceGrid, HandwritingCanvas, SpeechAnswer, TapMatch } from '@/components/adaptive';
import { BigButton, Card, Celebration, ChildScreen, Icon, ProgressBar } from '@/components/common';
import { acceptedAnswers, choicesForLevel, matchesFreeAnswer, orderedMethods } from '@/adaptive/answers';
import { ANSWER_METHOD_META, ASSISTANCE_META, type AnswerMethod, type LessonActivity } from '@/adaptive/types';
import { MAX_FONT_SCALE, SPACING, TAP_GUARD_MS } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { adaptiveProgressRepo } from '@/database';
import { useAwardStars, useCompletedActivityIds, useLesson, useLessonActivities, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { speakWithSettings, stopSpeaking } from '@/services/speech';
import { Fonts, Radius, useTheme } from '@/theme';

type Phase = 'intro' | 'question' | 'correct' | 'retry' | 'reveal' | 'summary';

/**
 * Lesson runner. One question at a time; the child picks HOW to answer (tap, picture, match,
 * type, speak, write, or tell a grown-up) from the methods the parent/teacher allowed.
 * A wrong answer gets one gentle retry with the hint; the objective never changes.
 */
export function AdaptiveLessonScreen({ navigation, route }: RootScreenProps<'AdaptiveLesson'>) {
  const { lessonId } = route.params;
  const sizes = useSizes();
  const theme = useTheme();
  const { settings } = useSettings();
  const { profile, displayName } = useProfile();
  const { data: lesson } = useLesson(lessonId);
  const { data: activities, loading } = useLessonActivities(lessonId);
  const { data: completedIds } = useCompletedActivityIds(lessonId);
  const { speakFeedback } = useSpeak();
  const award = useAwardStars();
  const level = ASSISTANCE_META[profile.assistanceLevel];

  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [queue, setQueue] = useState<LessonActivity[] | null>(null);
  const [method, setMethod] = useState<AnswerMethod>('tap');
  const [attempt, setAttempt] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [burst, setBurst] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [strokeWidth, setStrokeWidth] = useState(14);
  const lastTap = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activity = queue?.[index];
  const methods = useMemo(() => (activity ? orderedMethods(activity, profile.preferredMethod, profile.assistanceLevel) : []), [activity, profile.preferredMethod, profile.assistanceLevel]);
  const choices = useMemo(() => (activity ? choicesForLevel(activity.choices, profile.assistanceLevel) : []), [activity, profile.assistanceLevel]);
  const multiSelect = choices.filter((c) => c.correct).length > 1;

  const say = useCallback((text: string, force = false) => (force || settings.soundEnabled ? speakWithSettings(text, settings) : Promise.resolve()), [settings]);

  // Build the queue once activities load: unfinished first, then (if all done) everything again.
  useEffect(() => {
    if (loading || queue !== null || activities.length === 0) return;
    const todo = activities.filter((a) => !completedIds.has(a.id));
    setQueue(todo.length ? todo : activities);
  }, [loading, activities, completedIds, queue]);

  // Reset per-question state and read the question aloud — once per activity (a retry
  // returns to 'question' without resetting the attempt counter).
  const startedFor = useRef<number | null>(null);
  useEffect(() => {
    if (!activity || phase !== 'question' || startedFor.current === activity.id) return;
    startedFor.current = activity.id;
    setMethod(methods[0] ?? 'assisted');
    setSelected([]);
    setWrongIdx(null);
    setTyped('');
    setAttempt(1);
    setShowHint(level.hintAlways);
    say(activity.question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity?.id, phase]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); stopSpeaking(); }, []);

  const haptic = (ok: boolean) => {
    if (!settings.hapticsEnabled) return;
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
  };

  const record = (correct: boolean, usedMethod: AnswerMethod, answerText = '') => {
    if (!activity) return;
    adaptiveProgressRepo
      .recordAttempt({ childId: profile.id, lessonId, activityId: activity.id, answerMethod: usedMethod, correct, attempts: attempt, answerText })
      .catch(() => {});
  };

  const next = (afterMs: number) => {
    timer.current = setTimeout(async () => {
      if (!queue) return;
      if (index + 1 >= queue.length) {
        setPhase('summary');
        const stars = await award('learning', lesson?.title ?? 'Lesson');
        setBurst((b) => b + 1);
        say(`You completed the lesson, ${displayName}!${stars > 0 ? ` ${stars} star${stars === 1 ? '' : 's'}.` : ''}`);
      } else {
        setIndex((i) => i + 1);
        setPhase('question');
      }
    }, afterMs);
  };

  const succeed = (usedMethod: AnswerMethod, answerText = '') => {
    record(true, usedMethod, answerText);
    setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
    setPhase('correct');
    haptic(true);
    setBurst((b) => b + 1);
    say(`Great job, ${displayName}!`);
    next(1500);
  };

  const fail = (usedMethod: AnswerMethod, answerText = '') => {
    haptic(false);
    if (attempt === 1) {
      setAttempt(2);
      setPhase('retry');
      setShowHint(true);
      say(`Not quite. ${activity?.hint ?? ''} Try again.`);
      timer.current = setTimeout(() => setPhase('question'), 1800);
    } else {
      record(false, usedMethod, answerText);
      setScore((s) => ({ correct: s.correct, total: s.total + 1 }));
      setPhase('reveal');
      const correct = activity ? acceptedAnswers(activity)[0] : '';
      say(`The answer is ${correct}. Let's keep going.`);
      next(2400);
    }
  };

  // ---- answer handlers -------------------------------------------------------
  const tapChoice = (i: number) => {
    const now = Date.now();
    if (now - lastTap.current < TAP_GUARD_MS || phase !== 'question') return;
    lastTap.current = now;
    if (multiSelect) {
      setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
      return;
    }
    setSelected([i]);
    if (choices[i].correct) succeed(method, choices[i].label);
    else {
      setWrongIdx(i);
      fail(method, choices[i].label);
    }
  };

  const checkMulti = () => {
    const correctIdx = choices.map((c, i) => (c.correct ? i : -1)).filter((i) => i >= 0);
    const ok = correctIdx.every((i) => selected.includes(i)) && selected.every((i) => choices[i].correct);
    if (ok) succeed(method, selected.map((i) => choices[i].label).join(', '));
    else fail(method, selected.map((i) => choices[i].label).join(', '));
  };

  const checkFree = (text: string, usedMethod: AnswerMethod) => {
    if (!activity) return;
    if (matchesFreeAnswer(text, acceptedAnswers(activity))) succeed(usedMethod, text);
    else fail(usedMethod, text);
  };

  const writingDone = (r: { strokes: number; durationMs: number }) => {
    if (!activity) return;
    adaptiveProgressRepo.recordHandwriting({ childId: profile.id, level: 7, item: acceptedAnswers(activity)[0] ?? activity.question, strokes: r.strokes, durationMs: r.durationMs }).catch(() => {});
    succeed('write', `${r.strokes} strokes`);
  };

  // ---- rendering --------------------------------------------------------------
  if (!lesson) return <ChildScreen title="Lesson" back />;

  if (phase === 'intro') {
    return (
      <ChildScreen title={lesson.subjectName} emoji={lesson.subjectIcon} back>
        <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Card color={lesson.subjectColor}>
            <Text style={[styles.title, { fontSize: sizes.heading, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{lesson.title}</Text>
            {lesson.content ? <Text style={[styles.body, { fontSize: sizes.body + 3, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{lesson.content}</Text> : null}
          </Card>
          {lesson.vocabulary.length > 0 ? (
            <View style={styles.vocab}>
              {lesson.vocabulary.map((v, i) => (
                <Pressable key={i} onPress={() => say(v.replace(/[^\p{L}\p{N}\s'—-]/gu, ''), true)} accessibilityRole="button" accessibilityLabel={v} style={[styles.vocabRow, theme.shadow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]}>
                  <Text style={[styles.vocabText, { fontSize: sizes.tileLabel + 4, color: theme.colors.text }]} allowFontScaling={false}>{v}</Text>
                  <Icon name="volume-high" size={26} color={theme.colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : null}
          <BigButton label="Read it to me" icon="volume-high" variant="secondary" minHeight={72} onPress={() => say(`${lesson.title}. ${lesson.content}`, true)} />
          {activities.length > 0 ? (
            <BigButton label={completedIds.size > 0 && completedIds.size < activities.length ? 'Continue questions' : 'Start questions'} icon="play" minHeight={88} onPress={() => setPhase('question')} />
          ) : (
            <Text style={[styles.note, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>This lesson has no questions yet.</Text>
          )}
        </ScrollView>
      </ChildScreen>
    );
  }

  if (phase === 'summary') {
    const total = queue?.length ?? 0;
    return (
      <ChildScreen title={lesson.title} back>
        <Celebration trigger={burst} />
        <View style={[styles.summary, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Text style={styles.bigEmoji} allowFontScaling={false}>🎉</Text>
          <Text style={[styles.title, { fontSize: sizes.phrase - 4, color: theme.colors.text, textAlign: 'center' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            You completed the lesson, {displayName}!
          </Text>
          <Text style={[styles.body, { fontSize: sizes.body + 2, color: theme.colors.textMuted, textAlign: 'center' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            👏 {score.correct} of {total} answered right
          </Text>
          <BigButton label="Back to lessons" icon="arrow-left" minHeight={80} onPress={() => navigation.goBack()} />
        </View>
      </ChildScreen>
    );
  }

  if (!activity || !queue) return <ChildScreen title={lesson.title} back />;

  const meta = ANSWER_METHOD_META[method];
  const isPicture = method === 'picture' || (activity.type === 'picture' && method === 'tap');
  const locked = phase !== 'question';

  return (
    <ChildScreen title={lesson.subjectName} emoji={lesson.subjectIcon} back>
      <Celebration trigger={burst} />
      <View style={[styles.progressRow, { paddingHorizontal: sizes.horizontalPadding }]}>
        <ProgressBar value={index / queue.length} label={`${index + 1} / ${queue.length}`} height={12} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]} keyboardShouldPersistTaps="handled">
        <Card color={lesson.subjectColor} style={styles.questionCard}>
          {activity.image ? <Text style={[styles.image, { fontSize: sizes.iconSize + 20 }]} allowFontScaling={false}>{activity.image}</Text> : null}
          <Text style={[styles.question, { fontSize: activity.question.length > 50 ? sizes.body + 4 : sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {activity.question}
          </Text>
          <View style={styles.qActions}>
            <Pressable onPress={() => say(activity.question, true)} accessibilityRole="button" accessibilityLabel="Hear the question again" style={[styles.hear, { backgroundColor: theme.colors.primary }]}>
              <Icon name="volume-high" size={26} color="#FFFFFF" />
              <Text style={styles.hearText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Hear again</Text>
            </Pressable>
            {activity.hint && !showHint ? (
              <Pressable onPress={() => { setShowHint(true); say(activity.hint, true); }} accessibilityRole="button" accessibilityLabel="Show a hint" style={[styles.hear, { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.borderSoft }]}>
                <Text style={styles.hintEmoji} allowFontScaling={false}>💡</Text>
                <Text style={[styles.hearText, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Hint</Text>
              </Pressable>
            ) : null}
          </View>
          {showHint && activity.hint ? (
            <Text style={[styles.hint, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>💡 {activity.hint}</Text>
          ) : null}
        </Card>

        <Text
          style={[styles.feedback, { fontSize: sizes.body + 2, color: phase === 'correct' ? theme.colors.success : phase === 'question' ? theme.colors.textMuted : theme.colors.danger }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLiveRegion="polite"
        >
          {phase === 'correct' ? `✅ Great job, ${displayName}!` : phase === 'retry' ? '↻ Not quite — try again' : phase === 'reveal' ? `💡 The answer: ${acceptedAnswers(activity)[0] ?? ''}` : `${meta.emoji} ${meta.label}`}
        </Text>

        <AnswerMethodPicker methods={methods} value={method} onChange={(m) => { setMethod(m); setSelected([]); setTyped(''); }} compact />

        {(method === 'tap' || method === 'picture') ? (
          <>
            <ChoiceGrid>
              {choices.map((c, i) => (
                <ChoiceCard
                  key={`${activity.id}-${i}`}
                  label={c.label}
                  emoji={c.emoji}
                  pictureMode={isPicture && !!c.emoji}
                  width={isPicture || choices.length > 2 ? '48%' : '100%'}
                  disabled={locked}
                  state={
                    (phase === 'correct' && c.correct && selected.includes(i)) || (phase === 'reveal' && c.correct) ? 'correct'
                    : wrongIdx === i && phase !== 'question' ? 'wrong'
                    : selected.includes(i) ? 'selected'
                    : showHint && level.hintAlways && c.correct && profile.assistanceLevel === 'guided' && attempt > 1 ? 'hint'
                    : 'idle'
                  }
                  onPress={() => tapChoice(i)}
                />
              ))}
            </ChoiceGrid>
            {multiSelect ? (
              <BigButton label={`Check my answer (${selected.length} chosen)`} icon="check-bold" variant="success" minHeight={72} disabled={locked || selected.length === 0} onPress={checkMulti} />
            ) : null}
          </>
        ) : null}

        {method === 'match' ? (
          <TapMatch key={`${activity.id}-match`} pairs={activity.pairs} showExample={profile.assistanceLevel === 'guided'} onComplete={(mistakes) => succeed('match', mistakes ? `${mistakes} retries` : '')} />
        ) : null}

        {method === 'type' ? (
          <BigKeyboard value={typed} onChange={setTyped} onDone={() => typed.trim() && checkFree(typed, 'type')} numbersFirst={/\d/.test(acceptedAnswers(activity)[0] ?? '')} />
        ) : null}

        {method === 'speak' ? (
          <SpeechAnswer
            key={`${activity.id}-speak`}
            prompt="🎤 Say your answer"
            onUseAnswer={(t) => checkFree(t, 'speak')}
            onAssistedResult={(ok) => (ok ? succeed('assisted') : fail('assisted'))}
          />
        ) : null}

        {method === 'write' ? (
          <View style={styles.writeWrap}>
            <Text style={[styles.note, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Any size is fine. Tap Done when you finish.
            </Text>
            <HandwritingCanvas
              key={`${activity.id}-write`}
              guide={profile.assistanceLevel === 'independent' ? { kind: 'none' } : { kind: 'text', text: acceptedAnswers(activity)[0] ?? '' }}
              onDone={writingDone}
              strokeWidth={strokeWidth}
              onStrokeWidthChange={setStrokeWidth}
              height={Math.max(260, sizes.tileHeight * 2)}
            />
          </View>
        ) : null}

        {method === 'assisted' ? (
          <Card>
            <Text style={[styles.body, { fontSize: sizes.body + 2, color: theme.colors.text, textAlign: 'center' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              🙋 Show or tell your answer to a grown-up.
            </Text>
            <View style={styles.row}>
              <BigButton label="Yes, correct" icon="check-bold" variant="success" minHeight={72} onPress={() => succeed('assisted')} style={styles.half} />
              <BigButton label="Not yet" icon="replay" variant="outline" minHeight={72} onPress={() => fail('assisted')} style={styles.half} />
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  progressRow: { paddingBottom: SPACING.xs },
  title: { fontFamily: Fonts.black },
  body: { fontFamily: Fonts.semibold, lineHeight: 32, marginTop: SPACING.sm },
  vocab: { gap: SPACING.sm },
  vocabRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 72, paddingHorizontal: SPACING.lg, borderRadius: Radius.lg, borderWidth: 1 },
  vocabText: { fontFamily: Fonts.extrabold },
  note: { fontFamily: Fonts.semibold, fontSize: 16, textAlign: 'center' },
  summary: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  bigEmoji: { fontSize: 72, lineHeight: 88 },
  questionCard: { alignItems: 'center', gap: SPACING.sm },
  image: { textAlign: 'center', lineHeight: 96 },
  question: { fontFamily: Fonts.extrabold, textAlign: 'center', lineHeight: 40 },
  qActions: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },
  hear: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 56, paddingHorizontal: SPACING.lg, borderRadius: Radius.pill },
  hearText: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 17 },
  hintEmoji: { fontSize: 22 },
  hint: { fontFamily: Fonts.bold, fontSize: 18, textAlign: 'center' },
  feedback: { fontFamily: Fonts.extrabold, textAlign: 'center' },
  writeWrap: { gap: SPACING.sm },
  row: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  half: { flex: 1 },
});
