import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BigButton, Card } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import type { ClapExercise } from '@/speechpractice/types';
import { Fonts, Radius, useTheme } from '@/theme';
import { ItemPicture } from './ItemPicture';
import { PRAISE } from './MicPanel';
import type { PracticeKit } from './kit';

/**
 * Clap the syllables: BA-NA-NA → 👏 👏 👏. Each tap lights the next beat. There is no timing at
 * all — slow, fast or with pauses, every clap counts.
 */
export function ClapExerciseView({ exercise, kit }: { exercise: ClapExercise; kit: PracticeKit }) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { settings } = useSettings();
  const [claps, setClaps] = useState(0);
  const done = claps >= exercise.beats.length;

  const clap = () => {
    if (done) return;
    const next = claps + 1;
    setClaps(next);
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (next === exercise.beats.length) {
      kit.attempt(exercise.item.text);
      kit.nextPraise();
      kit.speakUi(t(PRAISE[(kit.praiseIndex + 1) % PRAISE.length]));
    }
  };

  // The whole word, as a real word: reading the beats ("ba. na. na.") to a voice engine makes it
  // guess at isolated syllables, which is exactly what Speech Practice must not model.
  const hear = () => kit.play([exercise.item]);

  return (
    <View style={styles.wrap}>
      <Card color={theme.colors.primarySoft} style={styles.center}>
        <ItemPicture item={exercise.item} size={sizes.iconSize + 12} />
        <Text style={[styles.word, { fontSize: sizes.phrase, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {kit.label(exercise.item)}
        </Text>
        <View style={styles.beats} accessible accessibilityLabel={`${exercise.beats.join(' - ')}. ${claps} / ${exercise.beats.length}`}>
          {exercise.beats.map((b, i) => {
            const on = i < claps;
            return (
              <View
                key={`${b}-${i}`}
                style={[styles.beat, { borderColor: on ? theme.colors.success : theme.colors.border, backgroundColor: on ? theme.tint(theme.colors.successSoft) : theme.colors.surface }]}
              >
                <Text style={styles.beatEmoji} allowFontScaling={false}>{on ? '👏' : '○'}</Text>
                <Text style={[styles.beatText, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{b}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      <BigButton label={t('spHearIt')} icon="volume-high" variant="secondary" minHeight={72} onPress={hear} />
      {done ? (
        <>
          <Text style={[styles.praise, { fontSize: sizes.phrase - 6, color: theme.colors.success }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLiveRegion="polite">
            ⭐ {t(PRAISE[kit.praiseIndex % PRAISE.length])}
          </Text>
          <BigButton label={t('spClapAgain')} icon="replay" variant="outline" minHeight={68} onPress={() => setClaps(0)} />
        </>
      ) : (
        <BigButton label={`👏 ${t('spTapToClap')}`} minHeight={110} onPress={clap} accessibilityLabel={`${t('spTapToClap')}, ${claps} / ${exercise.beats.length}`} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.md },
  center: { alignItems: 'center', gap: SPACING.sm },
  word: { fontFamily: Fonts.black },
  beats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm },
  beat: { minWidth: 72, minHeight: 72, borderRadius: Radius.md, borderWidth: 3, alignItems: 'center', justifyContent: 'center', padding: SPACING.xs },
  beatEmoji: { fontSize: 26, lineHeight: 32 },
  beatText: { fontFamily: Fonts.black },
  praise: { fontFamily: Fonts.black, textAlign: 'center' },
});
