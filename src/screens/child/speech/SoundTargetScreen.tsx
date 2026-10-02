import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, Icon, PressableScale } from '@/components/common';
import { ColorArt, HeroPanel, SpeechPracticeLayout } from '@/components/adventure';
import { STAGE_ART, TARGET_STEP_ART } from '@/speechpractice/stageArt';
import { MicPanel, PRAISE } from '@/components/speech';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useSizes, useSoundRecorder } from '@/hooks';
import { useDbQuery } from '@/hooks/useDbQuery';
import { speechPracticeRepo } from '@/database';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { soundPracticeAudio } from '@/services/soundPracticeAudio';
import { modelKey } from '@/speechpractice/pronunciation';
import type { SpeechItem } from '@/speechpractice/types';
import {
  TARGET_STEPS, TARGET_STEP_DEFS, getTarget, stepItemKey, stepItemKeys,
  type SoundTarget, type TargetStepId, type TargetWord,
} from '@/speechpractice/targets';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, shade } from '@/theme/adventure';

/**
 * One target sound, practised all the way through: listen, say it, words, a phrase, a sentence, a
 * game — on ONE screen.
 *
 * This is the answer to "what speech skill is the child practising right now?": the target is at
 * the top in letters an inch high and never leaves. The old route to the same practice was a dozen
 * tiles on a dashboard, each of which took the child somewhere else; here they open BA and stay in
 * BA until they are done.
 *
 * STEPS ARE NOT GATES. Any step can be opened at any time and in any order — a child who only
 * wants the game may have the game. Opening a step marks it practised, because for a child who
 * cannot yet produce the sound, having a go IS the practice and there is nothing else to measure.
 *
 * Only the Sounds stage's colour is used, in shades, so the screen reads as one thing rather than
 * six competing cards.
 */
export function SoundTargetScreen({ route, navigation }: RootScreenProps<'SoundTarget'>) {
  const { targetId } = route.params;
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { settings } = useSettings();
  const recorder = useSoundRecorder();
  const night = !!theme.night;

  const target = getTarget(targetId);
  const [open, setOpen] = useState<TargetStepId | null>('listen');
  const [micDeclined, setMicDeclined] = useState(false);
  const [praise, setPraise] = useState(0);
  const [gamePick, setGamePick] = useState<string | null>(null);
  const [localDone, setLocalDone] = useState<Set<TargetStepId>>(new Set());

  const items = useMemo(() => (target ? stepItemKeys(target.id) : []), [target]);
  const { data: doneCount } = useDbQuery<number>(
    () => (items.length ? speechPracticeRepo.distinctItems('sounds', items) : Promise.resolve(0)),
    0,
    ['speechPractice'],
    [items.join(',')],
  );

  /** Records that a step was worked through. Never a result — only that it happened. */
  const markDone = useCallback(
    (step: TargetStepId) => {
      if (!target) return;
      setLocalDone((prev) => new Set(prev).add(step));
      setPraise((p) => (p + 1) % PRAISE.length);
      speechPracticeRepo
        .record({ activityId: 'sounds', kind: 'exercise', item: stepItemKey(target.id, step) })
        .catch(() => {
          // Practice is never interrupted by bookkeeping.
        });
    },
    [target],
  );

  const say = useCallback(
    (item: SpeechItem) => { void soundPracticeAudio.playItem(item, settings).catch(() => {}); },
    [settings],
  );

  if (!target) return null;

  const c = Adventure.sky; // Sounds is the blue family; every card here is a shade of it.
  const done = Math.max(doneCount ?? 0, localDone.size);
  const syllable: SpeechItem = {
    id: target.id,
    text: target.display,
    modelKey: modelKey('syllable', target.id),
    strict: true,
  };

  return (
    <SpeechPracticeLayout title={target.display} subtitle={t('tgSubtitle')} colorArt={STAGE_ART.sounds} back>
        <HeroPanel color="sky" art="speech" mascot mascotLeft title={target.display} subtitle={t('tgProgress', { done, total: TARGET_STEPS.length })}>
          <View style={[styles.track, { backgroundColor: 'rgba(0,0,0,0.24)' }]}>
            <View style={[styles.fill, { width: `${Math.round((done / TARGET_STEPS.length) * 100)}%` }]} />
          </View>
        </HeroPanel>

        {TARGET_STEP_DEFS.map((def, i) => {
          const isOpen = open === def.id;
          const isDone = localDone.has(def.id);
          return (
            <View key={def.id} style={[styles.step, { backgroundColor: night ? shade(c.to, isOpen ? 1 : 0.72) : theme.colors.surface, borderColor: isOpen ? c.from : night ? 'rgba(255,255,255,0.16)' : theme.colors.borderSoft }]}>
              <PressableScale
                onPress={() => setOpen(isOpen ? null : def.id)}
                accessibilityRole="button"
                accessibilityLabel={`${t('spStageStep', { n: i + 1 })}. ${t(def.titleKey)}.`}
              >
                <View style={styles.stepHead}>
                  {/* A drawing, not an emoji; in a View so it paints above any gradient on web. */}
                  <View>
                    <ColorArt name={TARGET_STEP_ART[def.id] ?? STAGE_ART.sounds} size={38} />
                  </View>
                  <View style={styles.stepWords}>
                    <Text style={[styles.stepEyebrow, { color: night ? 'rgba(255,255,255,0.82)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {t('spStageStep', { n: i + 1 })}
                    </Text>
                    <Text style={[styles.stepTitle, { fontSize: sizes.body + 1, color: night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                      {t(def.titleKey)}
                    </Text>
                  </View>
                  {isDone ? <Icon name="check-circle" size={24} color={Adventure.grass.from} /> : null}
                  <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={24} color={night ? '#FFFFFF' : theme.colors.textMuted} />
                </View>
              </PressableScale>

              {isOpen ? (
                <View style={styles.stepBody}>
                  <Text style={[styles.cue, { fontSize: sizes.body, color: night ? 'rgba(255,255,255,0.94)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {t(def.cueKey)}
                  </Text>

                  {def.id === 'listen' ? (
                    <>
                      <BigTarget text={target.display} sizes={sizes} night={night} theme={theme} />
                      <BigButton label={t('vcListen')} icon="volume-high" minHeight={MIN_CHILD_TARGET} onPress={() => { say(syllable); markDone('listen'); }} />
                    </>
                  ) : null}

                  {def.id === 'say' ? (
                    <>
                      <BigTarget text={target.display} sizes={sizes} night={night} theme={theme} />
                      <BigButton label={t('vcListen')} icon="volume-high" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={() => say(syllable)} />
                      <MicPanel recorder={recorder} onAttempt={() => markDone('say')} declined={micDeclined} onDecline={() => setMicDeclined(true)} praiseIndex={praise} />
                      {/* Speaking is offered, never required. */}
                      <BigButton label={t('vcIListened')} icon="ear-hearing" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={() => markDone('say')} />
                    </>
                  ) : null}

                  {def.id === 'words' ? (
                    <View style={styles.words}>
                      {target.words.map((w) => (
                        <WordChip key={w.text} word={w} night={night} theme={theme} sizes={sizes} onPress={() => { say({ id: w.text, text: w.text }); markDone('words'); }} />
                      ))}
                    </View>
                  ) : null}

                  {def.id === 'phrase' || def.id === 'sentence' ? (
                    <>
                      <Card>
                        <Text style={[styles.line, { fontSize: sizes.phrase - 10, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                          {def.id === 'phrase' ? target.phrase : target.sentence}
                        </Text>
                      </Card>
                      <BigButton
                        label={t('vcListen')}
                        icon="volume-high"
                        minHeight={MIN_CHILD_TARGET}
                        onPress={() => {
                          const text = def.id === 'phrase' ? target.phrase : target.sentence;
                          say({ id: `${target.id}-${def.id}`, text });
                          markDone(def.id);
                        }}
                      />
                      <MicPanel recorder={recorder} onAttempt={() => markDone(def.id)} declined={micDeclined} onDecline={() => setMicDeclined(true)} praiseIndex={praise} />
                    </>
                  ) : null}

                  {def.id === 'play' ? (
                    <TargetGame
                      target={target}
                      picked={gamePick}
                      night={night}
                      theme={theme}
                      sizes={sizes}
                      onPick={(word, correct) => {
                        setGamePick(word.text);
                        say({ id: word.text, text: word.text });
                        if (correct) markDone('play');
                      }}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })}

        <BigButton label={t('vcDone')} icon="check" minHeight={MIN_CHILD_TARGET} onPress={() => navigation.goBack()} />
    </SpeechPracticeLayout>
  );
}

/** The target, big. It is the answer to "what am I practising?", so it is the biggest thing here. */
function BigTarget({ text, sizes, night, theme }: { text: string; sizes: ReturnType<typeof useSizes>; night: boolean; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.bigTarget, { backgroundColor: night ? 'rgba(255,255,255,0.14)' : Adventure.sky.tint }]}>
      <Text
        style={[styles.bigTargetText, { fontSize: sizes.phrase + 10, color: night ? '#FFFFFF' : Adventure.sky.ink }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        allowFontScaling={false}
      >
        {text}
      </Text>
    </View>
  );
}

function WordChip({ word, night, theme, sizes, onPress }: { word: TargetWord; night: boolean; theme: ReturnType<typeof useTheme>; sizes: ReturnType<typeof useSizes>; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={word.text}>
      <View style={[styles.word, { backgroundColor: night ? 'rgba(255,255,255,0.12)' : theme.colors.surface, borderColor: night ? 'rgba(255,255,255,0.2)' : theme.colors.borderSoft }]}>
        <Text style={styles.wordEmoji} allowFontScaling={false}>{word.picture}</Text>
        <Text style={[styles.wordText, { fontSize: sizes.body, color: night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
          {word.text}
        </Text>
      </View>
    </PressableScale>
  );
}

/**
 * The game: which one starts with the target sound?
 *
 * A tap that is not the target says the word and leaves the game open — never a cross, and never a
 * dead end. Finding one target word is enough to finish; the point is a light ending, not a test.
 */
function TargetGame({
  target, picked, night, theme, sizes, onPick,
}: {
  target: SoundTarget; picked: string | null; night: boolean;
  theme: ReturnType<typeof useTheme>; sizes: ReturnType<typeof useSizes>;
  onPick: (word: TargetWord, correct: boolean) => void;
}) {
  const { t } = useI18n();
  // Fixed order, derived from the target, so the same game looks the same tomorrow.
  const choices = useMemo(() => {
    const pool = [target.words[0], target.others[0], target.others[1]];
    const at = target.id.charCodeAt(0) % pool.length;
    return [...pool.slice(at), ...pool.slice(0, at)];
  }, [target]);

  return (
    <>
      <Text style={[styles.cue, { fontSize: sizes.body, color: night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('tgGamePrompt', { target: target.display })}
      </Text>
      <View style={styles.words}>
        {choices.map((w) => {
          const isTarget = target.words.some((x) => x.text === w.text);
          const chosen = picked === w.text;
          return (
            <PressableScale key={w.text} onPress={() => onPick(w, isTarget)} accessibilityRole="button" accessibilityLabel={w.text}>
              <View
                style={[
                  styles.word,
                  {
                    backgroundColor: night ? 'rgba(255,255,255,0.12)' : theme.colors.surface,
                    borderColor: chosen && isTarget ? Adventure.grass.from : night ? 'rgba(255,255,255,0.2)' : theme.colors.borderSoft,
                    borderWidth: chosen ? 3 : 2,
                  },
                ]}
              >
                <Text style={styles.wordEmoji} allowFontScaling={false}>{w.picture}</Text>
                <Text style={[styles.wordText, { fontSize: sizes.body, color: night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {w.text}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xl * 2 },
  track: { height: 12, borderRadius: 999, overflow: 'hidden', alignSelf: 'stretch' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: '#FFD84D' },
  step: { borderRadius: AdventureRadius.card, borderWidth: 2, padding: SPACING.md, gap: SPACING.sm },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minHeight: MIN_CHILD_TARGET - 16 },
  stepEmoji: { fontSize: 30 },
  stepWords: { flex: 1, minWidth: 0 },
  stepEyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  stepTitle: { fontFamily: Fonts.black, alignSelf: 'stretch' },
  stepBody: { gap: SPACING.sm, paddingTop: SPACING.xs },
  cue: { fontFamily: Fonts.bold, textAlign: 'center', alignSelf: 'stretch' },
  bigTarget: { borderRadius: AdventureRadius.card, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.lg },
  bigTargetText: { fontFamily: Fonts.black, letterSpacing: 3 },
  line: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  words: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm },
  word: {
    minWidth: 104, minHeight: MIN_CHILD_TARGET + 12,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    borderRadius: AdventureRadius.card, borderWidth: 2,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  wordEmoji: { fontSize: 34 },
  wordText: { fontFamily: Fonts.black, textAlign: 'center' },
});
