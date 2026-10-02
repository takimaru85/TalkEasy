import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import { Fonts, useTheme } from '@/theme';
import type { CopyActionExercise, VoiceLine } from '@/practice/types';

interface Props {
  exercise: CopyActionExercise;
  say: (line: VoiceLine) => void;
  onDone: () => void;
}

/**
 * Copy the action — clap, wave, stamp.
 *
 * Imitating a MOVEMENT comes before imitating a sound, and this is the whole of it: the app shows
 * and says an action, the child has a go, and taps to move on.
 *
 * THE APP CANNOT SEE THE CHILD, so it never claims to know whether they did it. There is no
 * checking here and nothing to get wrong — which is exactly why it is a good place for a child who
 * has not succeeded at much else today. A child who cannot make the movement taps the gentler
 * option, and that counts the same: the practice being recorded is joining in, not performing.
 */
export function CopyActionView({ exercise, say, onDone }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <>
      <Card>
        <View style={styles.body}>
          <Text style={styles.picture} allowFontScaling={false}>{exercise.picture}</Text>
          <Text
            style={[styles.line, { fontSize: sizes.phrase - 8, color: theme.colors.text }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {exercise.line.text}
          </Text>
        </View>
      </Card>

      <BigButton
        label={t('vcWatchAgain')}
        icon="volume-high"
        variant="secondary"
        minHeight={MIN_CHILD_TARGET}
        onPress={() => say(exercise.line)}
      />
      <BigButton label={t('vcIDidIt')} icon="check" minHeight={MIN_CHILD_TARGET + 8} onPress={onDone} />
      {exercise.gentlerKey ? (
        <Text
          style={[styles.gentler, { color: theme.night ? 'rgba(255,255,255,0.8)' : theme.colors.textMuted }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t(exercise.gentlerKey)}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  picture: { fontSize: 88 },
  line: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  gentler: { fontFamily: Fonts.bold, fontSize: 13, textAlign: 'center' },
});
