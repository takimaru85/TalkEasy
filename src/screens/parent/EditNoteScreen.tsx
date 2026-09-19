import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { BigButton, ChoiceRow, FormField, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { notesRepo } from '@/database';
import { useNote } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import type { NoteType } from '@/types/models';
import { alertMessage, confirm } from '@/utils/confirm';
import { formatDateTime } from '@/utils/date';
import { NOTE_TYPE_LABELS } from './CareNotesScreen';

/** Create or edit a caregiver note. The timestamp is set automatically on creation. */
export function EditNoteScreen({ navigation, route }: ParentScreenProps<'EditNote'>) {
  const { noteId } = route.params ?? {};
  const isNew = noteId === undefined;
  const { data: existing, loading } = useNote(noteId);

  const [noteType, setNoteType] = useState<NoteType>('general');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [hydrated, setHydrated] = useState(isNew);

  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setNoteType(existing.noteType);
      setTitle(existing.title);
      setBody(existing.body);
      setHydrated(true);
    }
  }, [isNew, existing, hydrated]);

  const save = async () => {
    if (!title.trim()) return alertMessage('Please give the note a title.');
    const input = { noteType, title, body };
    if (isNew) await notesRepo.create(input);
    else await notesRepo.update(noteId, input);
    navigation.goBack();
  };

  const remove = async () => {
    if (isNew) return;
    if (await confirm('Delete note?', `"${title}" will be removed.`)) {
      await notesRepo.remove(noteId);
      navigation.goBack();
    }
  };

  if (!isNew && loading) return <ScreenContainer edges={['top', 'bottom', 'left', 'right']} />;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title={isNew ? 'New note' : 'Edit note'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {existing ? (
            <Text style={styles.meta} maxFontSizeMultiplier={MAX_FONT_SCALE}>Written {formatDateTime(existing.createdAt)}</Text>
          ) : (
            <Text style={styles.meta} maxFontSizeMultiplier={MAX_FONT_SCALE}>Date and time are saved automatically.</Text>
          )}
          <ChoiceRow<NoteType>
            label="Type"
            value={noteType}
            onChange={setNoteType}
            choices={(Object.keys(NOTE_TYPE_LABELS) as NoteType[]).map((t) => ({ value: t, label: NOTE_TYPE_LABELS[t] }))}
          />
          <FormField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Physio session" maxLength={80} />
          <FormField
            label="Details"
            value={body}
            onChangeText={setBody}
            placeholder="What happened, what you noticed, anything to remember."
            multiline
            maxLength={2000}
          />
          <BigButton label="Save" icon="content-save" onPress={save} minHeight={72} />
          {!isNew ? <BigButton label="Delete this note" icon="delete-outline" variant="danger" onPress={remove} minHeight={64} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  meta: { color: Colors.textMuted, fontSize: 15 },
});
