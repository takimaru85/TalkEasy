import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { BigButton, ChoiceRow, DateField, FormField, ScreenContainer, ScreenHeader, TimeField } from '@/components/common';
import { EVENT_TYPE_META } from '@/constants/school';
import { SPACING } from '@/constants/sizes';
import { eventsRepo } from '@/database';
import { useEvent, useSubjects } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import type { SchoolEventType } from '@/types/models';
import { alertMessage, confirm } from '@/utils/confirm';
import { toIsoDate } from '@/utils/date';

/** Create / edit a school event (holiday, meeting, reminder, exam, project, other). */
export function EditEventScreen({ navigation, route }: ParentScreenProps<'EditEvent'>) {
  const { eventId, date: initialDate } = route.params ?? {};
  const isNew = eventId === undefined;
  const { data: existing, loading } = useEvent(eventId);
  const { data: subjects } = useSubjects(true);

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<SchoolEventType>('event');
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(initialDate ?? toIsoDate(new Date()));
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [hydrated, setHydrated] = useState(isNew);

  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setTitle(existing.title);
      setEventType(existing.eventType);
      setSubjectId(existing.subjectId);
      setDate(existing.date);
      setTime(existing.time);
      setNotes(existing.notes);
      setHydrated(true);
    }
  }, [isNew, existing, hydrated]);

  const save = async () => {
    if (!title.trim()) return alertMessage('Please type a title.');
    if (!date) return alertMessage('Please choose a date.');
    const input = { title, eventType, subjectId, date, time, notes };
    if (isNew) await eventsRepo.create(input);
    else await eventsRepo.update(eventId, input);
    navigation.goBack();
  };

  const remove = async () => {
    if (isNew) return;
    if (await confirm('Delete event?', `"${title}" will be removed.`)) {
      await eventsRepo.remove(eventId);
      navigation.goBack();
    }
  };

  if (!isNew && loading) return <ScreenContainer edges={['top', 'bottom', 'left', 'right']} />;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title={isNew ? 'New event' : 'Edit event'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <ChoiceRow<SchoolEventType>
            label="Type"
            value={eventType}
            onChange={setEventType}
            choices={(Object.keys(EVENT_TYPE_META) as SchoolEventType[]).map((t) => ({ value: t, label: EVENT_TYPE_META[t].label }))}
          />
          <FormField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Family Day, Parent-teacher meeting" maxLength={100} />
          <DateField label="Date" value={date} onChange={setDate} optional={false} />
          <TimeField label="Time (optional)" value={time} onChange={setTime} />
          <ChoiceRow
            label="Subject (optional)"
            value={subjectId === null ? 'none' : String(subjectId)}
            onChange={(v) => setSubjectId(v === 'none' ? null : Number(v))}
            choices={[{ value: 'none', label: 'None' }, ...subjects.map((s) => ({ value: String(s.id), label: s.name }))]}
          />
          <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Details" multiline maxLength={1000} />
          <BigButton label="Save" icon="content-save" minHeight={72} onPress={save} />
          {!isNew ? <BigButton label="Delete" icon="delete-outline" variant="danger" minHeight={64} onPress={remove} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
});
