import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BigButton, ChildScreen, EmptyState, SectionTitle } from '@/components/common';
import { SubjectCard } from '@/components/school';
import { Colors } from '@/constants/colors';
import { DAY_NAMES, SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useOpenAssignments, useScheduleForDay, useSizes, useSubjects, useToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { formatTime } from '@/utils/date';

/**
 * School dashboard for the child: today's classes in order, then every subject as a big tile.
 * Tapping a subject opens its detail (teacher, schedule, materials, assignments).
 */
export function SchoolScreen({ navigation }: RootScreenProps<'School'>) {
  const sizes = useSizes();
  const { dayOfWeek, time } = useToday();
  const { data: subjects, loading } = useSubjects();
  const { data: schedule } = useScheduleForDay(dayOfWeek);
  const { data: open } = useOpenAssignments();

  const openCount = (subjectId: number) => open.filter((a) => a.subjectId === subjectId).length;
  const current = schedule.find((s) => s.startTime <= time && (!s.endTime || s.endTime >= time));

  return (
    <ChildScreen title="School">
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <SectionTitle title={`Today · ${DAY_NAMES[dayOfWeek].long}`} emoji="📆" />
        {schedule.length === 0 ? (
          <Text style={[styles.empty, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            No classes today.
          </Text>
        ) : (
          schedule.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s.subject}
              subtitle={`${formatTime(s.startTime)}${s.endTime ? ` – ${formatTime(s.endTime)}` : ''}`}
              highlighted={current?.id === s.id}
              onPress={() => navigation.navigate('SubjectDetail', { subjectId: s.subject.id })}
            />
          ))
        )}

        <BigButton label="Calendar" icon="calendar-month" variant="secondary" minHeight={72} onPress={() => navigation.navigate('Calendar')} />

        <SectionTitle title="My subjects" emoji={SECTION_EMOJI.school} />
        {!loading && subjects.length === 0 ? <EmptyState icon="school" title="No subjects yet" message="A parent can add subjects in Parent Mode." /> : null}
        {subjects.map((s) => {
          const n = openCount(s.id);
          return (
            <SubjectCard
              key={s.id}
              subject={s}
              subtitle={n > 0 ? `${n} to do${s.teacherName ? ` · ${s.teacherName}` : ''}` : s.teacherName || undefined}
              onPress={() => navigation.navigate('SubjectDetail', { subjectId: s.id })}
            />
          );
        })}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  empty: { color: Colors.textMuted, fontWeight: '600' },
});
