import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, TileColors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Icon } from './Icon';

interface Props {
  value: string;
  onChange: (color: string) => void;
}

/** Row of large color swatches for tile backgrounds. */
export function ColorPicker({ value, onChange }: Props) {
  const sizes = useSizes();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Color
      </Text>
      <View style={styles.row}>
        {TileColors.map((c) => {
          const selected = c.value === value;
          return (
            <Pressable
              key={c.key}
              onPress={() => onChange(c.value)}
              accessibilityRole="button"
              accessibilityLabel={`Color ${c.name}`}
              accessibilityState={{ selected }}
              style={[styles.swatch, { backgroundColor: c.value }, selected && styles.swatchSelected]}
            >
              {selected ? <Icon name="check-bold" size={30} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  label: { fontWeight: '700', color: Colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  swatch: {
    width: MIN_PARENT_TARGET + 4,
    height: MIN_PARENT_TARGET + 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: { borderWidth: 5, borderColor: Colors.primaryDark },
});
