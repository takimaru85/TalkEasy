import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  BigButton,
  ChoiceRow,
  EmptyState,
  FormField,
  IconPicker,
  ListRow,
  ScreenContainer,
  ScreenHeader,
  TimeField,
} from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { routinesRepo } from '@/database';
import { useRoutineItems, useRoutines, useSizes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import type { RoutineItem, RoutineSegment } from '@/types/models';
import { ROUTINE_SEGMENT_META } from '@/constants/school';
import { alertMessage, confirm } from '@/utils/confirm';
import { formatTime } from '@/utils/date';
import { Fonts } from '@/theme';

type Editing = { mode: 'new' } | { mode: 'edit'; item: RoutineItem } | null;

/**
 * Build the visual schedule: pick the active routine, add / rename / reorder / delete steps.
 * Steps are edited inline in a panel at the top so everything stays on one screen.
 */
export function ManageRoutineScreen({ navigation }: ParentScreenProps<'ManageRoutine'>) {
  const sizes = useSizes();
  const { data: routines } = useRoutines();
  const [routineId, setRoutineId] = useState<number | null>(null);
  const { data: items } = useRoutineItems(routineId ?? undefined);
  const [editing, setEditing] = useState<Editing>(null);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('weather-sunny');
  const [startTime, setStartTime] = useState<string | null>(null);
  const [segment, setSegment] = useState<RoutineSegment>('morning');
  const [notes, setNotes] = useState('');
  const [newRoutineName, setNewRoutineName] = useState('');

  // Select the active routine by default.
  useEffect(() => {
    if (routineId === null && routines.length > 0) {
      setRoutineId((routines.find((r) => r.isActive) ?? routines[0]).id);
    }
    if (routineId !== null && !routines.some((r) => r.id === routineId)) {
      setRoutineId(routines[0]?.id ?? null);
    }
  }, [routines, routineId]);

  const routine = routines.find((r) => r.id === routineId) ?? null;

  const startNew = () => {
    setLabel('');
    setIcon('weather-sunny');
    setStartTime(null);
    setSegment('morning');
    setNotes('');
    setEditing({ mode: 'new' });
  };

  const startEdit = (item: RoutineItem) => {
    setLabel(item.label);
    setIcon(item.icon);
    setStartTime(item.startTime);
    setSegment(item.segment);
    setNotes(item.notes);
    setEditing({ mode: 'edit', item });
  };

  const saveItem = async () => {
    if (!routineId) return;
    if (!label.trim()) return alertMessage('Please give the step a name.');
    if (editing?.mode === 'edit') await routinesRepo.updateItem(editing.item.id, label, icon, startTime, segment, notes);
    else await routinesRepo.addItem(routineId, label, icon, startTime, segment, notes);
    setEditing(null);
  };

  const deleteItem = async (item: RoutineItem) => {
    if (await confirm('Delete step?', `"${item.label}" will be removed from the routine.`)) {
      await routinesRepo.removeItem(item.id);
    }
  };

  const addRoutine = async () => {
    if (!newRoutineName.trim()) return alertMessage('Please type a name for the routine.');
    const id = await routinesRepo.create(newRoutineName);
    setNewRoutineName('');
    setRoutineId(id);
  };

  const deleteRoutine = async () => {
    if (!routine) return;
    if (routines.length === 1) return alertMessage('Keep at least one routine.');
    if (await confirm('Delete routine?', `"${routine.name}" and all its steps will be removed.`)) {
      await routinesRepo.remove(routine.id);
      setRoutineId(null);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Daily schedule" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {routines.length > 1 ? (
            <ChoiceRow
              label="Routine"
              value={String(routineId ?? '')}
              onChange={(v) => setRoutineId(Number(v))}
              choices={routines.map((r) => ({ value: String(r.id), label: r.isActive ? `${r.name} ✓` : r.name }))}
            />
          ) : null}

          {routine ? (
            <View style={styles.routineRow}>
              <Text style={[styles.routineName, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {routine.name}
                {routine.isActive ? '  (shown to child)' : ''}
              </Text>
              {!routine.isActive ? (
                <BigButton label="Show this one to the child" variant="secondary" minHeight={56} compact onPress={() => routinesRepo.setActive(routine.id)} />
              ) : null}
            </View>
          ) : null}

          {editing ? (
            <View style={styles.editor}>
              <Text style={[styles.editorTitle, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {editing.mode === 'new' ? 'New step' : 'Edit step'}
              </Text>
              <FormField label="Step name" value={label} onChangeText={setLabel} placeholder="e.g. Snack" maxLength={30} />
              <ChoiceRow<RoutineSegment>
                label="Part of the day"
                value={segment}
                onChange={setSegment}
                choices={(Object.keys(ROUTINE_SEGMENT_META) as RoutineSegment[]).map((k) => ({ value: k, label: `${ROUTINE_SEGMENT_META[k].emoji} ${ROUTINE_SEGMENT_META[k].label}` }))}
              />
              <TimeField label="Time (optional)" value={startTime} onChange={setStartTime} />
              <FormField label="Note (optional)" value={notes} onChangeText={setNotes} placeholder='e.g. "Blue bag today"' maxLength={60} />
              <IconPicker value={icon} onChange={setIcon} />
              <View style={styles.editorButtons}>
                <BigButton label="Save step" icon="content-save" onPress={saveItem} minHeight={64} />
                <BigButton label="Cancel" variant="secondary" onPress={() => setEditing(null)} minHeight={56} />
              </View>
            </View>
          ) : (
            <BigButton label="Add a step" icon="plus-circle" onPress={startNew} minHeight={72} disabled={!routine} />
          )}

          {routine && items.length === 0 ? <EmptyState icon="calendar-check" title="No steps yet" /> : null}
          {items.map((item, index) => (
            <ListRow
              key={item.id}
              title={`${index + 1}. ${item.label}`}
              subtitle={[`${ROUTINE_SEGMENT_META[item.segment].emoji} ${ROUTINE_SEGMENT_META[item.segment].label}`, item.startTime ? formatTime(item.startTime) : null, item.notes || null, item.isDone ? 'Done today' : null].filter(Boolean).join(' · ')}
              icon={item.icon}
              dimmed={item.isDone}
              onPress={() => startEdit(item)}
              actions={[
                { icon: 'chevron-up', label: 'Move up', disabled: index === 0, onPress: () => routinesRepo.moveItem(item.id, -1) },
                { icon: 'chevron-down', label: 'Move down', disabled: index === items.length - 1, onPress: () => routinesRepo.moveItem(item.id, 1) },
                { icon: 'pencil-outline', label: 'Edit', onPress: () => startEdit(item) },
                { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: () => deleteItem(item) },
              ]}
            />
          ))}

          {routine ? (
            <View style={styles.footer}>
              <BigButton
                label="Start a new day (clear ticks)"
                icon="refresh"
                variant="secondary"
                minHeight={64}
                onPress={() => routinesRepo.resetDone(routine.id)}
              />
              <Text style={[styles.sectionTitle, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Another routine (e.g. "Weekend")
              </Text>
              <FormField label="Routine name" value={newRoutineName} onChangeText={setNewRoutineName} placeholder="e.g. Weekend" maxLength={30} />
              <BigButton label="Create routine" icon="plus-circle" variant="secondary" minHeight={64} onPress={addRoutine} />
              {routines.length > 1 ? (
                <BigButton label={`Delete "${routine.name}"`} icon="delete-outline" variant="danger" minHeight={64} onPress={deleteRoutine} />
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  routineRow: { gap: SPACING.sm },
  routineName: { fontFamily: Fonts.extrabold, color: Colors.text },
  editor: {
    gap: SPACING.md,
    padding: SPACING.md,
    borderWidth: 3,
    borderColor: Colors.primaryDark,
    borderRadius: 16,
    backgroundColor: '#F2F6FF',
  },
  editorTitle: { fontFamily: Fonts.extrabold, color: Colors.text },
  editorButtons: { gap: SPACING.sm },
  footer: { gap: SPACING.md, marginTop: SPACING.lg },
  sectionTitle: { fontFamily: Fonts.extrabold, color: Colors.text, marginTop: SPACING.md },
});
