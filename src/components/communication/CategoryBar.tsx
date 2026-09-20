import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { Fonts, Radius, useTheme } from '@/theme';
import { Icon } from '@/components/common/Icon';
import type { Category } from '@/types/models';

interface Props {
  categories: Category[];
  /** null = "All" */
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  /** How many category pills to show before "More" (progressive disclosure). */
  visibleCount?: number;
}

/**
 * Category pills. "All" is always first and the order never changes. Only the first few
 * categories are shown; a "More" pill reveals the rest in place — no sideways scrolling,
 * so the child never needs a swipe gesture. The selected pill is marked by a filled
 * background AND a check icon, not by colour alone.
 */
export function CategoryBar({ categories, selectedId, onSelect, visibleCount = 4 }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const selectedHidden = selectedId !== null && categories.findIndex((c) => c.id === selectedId) >= visibleCount;
  const showAll = expanded || selectedHidden || categories.length <= visibleCount + 1;
  const shown = showAll ? categories : categories.slice(0, visibleCount);

  const items: { id: number | null; name: string; icon: string; color: string }[] = [
    { id: null, name: 'All', icon: 'view-grid', color: theme.colors.primarySoft },
    ...shown.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color })),
  ];

  const pillBase = (selected: boolean, color: string) => [
    styles.pill,
    theme.shadow,
    {
      backgroundColor: selected ? theme.colors.primary : theme.tint(color),
      borderColor: selected ? theme.colors.primaryDark : theme.highContrast ? theme.colors.border : 'transparent',
      borderWidth: theme.highContrast ? theme.borderWidth : selected ? 1.5 : 0,
    },
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
            style={pillBase(selected, item.color)}
          >
            <Icon name={selected ? 'check-bold' : item.icon} size={24} color={selected ? '#FFFFFF' : theme.colors.text} />
            <Text style={[styles.label, { color: selected ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
      {!showAll ? (
        <Pressable
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel={`More categories, ${categories.length - visibleCount} more`}
          hitSlop={4}
          style={pillBase(false, theme.colors.surfaceAlt)}
        >
          <Icon name="dots-horizontal-circle" size={24} color={theme.colors.text} />
          <Text style={[styles.label, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>More</Text>
        </Pressable>
      ) : expanded ? (
        <Pressable onPress={() => setExpanded(false)} accessibilityRole="button" accessibilityLabel="Fewer categories" hitSlop={4} style={pillBase(false, theme.colors.surfaceAlt)}>
          <Icon name="chevron-up" size={24} color={theme.colors.text} />
          <Text style={[styles.label, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Less</Text>
        </Pressable>
      ) : null}
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
  pill: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: MIN_CHILD_TARGET,
    paddingHorizontal: SPACING.sm,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: { fontFamily: Fonts.extrabold, fontSize: 16 },
});
