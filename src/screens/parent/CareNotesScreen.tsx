import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BigButton, EmptyState, ListRow, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { notesRepo } from '@/database';
import { useNotes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import type { NoteType } from '@/types/models';
import { confirm } from '@/utils/confirm';
import { formatDateTime } from '@/utils/date';

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  activity: 'Activity',
  observation: 'Observation',
  general: 'General',
};

const NOTE_TYPE_ICONS: Record<NoteType, string> = {
  activity: 'run',
  observation: 'eye-outline',
  general: 'note-text-outline',
};

/**
 * Local-only caregiver notes, newest first. This is a private journal for the parent;
 * the app never interprets, analyses or shares what is written here.
 */
export function CareNotesScreen({ navigation }: ParentScreenProps<'CareNotes'>) {
  const { data: notes, loading } = useNotes();

  const remove = async (id: number, title: string) => {
    if (await confirm('Delete note?', `"${title}" will be removed.`)) await notesRepo.remove(id);
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Care notes" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Notes are stored only on this device. They are a private record for you and other caregivers —
          not medical advice.
        </Text>
        <BigButton label="Add a note" icon="plus-circle" onPress={() => navigation.navigate('EditNote', {})} minHeight={72} />
        {!loading && notes.length === 0 ? <EmptyState icon="note-text-outline" title="No notes yet" /> : null}
        {notes.map((n) => (
          <ListRow
            key={n.id}
            title={n.title}
            subtitle={`${NOTE_TYPE_LABELS[n.noteType] ?? 'Note'} · ${formatDateTime(n.createdAt)}${n.body ? `\n${n.body}` : ''}`}
            icon={NOTE_TYPE_ICONS[n.noteType] ?? 'note-text-outline'}
            onPress={() => navigation.navigate('EditNote', { noteId: n.id })}
            actions={[
              { icon: 'pencil-outline', label: 'Edit', onPress: () => navigation.navigate('EditNote', { noteId: n.id }) },
              { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: () => remove(n.id, n.title) },
            ]}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  hint: { color: Colors.textMuted, fontSize: 16 },
});
