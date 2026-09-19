import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { BigButton, EmptyState, ScreenContainer, ScreenHeader, SectionTitle } from '@/components/common';
import { EventRow, MonthGrid, shiftMonth } from '@/components/school';
import { SPACING } from '@/constants/sizes';
import { useCalendarEntries, useToday } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { formatDate, monthRange } from '@/utils/date';

/**
 * Calendar for the parent: same month grid as the child sees, plus add/edit.
 * Assignments appear here by due date; tapping one opens its editor.
 */
export function ManageEventsScreen({ navigation }: ParentScreenProps<'ManageEvents'>) {
  const { isoDate } = useToday();
  const [month, setMonth] = useState(isoDate);
  const [selected, setSelected] = useState<string>(isoDate);
  const { from, to } = monthRange(month);
  const { data: entries, loading } = useCalendarEntries(from, to);
  const dayEntries = entries.filter((e) => e.date === selected);

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="School calendar" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <BigButton label={`Add event on ${formatDate(selected)}`} icon="plus-circle" minHeight={72} onPress={() => navigation.navigate('EditEvent', { date: selected })} />
        <MonthGrid
          month={month}
          today={isoDate}
          selected={selected}
          entries={entries}
          onSelect={setSelected}
          onPrevMonth={() => setMonth((m) => shiftMonth(m, -1))}
          onNextMonth={() => setMonth((m) => shiftMonth(m, 1))}
        />
        <SectionTitle title={formatDate(selected)} emoji="📌" />
        {!loading && dayEntries.length === 0 ? <EmptyState icon="calendar-blank" title="Nothing on this day" /> : null}
        {dayEntries.map((e) => (
          <EventRow
            key={e.key}
            entry={e}
            today={isoDate}
            hideDate
            onPress={() =>
              e.assignment
                ? navigation.navigate('EditAssignment', { assignmentId: e.assignment.id })
                : e.event
                  ? navigation.navigate('EditEvent', { eventId: e.event.id })
                  : undefined
            }
          />
        ))}
        <SectionTitle title="This month" emoji="🗓️" trailing={String(entries.length)} />
        {entries.map((e) => (
          <EventRow
            key={`all-${e.key}`}
            entry={e}
            today={isoDate}
            onPress={() =>
              e.assignment
                ? navigation.navigate('EditAssignment', { assignmentId: e.assignment.id })
                : e.event
                  ? navigation.navigate('EditEvent', { eventId: e.event.id })
                  : undefined
            }
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
});
