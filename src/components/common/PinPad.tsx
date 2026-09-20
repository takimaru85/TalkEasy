import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { Icon } from './Icon';
import { Fonts } from '@/theme';

interface Props {
  length?: number;
  onComplete: (pin: string) => void;
  /** Bumps when the parent wants the pad cleared (e.g. after a wrong PIN). */
  resetKey?: number;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];
const KEY_SIZE = 88;

/** Large 3x4 numeric keypad. Calls onComplete once `length` digits are entered. */
export function PinPad({ length = 4, onComplete, resetKey = 0 }: Props) {
  const [digits, setDigits] = useState('');

  React.useEffect(() => {
    setDigits('');
  }, [resetKey]);

  const press = (key: string) => {
    if (key === 'clear') return setDigits('');
    if (key === 'back') return setDigits((d) => d.slice(0, -1));
    if (digits.length >= length) return;
    const next = digits + key;
    setDigits(next);
    if (next.length === length) {
      onComplete(next);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.dots} accessibilityLabel={`${digits.length} of ${length} digits entered`}>
        {Array.from({ length }).map((_, i) => (
          <View key={i} style={[styles.dot, i < digits.length && styles.dotFilled]} />
        ))}
      </View>

      <View style={styles.grid}>
        {KEYS.map((key) => (
          <Pressable
            key={key}
            onPress={() => press(key)}
            accessibilityRole="button"
            accessibilityLabel={key === 'back' ? 'Delete digit' : key === 'clear' ? 'Clear' : key}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            {key === 'back' ? (
              <Icon name="backspace-outline" size={34} />
            ) : key === 'clear' ? (
              <Text style={styles.keyTextSmall} maxFontSizeMultiplier={MAX_FONT_SCALE}>Clear</Text>
            ) : (
              <Text style={styles.keyText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{key}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: SPACING.xl },
  dots: { flexDirection: 'row', gap: SPACING.lg },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  dotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  grid: {
    width: KEY_SIZE * 3 + SPACING.md * 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: { backgroundColor: Colors.selected },
  keyText: { fontSize: 36, fontFamily: Fonts.extrabold, color: Colors.text },
  keyTextSmall: { fontSize: 20, fontFamily: Fonts.bold, color: Colors.text },
});
