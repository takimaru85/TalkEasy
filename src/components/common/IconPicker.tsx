import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { ICON_GROUPS } from '@/constants/icons';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Icon } from './Icon';
import { Fonts } from '@/theme';

interface Props {
  value: string;
  onChange: (icon: string) => void;
  /** Background color previewed behind the selected icon. */
  previewColor?: string;
}

const CELL = MIN_PARENT_TARGET + 8;

/** Grouped grid of bundled icons. Scrolls inside a fixed-height box so forms stay compact. */
export function IconPicker({ value, onChange, previewColor = Colors.surface }: Props) {
  const sizes = useSizes();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Icon
      </Text>
      <View style={styles.preview}>
        <View style={[styles.previewBox, { backgroundColor: previewColor }]}>
          <Icon name={value} size={44} />
        </View>
        <Text style={styles.previewName} maxFontSizeMultiplier={MAX_FONT_SCALE}>{value}</Text>
      </View>
      <ScrollView style={styles.scroll} nestedScrollEnabled>
        {ICON_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{group.title}</Text>
            <View style={styles.grid}>
              {group.icons.map((name) => {
                const selected = name === value;
                return (
                  <Pressable
                    key={name}
                    onPress={() => onChange(name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Icon ${name}`}
                    accessibilityState={{ selected }}
                    style={[styles.cell, selected && styles.cellSelected]}
                  >
                    <Icon name={name} size={32} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  label: { fontFamily: Fonts.bold, color: Colors.text },
  preview: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  previewBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: { color: Colors.textMuted, fontSize: 16 },
  scroll: {
    maxHeight: 300,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: SPACING.sm,
  },
  group: { marginBottom: SPACING.md },
  groupTitle: { fontFamily: Fonts.bold, color: Colors.textMuted, marginBottom: SPACING.xs, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CFCFCF',
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: { borderColor: Colors.primaryDark, borderWidth: 4, backgroundColor: '#E3ECFF' },
});
