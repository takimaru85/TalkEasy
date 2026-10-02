import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, Icon } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useCountdown } from '@/hooks/useCountdown';
import {
  MAX_MINUTES,
  MIN_MINUTES,
  QUICK_MINUTES,
  TIMER_COPY,
  formatClock,
  spokenRemaining,
} from '@/therapy/timer';
import { Fonts, Radius, useTheme } from '@/theme';

/**
 * The practice timer on a therapy activity.
 *
 * A GUIDE, NOT A TARGET. It records nothing, completes nothing and never tells a child to continue:
 * at 00:00 it says so kindly and stops. The activity's own "Done for today" button is the only thing
 * that records practice, and this component deliberately has no way to reach it.
 *
 * Its safety reminder sits INSIDE the card, so a grown-up who looks at the timer reads it; the
 * activity's own safety note below is untouched and still always visible.
 *
 * Reusable: it takes only a default length. Key it by activity id where it is used, so moving to
 * another activity starts that activity's own default.
 */
export function TherapyTimer({ defaultMinutes }: { defaultMinutes: number }) {
  const theme = useTheme();
  const c = theme.colors;
  const { timer, left, start, pause, resume, reset, choose } = useCountdown(defaultMinutes);
  const counting = timer.kind === 'running' || timer.kind === 'paused';
  const done = timer.kind === 'done';

  return (
    <Card>
      <Text style={[styles.label, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {TIMER_COPY.title}
      </Text>

      <Text
        style={[styles.clock, { color: done ? c.success : c.text }]}
        maxFontSizeMultiplier={1.2}
        accessibilityRole="timer"
        accessibilityLabel={spokenRemaining(left)}
      >
        {formatClock(left)}
      </Text>

      {done ? (
        <View accessibilityLiveRegion="polite">
          <Text style={[styles.doneTitle, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {TIMER_COPY.done}
          </Text>
          <Text style={[styles.meta, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {TIMER_COPY.doneSub}
          </Text>
        </View>
      ) : (
        <Text style={[styles.meta, styles.center, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {timer.minutes} {timer.minutes === 1 ? 'minute' : 'minutes'} selected
        </Text>
      )}

      {/* The length can only change while nothing is counting. */}
      {!counting ? (
        <View style={styles.picker}>
          <View style={styles.chips}>
            {QUICK_MINUTES.map((m) => {
              const on = m === timer.minutes;
              return (
                <Pressable
                  key={m}
                  onPress={() => choose(m)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${m} ${m === 1 ? 'minute' : 'minutes'}`}
                  style={[styles.chip, { backgroundColor: on ? c.primary : c.surfaceAlt, borderColor: on ? c.primary : c.borderSoft }]}
                >
                  <Text style={[styles.chipText, { color: on ? '#FFFFFF' : c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {m}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => choose(timer.minutes - 1)}
              disabled={timer.minutes <= MIN_MINUTES}
              accessibilityRole="button"
              accessibilityLabel="One minute less"
              style={[styles.step, { backgroundColor: c.surfaceAlt, borderColor: c.borderSoft, opacity: timer.minutes <= MIN_MINUTES ? 0.4 : 1 }]}
            >
              <Icon name="minus" size={26} color={c.text} />
            </Pressable>
            <Text style={[styles.stepLabel, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Your own length
            </Text>
            <Pressable
              onPress={() => choose(timer.minutes + 1)}
              disabled={timer.minutes >= MAX_MINUTES}
              accessibilityRole="button"
              accessibilityLabel="One minute more"
              style={[styles.step, { backgroundColor: c.surfaceAlt, borderColor: c.borderSoft, opacity: timer.minutes >= MAX_MINUTES ? 0.4 : 1 }]}
            >
              <Icon name="plus" size={26} color={c.text} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.controls}>
        {timer.kind === 'idle' ? <BigButton label="Start timer" icon="timer-outline" minHeight={MIN_CHILD_TARGET} onPress={start} /> : null}
        {timer.kind === 'running' ? <BigButton label="Pause" icon="pause" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={pause} /> : null}
        {timer.kind === 'paused' ? <BigButton label="Resume" icon="play" minHeight={MIN_CHILD_TARGET} onPress={resume} /> : null}
        {counting || done ? (
          <BigButton label="Reset" icon="restart" variant="outline" minHeight={MIN_CHILD_TARGET} onPress={reset} />
        ) : null}
      </View>

      <View style={styles.row}>
        <Icon name="shield-alert-outline" size={20} color={c.danger} />
        <Text style={[styles.safety, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {TIMER_COPY.safety}
        </Text>
      </View>
      <Text style={[styles.meta, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {TIMER_COPY.guide}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.8, marginBottom: 4 },
  clock: { fontFamily: Fonts.black, fontSize: 56, lineHeight: 64, textAlign: 'center', fontVariant: ['tabular-nums'] },
  doneTitle: { fontFamily: Fonts.extrabold, fontSize: 17, lineHeight: 24, textAlign: 'center' },
  meta: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, marginTop: SPACING.sm },
  center: { textAlign: 'center' },
  picker: { gap: SPACING.sm, marginTop: SPACING.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  // Grown-up controls: 56pt, the Parent Mode minimum.
  chip: { minWidth: 56, height: 56, borderRadius: Radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  chipText: { fontFamily: Fonts.extrabold, fontSize: 18 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  step: { width: 56, height: 56, borderRadius: Radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontFamily: Fonts.bold, fontSize: 13, flex: 1, textAlign: 'center' },
  controls: { gap: SPACING.sm, marginTop: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginTop: SPACING.md },
  safety: { fontFamily: Fonts.extrabold, fontSize: 13, lineHeight: 19, flex: 1 },
});
