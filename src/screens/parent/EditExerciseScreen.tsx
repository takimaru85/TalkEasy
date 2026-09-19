import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { BigButton, ChoiceRow, FormField, IconPicker, ScreenContainer, ScreenHeader } from '@/components/common';
import { SPACING } from '@/constants/sizes';
import { exercisesRepo } from '@/database';
import { useExercise } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { alertMessage, confirm } from '@/utils/confirm';

const DURATIONS = ['0', '2', '5', '10', '15', '20', '30'] as const;

/** Create or edit an activity card. */
export function EditExerciseScreen({ navigation, route }: ParentScreenProps<'EditExercise'>) {
  const { exerciseId } = route.params ?? {};
  const isNew = exerciseId === undefined;
  const { data: existing, loading } = useExercise(exerciseId);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('arm-flex');
  const [instructions, setInstructions] = useState('');
  const [duration, setDuration] = useState<string>('5');
  const [hydrated, setHydrated] = useState(isNew);

  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setName(existing.name);
      setIcon(existing.icon);
      setInstructions(existing.instructions);
      setDuration(String(existing.durationMinutes));
      setHydrated(true);
    }
  }, [isNew, existing, hydrated]);

  const save = async () => {
    if (!name.trim()) return alertMessage('Please give the activity a name.');
    const input = { name, icon, instructions, durationMinutes: Number(duration) || 0 };
    if (isNew) await exercisesRepo.create(input);
    else await exercisesRepo.update(exerciseId, input);
    navigation.goBack();
  };

  const remove = async () => {
    if (isNew) return;
    if (await confirm('Delete activity?', `"${name}" will be removed.`)) {
      await exercisesRepo.remove(exerciseId);
      navigation.goBack();
    }
  };

  if (!isNew && loading) return <ScreenContainer edges={['top', 'bottom', 'left', 'right']} />;

  const durationChoices = DURATIONS.includes(duration as (typeof DURATIONS)[number])
    ? DURATIONS.map((d) => ({ value: d, label: d === '0' ? 'None' : `${d} min` }))
    : [...DURATIONS.map((d) => ({ value: d, label: d === '0' ? 'None' : `${d} min` })), { value: duration, label: `${duration} min` }];

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title={isNew ? 'New activity' : 'Edit activity'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <FormField label="Name" value={name} onChangeText={setName} placeholder="e.g. Leg stretch" maxLength={40} />
          <FormField
            label="Instructions"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Step-by-step, in simple words."
            multiline
            maxLength={600}
          />
          <ChoiceRow label="Duration" value={duration} onChange={setDuration} choices={durationChoices} />
          <IconPicker value={icon} onChange={setIcon} />
          <BigButton label="Save" icon="content-save" onPress={save} minHeight={72} />
          {!isNew ? <BigButton label="Delete this activity" icon="delete-outline" variant="danger" onPress={remove} minHeight={64} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xl * 2 },
});
