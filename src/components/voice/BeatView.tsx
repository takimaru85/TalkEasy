import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, PressableScale } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius } from '@/theme/adventure';
import type { BeatExercise, VoiceLine } from '@/practice/types';

interface Props {
  exercise: BeatExercise;
  say: (line: VoiceLine) => void;
  onDone: () => void;
}

/**
 * Copy the beats — rhythm and counting, with no speaking anywhere in it.
 *
 * NOTHING IS TIMED, and that is the important design decision. The app plays a number of beats and
 * the child taps that many, at whatever speed they like, with as many pauses as they like. Asking
 * a child to match a TEMPO would turn this into a motor test, and a good share of the children
 * this app is for cannot move quickly or evenly — they would fail an activity that was never
 * about their listening at all.
 *
 * Tapping a different number is answered by playing the beats again, never by a cross.
 */
export function BeatView({ exercise, say, onDone }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const night = !!theme.night;

  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState(-1);
  const [taps, setTaps] = useState(0);
  const [heard, setHeard] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const playBeats = () => {
    clear();
    setPlaying(true);
    setTaps(0);
    setLit(-1);
    for (let i = 0; i < exercise.beats; i++) {
      timers.current.push(
        setTimeout(() => {
          setLit(i);
          // Spoken as well as shown: a child who is not looking still hears the count.
          say({ id: `beat-${i}`, text: 'clap' });
        }, i * exercise.gapMs),
      );
    }
    timers.current.push(
      setTimeout(() => {
        setLit(-1);
        setPlaying(false);
        setHeard(true);
      }, exercise.beats * exercise.gapMs + 250),
    );
  };

  const matched = heard && taps === exercise.beats;

  return (
    <>
      <Text
        style={[styles.caption, { fontSize: sizes.body + 2, color: night ? '#FFFFFF' : theme.colors.text }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {playing ? t('vcBeatsPlaying') : heard ? t('vcBeatsYourTurn') : t('vcBeatsPlaying')}
      </Text>

      {/* The app's beats. Filled as each one sounds, so the count is visible as well as audible. */}
      <View style={styles.beats}>
        {Array.from({ length: exercise.beats }, (_, i) => (
          <View
            key={i}
            style={[
              styles.beat,
              {
                backgroundColor: lit === i ? Adventure.sun.from : night ? 'rgba(255,255,255,0.16)' : theme.colors.surfaceAlt,
                transform: [{ scale: lit === i ? 1.18 : 1 }],
              },
            ]}
          />
        ))}
      </View>

      <BigButton
        label={heard ? t('vcBeatsPlayAgain') : t('vcListen')}
        icon="volume-high"
        variant="secondary"
        minHeight={MIN_CHILD_TARGET}
        onPress={playBeats}
      />

      {heard ? (
        <>
          {/* The child's taps, counted but never clocked. */}
          <View style={styles.beats}>
            {Array.from({ length: Math.max(exercise.beats, taps) }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.beat,
                  { backgroundColor: i < taps ? Adventure.grass.from : night ? 'rgba(255,255,255,0.16)' : theme.colors.surfaceAlt },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.count, { color: night ? 'rgba(255,255,255,0.86)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('vcBeatsTapped', { n: taps })}
          </Text>

          <PressableScale
            onPress={() => setTaps((n) => n + 1)}
            accessibilityRole="button"
            accessibilityLabel={t('vcBeatsYourTurn')}
          >
            <View style={[styles.pad, { backgroundColor: Adventure.lagoon.from }]}>
              <Text style={styles.padEmoji} allowFontScaling={false}>👏</Text>
            </View>
          </PressableScale>

          {matched ? (
            <BigButton label={t('vcNext')} icon="arrow-right" minHeight={MIN_CHILD_TARGET} onPress={onDone} />
          ) : taps > 0 ? (
            // A different number is not a failure: offer the beats again, and a way onward.
            <BigButton label={t('vcTryAgain')} icon="refresh" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={() => { setTaps(0); playBeats(); }} />
          ) : null}
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  caption: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  beats: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, minHeight: 40, alignItems: 'center' },
  beat: { width: 28, height: 28, borderRadius: 14 },
  count: { fontFamily: Fonts.bold, fontSize: 14, textAlign: 'center' },
  pad: {
    minHeight: MIN_CHILD_TARGET + 40,
    borderRadius: AdventureRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padEmoji: { fontSize: 54 },
});
