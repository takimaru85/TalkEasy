import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { Icon } from '@/components/common/Icon';
import type { Category } from '@/types/models';

interface Props {
  categories: Category[];
  /** null = "All" */
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

const ALL_ID = null;

/**
 * Category buttons. "All" is always first and the order never changes.
 * The row WRAPS instead of scrolling sideways, so the child never needs a swipe gesture.
 * Categories without any visible buttons are not passed in (see categoriesRepo.getHomeCategories).
 */
export function CategoryBar({ categories, selectedId, onSelect }: Props) {
  const items: { id: number | null; name: string; icon: string; color: string }[] = [
    { id: ALL_ID, name: 'All', icon: 'view-grid', color: Colors.surface },
    ...categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color })),
  ];

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {items.map((item) => {
        const selected = item.id === selectedId;
        return (
          <Pressable
            key={String(item.id)}
            onPress={() => onSelect(item.id)}
            accessibilityRole="tab"
            accessibilityLabel={`${item.name} category`}
            accessibilityState={{ selected }}
            hitSlop={4}
            style={[styles.chip, { backgroundColor: item.color }, selected && styles.chipSelected]}
          >
            <Icon name={item.icon} size={26} color={Colors.text} />
            <Text style={styles.chipLabel} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  chip: {
    flexGrow: 1,
    flexBasis: '30%',
    height: MIN_CHILD_TARGET + 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.button,
    borderWidth: 3,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  chipSelected: { borderColor: Colors.primaryDark, borderWidth: 5, backgroundColor: '#FFF7CC' },
  chipLabel: { fontSize: 16, fontWeight: '800', color: Colors.text },
});
