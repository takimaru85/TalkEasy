import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { Fonts, Radius, useTheme } from '@/theme';

interface Props {
  value: string;
  onChange: (next: string) => void;
  onDone: () => void;
  /** Start on the number pad (for maths answers). */
  numbersFirst?: boolean;
  placeholder?: string;
}

const LETTER_ROWS = ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ'];
const NUMBER_ROWS = ['123', '456', '789', '0'];

/**
 * On-screen keyboard with very large, well-spaced keys — alphabetical (easier for a young
 * reader than QWERTY), high contrast, no tiny controls. Keys scale with the screen width so
 * it stays comfortable in landscape on a tablet. The native keyboard is never shown.
 */
export function BigKeyboard({ value, onChange, onDone, numbersFirst = false, placeholder = 'Type here' }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [numbers, setNumbers] = useState(numbersFirst);

  const rows = numbers ? NUMBER_ROWS : LETTER_ROWS;
  const perRow = numbers ? 3 : 7;
  const gap = width >= 700 ? 12 : 8;
  const keySize = Math.min(96, Math.floor((width - SPACING.lg * 2 - gap * (perRow - 1)) / perRow));
  const keyHeight = Math.max(64, Math.min(88, keySize));

  const key = (label: string, onPress: () => void, opts: { wide?: number; accent?: boolean; a11y?: string; icon?: string } = {}) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={opts.a11y ?? label}
      hitSlop={2}
      style={({ pressed }) => [
        styles.key,
        {
          width: opts.wide ? keySize * opts.wide + gap * (opts.wide - 1) : keySize,
          height: keyHeight,
          backgroundColor: pressed ? theme.colors.selected : opts.accent ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
          borderWidth: theme.highContrast ? theme.borderWidth : 1.5,
        },
      ]}
    >
      {opts.icon ? <Icon name={opts.icon} size={30} color={opts.accent ? '#FFFFFF' : theme.colors.text} /> : null}
      <Text style={[styles.keyText, { fontSize: Math.min(34, keySize * 0.5), color: opts.accent ? '#FFFFFF' : theme.colors.text }]} allowFontScaling={false}>
        {opts.icon ? '' : label}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      <View style={[styles.display, { backgroundColor: theme.colors.surface, borderColor: value ? theme.colors.primary : theme.colors.borderSoft }]} accessibilityLiveRegion="polite" accessibilityLabel={value ? `Typed: ${value}` : placeholder}>
        <Text style={[styles.displayText, { color: value ? theme.colors.text : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
          {value || placeholder}
        </Text>
      </View>

      <View style={[styles.rows, { gap }]}>
        {rows.map((row) => (
          <View key={row} style={[styles.row, { gap }]}>
            {row.split('').map((ch) => key(ch, () => onChange(value + (numbers ? ch : ch.toLowerCase()))))}
          </View>
        ))}
        <View style={[styles.row, { gap }]}>
          {key(numbers ? 'ABC' : '123', () => setNumbers((n) => !n), { wide: 2, a11y: numbers ? 'Letters' : 'Numbers' })}
          {key('space', () => onChange(value + ' '), { wide: numbers ? 1 : 2, a11y: 'Space', icon: 'keyboard-space' })}
          {key('back', () => onChange(value.slice(0, -1)), { wide: 1, a11y: 'Delete last letter', icon: 'backspace-outline' })}
          {key('done', onDone, { wide: 2, accent: true, a11y: 'Done, check my answer', icon: 'check-bold' })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.md },
  display: { minHeight: 76, borderRadius: Radius.md, borderWidth: 2.5, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, justifyContent: 'center' },
  displayText: { fontFamily: Fonts.black, fontSize: 32, textAlign: 'center' },
  rows: { alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center' },
  key: { borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontFamily: Fonts.black },
});
