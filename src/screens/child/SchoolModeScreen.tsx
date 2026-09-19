import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChildScreen, SectionTitle } from '@/components/common';
import { CommunicationTile, PhraseBanner } from '@/components/communication';
import { AssignmentCard, SubjectCard } from '@/components/school';
import { Colors } from '@/constants/colors';
import { SCHOOL_MODE_QUICK } from '@/constants/defaults';
import { SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useAssignmentsDueBy, useQuickButtons, useScheduleForDay, useSizes, useSpeak, useToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { formatTime } from '@/utils/date';

/**
 * School Mode: the simplest possible screen for the classroom.
 * Eight pinned phrases (help / break / don't understand / finished / bathroom / pain / water /
 * teacher), today's subjects and today's assignments. Nothing else.
 */
export function SchoolModeScreen({ navigation }: RootScreenProps<'SchoolMode'>) {
  const sizes = useSizes();
  const { isoDate, dayOfWeek, time } = useToday();
  const { data: quick } = useQuickButtons(SCHOOL_MODE_QUICK);
  const { data: schedule } = useScheduleForDay(dayOfWeek);
  const { data: due } = useAssignmentsDueBy(isoDate);
  const { lastPhrase, lastButtonId, speakButton, repeat, speakPhrase } = useSpeak();

  const current = schedule.find((s) => s.startTime <= time && (!s.endTime || s.endTime >= time));

  return (
    <ChildScreen title="School Mode">
      <PhraseBanner phrase={lastPhrase} onRepeat={repeat} placeholder="Tap what you need" />
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <View style={[styles.grid, { gap: sizes.gap }]}>
          {quick.map((b) => (
            <CommunicationTile key={b.id} button={b} selected={b.id === lastButtonId} onPress={speakButton} />
          ))}
        </View>
        <BigButton label="More words" icon="message-text" variant="secondary" minHeight={72} onPress={() => navigation.navigate('Communicate')} />

        <SectionTitle title="Today's subjects" emoji={SECTION_EMOJI.school} />
        {schedule.length === 0 ? (
          <Text style={[styles.empty, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            No classes today.
          </Text>
        ) : (
          schedule.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s.subject}
              subtitle={`${formatTime(s.startTime)}${s.endTime ? ` – ${formatTime(s.endTime)}` : ''}${s.subject.teacherName ? ` · ${s.subject.teacherName}` : ''}`}
              highlighted={current?.id === s.id}
              onPress={() => speakPhrase(`${s.subject.name}${s.subject.teacherName ? `, with ${s.subject.teacherName}` : ''}`)}
            />
          ))
        )}

        <SectionTitle title="Today's assignments" emoji={SECTION_EMOJI.assignments} />
        {due.length === 0 ? (
          <Text style={[styles.empty, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Nothing due today. 🎉
          </Text>
        ) : (
          due.map((a) => (
            <AssignmentCard key={a.id} assignment={a} today={isoDate} compact onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: a.id })} />
          ))
        )}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  empty: { color: Colors.textMuted, fontWeight: '600' },
});
