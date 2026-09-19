import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { formatTime } from '@/utils/date';
import { Icon } from './Icon';

interface Props {
  label: string;
  /** 'HH:MM' (24h) or null for "no time". */
  value: string | null;
  onChange: (value: string | null) => void;
  optional?: boolean;
  /** Minutes per tap on the minute buttons. */
  step?: number;
}

function split(value: string | null): { h: number; m: number } {
  if (!value) return { h: 8, m: 0 };
  const [h, m] = value.split(':').map(Number);
  return { h: Number.isFinite(h) ? h : 8, m: Number.isFinite(m) ? m : 0 };
}

function join(h: number, m: number): string {
  return `${String(((h % 24) + 24) % 24).padStart(2, '0')}:${String(((m % 60) + 60) % 60).padStart(2, '0')}`;
}

/** Time chooser with big hour / minute steppers — no native picker. */
export function TimeField({ label, value, onChange, optional = true, step = 15 }: Props) {
  const sizes = useSizes();
  const { h, m } = split(value);

  const setHour = (delta: number) => onChange(join(h + delta, m));
  const setMinute = (delta: number) => {
    let total = h * 60 + m + delta;
    total = ((total % 1440) + 1440) % 1440;
    onChange(join(Math.floor(total / 60), total % 60));
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>
      <View style={styles.row}>
        <Stepper icon="minus" label="One hour earlier" onPress={() => setHour(-1)} />
        <Stepper icon="minus" label={`${step} minutes earlier`} onPress={() => setMinute(-step)} small />
        <View style={styles.value}>
          <Text style={[styles.valueText, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {value ? formatTime(value) : 'No time'}
          </Text>
        </View>
        <Stepper icon="plus" label={`${step} minutes later`} onPress={() => setMinute(step)} small />
        <Stepper icon="plus" label="One hour later" onPress={() => setHour(1)} />
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText} maxFontSizeMultiplier={MAX_FONT_SCALE}>hour</Text>
        <Text style={styles.legendText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{step} min</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.legendText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{step} min</Text>
        <Text style={styles.legendText} maxFontSizeMultiplier={MAX_FONT_SCALE}>hour</Text>
      </View>
      {optional && value ? (
        <Pressable onPress={() => onChange(null)} accessibilityRole="button" accessibilityLabel="Clear time" style={styles.clear}>
          <Text style={styles.clearText} maxFontSizeMultiplier={MAX_FONT_SCALE}>No time</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Stepper({ icon, label, onPress, small }: { icon: string; label: string; onPress: () => void; small?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.stepper, small && styles.stepperSmall]}>
      <Icon name={icon} size={small ? 22 : 30} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.xs },
  label: { fontWeight: '700', color: Colors.text, marginBottom: SPACING.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  stepper: {
    width: MIN_PARENT_TARGET - 4,
    height: MIN_PARENT_TARGET,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSmall: { backgroundColor: Colors.background },
  value: {
    flex: 1,
    minHeight: MIN_PARENT_TARGET,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: RADIUS.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: { fontWeight: '800', color: Colors.text },
  legend: { flexDirection: 'row', gap: SPACING.xs, paddingHorizontal: 2 },
  legendText: { width: MIN_PARENT_TARGET - 4, textAlign: 'center', fontSize: 12, color: Colors.textMuted },
  clear: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: SPACING.sm },
  clearText: { color: Colors.primaryDark, fontWeight: '700', fontSize: 16 },
});
