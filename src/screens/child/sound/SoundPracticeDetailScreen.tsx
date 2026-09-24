import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, ChildScreen, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { soundPracticeRepo } from '@/database';
import { useSizes, useSoundRecorder } from '@/hooks';
import { getSoundExercise, nextSoundId } from '@/soundpractice/content';
import { soundPracticeAudio, type ModelSource } from '@/services/soundPracticeAudio';
import { useI18n } from '@/i18n';
import type { Strings } from '@/i18n/types';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';

/**
 * Practise one sound: Listen → Try → Repeat.
 *
 * Deliberately NOT here: any judgement of how the attempt sounded. Nothing is transcribed,
 * scored or compared. The child hears the model, hears themselves, and decides with a grown-up
 * whether to go again — feedback is always encouraging, never corrective.
 *
 * The recording is a temporary file that `useSoundRecorder` deletes; only the fact that an
 * attempt happened is stored.
 */

/** Rotating praise so it does not read like a machine repeating itself. */
const PRAISE: (keyof Strings)[] = ['soundGreatTry', 'soundNiceJob', 'soundKeepPracticing'];

export function SoundPracticeDetailScreen({ route, navigation }: RootScreenProps<'SoundPracticeDetail'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { settings } = useSettings();
  const recorder = useSoundRecorder();

  const exercise = getSoundExercise(route.params.soundId);
  const [modelSource, setModelSource] = useState<ModelSource | null>(null);
  const [praiseIndex, setPraiseIndex] = useState(0);
  const [askedAlready, setAskedAlready] = useState(false);
  const spokenFor = useRef<string | null>(null);

  const playModel = useCallback(async () => {
    if (!exercise) return;
    setModelSource(await soundPracticeAudio.playModel(exercise, 'sound', exercise.sound, settings));
  }, [exercise, settings]);

  // Play the model once when the sound opens, so the child hears it before trying.
  useEffect(() => {
    if (!exercise || spokenFor.current === exercise.id) return;
    spokenFor.current = exercise.id;
    playModel();
  }, [exercise, playModel]);

  if (!exercise) return <ChildScreen title={t('sectionSoundPractice')} back />;

  const finishAttempt = async () => {
    const durationMs = await recorder.stop();
    setPraiseIndex((i) => i + 1);
    soundPracticeRepo
      .recordAttempt({ soundId: exercise.id, level: 'sound', item: exercise.sound, durationMs })
      .catch(() => {});
  };

  const goToNext = () => {
    recorder.discard();
    setModelSource(null);
    spokenFor.current = null;
    navigation.setParams({ soundId: nextSoundId(exercise.id) });
  };

  const micBlocked = recorder.phase === 'denied' || recorder.phase === 'unsupported' || recorder.phase === 'error';

  return (
    <ChildScreen title={t('sectionSoundPractice')} emoji="🎯" back>
      <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        {/* The sound itself — the one thing the child must see. */}
        <Card color={theme.colors.primarySoft} style={styles.letterCard}>
          <Text
            style={[styles.letter, { fontSize: sizes.heading + 56, color: theme.colors.text }]}
            allowFontScaling={false}
            accessibilityLabel={exercise.sound}
          >
            {exercise.sound}
          </Text>
          <Text style={[styles.likeWord, { fontSize: sizes.body + 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {exercise.emoji} {t('soundLikeWord', { word: exercise.exampleWord })}
          </Text>
        </Card>

        <SectionTitle title={t('soundListen')} emoji="🔊" />
        <BigButton label={t('soundPlaySound')} icon="volume-high" variant="secondary" minHeight={88} onPress={playModel} />

        <SectionTitle title={t('soundYourTurn')} emoji="🎤" />

        {recorder.phase === 'needsPermission' && !askedAlready ? (
          // Explain before the OS prompt appears, never after.
          <Card>
            <Text style={[styles.micTitle, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              🎤 {t('soundMicTitle')}
            </Text>
            <Text style={[styles.micBody, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('soundMicExplain')}
            </Text>
            <BigButton label={t('soundMicAllow')} icon="microphone" minHeight={72} onPress={() => recorder.requestPermission()} />
            <View style={styles.spacer} />
            <BigButton label={t('soundMicNotNow')} variant="outline" minHeight={64} onPress={() => setAskedAlready(true)} />
          </Card>
        ) : recorder.phase === 'recording' ? (
          <BigButton label={t('soundStopRecording')} icon="stop" variant="danger" minHeight={96} onPress={finishAttempt} />
        ) : recorder.phase === 'recorded' ? (
          <Card>
            <Text
              style={[styles.praise, { fontSize: sizes.phrase - 4, color: theme.colors.success }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              accessibilityLiveRegion="polite"
            >
              ⭐ {t(PRAISE[praiseIndex % PRAISE.length])}
            </Text>
            <BigButton label={t('soundHearYourself')} icon="play" variant="secondary" minHeight={80} onPress={recorder.playBack} />
            <View style={styles.spacer} />
            <BigButton
              label={t('soundTryAgain')}
              icon="replay"
              variant="outline"
              minHeight={72}
              onPress={recorder.start}
            />
          </Card>
        ) : micBlocked || askedAlready ? (
          // No microphone is not a dead end: listening and saying it out loud is the exercise.
          <Card>
            <Text style={[styles.micBody, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('soundMicOff')}
            </Text>
            {recorder.message ? (
              <Text style={[styles.micNote, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {recorder.message}
              </Text>
            ) : null}
            <BigButton label={t('soundTryItAgain')} icon="replay" variant="secondary" minHeight={72} onPress={playModel} />
          </Card>
        ) : (
          <BigButton label={t('soundTapToSpeak')} icon="microphone" minHeight={96} onPress={recorder.start} />
        )}

        <BigButton label={t('soundNext')} icon="arrow-right" variant="success" minHeight={80} onPress={goToNext} />

        {/* Grown-up note: be honest that a synthesised model is an approximation. */}
        {modelSource === 'speech' ? (
          <Text style={[styles.note, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('soundModelIsSynthetic')}
          </Text>
        ) : null}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  letterCard: { alignItems: 'center', gap: SPACING.xs },
  letter: { fontFamily: Fonts.black, textAlign: 'center' },
  likeWord: { fontFamily: Fonts.semibold, textAlign: 'center' },
  micTitle: { fontFamily: Fonts.extrabold, textAlign: 'center', marginBottom: SPACING.sm },
  micBody: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: SPACING.md },
  micNote: { fontFamily: Fonts.semibold, fontSize: 13, textAlign: 'center', marginBottom: SPACING.md },
  praise: { fontFamily: Fonts.black, textAlign: 'center', marginBottom: SPACING.md },
  note: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  spacer: { height: SPACING.sm },
});
