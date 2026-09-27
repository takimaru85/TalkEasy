import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChoiceRow, DateField, FormField, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { notesRepo } from '@/database';
import { useNote, useToday } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import type { NoteType } from '@/types/models';
import { deleteImported, pickPhoto } from '@/services/files';
import { alertMessage, confirm } from '@/utils/confirm';
import { formatDateTime } from '@/utils/date';
import { NOTE_CATEGORIES, NOTE_TYPE_LABELS } from './CareNotesScreen';

/**
 * Create or edit a caregiver note: a day, a category, the note, and optionally a photo (copied
 * into the app's private storage, like every other photo). A short title is optional — the first
 * line of the note is used when it is left empty.
 */
export function EditNoteScreen({ navigation, route }: ParentScreenProps<'EditNote'>) {
  const { noteId, noteType: presetType } = route.params ?? {};
  const isNew = noteId === undefined;
  const { data: existing, loading } = useNote(noteId);
  const { isoDate } = useToday();

  const [noteType, setNoteType] = useState<NoteType>(presetType ?? 'other');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [noteDate, setNoteDate] = useState<string | null>(isoDate);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(isNew);

  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setNoteType(existing.noteType);
      setTitle(existing.title);
      setBody(existing.body);
      setNoteDate(existing.noteDate);
      setPhotoUri(existing.photoUri);
      setHydrated(true);
    }
  }, [isNew, existing, hydrated]);

  // A note typed in an older version keeps its category available.
  const categories = NOTE_CATEGORIES.includes(noteType) ? NOTE_CATEGORIES : [...NOTE_CATEGORIES, noteType];

  const choosePhoto = async (source: 'library' | 'camera') => {
    const picked = await pickPhoto(source);
    if (picked) {
      if (photoUri && photoUri !== existing?.photoUri) deleteImported(photoUri);
      setPhotoUri(picked.uri);
    }
  };

  const save = async () => {
    if (!title.trim() && !body.trim()) return alertMessage('Please write the note.');
    const input = { noteType, title: title.trim() || body.trim().split('\n')[0].slice(0, 80), body, photoUri, noteDate: noteDate ?? isoDate };
    if (isNew) await notesRepo.create(input);
    else await notesRepo.update(noteId, input);
    // A photo that was replaced or removed is deleted from storage once the note is saved.
    if (existing?.photoUri && existing.photoUri !== photoUri) deleteImported(existing.photoUri);
    navigation.goBack();
  };

  const remove = async () => {
    if (isNew) return;
    if (await confirm('Delete note?', `"${title || 'This note'}" will be removed.`)) {
      await notesRepo.remove(noteId);
      deleteImported(existing?.photoUri);
      navigation.goBack();
    }
  };

  if (!isNew && loading) return <ScreenContainer edges={['top', 'bottom', 'left', 'right']} />;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title={isNew ? 'New note' : 'Edit note'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {existing ? <Text style={styles.meta} maxFontSizeMultiplier={MAX_FONT_SCALE}>Written {formatDateTime(existing.createdAt)}</Text> : null}
          <DateField label="Date" value={noteDate} onChange={setNoteDate} optional={false} />
          <ChoiceRow<NoteType>
            label="Category"
            value={noteType}
            onChange={setNoteType}
            choices={categories.map((t) => ({ value: t, label: NOTE_TYPE_LABELS[t] }))}
          />
          <FormField
            label="Note"
            value={body}
            onChangeText={setBody}
            placeholder={noteType === 'speech' ? 'e.g. Practiced the B sounds today.' : noteType === 'reminder' ? 'e.g. Bring the library book on Friday.' : 'What happened, what you noticed, anything to remember.'}
            multiline
            maxLength={2000}
          />
          <FormField label="Short title (optional)" value={title} onChangeText={setTitle} placeholder="Uses the first line of the note if empty" maxLength={80} />

          <Text style={styles.label} maxFontSizeMultiplier={MAX_FONT_SCALE}>Photo (optional)</Text>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} accessibilityLabel="Note photo" /> : null}
          <View style={styles.row}>
            <BigButton label="Take photo" icon="camera-outline" variant="secondary" minHeight={60} compact onPress={() => choosePhoto('camera')} style={styles.half} />
            <BigButton label="Choose photo" icon="image-outline" variant="secondary" minHeight={60} compact onPress={() => choosePhoto('library')} style={styles.half} />
          </View>
          {photoUri ? (
            <BigButton
              label="Remove photo"
              icon="close"
              variant="outline"
              minHeight={56}
              onPress={() => {
                if (photoUri !== existing?.photoUri) deleteImported(photoUri);
                setPhotoUri(null);
              }}
            />
          ) : null}

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
  label: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  photo: { width: '100%', height: 200, borderRadius: RADIUS.tile, backgroundColor: Colors.surfaceAlt },
  row: { flexDirection: 'row', gap: SPACING.sm },
  half: { flex: 1 },
});
