import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import type { SoundRecorder } from '@/hooks/useSoundRecorder';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import type { Strings } from '@/i18n/types';
import { Fonts, useTheme } from '@/theme';

/** Rotating encouragement, so it never sounds like a machine repeating itself. */
export const PRAISE: (keyof Strings)[] = ['soundGreatTry', 'soundNiceJob', 'soundKeepPracticing'];

interface Props {
  recorder: SoundRecorder;
  /** Called with the attempt's length once the child stops recording. */
  onAttempt: (durationMs: number) => void;
  /** The grown-up tapped "Not now" once — stay quiet about the microphone after that. */
  declined: boolean;
  onDecline: () => void;
  praiseIndex: number;
}

/**
 * "Your turn" with the microphone — the Sound Practice recording flow, shared by every
 * Speech Practice exercise. Same privacy rule: the clip is a temporary cache file that
 * `useSoundRecorder` deletes; it is never transcribed, scored or stored.
 *
 * Nothing here is required. With no microphone, a refusal or an error the panel says so kindly
 * and the child simply practises out loud.
 */
export function MicPanel({ recorder, onAttempt, declined, onDecline, praiseIndex }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();

  const finish = async () => onAttempt(await recorder.stop());
  const blocked = recorder.phase === 'denied' || recorder.phase === 'unsupported' || recorder.phase === 'error';

  if (recorder.phase === 'needsPermission' && !declined) {
    // Explain before the OS prompt appears, never after.
    return (
      <Card>
        <Text style={[styles.title, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          🎤 {t('soundMicTitle')}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('soundMicExplain')}
        </Text>
        <BigButton label={t('soundMicAllow')} icon="microphone" minHeight={72} onPress={() => recorder.requestPermission()} />
        <View style={styles.spacer} />
        <BigButton label={t('soundMicNotNow')} variant="outline" minHeight={64} onPress={onDecline} />
      </Card>
    );
  }

  if (recorder.phase === 'recording') {
    return (
      <BigButton
        label={t('soundStopRecording')}
        icon="stop"
        variant="danger"
        minHeight={96}
        onPress={finish}
        accessibilityLabel={`${t('soundRecording')} ${t('soundStopRecording')}`}
      />
    );
  }

  if (recorder.phase === 'recorded') {
    return (
      <Card>
        <Text
          style={[styles.praise, { fontSize: sizes.phrase - 6, color: theme.colors.success }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLiveRegion="polite"
        >
          ⭐ {t(PRAISE[praiseIndex % PRAISE.length])}
        </Text>
        <BigButton label={t('soundHearYourself')} icon="play" variant="secondary" minHeight={76} onPress={recorder.playBack} />
        <View style={styles.spacer} />
        <BigButton label={t('soundTryAgain')} icon="replay" variant="outline" minHeight={68} onPress={recorder.start} />
      </Card>
    );
  }

  if (blocked || declined) {
    // No microphone is not a dead end: listening and saying it out loud is the exercise.
    return (
      <Card color={theme.colors.surfaceAlt}>
        <Text style={[styles.body, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('soundMicOff')}
        </Text>
        {recorder.message ? (
          <Text style={[styles.note, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {recorder.message}
          </Text>
        ) : null}
      </Card>
    );
  }

  return <BigButton label={t('soundTapToSpeak')} icon="microphone" minHeight={88} onPress={recorder.start} />;
}

const styles = StyleSheet.create({
  title: { fontFamily: Fonts.extrabold, textAlign: 'center', marginBottom: SPACING.sm },
  body: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: SPACING.sm },
  note: { fontFamily: Fonts.semibold, fontSize: 13, textAlign: 'center' },
  praise: { fontFamily: Fonts.black, textAlign: 'center', marginBottom: SPACING.md },
  spacer: { height: SPACING.sm },
});
