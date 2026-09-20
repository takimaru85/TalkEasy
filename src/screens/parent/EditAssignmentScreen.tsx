import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChoiceRow, DateField, FormField, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { KIND_META, PRIORITY_META, STATUS_META } from '@/constants/school';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { assignmentsRepo } from '@/database';
import { useAssignment, useSizes, useSubjects } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { deleteImported, pickAttachment, pickPhoto } from '@/services/files';
import type { AssignmentKind, AssignmentPriority, AssignmentStatus } from '@/types/models';
import { alertMessage, confirm } from '@/utils/confirm';
import { toIsoDate } from '@/utils/date';
import { Fonts } from '@/theme';

/** Create / edit an assignment, project or exam — with optional photo and attachment. */
export function EditAssignmentScreen({ navigation, route }: ParentScreenProps<'EditAssignment'>) {
  const { assignmentId, subjectId: initialSubjectId } = route.params ?? {};
  const isNew = assignmentId === undefined;
  const sizes = useSizes();
  const { data: existing, loading } = useAssignment(assignmentId);
  const { data: subjects } = useSubjects(true);

  const [subjectId, setSubjectId] = useState<number | null>(initialSubjectId ?? null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<AssignmentKind>('assignment');
  const [dateAssigned, setDateAssigned] = useState<string | null>(toIsoDate(new Date()));
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<AssignmentPriority>('medium');
  const [status, setStatus] = useState<AssignmentStatus>('todo');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [attachmentUri, setAttachmentUri] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(isNew);

  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setSubjectId(existing.subjectId);
      setTitle(existing.title);
      setDescription(existing.description);
      setKind(existing.kind);
      setDateAssigned(existing.dateAssigned);
      setDueDate(existing.dueDate);
      setPriority(existing.priority);
      setStatus(existing.status);
      setNotes(existing.notes);
      setPhotoUri(existing.photoUri);
      setAttachmentUri(existing.attachmentUri);
      setAttachmentName(existing.attachmentName);
      setHydrated(true);
    }
  }, [isNew, existing, hydrated]);

  const save = async () => {
    if (!title.trim()) return alertMessage('Please type a title, e.g. "Answer pages 25-26".');
    const input = { subjectId, title, description, kind, dateAssigned, dueDate, priority, status, notes, photoUri, attachmentUri, attachmentName };
    if (isNew) await assignmentsRepo.create(input);
    else await assignmentsRepo.update(assignmentId, input);
    navigation.goBack();
  };

  const remove = async () => {
    if (isNew) return;
    if (await confirm('Delete?', `"${title}" will be removed.`)) {
      deleteImported(photoUri);
      deleteImported(attachmentUri);
      await assignmentsRepo.remove(assignmentId);
      navigation.goBack();
    }
  };

  const choosePhoto = async (source: 'library' | 'camera') => {
    const picked = await pickPhoto(source);
    if (picked) {
      deleteImported(photoUri);
      setPhotoUri(picked.uri);
    }
  };

  const chooseAttachment = async () => {
    const picked = await pickAttachment();
    if (picked) {
      deleteImported(attachmentUri);
      setAttachmentUri(picked.uri);
      setAttachmentName(picked.name);
    }
  };

  if (!isNew && loading) return <ScreenContainer edges={['top', 'bottom', 'left', 'right']} />;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title={isNew ? 'New assignment' : 'Edit assignment'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <ChoiceRow<AssignmentKind>
            label="Type"
            value={kind}
            onChange={setKind}
            choices={(Object.keys(KIND_META) as AssignmentKind[]).map((k) => ({ value: k, label: KIND_META[k].label }))}
          />
          <ChoiceRow
            label="Subject"
            value={subjectId === null ? 'none' : String(subjectId)}
            onChange={(v) => setSubjectId(v === 'none' ? null : Number(v))}
            choices={[...subjects.map((s) => ({ value: String(s.id), label: `${s.icon} ${s.name}` })), { value: 'none', label: 'No subject' }]}
          />
          <FormField label="Title" value={title} onChangeText={setTitle} placeholder='e.g. "Answer pages 25-26"' maxLength={100} />
          <FormField label="Description" value={description} onChangeText={setDescription} placeholder="What exactly to do" multiline maxLength={1000} />
          <DateField label="Date assigned" value={dateAssigned} onChange={setDateAssigned} />
          <DateField label="Due date" value={dueDate} onChange={setDueDate} />
          <ChoiceRow<AssignmentPriority>
            label="Priority"
            value={priority}
            onChange={setPriority}
            choices={(Object.keys(PRIORITY_META) as AssignmentPriority[]).map((p) => ({ value: p, label: PRIORITY_META[p].label }))}
          />
          <ChoiceRow<AssignmentStatus>
            label="Status"
            value={status}
            onChange={setStatus}
            choices={(Object.keys(STATUS_META) as AssignmentStatus[]).map((s) => ({ value: s, label: STATUS_META[s].label }))}
          />
          <ChoiceRow
            label="Completed"
            value={status === 'done' ? 'yes' : 'no'}
            onChange={(v) => setStatus(v === 'yes' ? 'done' : status === 'done' ? 'todo' : status)}
            choices={[
              { value: 'yes', label: '✅ Completed' },
              { value: 'no', label: 'Not completed' },
            ]}
          />
          <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Anything to remember" multiline maxLength={1000} />

          <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Photo (optional)</Text>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} accessibilityIgnoresInvertColors accessibilityLabel="Assignment photo" /> : null}
          <View style={styles.row}>
            <BigButton label="Take photo" icon="camera-outline" variant="secondary" minHeight={60} compact onPress={() => choosePhoto('camera')} style={styles.half} />
            <BigButton label="Choose photo" icon="image-outline" variant="secondary" minHeight={60} compact onPress={() => choosePhoto('library')} style={styles.half} />
          </View>
          {photoUri ? (
            <BigButton label="Remove photo" icon="close" variant="outline" minHeight={56} onPress={() => { deleteImported(photoUri); setPhotoUri(null); }} />
          ) : null}

          <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Attachment (optional)</Text>
          {attachmentName ? <Text style={styles.attachment} maxFontSizeMultiplier={MAX_FONT_SCALE}>📎 {attachmentName}</Text> : null}
          <View style={styles.row}>
            <BigButton label={attachmentUri ? 'Replace file' : 'Attach a file'} icon="paperclip" variant="secondary" minHeight={60} compact onPress={chooseAttachment} style={styles.half} />
            {attachmentUri ? (
              <BigButton label="Remove file" icon="close" variant="outline" minHeight={60} compact onPress={() => { deleteImported(attachmentUri); setAttachmentUri(null); setAttachmentName(null); }} style={styles.half} />
            ) : null}
          </View>

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
  label: { fontFamily: Fonts.bold, color: Colors.text },
  row: { flexDirection: 'row', gap: SPACING.sm },
  half: { flex: 1 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: RADIUS.tile, borderWidth: 2, borderColor: Colors.border },
  attachment: { color: Colors.text, fontSize: 16, fontFamily: Fonts.semibold },
});
