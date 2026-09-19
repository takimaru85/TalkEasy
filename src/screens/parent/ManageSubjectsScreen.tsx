import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BigButton, EmptyState, ListRow, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { subjectsRepo } from '@/database';
import { useSubjects } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { confirm } from '@/utils/confirm';

/** Subjects: add, reorder, show/hide, edit, delete. */
export function ManageSubjectsScreen({ navigation }: ParentScreenProps<'ManageSubjects'>) {
  const { data: subjects, loading } = useSubjects(true);

  const remove = async (id: number, name: string) => {
    if (await confirm('Delete subject?', `"${name}" will be removed. Its assignments will stay but lose their subject.`)) {
      await subjectsRepo.remove(id);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Subjects" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <BigButton label="Add a subject" icon="plus-circle" minHeight={72} onPress={() => navigation.navigate('EditSubject', {})} />
        {!loading && subjects.length === 0 ? <EmptyState icon="school" title="No subjects yet" /> : null}
        {subjects.map((s, index) => (
          <ListRow
            key={s.id}
            title={s.name}
            subtitle={[s.teacherName || null, s.isActive ? null : 'Hidden'].filter(Boolean).join(' · ') || 'Tap to add teacher, schedule, materials'}
            icon={s.icon}
            iconBackground={s.color}
            dimmed={!s.isActive}
            onPress={() => navigation.navigate('EditSubject', { subjectId: s.id })}
            actions={[
              { icon: 'chevron-up', label: 'Move up', disabled: index === 0, onPress: () => subjectsRepo.move(s.id, -1) },
              { icon: 'chevron-down', label: 'Move down', disabled: index === subjects.length - 1, onPress: () => subjectsRepo.move(s.id, 1) },
              { icon: s.isActive ? 'eye-outline' : 'eye-off-outline', label: s.isActive ? 'Hide' : 'Show', onPress: () => subjectsRepo.setActive(s.id, !s.isActive) },
              { icon: 'pencil-outline', label: 'Edit', onPress: () => navigation.navigate('EditSubject', { subjectId: s.id }) },
              { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: () => remove(s.id, s.name) },
            ]}
          />
        ))}
        <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Hidden subjects are kept but not shown to the child.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  hint: { color: Colors.textMuted, fontSize: 15, textAlign: 'center' },
});
