import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BigButton, EmptyState, ListRow, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { FREQUENCY_META } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { therapyRepo } from '@/database';
import { useTherapyActivities } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { confirm } from '@/utils/confirm';

/**
 * Therapy / activity cards: add, reorder, tick, edit, delete.
 * An organiser for activities given by the child's caregivers or professionals — not medical advice.
 */
export function ManageTherapyScreen({ navigation }: ParentScreenProps<'ManageTherapy'>) {
  const { data: activities, loading } = useTherapyActivities();

  const remove = async (id: number, name: string) => {
    if (await confirm('Delete activity?', `"${name}" and its history will be removed.`)) await therapyRepo.remove(id);
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Therapy & activities" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <BigButton label="Add an activity" icon="plus-circle" minHeight={72} onPress={() => navigation.navigate('EditTherapy', {})} />
        {!loading && activities.length === 0 ? <EmptyState icon="dumbbell" title="No activities yet" /> : null}
        {activities.map((ex, index) => (
          <ListRow
            key={ex.id}
            title={ex.name}
            subtitle={[ex.durationMinutes > 0 ? `${ex.durationMinutes} min` : null, FREQUENCY_META[ex.frequency].label, ex.isCompleted ? '✅ Completed' : '⬜ Not completed']
              .filter(Boolean)
              .join(' · ')}
            icon={ex.icon}
            dimmed={ex.isCompleted}
            onPress={() => navigation.navigate('EditTherapy', { activityId: ex.id })}
            actions={[
              { icon: 'chevron-up', label: 'Move up', disabled: index === 0, onPress: () => therapyRepo.move(ex.id, -1) },
              { icon: 'chevron-down', label: 'Move down', disabled: index === activities.length - 1, onPress: () => therapyRepo.move(ex.id, 1) },
              {
                icon: ex.isCompleted ? 'check-circle' : 'checkbox-blank-circle-outline',
                label: ex.isCompleted ? 'Mark not completed' : 'Mark completed',
                color: ex.isCompleted ? Colors.success : Colors.text,
                onPress: () => therapyRepo.setCompleted(ex.id, !ex.isCompleted),
              },
              { icon: 'pencil-outline', label: 'Edit', onPress: () => navigation.navigate('EditTherapy', { activityId: ex.id }) },
              { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: () => remove(ex.id, ex.name) },
            ]}
          />
        ))}
        {activities.length > 0 ? (
          <BigButton label="New day: reset all to not completed" icon="refresh" variant="secondary" minHeight={64} onPress={() => therapyRepo.resetAll()} />
        ) : null}
        <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Completions are logged so you can see them under Progress. This tracker does not give medical advice.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  hint: { color: Colors.textMuted, fontSize: 15, textAlign: 'center' },
});
