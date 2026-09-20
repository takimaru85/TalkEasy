import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { addDays, formatShortDate, parseIsoDate, toIsoDate } from '@/utils/date';
import { Icon } from './Icon';
import { Fonts } from '@/theme';

interface Props {
  label: string;
  /** ISO 'YYYY-MM-DD' or null for "no date". */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Allow clearing to "no date" (default true). */
  optional?: boolean;
}

/**
 * Date chooser built from large buttons (no native picker, no dependency):
 * quick chips for Today / Tomorrow / the next school days, plus −1 / +1 day and −/+ week.
 */
export function DateField({ label, value, onChange, optional = true }: Props) {
  const sizes = useSizes();
  const today = toIsoDate(new Date());

  const quick: { label: string; iso: string }[] = [
    { label: 'Today', iso: today },
    { label: 'Tomorrow', iso: addDays(today, 1) },
  ];
  // Next five weekdays after tomorrow (skip weekends), labelled by weekday.
  let cursor = addDays(today, 2);
  while (quick.length < 6) {
    const d = parseIsoDate(cursor);
    if (d && d.getDay() !== 0 && d.getDay() !== 6) {
      quick.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), iso: cursor });
    }
    cursor = addDays(cursor, 1);
  }

  const shift = (days: number) => onChange(addDays(value ?? today, days));

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>

      <View style={styles.valueRow}>
        <Pressable onPress={() => shift(-7)} accessibilityRole="button" accessibilityLabel="One week earlier" style={styles.stepper}>
          <Icon name="chevron-double-left" size={28} />
        </Pressable>
        <Pressable onPress={() => shift(-1)} accessibilityRole="button" accessibilityLabel="One day earlier" style={styles.stepper}>
          <Icon name="chevron-left" size={30} />
        </Pressable>
        <View style={styles.value}>
          <Text style={[styles.valueText, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
            {value ? formatShortDate(value) : 'No date'}
          </Text>
        </View>
        <Pressable onPress={() => shift(1)} accessibilityRole="button" accessibilityLabel="One day later" style={styles.stepper}>
          <Icon name="chevron-right" size={30} />
        </Pressable>
        <Pressable onPress={() => shift(7)} accessibilityRole="button" accessibilityLabel="One week later" style={styles.stepper}>
          <Icon name="chevron-double-right" size={28} />
        </Pressable>
      </View>

      <View style={styles.chips}>
        {quick.map((q) => {
          const selected = q.iso === value;
          return (
            <Pressable
              key={q.iso}
              onPress={() => onChange(q.iso)}
              accessibilityRole="button"
              accessibilityLabel={`${q.label}, ${formatShortDate(q.iso)}`}
              accessibilityState={{ selected }}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {q.label}
              </Text>
            </Pressable>
          );
        })}
        {optional ? (
          <Pressable
            onPress={() => onChange(null)}
            accessibilityRole="button"
            accessibilityLabel="No date"
            accessibilityState={{ selected: value === null }}
            style={[styles.chip, value === null && styles.chipSelected]}
          >
            <Text style={[styles.chipText, value === null && styles.chipTextSelected]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              None
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  label: { fontFamily: Fonts.bold, color: Colors.text },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  stepper: {
    width: MIN_PARENT_TARGET - 6,
    height: MIN_PARENT_TARGET,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    flex: 1,
    minHeight: MIN_PARENT_TARGET,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: RADIUS.input,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  valueText: { fontFamily: Fonts.bold, color: Colors.text, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    minHeight: MIN_PARENT_TARGET - 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.button,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  chipText: { fontFamily: Fonts.bold, color: Colors.text, fontSize: 16 },
  chipTextSelected: { color: Colors.textOnDark },
});
