import React from 'react';
import { PixelRatio, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, BigButton, Glyph, Icon, IconTile, ScreenContainer, ScreenHeader, SectionTitle, StatTile } from '@/components/common';
import { EventRow } from '@/components/school';
import { Colors, tileColor } from '@/constants/colors';
import { ROUTINE_SEGMENT_TINT, SECTION_EMOJI } from '@/constants/school';
import { useProfile } from '@/context/ProfileContext';
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
  | 'ManageLessons'
  | 'AdaptiveProgress'
  | 'SpeechPracticeSettings'
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

interface MenuItem {
  screen: MenuScreen;
  title: string;
  /** One quiet line saying what is inside — so titles can stay short. */
  detail: string;
  icon: string;
  tint: string;
}

/** Parent Mode's management menu, grouped the way a parent thinks about it. */
const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Your child',
    items: [
      { screen: 'ChildProfile', title: 'My child', detail: 'Name, photo, colour and favourites', icon: 'account-heart-outline', tint: tileColor('pink') },
      { screen: 'ManageRewards', title: 'Stars & rewards', detail: 'What stars are earned for, and rewards', icon: 'gift-outline', tint: tileColor('yellow') },
    ],
  },
  {
    title: 'Communication',
    items: [
      { screen: 'ManageButtons', title: 'Communication cards', detail: 'The Talk board: cards, photos, categories', icon: 'message-processing-outline', tint: tileColor('blue') },
      { screen: 'ManageFavorites', title: 'Favorites', detail: 'Cards pinned to the Home screen', icon: 'star-outline', tint: tileColor('yellow') },
    ],
  },
  {
    title: 'Learning',
    items: [
      { screen: 'ManageLessons', title: 'Lessons', detail: "Today's schoolwork and adaptive lessons", icon: 'school-outline', tint: tileColor('purple') },
      { screen: 'SpeechPracticeSettings', title: 'Speech Practice', detail: 'Activities, My Words and practice history', icon: 'microphone-outline', tint: tileColor('coral') },
      { screen: 'ManageLearning', title: 'Learning activities', detail: 'Which Learn activities are on, and how hard', icon: 'book-open-page-variant-outline', tint: tileColor('teal') },
      { screen: 'AdaptiveProgress', title: 'Learning progress', detail: 'Lessons and handwriting, shown separately', icon: 'chart-line', tint: tileColor('green') },
      { screen: 'Progress', title: 'Practice results', detail: 'Recent Learn sessions and subjects', icon: 'chart-bar', tint: tileColor('blue') },
    ],
  },
  {
    title: 'School',
    items: [
      { screen: 'ManageSubjects', title: 'Subjects', detail: 'Timetable, teachers and things to bring', icon: 'bag-personal-outline', tint: tileColor('green') },
      { screen: 'ManageAssignments', title: 'Assignments', detail: 'Homework, projects and exams', icon: 'file-document-edit-outline', tint: tileColor('orange') },
      { screen: 'ManageEvents', title: 'School calendar', detail: 'Events, holidays and meetings', icon: 'calendar-month-outline', tint: tileColor('teal') },
    ],
  },
  {
    title: 'Daily life',
    items: [
      { screen: 'ManageRoutine', title: 'Daily schedule', detail: 'The My Day routine, morning to bedtime', icon: 'calendar-check-outline', tint: tileColor('orange') },
      { screen: 'ManageTherapy', title: 'Activities', detail: 'Therapy and activity cards', icon: 'puzzle-outline', tint: tileColor('teal') },
      { screen: 'CareNotes', title: 'Care notes', detail: 'Notes for caregivers and teachers', icon: 'note-text-outline', tint: tileColor('purple') },
    ],
  },
  {
    title: 'App',
    items: [
      { screen: 'Settings', title: 'Settings', detail: 'Language, voice, sizes, accessibility and PIN', icon: 'cog-outline', tint: tileColor('grey') },
    ],
  },
];

/**
 * Parent dashboard: today at a glance (schedule, due work, events), assignment counts,
 * and the management menu.
 */
export function DashboardScreen({ navigation }: ParentScreenProps<'Dashboard'>) {
  const sizes = useSizes();
  const { profile, displayName } = useProfile();
  const { isoDate, dayOfWeek } = useToday();
  const { data: counts } = useAssignmentCounts();
  const { data: schedule } = useScheduleForDay(dayOfWeek);
  const { data: routine } = useActiveRoutineItems();
  const { data: therapy } = useTherapyActivities();
  const { data: entries } = useCalendarEntries(isoDate, addDays(isoDate, 7));

  const exitToChild = () => navigation.navigate('ChildHome');
  // Wide enough for the longest time ("12:00 PM") at the current text size and OS font scale, so
  // a time never wraps onto a second line and every label still lines up.
  const timeSize = sizes.body - 3;
  const timeWidth = Math.ceil(timeSize * 0.62 * 8 * Math.min(PixelRatio.getFontScale(), MAX_FONT_SCALE)) + SPACING.md * 2;
  const todayEntries = entries.filter((e) => e.date === isoDate);
  const soon = entries.filter((e) => e.date > isoDate).slice(0, 5);
  const therapyDone = therapy.filter((t) => t.isCompleted).length;

  // "Today's schedule": routine steps with a time + today's classes, merged by time.
  const timeline = [
    ...routine
      .filter((r) => r.startTime)
      .map((r) => ({ key: `r${r.id}`, time: r.startTime as string, label: r.label, icon: r.icon, tint: ROUTINE_SEGMENT_TINT[r.segment], done: r.isDone })),
    ...schedule.map((s) => ({ key: `s${s.id}`, time: s.startTime, label: s.subject.name, icon: s.subject.icon, tint: tileColor('green'), done: false })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Parent Mode" rightIcon="lock-open-variant" rightLabel="Exit" onRightPress={exitToChild} />
      <ScrollView contentContainerStyle={styles.list}>
        {/* Welcome: whose day this is, the date, and the privacy promise. */}
        <View style={styles.hero}>
          <Avatar avatar={profile.avatar} photoUri={profile.photoUri} size={60} />
          <View style={styles.heroText}>
            <Text style={[styles.heroTitle, { fontSize: sizes.body + 3 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {displayName}'s day
            </Text>
            <Text style={styles.heroDate} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {formatDate(isoDate)}
            </Text>
            <View style={styles.badge}>
              <Icon name="lock-outline" size={14} color={Colors.success} />
              <Text style={styles.badgeText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Private · stays on this device</Text>
            </View>
          </View>
        </View>

        <SectionTitle title="Assignments" emoji={SECTION_EMOJI.assignments} />
        <View style={styles.stats}>
          <StatTile label="To Do" value={counts.todo} emoji="clipboard-text-outline" color={tileColor('yellow')} onPress={() => navigation.navigate('ManageAssignments')} />
          <StatTile label="In Progress" value={counts.in_progress} emoji="progress-clock" color={tileColor('blue')} onPress={() => navigation.navigate('ManageAssignments')} />
          <StatTile label="Completed" value={counts.done} emoji="check-circle-outline" color={tileColor('green')} onPress={() => navigation.navigate('ManageAssignments')} />
        </View>

        <SectionTitle title="Today" emoji="📆" trailing={timeline.length ? `${timeline.filter((t) => t.done).length} / ${timeline.length} done` : undefined} />
        {timeline.length === 0 ? (
          <Text style={styles.empty} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            No timed routine steps or classes today. Add times in "Daily schedule" and "Subjects".
          </Text>
        ) : (
          <View style={styles.timeline}>
            {timeline.map((t, i) => (
              <View key={t.key} style={[styles.timelineRow, i > 0 && styles.timelineDivider]}>
                <View style={[styles.timePill, { width: timeWidth }, t.done && styles.timePillDone]}>
                  <Text style={[styles.timelineTime, { fontSize: timeSize }, t.done && styles.textDone]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                    {formatTime(t.time)}
                  </Text>
                </View>
                <Glyph value={t.icon} size={36} tint={t.tint} muted={t.done} />
                <Text style={[styles.timelineLabel, { fontSize: sizes.body }, t.done && styles.labelDone]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {t.label}
                </Text>
                {t.done ? <Icon name="check-circle" size={22} color={Colors.success} /> : null}
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
        {MENU_GROUPS.map((group) => (
          <View key={group.title} style={styles.menuGroup}>
            <Text style={styles.menuGroupTitle} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
              {group.title.toUpperCase()}
            </Text>
            <View style={styles.menuCard}>
              {group.items.map((item, i) => (
                <Pressable
                  key={item.screen}
                  onPress={() => navigation.navigate(item.screen)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}. ${item.detail}`}
                  style={({ pressed }) => [styles.menuRow, i > 0 && styles.menuDivider, pressed && styles.menuPressed]}
                >
                  <IconTile name={item.icon} size={44} tint={item.tint} />
                  <View style={styles.menuText}>
                    <Text style={[styles.menuTitle, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.menuDetail} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                      {item.detail}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={Colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <BigButton label="Back to child mode" icon="account-child" variant="primary" minHeight={80} onPress={exitToChild} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.tile,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    shadowColor: '#1B2A4A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroText: { flex: 1, gap: 2 },
  heroTitle: { fontFamily: Fonts.black, color: Colors.text },
  heroDate: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.textMuted },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, marginTop: 4, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: 999, backgroundColor: Colors.successSoft },
  badgeText: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.success },
  stats: { flexDirection: 'row', gap: SPACING.sm },
  empty: { color: Colors.textMuted, fontSize: 16 },
  timeline: {
    borderRadius: RADIUS.tile,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    overflow: 'hidden',
  },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minHeight: 60, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  timelineDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.borderSoft },
  timePill: { alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.primarySoft },
  timePillDone: { backgroundColor: Colors.surfaceAlt },
  timelineTime: { fontFamily: Fonts.extrabold, color: Colors.primaryDark },
  textDone: { color: Colors.textMuted },
  timelineLabel: { flex: 1, fontFamily: Fonts.bold, color: Colors.text },
  labelDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  menuGroup: { gap: SPACING.xs },
  menuGroupTitle: { fontFamily: Fonts.extrabold, fontSize: 13, letterSpacing: 1.2, color: Colors.textMuted, marginLeft: SPACING.xs, marginTop: SPACING.xs },
  menuCard: { backgroundColor: Colors.surface, borderRadius: RADIUS.tile, borderWidth: 1, borderColor: Colors.borderSoft, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minHeight: 72, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  menuDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.borderSoft },
  menuPressed: { backgroundColor: Colors.surfaceAlt },
  menuText: { flex: 1, gap: 2 },
  menuTitle: { fontFamily: Fonts.extrabold, color: Colors.text },
  menuDetail: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 19, color: Colors.textMuted },
});
