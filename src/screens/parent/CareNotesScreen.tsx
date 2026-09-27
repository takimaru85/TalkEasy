import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, EmptyState, ListRow, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors, tileColor } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { notesRepo } from '@/database';
import { useNotes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import type { NoteType } from '@/types/models';
import { Fonts } from '@/theme';
import { confirm } from '@/utils/confirm';
import { formatDate } from '@/utils/date';

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  speech: 'Speech',
  school: 'School',
  behavior: 'Behavior',
  activity: 'Activity',
  teacher: 'Teacher note',
  reminder: 'Reminder',
  other: 'Other',
  // From earlier versions; still shown for notes that use them.
  observation: 'Observation',
  general: 'General',
};

export const NOTE_TYPE_ICONS: Record<NoteType, string> = {
  speech: 'microphone-outline',
  school: 'school-outline',
  behavior: 'emoticon-outline',
  activity: 'run',
  teacher: 'human-male-board',
  reminder: 'bell-outline',
  other: 'note-text-outline',
  observation: 'eye-outline',
  general: 'note-text-outline',
};

export const NOTE_TYPE_TINTS: Record<NoteType, string> = {
  speech: tileColor('coral'),
  school: tileColor('green'),
  behavior: tileColor('purple'),
  activity: tileColor('teal'),
  teacher: tileColor('blue'),
  reminder: tileColor('yellow'),
  other: tileColor('grey'),
  observation: tileColor('grey'),
  general: tileColor('grey'),
};

/** The categories a parent picks from for a new note, in order. */
export const NOTE_CATEGORIES: NoteType[] = ['speech', 'school', 'behavior', 'activity', 'teacher', 'reminder', 'other'];

const TITLES: Partial<Record<NoteType, string>> = { teacher: 'Teacher notes', reminder: 'Important reminders' };

/**
 * Local-only caregiver notes, newest first, filterable by category. This is a private journal for
 * the parent; the app never interprets, analyses or shares what is written here.
 */
export function CareNotesScreen({ navigation, route }: ParentScreenProps<'CareNotes'>) {
  const { data: notes, loading } = useNotes();
  const [filter, setFilter] = React.useState<NoteType | null>(route.params?.filter ?? null);
  // Older notes typed "general" / "observation" appear under "Other".
  const matches = (t: NoteType) => filter === null || t === filter || (filter === 'other' && (t === 'general' || t === 'observation'));
  const shown = notes.filter((n) => matches(n.noteType));

  const remove = async (id: number, title: string) => {
    if (await confirm('Delete note?', `"${title}" will be removed.`)) await notesRepo.remove(id);
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title={(filter && TITLES[filter]) || 'Care notes'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Private notes for you and other caregivers, kept only on this device. A place to remember what
          happened — not medical advice.
        </Text>
        <BigButton label="Add a note" icon="plus-circle" onPress={() => navigation.navigate('EditNote', { noteType: filter ?? undefined })} minHeight={72} />

        {/* Category filter: large chips, wrapping, no sideways scrolling. */}
        <View style={styles.chips} accessibilityRole="tablist">
          {([null, ...NOTE_CATEGORIES] as (NoteType | null)[]).map((c) => {
            const selected = filter === c;
            return (
              <Pressable
                key={c ?? 'all'}
                onPress={() => setFilter(c)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                style={[styles.chip, selected ? styles.chipSelected : null]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {c ? NOTE_TYPE_LABELS[c] : 'All'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!loading && shown.length === 0 ? <EmptyState icon="note-text-outline" title={filter ? `No ${NOTE_TYPE_LABELS[filter].toLowerCase()} notes yet` : 'No notes yet'} /> : null}
        {shown.map((n) => (
          <View key={n.id} style={styles.item}>
            <ListRow
              title={n.title || n.body.split('\n')[0] || 'Note'}
              subtitle={`${NOTE_TYPE_LABELS[n.noteType] ?? 'Note'} · ${formatDate(n.noteDate)}${n.photoUri ? ' · 📷 photo' : ''}${n.body && n.title ? `\n${n.body}` : ''}`}
              icon={NOTE_TYPE_ICONS[n.noteType] ?? 'note-text-outline'}
              iconBackground={NOTE_TYPE_TINTS[n.noteType]}
              onPress={() => navigation.navigate('EditNote', { noteId: n.id })}
              actions={[
                { icon: 'pencil-outline', label: 'Edit', onPress: () => navigation.navigate('EditNote', { noteId: n.id }) },
                { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: () => remove(n.id, n.title || 'this note') },
              ]}
            />
            {n.photoUri ? <Image source={{ uri: n.photoUri }} style={styles.photo} accessibilityLabel="Note photo" /> : null}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  hint: { color: Colors.textMuted, fontSize: 16, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    minHeight: MIN_PARENT_TARGET - 8,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.borderSoft,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  chipText: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.text },
  chipTextSelected: { color: '#FFFFFF' },
  item: { gap: SPACING.xs },
  photo: { width: '100%', height: 180, borderRadius: RADIUS.tile, backgroundColor: Colors.surfaceAlt },
});
