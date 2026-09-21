import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BigButton, EmptyState, ListRow, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { lessonsRepo } from '@/database';
import { useLessons, useToday } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { Fonts } from '@/theme';
import { confirm } from '@/utils/confirm';
import { describeDueDate } from '@/utils/date';

/** Lessons for Adaptive Learning: add / edit / reorder / hide / delete. */
export function ManageLessonsScreen({ navigation }: ParentScreenProps<'ManageLessons'>) {
  const { data: lessons, loading } = useLessons(true);
  const { isoDate } = useToday();

  const remove = async (id: number, title: string) => {
    if (await confirm('Delete lesson?', `"${title}" and its questions and results will be removed.`)) await lessonsRepo.remove(id);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Lessons" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <BigButton label="Add a lesson" icon="plus-circle" minHeight={72} onPress={() => navigation.navigate('EditLesson', {})} />
        <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Paste or type the school lesson, add questions, and choose which answer methods are allowed (tap, picture,
          type, speak, write, helper). The objective stays the same — only the way of answering adapts.
        </Text>
        {!loading && lessons.length === 0 ? <EmptyState icon="school-outline" title="No lessons yet" /> : null}
        {lessons.map((l, index) => (
          <ListRow
            key={l.id}
            title={l.title}
            subtitle={[
              `${l.subjectIcon} ${l.subjectName}${l.gradeLevel ? ` · ${l.gradeLevel}` : ''}`,
              `${l.activityCount} question${l.activityCount === 1 ? '' : 's'} · ${l.completedCount}/${l.activityCount} done` +
                (l.assignedDate ? ` · ${describeDueDate(l.assignedDate, isoDate)}` : '') +
                (l.isActive ? '' : ' · Hidden'),
            ].join('\n')}
            dimmed={!l.isActive}
            onPress={() => navigation.navigate('EditLesson', { lessonId: l.id })}
            actions={[
              { icon: 'chevron-up', label: 'Move up', disabled: index === 0, onPress: () => lessonsRepo.move(l.id, -1) },
              { icon: 'chevron-down', label: 'Move down', disabled: index === lessons.length - 1, onPress: () => lessonsRepo.move(l.id, 1) },
              { icon: 'pencil-outline', label: 'Edit', onPress: () => navigation.navigate('EditLesson', { lessonId: l.id }) },
              { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: () => remove(l.id, l.title) },
            ]}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  hint: { fontFamily: Fonts.semibold, color: Colors.textMuted, fontSize: 15, lineHeight: 21 },
});
