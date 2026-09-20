import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ScreenContainer, ScreenHeader, SectionTitle, StatTile } from '@/components/common';
import { EventRow } from '@/components/school';
import { Colors } from '@/constants/colors';
import { DAY_NAMES, SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import {
  useActiveRoutineItems,
  useAssignmentCounts,
  useCalendarEntries,
  useScheduleForDay,
  useSizes,
  useTherapyActivities,
  useToday,
} from '@/hooks';
import type { ParentScreenProps, ParentStackParamList } from '@/navigation/types';
import { addDays, formatDate, formatTime } from '@/utils/date';
import { Fonts } from '@/theme';

type MenuScreen = Extract<
  keyof ParentStackParamList,
  | 'ChildProfile'
  | 'ManageRewards'
  | 'ManageButtons'
  | 'ManageFavorites'
  | 'ManageSubjects'
  | 'ManageAssignments'
  | 'ManageEvents'
  | 'ManageLearning'
  | 'ManageRoutine'
  | 'ManageTherapy'
  | 'CareNotes'
  | 'Progress'
  | 'Settings'
>;

const MENU: { screen: MenuScreen; label: string; icon: string }[] = [
  { screen: 'ChildProfile', label: 'My child (name, photo, colour, favourites)', icon: 'account-heart' },
  { screen: 'ManageRewards', label: 'Stars & rewards', icon: 'gift-outline' },
  { screen: 'ManageButtons', label: 'Communication cards', icon: 'message-text' },
  { screen: 'ManageFavorites', label: 'Favorites', icon: 'star' },
  { screen: 'ManageSubjects', label: 'School subjects', icon: 'school' },
  { screen: 'ManageAssignments', label: 'Assignments, projects & exams', icon: 'pencil' },
  { screen: 'ManageEvents', label: 'School calendar events', icon: 'calendar-month' },
  { screen: 'ManageLearning', label: 'Learning activities', icon: 'book-open-variant' },
  { screen: 'ManageRoutine', label: 'Daily schedule (My Day)', icon: 'calendar-check' },
  { screen: 'ManageTherapy', label: 'Activities', icon: 'puzzle' },
  { screen: 'CareNotes', label: 'Care notes', icon: 'note-text-outline' },
  { screen: 'Progress', label: 'Progress', icon: 'chart-bar' },
  { screen: 'Settings', label: 'Settings, speech, sizes & PIN', icon: 'cog-outline' },
];

/**
 * Parent dashboard: today at a glance (schedule, due work, events), assignment counts,
 * and the management menu.
 */
export function DashboardScreen({ navigation }: ParentScreenProps<'Dashboard'>) {
  const sizes = useSizes();
  const { isoDate, dayOfWeek } = useToday();
  const { data: counts } = useAssignmentCounts();
  const { data: schedule } = useScheduleForDay(dayOfWeek);
  const { data: routine } = useActiveRoutineItems();
  const { data: therapy } = useTherapyActivities();
  const { data: entries } = useCalendarEntries(isoDate, addDays(isoDate, 7));

  const exitToChild = () => navigation.navigate('ChildHome');
  const todayEntries = entries.filter((e) => e.date === isoDate);
  const soon = entries.filter((e) => e.date > isoDate).slice(0, 5);
  const therapyDone = therapy.filter((t) => t.isCompleted).length;

  // "Today's schedule": routine steps with a time + today's classes, merged by time.
  const timeline = [
    ...routine.filter((r) => r.startTime).map((r) => ({ key: `r${r.id}`, time: r.startTime as string, label: r.label, icon: r.icon, done: r.isDone })),
    ...schedule.map((s) => ({ key: `s${s.id}`, time: s.startTime, label: s.subject.name, icon: s.subject.icon, done: false })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Parent Mode" rightIcon="lock-open-variant" rightLabel="Exit" onRightPress={exitToChild} />
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={[styles.dateLine, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {formatDate(isoDate)} · Everything stays on this device.
        </Text>

        <SectionTitle title="Assignments" emoji={SECTION_EMOJI.assignments} />
        <View style={styles.stats}>
          <StatTile label="To Do" value={counts.todo} color="#FFF3A8" onPress={() => navigation.navigate('ManageAssignments')} />
          <StatTile label="In Progress" value={counts.in_progress} color="#BFE0FF" onPress={() => navigation.navigate('ManageAssignments')} />
          <StatTile label="Completed" value={counts.done} color="#C4F2C8" onPress={() => navigation.navigate('ManageAssignments')} />
        </View>

        <SectionTitle title="Today" emoji="📆" trailing={DAY_NAMES[dayOfWeek].long} />
        {timeline.length === 0 ? (
          <Text style={styles.empty} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            No timed routine steps or classes today. Add times in "Daily routine" and "School subjects".
          </Text>
        ) : (
          <View style={styles.timeline}>
            {timeline.map((t) => (
              <View key={t.key} style={[styles.timelineRow, t.done && styles.timelineDone]}>
                <Text style={[styles.timelineTime, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{formatTime(t.time)}</Text>
                <Text style={[styles.timelineLabel, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {t.done ? '✅ ' : ''}{t.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {todayEntries.length > 0 ? (
          <>
            <SectionTitle title="Due / happening today" emoji="📌" />
            {todayEntries.map((e) => (
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
          </>
        ) : null}

        {soon.length > 0 ? (
          <>
            <SectionTitle title="Next 7 days" emoji="🔜" />
            {soon.map((e) => (
              <EventRow
                key={e.key}
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
          </>
        ) : null}

        <SectionTitle title="Activities" emoji={SECTION_EMOJI.activities} trailing={`${therapyDone} / ${therapy.length} done`} />

        <SectionTitle title="Manage" emoji="🛠️" />
        {MENU.map((item) => (
          <BigButton key={item.screen} label={item.label} icon={item.icon} variant="secondary" minHeight={72} onPress={() => navigation.navigate(item.screen)} />
        ))}
        <BigButton label="Back to child mode" icon="account-child" variant="primary" minHeight={80} onPress={exitToChild} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  dateLine: { color: Colors.textMuted },
  stats: { flexDirection: 'row', gap: SPACING.sm },
  empty: { color: Colors.textMuted, fontSize: 16 },
  timeline: { borderWidth: 2, borderColor: Colors.border, borderRadius: RADIUS.button, overflow: 'hidden' },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: 52,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
  },
  timelineDone: { backgroundColor: '#F1F1F1' },
  timelineTime: { width: 90, fontFamily: Fonts.extrabold, color: Colors.primaryDark },
  timelineLabel: { flex: 1, fontFamily: Fonts.bold, color: Colors.text },
});
