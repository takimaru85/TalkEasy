import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChildScreen, Icon, SectionTitle } from '@/components/common';
import { AssignmentCard } from '@/components/school';
import { Colors } from '@/constants/colors';
import { DAY_NAMES, SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes, useSpeak, useSubject, useSubjectAssignments, useSubjectMaterials, useSubjectSchedule, useToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { formatTime } from '@/utils/date';
import { Fonts } from '@/theme';

/** One subject: teacher, weekly schedule, things to bring, notes, and its assignments. */
export function SubjectDetailScreen({ navigation, route }: RootScreenProps<'SubjectDetail'>) {
  const { subjectId } = route.params;
  const sizes = useSizes();
  const { isoDate } = useToday();
  const { data: subject } = useSubject(subjectId);
  const { data: schedule } = useSubjectSchedule(subjectId);
  const { data: materials } = useSubjectMaterials(subjectId);
  const { data: assignments } = useSubjectAssignments(subjectId);
  const { speakPhrase } = useSpeak();

  if (!subject) return <ChildScreen title="Subject" back />;

  const openOnes = assignments.filter((a) => a.status !== 'done');
  const doneOnes = assignments.filter((a) => a.status === 'done');

  return (
    <ChildScreen title={subject.name} back>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <View style={[styles.hero, { backgroundColor: subject.color }]}>
          <Icon name={subject.icon} size={sizes.iconSize + 20} />
          <View style={styles.heroText}>
            <Text style={[styles.heroName, { fontSize: sizes.tileLabel + 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{subject.name}</Text>
            {subject.teacherName ? (
              <Text style={[styles.heroTeacher, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>👩‍🏫 {subject.teacherName}</Text>
            ) : null}
          </View>
        </View>
        <BigButton
          label="Say it"
          icon="volume-high"
          variant="secondary"
          minHeight={64}
          onPress={() => speakPhrase(`${subject.name}${subject.teacherName ? `. Teacher: ${subject.teacherName}` : ''}`)}
        />

        <SectionTitle title="Schedule" emoji="🕒" />
        {schedule.length === 0 ? (
          <Text style={[styles.empty, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>No schedule set.</Text>
        ) : (
          schedule.map((s) => (
            <View key={s.id} style={styles.row}>
              <Text style={[styles.rowDay, { fontSize: sizes.body + 1 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{DAY_NAMES[s.dayOfWeek].long}</Text>
              <Text style={[styles.rowTime, { fontSize: sizes.body + 1 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {formatTime(s.startTime)}{s.endTime ? ` – ${formatTime(s.endTime)}` : ''}
              </Text>
            </View>
          ))
        )}

        <SectionTitle title="Things to bring" emoji="🎒" />
        {materials.length === 0 ? (
          <Text style={[styles.empty, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Nothing listed.</Text>
        ) : (
          materials.map((m) => (
            <View key={m.id} style={styles.row}>
              <Icon name="checkbox-blank-circle-outline" size={24} color={Colors.textMuted} />
              <Text style={[styles.rowDay, { fontSize: sizes.body + 1, flex: 1 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {m.name}{m.note ? ` — ${m.note}` : ''}
              </Text>
            </View>
          ))
        )}

        {subject.notes ? (
          <>
            <SectionTitle title="Reminders" emoji="📌" />
            <Text style={[styles.notes, { fontSize: sizes.body + 1 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{subject.notes}</Text>
          </>
        ) : null}

        <SectionTitle title="Assignments" emoji={SECTION_EMOJI.assignments} trailing={openOnes.length ? `${openOnes.length} to do` : undefined} />
        {assignments.length === 0 ? (
          <Text style={[styles.empty, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>No assignments. 🎉</Text>
        ) : null}
        {[...openOnes, ...doneOnes].map((a) => (
          <AssignmentCard key={a.id} assignment={a} today={isoDate} compact onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: a.id })} />
        ))}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  heroText: { flex: 1, gap: 4 },
  heroName: { fontFamily: Fonts.black, color: Colors.text },
  heroTeacher: { fontFamily: Fonts.bold, color: Colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: 60,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.button,
    borderWidth: 2,
    borderColor: '#CFCFCF',
    backgroundColor: Colors.surface,
  },
  rowDay: { fontFamily: Fonts.extrabold, color: Colors.text, flex: 1 },
  rowTime: { fontFamily: Fonts.bold, color: Colors.textMuted },
  notes: { color: Colors.text, lineHeight: 30 },
  empty: { color: Colors.textMuted, fontFamily: Fonts.semibold },
});
