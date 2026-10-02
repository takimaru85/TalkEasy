import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BigButton, ChildScreen, EmptyState, SectionTitle } from '@/components/common';
import { MissionCard } from '@/components/adventure';
import { useI18n } from '@/i18n';
import { SubjectCard } from '@/components/school';
import { Colors } from '@/constants/colors';
import { DAY_NAMES, SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useOpenAssignments, useScheduleForDay, useSizes, useSubjects, useToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { formatTime } from '@/utils/date';
import { Fonts, useTheme } from '@/theme';

/**
 * School dashboard for the child: today's classes in order, then every subject as a big tile.
 * Tapping a subject opens its detail (teacher, schedule, materials, assignments).
 */
export function SchoolScreen({ navigation }: RootScreenProps<'School'>) {
  const sizes = useSizes();
  const { t } = useI18n();
  const theme = useTheme();
  const { dayOfWeek, time } = useToday();
  const { data: subjects, loading } = useSubjects();
  const { data: schedule } = useScheduleForDay(dayOfWeek);
  const { data: open } = useOpenAssignments();

  const openCount = (subjectId: number) => open.filter((a) => a.subjectId === subjectId).length;
  const current = schedule.find((s) => s.startTime <= time && (!s.endTime || s.endTime >= time));

  return (
    <ChildScreen title="School" subtitle={t('schoolSubtitle')} emoji={SECTION_EMOJI.school} art="school">
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        {/*
          School Mode opens from the TOP, above the timetable, and that order is the point.
          School Mode is where the quick words live -- "I need help", "Bathroom", "I do not
          understand" -- the things a child needs DURING a lesson, in a hurry. Everything below
          this card is browsing: what is on today, which subjects there are, what is due. Putting
          the urgent thing under the browsing would mean scrolling past a timetable to ask to
          leave the room.

          It is also the ONLY way into School Mode from inside the app: the standalone bar on the
          Home screen was removed as redundant (the explore row already has a School card one tap
          from the same place), so this card must stay here and stay easy to find. check:headers
          asserts it, because an entry point nothing opens is not an entry point.

          It echoes the destination rather than describing it afresh -- the same art disc and the
          same subtitle string the School Mode header itself uses -- so the screen a child lands
          on looks like the card they just tapped.
        */}
        <MissionCard
          title="School Mode"
          subtitle={t('schoolModeSubtitle')}
          art="school"
          color="sky"
          onPress={() => navigation.navigate('SchoolMode')}
          accessibilityLabel={`School Mode. ${t('schoolModeSubtitle')}.`}
        />

        <SectionTitle title={`Today · ${DAY_NAMES[dayOfWeek].long}`} emoji="📆" />
        {schedule.length === 0 ? (
          <Text style={[styles.empty, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
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
  empty: { fontFamily: Fonts.semibold },
});
