import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import type { CalendarEntry } from '@/types/models';
import { addDays, monthRange, parseIsoDate, toIsoDate } from '@/utils/date';
import { Icon } from '@/components/common/Icon';
import { Fonts } from '@/theme';

interface Props {
  /** Any ISO date inside the month to show. */
  month: string;
  today: string;
  selected: string | null;
  entries: CalendarEntry[];
  onSelect: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Month view with big day cells (7 columns). Each cell shows up to 3 colored dots for
 * that day's entries. Tap a day to see its list below; ‹ › move by month. No swiping.
 */
export function MonthGrid({ month, today, selected, entries, onSelect, onPrevMonth, onNextMonth }: Props) {
  const { from } = monthRange(month);
  const first = parseIsoDate(from) ?? new Date();
  const title = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const cells = useMemo(() => {
    const out: (string | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) out.push(null);
    let cursor = from;
    while (cursor.slice(0, 7) === from.slice(0, 7)) {
      out.push(cursor);
      cursor = addDays(cursor, 1);
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [from, first]);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const e of entries) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [entries]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} accessibilityRole="button" accessibilityLabel="Previous month" style={styles.nav}>
          <Icon name="chevron-left" size={34} />
        </Pressable>
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
          {title}
        </Text>
        <Pressable onPress={onNextMonth} accessibilityRole="button" accessibilityLabel="Next month" style={styles.nav}>
          <Icon name="chevron-right" size={34} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekday} maxFontSizeMultiplier={MAX_FONT_SCALE}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((iso, i) => {
          if (!iso) return <View key={`e${i}`} style={styles.cell} />;
          const d = parseIsoDate(iso) as Date;
          const dayEntries = byDate.get(iso) ?? [];
          const isToday = iso === today;
          const isSelected = iso === selected;
          return (
            <Pressable
              key={iso}
              onPress={() => onSelect(iso)}
              accessibilityRole="button"
              accessibilityLabel={`${d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}${dayEntries.length ? `, ${dayEntries.length} items` : ''}${isToday ? ', today' : ''}`}
              accessibilityState={{ selected: isSelected }}
              style={[styles.cell, styles.dayCell, isToday && styles.today, isSelected && styles.selected]}
            >
              <Text style={[styles.dayText, isToday && styles.todayText]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {d.getDate()}
              </Text>
              <View style={styles.dots}>
                {dayEntries.slice(0, 3).map((e) => (
                  <View key={e.key} style={[styles.dot, { backgroundColor: e.color }]} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function shiftMonth(month: string, delta: number): string {
  const d = parseIsoDate(month) ?? new Date();
  return toIsoDate(new Date(d.getFullYear(), d.getMonth() + delta, 1));
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.xs },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: {
    width: MIN_PARENT_TARGET + 8,
    height: MIN_PARENT_TARGET,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontFamily: Fonts.extrabold, color: Colors.text },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontFamily: Fonts.extrabold, color: Colors.textMuted, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 0.9, padding: 2 },
  dayCell: {
    borderWidth: 2,
    borderColor: '#DADADA',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: Colors.background,
  },
  today: { borderColor: Colors.primaryDark, borderWidth: 3, backgroundColor: '#E3ECFF' },
  selected: { backgroundColor: Colors.selected, borderColor: Colors.border, borderWidth: 3 },
  dayText: { fontSize: 18, fontFamily: Fonts.extrabold, color: Colors.text },
  todayText: { color: Colors.primaryDark },
  dots: { flexDirection: 'row', gap: 3, minHeight: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: Colors.border },
});
