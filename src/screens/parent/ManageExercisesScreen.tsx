import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { BigButton, EmptyState, ListRow, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { SPACING } from '@/constants/sizes';
import { exercisesRepo } from '@/database';
import { useExercises } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { confirm } from '@/utils/confirm';

/** Therapy / activity cards: add, reorder, tick, edit, delete. */
export function ManageExercisesScreen({ navigation }: ParentScreenProps<'ManageExercises'>) {
  const { data: exercises, loading } = useExercises();

  const remove = async (id: number, name: string) => {
    if (await confirm('Delete activity?', `"${name}" will be removed.`)) await exercisesRepo.remove(id);
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Therapy & activities" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <BigButton label="Add an activity" icon="plus-circle" onPress={() => navigation.navigate('EditExercise', {})} minHeight={72} />
        {!loading && exercises.length === 0 ? <EmptyState icon="dumbbell" title="No activities yet" /> : null}
        {exercises.map((ex, index) => (
          <ListRow
            key={ex.id}
            title={ex.name}
            subtitle={[ex.durationMinutes > 0 ? `${ex.durationMinutes} min` : null, ex.isCompleted ? 'Completed' : 'Not completed'].filter(Boolean).join(' · ')}
            icon={ex.icon}
            dimmed={ex.isCompleted}
            onPress={() => navigation.navigate('EditExercise', { exerciseId: ex.id })}
            actions={[
              { icon: 'chevron-up', label: 'Move up', disabled: index === 0, onPress: () => exercisesRepo.move(ex.id, -1) },
              { icon: 'chevron-down', label: 'Move down', disabled: index === exercises.length - 1, onPress: () => exercisesRepo.move(ex.id, 1) },
              {
                icon: ex.isCompleted ? 'check-circle' : 'checkbox-blank-circle-outline',
                label: ex.isCompleted ? 'Mark not completed' : 'Mark completed',
                color: ex.isCompleted ? Colors.success : Colors.text,
                onPress: () => exercisesRepo.setCompleted(ex.id, !ex.isCompleted),
              },
              { icon: 'pencil-outline', label: 'Edit', onPress: () => navigation.navigate('EditExercise', { exerciseId: ex.id }) },
              { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: () => remove(ex.id, ex.name) },
            ]}
          />
        ))}
        {exercises.length > 0 ? (
          <BigButton label="Reset all to not completed" icon="refresh" variant="secondary" minHeight={64} onPress={() => exercisesRepo.resetAll()} />
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
});
