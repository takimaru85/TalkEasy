import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { Fonts, Radius, useTheme } from '@/theme';
import { Icon } from '@/components/common/Icon';
import { tileInk } from '@/constants/colors';
import { fitFontSize } from '@/utils/fitText';
import type { Category } from '@/types/models';
import { useI18n } from '@/i18n';

interface Props {
  categories: Category[];
  /** null = "All" */
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  /** How many category pills to show before "More" (progressive disclosure). */
  visibleCount?: number;
}

/** Three chips per row, matching the card grid's rhythm. */
const COLUMNS = 3;
const BASE_LABEL = 16;

/**
 * Category chips. "All" is always first and the order never changes. Only the first few
 * categories are shown; a "More" chip reveals the rest in place — no sideways scrolling, so the
 * child never needs a swipe gesture. The selected chip is marked by a filled background AND a
 * check icon, not by colour alone.
 *
 * Layout: the icon sits ABOVE the label so the label gets the chip's full width. Side by side,
 * the icon and its gap ate ~28 of ~99dp and long names either truncated ("Emerge…") or spilled
 * out of the chip entirely. One shared label size — the largest that fits every visible chip —
 * keeps "Food" and "Activities" reading at the same size instead of each chip shrinking alone.
 */
export function CategoryBar({ categories, selectedId, onSelect, visibleCount = 4 }: Props) {
  const { t, tContent } = useI18n();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);

  const selectedHidden = selectedId !== null && categories.findIndex((c) => c.id === selectedId) >= visibleCount;
  const showAll = expanded || selectedHidden || categories.length <= visibleCount + 1;
  const shown = showAll ? categories : categories.slice(0, visibleCount);

  const items: { id: number | null; name: string; icon: string; color: string }[] = [
    { id: null, name: t('categoryAll'), icon: 'view-grid-outline', color: theme.colors.primarySoft },
    ...shown.map((c) => ({ id: c.id, name: tContent(c.name), icon: c.icon, color: c.color })),
  ];

  // Room for text inside one chip, then the size that fits the longest word of every label.
  const chipWidth = (width - SPACING.lg * 2 - SPACING.sm * (COLUMNS - 1)) / COLUMNS;
  const innerWidth = chipWidth - SPACING.sm * 2;
  const labelSize = useMemo(
    () => items.reduce((min, i) => Math.min(min, fitFontSize(i.name, innerWidth, BASE_LABEL, 'word', 12)), BASE_LABEL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.map((i) => i.name).join('|'), innerWidth],
  );

  const chipStyle = (selected: boolean) => [
    styles.chip,
    {
      backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
      borderColor: selected ? theme.colors.primaryDark : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
      borderWidth: theme.highContrast ? theme.borderWidth : 1.5,
    },
  ];

  const labelStyle = (color: string) => [styles.label, { fontSize: labelSize, lineHeight: Math.round(labelSize * 1.18), color }];

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {items.map((item) => {
        const selected = item.id === selectedId;
        const ink = selected
          ? '#FFFFFF'
          : theme.highContrast ? theme.colors.text
          : item.id === null ? theme.colors.primary
          : tileInk(item.color);
        return (
          <Pressable
            key={String(item.id)}
            onPress={() => onSelect(item.id)}
            accessibilityRole="tab"
            accessibilityLabel={`${item.name} category`}
            accessibilityState={{ selected }}
            hitSlop={4}
            style={({ pressed }) => [...chipStyle(selected), pressed && styles.pressed]}
          >
            <Icon name={selected ? 'check-bold' : item.icon} size={22} color={ink} />
            <Text
              style={labelStyle(selected ? '#FFFFFF' : theme.colors.text)}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              numberOfLines={2}
              textBreakStrategy="simple"
            >
              {item.name}
            </Text>
          </Pressable>
        );
      })}

      {!showAll ? (
        <Pressable
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel={`${t('categoryMore')}, ${categories.length - visibleCount}`}
          hitSlop={4}
          style={({ pressed }) => [...chipStyle(false), pressed && styles.pressed]}
        >
          <Icon name="dots-horizontal" size={22} color={theme.colors.textMuted} />
          <Text style={labelStyle(theme.colors.text)} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
            {t('categoryMore')}
          </Text>
        </Pressable>
      ) : expanded ? (
        <Pressable
          onPress={() => setExpanded(false)}
          accessibilityRole="button"
          accessibilityLabel={t('categoryLess')}
          hitSlop={4}
          style={({ pressed }) => [...chipStyle(false), pressed && styles.pressed]}
        >
          <Icon name="chevron-up" size={22} color={theme.colors.textMuted} />
          <Text style={labelStyle(theme.colors.text)} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
            {t('categoryLess')}
          </Text>
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
  chip: {
    // Exactly three per row: the basis leaves room for the two gaps between them.
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: MIN_CHILD_TARGET + 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    // A label can never paint outside its own chip again.
    overflow: 'hidden',
  },
  label: {
    fontFamily: Fonts.extrabold,
    textAlign: 'center',
    // Without this a Text keeps its natural width and spills out of the chip.
    alignSelf: 'stretch',
  },
  pressed: { opacity: 0.85 },
});
