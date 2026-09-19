import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ChildScreen, SectionTitle } from '@/components/common';
import { EventRow, MonthGrid, shiftMonth } from '@/components/school';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useCalendarEntries, useSizes, useSpeak, useToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { formatDate, monthRange } from '@/utils/date';

/**
 * School calendar: month grid with dots, then the selected day's items, then "coming up".
 * Assignments (by due date) and school events share the same list.
 */
export function CalendarScreen({ navigation }: RootScreenProps<'Calendar'>) {
  const sizes = useSizes();
  const { isoDate } = useToday();
  const [month, setMonth] = useState(isoDate);
  const [selected, setSelected] = useState<string | null>(isoDate);
  const { speakPhrase } = useSpeak();

  const { from, to } = monthRange(month);
  const { data: entries } = useCalendarEntries(from, to);
  const dayEntries = selected ? entries.filter((e) => e.date === selected) : [];
  const upcoming = entries.filter((e) => e.date >= isoDate && e.date !== selected).slice(0, 8);

  const openEntry = (key: string) => {
    const e = entries.find((x) => x.key === key);
    if (!e) return;
    if (e.assignment) navigation.navigate('AssignmentDetail', { assignmentId: e.assignment.id });
    else speakPhrase(`${e.title}. ${formatDate(e.date)}`);
  };

  return (
    <ChildScreen title="Calendar" back>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <MonthGrid
          month={month}
          today={isoDate}
          selected={selected}
          entries={entries}
          onSelect={(iso) => {
            setSelected(iso);
            speakPhrase(formatDate(iso));
          }}
          onPrevMonth={() => setMonth((m) => shiftMonth(m, -1))}
          onNextMonth={() => setMonth((m) => shiftMonth(m, 1))}
        />

        {selected ? (
          <>
            <SectionTitle title={selected === isoDate ? 'Today' : formatDate(selected)} emoji="📌" />
            {dayEntries.length === 0 ? (
              <Text style={[styles.empty, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Nothing on this day.</Text>
            ) : (
              dayEntries.map((e) => <EventRow key={e.key} entry={e} today={isoDate} hideDate onPress={() => openEntry(e.key)} />)
            )}
          </>
        ) : null}

        {upcoming.length > 0 ? (
          <>
            <SectionTitle title="Coming up" emoji="🔜" />
            {upcoming.map((e) => <EventRow key={e.key} entry={e} today={isoDate} onPress={() => openEntry(e.key)} />)}
          </>
        ) : null}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  empty: { color: Colors.textMuted, fontWeight: '600' },
});
