import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, PressableScale } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius } from '@/theme/adventure';
import type { WaitGoExercise, VoiceLine } from '@/practice/types';

interface Props {
  exercise: WaitGoExercise;
  /** Speaks one line through the activity screen's model player. */
  say: (line: VoiceLine) => void;
  /** All rounds finished. */
  onDone: () => void;
}

type Phase = 'idle' | 'ready' | 'steady' | 'go' | 'early' | 'well-done';

/**
 * Ready, steady… GO.
 *
 * Waiting for a cue before acting — the attention skill the developmental sequence puts before
 * almost everything else, and one a child practises entirely without speaking.
 *
 * WHAT THIS IS NOT: a reaction test. Nothing measures how FAST the child taps after GO; the button
 * simply waits for them, for as long as they need. Tapping early is answered with "wait for GO"
 * and the round starts again — never a cross, never a lost point, never a score. The only thing
 * that changes across rounds is how long the pause is, because anticipating a longer wait is the
 * whole skill.
 */
export function WaitGoView({ exercise, say, onDone }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const night = !!theme.night;

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const start = () => {
    clear();
    setPhase('ready');
    say({ id: 'ready', text: t('vcReady') });
    timers.current.push(
      setTimeout(() => {
        setPhase('steady');
        say({ id: 'steady', text: t('vcSteady') });
      }, 1100),
    );
    // The wait that grows. `waits` is indexed by round, so each round asks for a little more.
    timers.current.push(
      setTimeout(() => {
        setPhase('go');
        say({ id: 'go', text: t('vcGo') });
      }, 1100 + 900 + exercise.waits[round]),
    );
  };

  const tap = () => {
    if (phase === 'go') {
      clear();
      const last = round + 1 >= exercise.waits.length;
      setPhase('well-done');
      if (last) {
        timers.current.push(setTimeout(onDone, 900));
      } else {
        timers.current.push(
          setTimeout(() => {
            setRound((r) => r + 1);
            setPhase('idle');
          }, 900),
        );
      }
      return;
    }
    // Too early. Say so kindly and let them go again — the round is not lost, it restarts.
    clear();
    setPhase('early');
    timers.current.push(setTimeout(() => setPhase('idle'), 1400));
  };

  const light =
    phase === 'go' ? Adventure.grass.from : phase === 'steady' ? Adventure.sun.from : phase === 'early' ? Adventure.coral.from : Adventure.sky.from;

  const caption =
    phase === 'ready' ? t('vcReady')
      : phase === 'steady' ? t('vcSteady')
        : phase === 'go' ? t('vcGo')
          : phase === 'early' ? t('vcWaitForGo')
            : phase === 'well-done' ? t('vcNiceWaiting')
              : '';

  return (
    <>
      <Card>
        <View style={styles.head}>
          {exercise.intro.picture ? (
            <Text style={styles.emoji} allowFontScaling={false}>{exercise.intro.picture}</Text>
          ) : null}
          <Text
            style={[styles.intro, { fontSize: sizes.body + 2, color: theme.colors.text }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {exercise.intro.text}
          </Text>
          <Text style={[styles.round, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('vcRound', { n: round + 1 })} / {exercise.waits.length}
          </Text>
        </View>
      </Card>

      {/* The cue is given three ways at once — a colour, a word, and the spoken line — so it does
          not depend on hearing it, on reading it, or on telling colours apart. */}
      <View
        style={[styles.lamp, { backgroundColor: light, opacity: phase === 'idle' ? 0.4 : 1 }]}
        accessibilityLiveRegion="assertive"
        accessibilityLabel={caption}
      >
        <Text style={styles.lampText} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
          {caption || '…'}
        </Text>
      </View>

      {phase === 'idle' || phase === 'early' ? (
        <BigButton label={t('vcListen')} icon="play" minHeight={MIN_CHILD_TARGET} onPress={start} />
      ) : (
        <PressableScale onPress={tap} accessibilityRole="button" accessibilityLabel={t('vcTapNow')}>
          <View style={[styles.button, { backgroundColor: phase === 'go' ? Adventure.grass.from : night ? 'rgba(255,255,255,0.12)' : theme.colors.surfaceAlt }]}>
            <Text style={[styles.buttonText, { color: phase === 'go' ? '#FFFFFF' : night ? '#FFFFFF' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {phase === 'go' ? t('vcTapNow') : t('vcWait')}
            </Text>
          </View>
        </PressableScale>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: SPACING.sm },
  emoji: { fontSize: 46 },
  intro: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  round: { fontFamily: Fonts.bold, fontSize: 12 },
  lamp: {
    minHeight: 92,
    borderRadius: AdventureRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  lampText: { fontFamily: Fonts.black, fontSize: 30, color: '#FFFFFF', textAlign: 'center', letterSpacing: 1 },
  button: {
    minHeight: MIN_CHILD_TARGET + 24,
    borderRadius: AdventureRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  buttonText: { fontFamily: Fonts.black, fontSize: 22, textAlign: 'center' },
});
