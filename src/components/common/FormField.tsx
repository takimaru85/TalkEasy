import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts } from '@/theme';

interface Props extends TextInputProps {
  label: string;
  hint?: string;
}

/** Labeled text input with large text and a tall touch area. */
export function FormField({ label, hint, style, multiline, ...rest }: Props) {
  const sizes = useSizes();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>
      <TextInput
        {...rest}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor="#8A8A8A"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={[
          styles.input,
          { fontSize: sizes.body, minHeight: multiline ? MIN_PARENT_TARGET * 2 : MIN_PARENT_TARGET },
          multiline && styles.multiline,
          style,
        ]}
      />
      {hint ? <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  label: { fontFamily: Fonts.bold, color: Colors.text },
  input: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  multiline: { textAlignVertical: 'top' },
  hint: { color: Colors.textMuted, fontSize: 15 },
});
