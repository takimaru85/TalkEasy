import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChildScreen, SectionTitle } from '@/components/common';
import { useI18n } from '@/i18n';
import { CommunicationTile, PhraseBanner } from '@/components/communication';
import { MissionCard } from '@/components/adventure';
import { AssignmentCard, SubjectCard } from '@/components/school';
import { Colors } from '@/constants/colors';
import { SCHOOL_MODE_QUICK } from '@/constants/defaults';
import { SECTION_EMOJI } from '@/constants/school';
import { SCAN_ASSIGNMENT_AVAILABLE } from '@/scan/availability';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useAssignmentsDueBy, useQuickButtons, useScheduleForDay, useSizes, useSpeak, useToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { formatTime } from '@/utils/date';
import { Fonts, useTheme } from '@/theme';

/**
 * School Mode: the simplest possible screen for the classroom.
 * Eight pinned phrases (help / break / don't understand / finished / bathroom / pain / water /
 * teacher), today's subjects and today's assignments. Nothing else.
 */
export function SchoolModeScreen({ navigation }: RootScreenProps<'SchoolMode'>) {
  const sizes = useSizes();
  const { t } = useI18n();
  const theme = useTheme();
  const { isoDate, dayOfWeek, time } = useToday();
  const { data: quick } = useQuickButtons(SCHOOL_MODE_QUICK);
  const { data: schedule } = useScheduleForDay(dayOfWeek);
  const { data: due } = useAssignmentsDueBy(isoDate);
  const { lastPhrase, lastButtonId, speakButton, repeat, speakPhrase } = useSpeak();

  const current = schedule.find((s) => s.startTime <= time && (!s.endTime || s.endTime >= time));

  return (
    <ChildScreen title="School Mode" subtitle={t('schoolModeSubtitle')} emoji={SECTION_EMOJI.schoolMode} art="school">
      <PhraseBanner phrase={lastPhrase} onRepeat={repeat} placeholder="Tap what you need" />
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <View style={[styles.grid, { gap: sizes.gap }]}>
          {quick.map((b) => (
            <CommunicationTile key={b.id} button={b} selected={b.id === lastButtonId} onPress={speakButton} />
          ))}
        </View>
        <BigButton label="More words" icon="message-text" variant="secondary" minHeight={72} onPress={() => navigation.navigate('Communicate')} />

        {/*
          Scan Assignment sits with the schoolwork it produces, above today's subjects: what it makes
          is an assignment, so it belongs beside them rather than in a tools menu somewhere else.
        */}
        {SCAN_ASSIGNMENT_AVAILABLE ? (
          <MissionCard
            title="Scan Assignment"
            subtitle="Photograph a worksheet and turn it into words"
            glyph="scan-assignment"
            color="lagoon"
            onPress={() => navigation.navigate('ScanAssignment')}
            accessibilityLabel="Scan Assignment. Photograph a worksheet and turn it into words."
          />
        ) : null}

        <SectionTitle title="Today's subjects" emoji={SECTION_EMOJI.school} />
        {schedule.length === 0 ? (
          <Text style={[styles.empty, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
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
          <Text style={[styles.empty, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
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
  empty: { fontFamily: Fonts.semibold },
});
