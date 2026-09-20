import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts } from '@/theme';

export interface Choice<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Segmented control with large segments — used for size options, note type, etc. */
export function ChoiceRow<T extends string>({ label, choices, value, onChange }: Props<T>) {
  const sizes = useSizes();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {choices.map((c) => {
          const selected = c.value === value;
          return (
            <Pressable
              key={c.value}
              onPress={() => onChange(c.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              accessibilityLabel={`${label}: ${c.label}`}
              style={[styles.segment, selected && styles.segmentSelected]}
            >
              <Text
                style={[styles.segmentText, { fontSize: sizes.body - 1 }, selected && styles.segmentTextSelected]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
                numberOfLines={2}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  label: { fontFamily: Fonts.bold, color: Colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  segment: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: MIN_PARENT_TARGET,
    borderRadius: RADIUS.button,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  segmentSelected: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  segmentText: { fontFamily: Fonts.bold, color: Colors.text, textAlign: 'center' },
  segmentTextSelected: { color: Colors.textOnDark },
});
