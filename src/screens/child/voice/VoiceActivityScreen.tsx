import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { activityArtFor } from '@/speechpractice/stageArt';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, ChildScreen, CompletionView, Icon, PressableScale } from '@/components/common';
import { MicPanel, PRAISE } from '@/components/speech';
import { ArrangeView, BeatView, CopyActionView, FocusSentence, SayMoreView, TurnLight, VoiceShapeTrace, WaitGoView, type TurnPhase } from '@/components/voice';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useAdventureWorld, useRecordVoicePractice, useSizes, useSoundRecorder } from '@/hooks';
import { themeFor } from '@/adventure/themes';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import type { Strings } from '@/i18n/types';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius } from '@/theme/adventure';
import { PurposeColor } from '@/theme/purpose';
import { buildExercises, exerciseLabel, getActivity, getCategory, linesOf } from '@/practice/engine';
import type { ExchangeTurn, PracticeExercise, VoiceLine } from '@/practice/types';
import { playLine, playLines } from '@/practice/voiceModel';

/**
 * Every Voice & Communication activity, on one screen.
 *
 * Five exercise kinds, one screen — the same rule as Speech Practice, and for the same reason:
 * twenty-eight activities cannot each have a screen and stay consistent, and a child should not
 * have to relearn where the buttons are every time they open a new one.
 *
 * TWO RULES THIS SCREEN ENFORCES, whatever the exercise:
 *  1. Nothing is ever marked wrong. A tap that was not the expected one replays the model and
 *     invites another go; it never says "no", never shows a cross, and never blocks the way on.
 *  2. Speaking is never required. Every exercise can be completed by listening and tapping, and
 *     the practice counts exactly the same, because a child who cannot produce the target speech
 *     is precisely the child this section is for.
 */
export function VoiceActivityScreen({ route, navigation }: RootScreenProps<'VoiceActivity'>) {
  const { activityId, limit, sessionStep } = route.params;
  const def = getActivity(activityId);
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { settings } = useSettings();
  const recorder = useSoundRecorder();
  const record = useRecordVoicePractice();
  // The active adventure theme, so turn-taking can address the child's own companion.
  const { world } = useAdventureWorld();
  const companion = themeFor(world.id).companion;
  const night = !!theme.night;

  /**
   * A session runs a SLICE of an activity rather than all of it — a few exercises, then back to
   * the session for the next step. Opened on its own (no limit), the activity runs in full.
   */
  const exercises = useMemo(() => {
    const all = buildExercises(activityId);
    return limit && limit > 0 ? all.slice(0, limit) : all;
  }, [activityId, limit]);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [micDeclined, setMicDeclined] = useState(false);
  const [praise, setPraise] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  /** listen-choose: the answers tapped so far, in the order they were tapped. */
  const [tapped, setTapped] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [reading, setReading] = useState(0);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('listen');
  const [step, setStep] = useState(0);
  const startedAt = useRef(Date.now());
  const scroll = useRef<ScrollView>(null);

  const exercise: PracticeExercise | undefined = exercises[index];
  const cat = def ? getCategory(def.category) : undefined;
  // The area's colour comes from what KIND of practice it is, never picked per screen.
  const accent = cat ? PurposeColor[cat.purpose] : 'grape';
  const c = Adventure[accent];

  const play = useCallback((lines: VoiceLine[]) => { void playLines(lines, settings); }, [settings]);
  const sayOne = useCallback((l: VoiceLine) => { void playLine(l, settings); }, [settings]);

  /** Logs one worked-through exercise. Never a result — only that it happened. */
  const logDone = useCallback(() => {
    if (!def || !exercise) return;
    record(def.id, def.category, exercise.kind, exerciseLabel(exercise), Date.now() - startedAt.current);
  }, [def, exercise, record]);

  // Play the model as each exercise opens: the section is audio-first, so a child who cannot read
  // still knows what is being asked.
  useEffect(() => {
    setPicked(null);
    setTapped([]);
    setRevealed(false);
    setReading(0);
    setStep(0);
    setTurnPhase('listen');
    startedAt.current = Date.now();
    recorder.discard();
    scroll.current?.scrollTo({ y: 0, animated: false });
    if (!exercise) return;
    const timer = setTimeout(() => play(openingLines(exercise)), 380);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, exercise?.id]);

  // The traffic light runs itself: red while the app talks, amber to get ready, then green. The
  // amber wait is generous and nothing is timed after it — green simply stays on.
  useEffect(() => {
    if (exercise?.kind !== 'turn-light' || turnPhase !== 'listen') return;
    const toReady = setTimeout(() => setTurnPhase('ready'), 2600);
    return () => clearTimeout(toReady);
  }, [exercise, turnPhase]);

  useEffect(() => {
    if (exercise?.kind !== 'turn-light' || turnPhase !== 'ready') return;
    const toSpeak = setTimeout(() => setTurnPhase('speak'), exercise.readyMs);
    return () => clearTimeout(toSpeak);
  }, [exercise, turnPhase]);

  const next = () => {
    logDone();
    setPraise((p) => (p + 1) % PRAISE.length);
    if (index + 1 >= exercises.length) {
      // In a session, the last exercise of a step hands control straight back rather than
      // showing its own celebration — the session owns the ending, and two in a row would
      // stretch a short session out.
      // Tell the session this step was FINISHED. Returning on its own is not enough: a child who
      // backs out half way has still practised, but the step has not been completed and the
      // session should not tick it off.
      if (limit) navigation.navigate('PracticeSession', { completed: sessionStep ?? 0 });
      else setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (!def || !cat) return null;

  if (finished) {
    return (
      <ChildScreen title={t(def.titleKey)} colorArt={activityArtFor(def.id)} emoji={def.emoji} back>
        <CompletionView emoji="🎉" title={t('vcDone')} message={t('vcDoneSub')} actionLabel={t('vcNext')} onAction={() => navigation.goBack()} />
      </ChildScreen>
    );
  }

  if (!exercise) return null;

  /** The encouragement line under every exercise. Always warm, never a verdict. */
  const encouragement = (
    <Text style={[styles.praise, { color: night ? 'rgba(255,255,255,0.86)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
      {picked === null && tapped.length === 0 ? '' : t(PRAISE[praise])}
    </Text>
  );

  /** Practice content labels itself; interface words come from the strings. */
  const choiceLabel = (choice: { text?: string; labelKey?: keyof Strings }) => choice.text ?? (choice.labelKey ? t(choice.labelKey) : '');

  const listenButton = (lines: VoiceLine[], labelKey: 'vcListen' | 'vcListenAgain' = 'vcListenAgain') => (
    <BigButton label={t(labelKey)} icon="volume-high" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={() => play(lines)} />
  );

  const nextButton = (label: keyof typeof LABELS = 'next') => (
    <BigButton label={t(label === 'next' ? 'vcNext' : 'vcIListened')} icon="arrow-right" minHeight={MIN_CHILD_TARGET} onPress={next} />
  );

  return (
    <ChildScreen title={t(def.titleKey)} subtitle={t(def.subtitleKey)} colorArt={activityArtFor(def.id)} emoji={def.emoji} back>
      <ScrollView ref={scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.step, { color: night ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {index + 1} / {exercises.length}
        </Text>

        {/* ------------------------------------------------- listen & choose */}
        {exercise.kind === 'listen-choose' ? (
          <>
            <Prompt text={t(exercise.promptKey)} night={night} theme={theme} sizes={sizes} />
            {exercise.showShapes && revealed
              ? exercise.listen.map((l) => (
                  l.shape ? (
                    <View key={l.id} style={styles.trace}>
                      <VoiceShapeTrace shape={l.shape} width={220} color={night ? '#FFFFFF' : c.from} />
                    </View>
                  ) : null
                ))
              : null}
            {listenButton(exercise.listen, 'vcListen')}
            {/* More than one to find? Say so, and show the order as it builds. */}
            {exercise.answerIds.length > 1 ? (
              <Text style={[styles.who, { color: night ? 'rgba(255,255,255,0.86)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {exercise.ordered ? t('vcTapInOrder') : t('vcPromptDoBoth')} — {tapped.length} / {exercise.answerIds.length}
              </Text>
            ) : null}
            <View style={styles.choices}>
              {exercise.choices.map((choice) => {
                const at = tapped.indexOf(choice.id);
                const chosen = at >= 0;
                const complete = tapped.length >= exercise.answerIds.length;
                return (
                  <PressableScale
                    key={choice.id}
                    onPress={() => {
                      if (complete || chosen) return;
                      setRevealed(true);
                      // What comes next: the exact one when order matters, any outstanding one
                      // otherwise. A tap that is not it REPLAYS the model and invites another go —
                      // it is never marked wrong, and it never blocks the way forward.
                      const wanted = exercise.ordered
                        ? [exercise.answerIds[tapped.length]]
                        : exercise.answerIds.filter((id) => !tapped.includes(id));
                      if (wanted.includes(choice.id)) setTapped((prev) => [...prev, choice.id]);
                      else play(exercise.listen);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={choiceLabel(choice)}
                  >
                    <View
                      style={[
                        styles.choice,
                        { backgroundColor: night ? 'rgba(255,255,255,0.1)' : theme.colors.surface, borderColor: chosen ? c.from : night ? 'rgba(255,255,255,0.2)' : theme.colors.borderSoft },
                        chosen && { borderWidth: 3 },
                      ]}
                    >
                      {choice.shape ? (
                        <VoiceShapeTrace shape={choice.shape} width={110} color={night ? '#FFFFFF' : c.from} />
                      ) : (
                        <Text style={styles.choiceEmoji} allowFontScaling={false}>{choice.picture ?? '🔊'}</Text>
                      )}
                      <Text
                        style={[styles.choiceLabel, { fontSize: sizes.body, color: night ? '#FFFFFF' : theme.colors.text }]}
                        maxFontSizeMultiplier={MAX_FONT_SCALE}
                        numberOfLines={2}
                      >
                        {choiceLabel(choice)}
                      </Text>
                      {/* The order a child chose, shown so a two-step instruction is legible. */}
                      {chosen && exercise.ordered && exercise.answerIds.length > 1 ? (
                        <View style={[styles.orderPip, { backgroundColor: c.from }]}>
                          <Text style={styles.orderPipText} allowFontScaling={false}>{at + 1}</Text>
                        </View>
                      ) : null}
                    </View>
                  </PressableScale>
                );
              })}
            </View>
            {encouragement}
            {tapped.length >= exercise.answerIds.length ? nextButton() : null}
          </>
        ) : null}

        {/* ------------------------------------------------- voice try */}
        {exercise.kind === 'voice-try' ? (
          <>
            <Prompt text={t(exercise.cueKey)} night={night} theme={theme} sizes={sizes} />
            <Card>
              <View style={styles.tryCard}>
                {exercise.line.picture ? (
                  <Text style={styles.bigEmoji} allowFontScaling={false}>{exercise.line.picture}</Text>
                ) : null}
                <Text
                  style={[styles.lineText, { fontSize: sizes.phrase - 6, color: theme.colors.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {exercise.line.text}
                </Text>
                {exercise.line.shape ? (
                  <VoiceShapeTrace shape={exercise.line.shape} width={210} color={c.from} />
                ) : null}
              </View>
            </Card>
            {listenButton([exercise.line], 'vcListen')}
            <MicPanel recorder={recorder} onAttempt={() => setPicked('spoke')} declined={micDeclined} onDecline={() => setMicDeclined(true)} praiseIndex={praise} />
            {/* Always available, whatever the microphone did. */}
            <BigButton label={t('vcIListened')} icon="ear-hearing" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={next} />
          </>
        ) : null}

        {/* ------------------------------------------------- focus */}
        {exercise.kind === 'focus-say' ? (
          <>
            <Prompt
              text={exercise.question && !revealed ? t(exercise.question.promptKey) : t(exercise.cueKey)}
              night={night}
              theme={theme}
              sizes={sizes}
            />
            <Card>
              <View style={styles.tryCard}>
                <FocusSentence
                  words={exercise.readings[reading].text.split(' ')}
                  focusWord={exercise.readings[reading].focusWord ?? -1}
                  reveal={!exercise.question || revealed}
                  onPickWord={
                    exercise.question && !revealed
                      ? (i) => {
                          setRevealed(true);
                          setPicked(`w${i}`);
                          sayOne(exercise.readings[reading]);
                        }
                      : undefined
                  }
                  picked={picked?.startsWith('w') ? Number(picked.slice(1)) : undefined}
                />
              </View>
            </Card>
            {/* More than one reading? Let the child flip between them and hear the weight move. */}
            {exercise.readings.length > 1 ? (
              <View style={styles.readings}>
                {exercise.readings.map((r, i) => (
                  <PressableScale
                    key={r.id}
                    onPress={() => { setReading(i); sayOne(r); }}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('vcListen')} ${i + 1}`}
                  >
                    <View style={[styles.readingChip, { backgroundColor: i === reading ? c.from : night ? 'rgba(255,255,255,0.1)' : theme.colors.surfaceAlt, borderColor: c.from }]}>
                      <Icon name="volume-high" size={20} color={i === reading ? '#FFFFFF' : night ? '#FFFFFF' : c.ink} />
                      <Text style={[styles.readingText, { color: i === reading ? '#FFFFFF' : night ? '#FFFFFF' : c.ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                        {i + 1}
                      </Text>
                    </View>
                  </PressableScale>
                ))}
              </View>
            ) : (
              listenButton([exercise.readings[0]], 'vcListen')
            )}
            <MicPanel recorder={recorder} onAttempt={() => setPicked('spoke')} declined={micDeclined} onDecline={() => setMicDeclined(true)} praiseIndex={praise} />
            <BigButton label={t('vcIListened')} icon="ear-hearing" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={next} />
          </>
        ) : null}

        {/* ------------------------------------------------- turn light */}
        {exercise.kind === 'turn-light' ? (
          <>
            <TurnLight phase={turnPhase} companion={companion} />
            <Card>
              <View style={styles.tryCard}>
                <Text style={[styles.who, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('vcAppSays')}
                </Text>
                <Text style={[styles.lineText, { fontSize: sizes.body + 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {exercise.ask.text}
                </Text>
              </View>
            </Card>
            {listenButton([exercise.ask])}
            {turnPhase === 'speak' ? (
              <>
                <Text style={[styles.who, { color: night ? 'rgba(255,255,255,0.86)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('vcOrSay')}
                </Text>
                <View style={styles.ideas}>
                  {exercise.ideas.map((idea) => (
                    <PressableScale key={idea.id} onPress={() => { setPicked(idea.id); sayOne(idea); }} accessibilityRole="button" accessibilityLabel={idea.text}>
                      <View style={[styles.idea, { backgroundColor: night ? 'rgba(255,255,255,0.1)' : theme.colors.surface, borderColor: picked === idea.id ? c.from : night ? 'rgba(255,255,255,0.2)' : theme.colors.borderSoft }]}>
                        <Text style={styles.ideaEmoji} allowFontScaling={false}>{idea.picture ?? '💬'}</Text>
                        <Text style={[styles.ideaText, { fontSize: sizes.body - 1, color: night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                          {idea.text}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </View>
                <MicPanel recorder={recorder} onAttempt={() => setPicked('spoke')} declined={micDeclined} onDecline={() => setMicDeclined(true)} praiseIndex={praise} />
                <BigButton label={t('vcNext')} icon="arrow-right" minHeight={MIN_CHILD_TARGET} onPress={next} />
              </>
            ) : null}
          </>
        ) : null}

        {/* ------------------------------------------------- exchange */}
        {exercise.kind === 'exchange' ? (
          <>
            <Prompt text={t(exercise.titleKey)} night={night} theme={theme} sizes={sizes} />
            <View style={styles.turns}>
              {exercise.turns.slice(0, step + 1).map((turn, i) => (
                <TurnBubble
                  key={turn.id}
                  turn={turn}
                  active={i === step}
                  night={night}
                  theme={theme}
                  sizes={sizes}
                  accent={c}
                  onPlay={() => sayOne(turn.line)}
                  label={turn.who === 'app' ? t('vcAppSays') : t('vcYouSay')}
                />
              ))}
            </View>
            {exercise.turns[step]?.who === 'child' ? (
              <>
                {exercise.turns[step].alternatives?.length ? (
                  <>
                    <Text style={[styles.who, { color: night ? 'rgba(255,255,255,0.86)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {t('vcOrSay')}
                    </Text>
                    <View style={styles.ideas}>
                      {exercise.turns[step].alternatives!.map((alt) => (
                        <PressableScale key={alt.id} onPress={() => sayOne(alt)} accessibilityRole="button" accessibilityLabel={alt.text}>
                          <View style={[styles.idea, { backgroundColor: night ? 'rgba(255,255,255,0.1)' : theme.colors.surface, borderColor: night ? 'rgba(255,255,255,0.2)' : theme.colors.borderSoft }]}>
                            <Text style={[styles.ideaText, { fontSize: sizes.body - 1, color: night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                              {alt.text}
                            </Text>
                          </View>
                        </PressableScale>
                      ))}
                    </View>
                  </>
                ) : null}
                <MicPanel recorder={recorder} onAttempt={() => setPicked('spoke')} declined={micDeclined} onDecline={() => setMicDeclined(true)} praiseIndex={praise} />
              </>
            ) : (
              listenButton([exercise.turns[step].line])
            )}
            <BigButton
              label={step + 1 < exercise.turns.length ? t('vcNext') : t('vcDone')}
              icon="arrow-right"
              minHeight={MIN_CHILD_TARGET}
              onPress={() => {
                if (step + 1 < exercise.turns.length) {
                  const nextStep = step + 1;
                  setStep(nextStep);
                  if (exercise.turns[nextStep].who === 'app') sayOne(exercise.turns[nextStep].line);
                } else next();
              }}
            />
          </>
        ) : null}

        {/* Each view is KEYED BY EXERCISE ID so it remounts when the exercise changes. These
            views hold their own state — taps counted, round reached, words placed — and React
            reuses a component instance when only its props change, so without the key a child
            arrived at exercise 2 already "having tapped 2" from exercise 1. */}
        {/* ------------------------------------------------- ready, steady, go */}
        {exercise.kind === 'wait-go' ? <WaitGoView key={exercise.id} exercise={exercise} say={sayOne} onDone={next} /> : null}

        {/* ------------------------------------------------- copy the beats */}
        {exercise.kind === 'beat' ? <BeatView key={exercise.id} exercise={exercise} say={sayOne} onDone={next} /> : null}

        {/* ------------------------------------------------- copy the action */}
        {exercise.kind === 'copy-action' ? <CopyActionView key={exercise.id} exercise={exercise} say={sayOne} onDone={next} /> : null}

        {/* ------------------------------------------------- say what you see */}
        {exercise.kind === 'say-more' ? (
          <>
            <SayMoreView key={exercise.id} exercise={exercise} say={sayOne} accent={accent} onPicked={() => setPicked('rung')} />
            <MicPanel recorder={recorder} onAttempt={() => setPicked('spoke')} declined={micDeclined} onDecline={() => setMicDeclined(true)} praiseIndex={praise} />
            <BigButton label={t('vcIListened')} icon="ear-hearing" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={next} />
          </>
        ) : null}

        {/* ------------------------------------------------- build the sentence */}
        {exercise.kind === 'arrange' ? <ArrangeView key={exercise.id} exercise={exercise} say={sayOne} accent={accent} onDone={next} /> : null}

        {/* Always a way past an exercise that is not working today. */}
        <PressableScale onPress={next} accessibilityRole="button" accessibilityLabel={t('vcSkip')}>
          <Text style={[styles.skip, { color: night ? 'rgba(255,255,255,0.6)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('vcSkip')}
          </Text>
        </PressableScale>
      </ScrollView>
    </ChildScreen>
  );
}

const LABELS = { next: 1, listened: 1 };

/** The lines played when an exercise opens. */
function openingLines(ex: PracticeExercise): VoiceLine[] {
  if (ex.kind === 'exchange') return [ex.turns[0].line];
  if (ex.kind === 'focus-say') return [ex.readings[0]];
  return linesOf(ex);
}

function Prompt({ text, night, theme, sizes }: { text: string; night: boolean; theme: ReturnType<typeof useTheme>; sizes: ReturnType<typeof useSizes> }) {
  return (
    <Text
      style={[styles.prompt, { fontSize: sizes.body + 3, color: night ? '#FFFFFF' : theme.colors.text }]}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      accessibilityRole="header"
    >
      {text}
    </Text>
  );
}

function TurnBubble({
  turn, active, night, theme, sizes, accent, onPlay, label,
}: {
  turn: ExchangeTurn; active: boolean; night: boolean;
  theme: ReturnType<typeof useTheme>; sizes: ReturnType<typeof useSizes>;
  accent: { from: string; ink: string }; onPlay: () => void; label: string;
}) {
  const mine = turn.who === 'child';
  return (
    <PressableScale onPress={onPlay} accessibilityRole="button" accessibilityLabel={`${label}. ${turn.line.text}`}>
      <View
        style={[
          styles.bubble,
          mine ? styles.bubbleMine : styles.bubbleApp,
          {
            backgroundColor: mine ? accent.from : night ? 'rgba(255,255,255,0.12)' : theme.colors.surface,
            borderColor: active ? accent.from : 'transparent',
            opacity: active ? 1 : 0.72,
          },
        ]}
      >
        <Text style={[styles.who, { color: mine ? '#FFFFFF' : night ? 'rgba(255,255,255,0.8)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {label}
        </Text>
        <Text
          style={[styles.bubbleText, { fontSize: sizes.body, color: mine ? '#FFFFFF' : night ? '#FFFFFF' : theme.colors.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {turn.line.picture ? `${turn.line.picture} ` : ''}{turn.line.text}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  step: { fontFamily: Fonts.bold, fontSize: 13, textAlign: 'center' },
  prompt: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  trace: { alignItems: 'center' },
  tryCard: { alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  bigEmoji: { fontSize: 52 },
  lineText: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.md },
  choice: {
    minWidth: 140, minHeight: MIN_CHILD_TARGET + 34,
    alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderRadius: AdventureRadius.card, borderWidth: 2,
  },
  choiceEmoji: { fontSize: 36 },
  orderPip: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  orderPipText: { fontFamily: Fonts.black, fontSize: 13, color: '#FFFFFF' },
  choiceLabel: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  praise: { fontFamily: Fonts.bold, fontSize: 15, textAlign: 'center', minHeight: 20 },
  readings: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md },
  readingChip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: MIN_CHILD_TARGET - 12, paddingHorizontal: SPACING.lg, borderRadius: AdventureRadius.pill, borderWidth: 2 },
  readingText: { fontFamily: Fonts.black, fontSize: 16 },
  who: { fontFamily: Fonts.bold, fontSize: 12, textAlign: 'center' },
  ideas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm },
  idea: {
    minWidth: 132, minHeight: MIN_CHILD_TARGET,
    alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: AdventureRadius.card, borderWidth: 2,
  },
  ideaEmoji: { fontSize: 26 },
  ideaText: { fontFamily: Fonts.bold, textAlign: 'center', alignSelf: 'stretch' },
  turns: { gap: SPACING.sm },
  bubble: { padding: SPACING.md, borderRadius: AdventureRadius.card, borderWidth: 2, gap: 2, maxWidth: '88%' },
  bubbleApp: { alignSelf: 'flex-start' },
  bubbleMine: { alignSelf: 'flex-end' },
  bubbleText: { fontFamily: Fonts.black },
  skip: { fontFamily: Fonts.bold, fontSize: 13, textAlign: 'center', paddingVertical: SPACING.md },
});
