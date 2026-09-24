import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChoiceRow, EmptyState, ListRow, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { KIND_META, PRIORITY_META, STATUS_META, STATUS_ORDER } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { assignmentsRepo } from '@/database';
import { useAssignments, useToday } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import type { AssignmentStatus, AssignmentWithSubject } from '@/types/models';
import { confirm } from '@/utils/confirm';
import { describeDueDate } from '@/utils/date';

type Filter = 'open' | 'all' | 'done';

/** Assignment manager: filter, quick status changes, edit, delete. */
export function ManageAssignmentsScreen({ navigation }: ParentScreenProps<'ManageAssignments'>) {
  const { isoDate } = useToday();
  const { data: assignments, loading } = useAssignments();
  const [filter, setFilter] = useState<Filter>('open');

  const visible = assignments.filter((a) => (filter === 'all' ? true : filter === 'done' ? a.status === 'done' : a.status !== 'done'));

  const nextStatus = (s: AssignmentStatus): AssignmentStatus => STATUS_ORDER[(STATUS_ORDER.indexOf(s) + 1) % STATUS_ORDER.length];

  const remove = async (a: AssignmentWithSubject) => {
    if (await confirm('Delete?', `"${a.title}" will be removed.`)) await assignmentsRepo.remove(a.id);
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Assignments" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <BigButton label="Add assignment / project / exam" icon="plus-circle" minHeight={72} onPress={() => navigation.navigate('EditAssignment', {})} />
        <ChoiceRow<Filter>
          label="Show"
          value={filter}
          onChange={setFilter}
          choices={[
            { value: 'open', label: 'Not done' },
            { value: 'done', label: 'Done' },
            { value: 'all', label: 'All' },
          ]}
        />
        {!loading && visible.length === 0 ? <EmptyState icon="pencil" title="Nothing here" /> : null}
        {visible.map((a) => (
          <ListRow
            key={a.id}
            title={a.title}
            subtitle={[
              `${a.subject?.name ?? 'No subject'} · ${KIND_META[a.kind].label}`,
              `Due ${describeDueDate(a.dueDate, isoDate)} · ${STATUS_META[a.status].label} · ${PRIORITY_META[a.priority].label} priority`,
            ].join('\n')}
            icon={a.status === 'done' ? 'check-circle' : (a.subject?.icon ?? KIND_META[a.kind].icon)}
            iconBackground={a.subject?.color ?? KIND_META[a.kind].color}
            dimmed={a.status === 'done'}
            onPress={() => navigation.navigate('EditAssignment', { assignmentId: a.id })}
            actions={[
              {
                icon: a.status === 'done' ? 'checkbox-marked' : 'checkbox-blank-outline',
                label: a.status === 'done' ? 'Mark not done' : 'Mark completed',
                color: a.status === 'done' ? Colors.success : Colors.text,
                onPress: () => assignmentsRepo.setStatus(a.id, a.status === 'done' ? 'todo' : 'done'),
              },
              { icon: 'progress-clock', label: `Set status to ${STATUS_META[nextStatus(a.status)].label}`, onPress: () => assignmentsRepo.setStatus(a.id, nextStatus(a.status)) },
              { icon: 'pencil-outline', label: 'Edit', onPress: () => navigation.navigate('EditAssignment', { assignmentId: a.id }) },
              { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: () => remove(a) },
            ]}
          />
        ))}
        <View>
          <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            The tick marks an assignment completed. The clock button cycles To Do → In Progress → Done.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  hint: { color: Colors.textMuted, fontSize: 15, textAlign: 'center' },
});
