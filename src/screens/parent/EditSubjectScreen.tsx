import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  BigButton,
  ChoiceRow,
  ColorPicker,
  FormField,
  IconPicker,
  ListRow,
  ScreenContainer,
  ScreenHeader,
  SectionTitle,
  TimeField,
} from '@/components/common';
import { Colors } from '@/constants/colors';
import { DEFAULT_TILE_COLOR } from '@/constants/colors';
import { ALL_DAYS, DAY_NAMES } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { subjectsRepo } from '@/database';
import { useSizes, useSubject, useSubjectMaterials, useSubjectSchedule } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import type { DayOfWeek } from '@/types/models';
import { alertMessage, confirm } from '@/utils/confirm';
import { formatTime } from '@/utils/date';
import { Fonts } from '@/theme';

const SUBJECT_EMOJI = ['📖', '🇵🇭', '🔢', '🔬', '🏘️', '💗', '🎨', '🎵', '⚽', '💻', '🌍', '✏️', '📚', '🧪', '🎭', '🙏'];

/**
 * Create / edit a subject. Once saved, the same screen manages its weekly schedule and
 * "things to bring" list (both inline, no extra routes).
 */
export function EditSubjectScreen({ navigation, route }: ParentScreenProps<'EditSubject'>) {
  const { subjectId } = route.params ?? {};
  const isNew = subjectId === undefined;
  const sizes = useSizes();
  const { data: existing, loading } = useSubject(subjectId);
  const { data: schedule } = useSubjectSchedule(subjectId);
  const { data: materials } = useSubjectMaterials(subjectId);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📖');
  const [color, setColor] = useState(DEFAULT_TILE_COLOR);
  const [teacher, setTeacher] = useState('');
  const [notes, setNotes] = useState('');
  const [hydrated, setHydrated] = useState(isNew);
  const [useGlyphPicker, setUseGlyphPicker] = useState(false);

  // schedule form
  const [day, setDay] = useState<DayOfWeek>(1);
  const [start, setStart] = useState<string | null>('08:00');
  const [end, setEnd] = useState<string | null>('09:00');
  // material form
  const [materialName, setMaterialName] = useState('');

  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setName(existing.name);
      setIcon(existing.icon);
      setColor(existing.color);
      setTeacher(existing.teacherName);
      setNotes(existing.notes);
      setHydrated(true);
    }
  }, [isNew, existing, hydrated]);

  const save = async () => {
    if (!name.trim()) return alertMessage('Please give the subject a name.');
    const input = { name, icon, color, teacherName: teacher, notes };
    if (isNew) {
      const id = await subjectsRepo.create(input);
      navigation.replace('EditSubject', { subjectId: id });
    } else {
      await subjectsRepo.update(subjectId, input);
      navigation.goBack();
    }
  };

  const addSchedule = async () => {
    if (!subjectId || !start) return alertMessage('Choose a start time.');
    await subjectsRepo.addSchedule(subjectId, day, start, end);
  };

  const addMaterial = async () => {
    if (!subjectId) return;
    if (!materialName.trim()) return alertMessage('Type what to bring, e.g. "Notebook".');
    await subjectsRepo.addMaterial(subjectId, materialName);
    setMaterialName('');
  };

  const remove = async () => {
    if (isNew) return;
    if (await confirm('Delete subject?', `"${name}" will be removed.`)) {
      await subjectsRepo.remove(subjectId);
      navigation.goBack();
    }
  };

  if (!isNew && loading) return <ScreenContainer edges={['top', 'bottom', 'left', 'right']} />;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title={isNew ? 'New subject' : name || 'Edit subject'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <FormField label="Subject name" value={name} onChangeText={setName} placeholder="e.g. Mathematics" maxLength={40} />
          <FormField label="Teacher" value={teacher} onChangeText={setTeacher} placeholder="e.g. Teacher Ana" maxLength={60} />
          <FormField label="Notes / important reminders" value={notes} onChangeText={setNotes} placeholder="e.g. Bring workbook every Monday." multiline maxLength={600} />
          <ColorPicker value={color} onChange={setColor} />

          <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Picture</Text>
          <View style={styles.emojiRow}>
            {SUBJECT_EMOJI.map((e) => (
              <BigButton key={e} label={e} variant={icon === e ? 'primary' : 'outline'} fullWidth={false} compact minHeight={56} onPress={() => setIcon(e)} accessibilityLabel={`Picture ${e}`} />
            ))}
          </View>
          <BigButton label={useGlyphPicker ? 'Hide icon list' : 'Choose an icon instead'} variant="secondary" minHeight={56} onPress={() => setUseGlyphPicker((v) => !v)} />
          {useGlyphPicker ? <IconPicker value={icon} onChange={setIcon} previewColor={color} /> : null}

          <BigButton label={isNew ? 'Save and continue' : 'Save'} icon="content-save" minHeight={72} onPress={save} />

          {!isNew ? (
            <>
              <SectionTitle title="Weekly schedule" emoji="🕒" />
              {schedule.length === 0 ? (
                <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>No class times yet. Add one below.</Text>
              ) : null}
              {schedule.map((s) => (
                <ListRow
                  key={s.id}
                  title={DAY_NAMES[s.dayOfWeek].long}
                  subtitle={`${formatTime(s.startTime)}${s.endTime ? ` – ${formatTime(s.endTime)}` : ''}`}
                  icon="clock-outline"
                  actions={[{ icon: 'delete-outline', label: 'Remove', color: Colors.danger, onPress: () => subjectsRepo.removeSchedule(s.id) }]}
                />
              ))}
              <View style={styles.panel}>
                <ChoiceRow
                  label="Day"
                  value={String(day)}
                  onChange={(v) => setDay(Number(v) as DayOfWeek)}
                  choices={ALL_DAYS.map((d) => ({ value: String(d), label: DAY_NAMES[d].short }))}
                />
                <TimeField label="Starts" value={start} onChange={setStart} optional={false} />
                <TimeField label="Ends" value={end} onChange={setEnd} />
                <BigButton label="Add class time" icon="plus-circle" variant="secondary" minHeight={64} onPress={addSchedule} />
              </View>

              <SectionTitle title="Things to bring" emoji="🎒" />
              {materials.map((m) => (
                <ListRow
                  key={m.id}
                  title={m.name}
                  subtitle={m.note || undefined}
                  icon="checkbox-blank-circle-outline"
                  actions={[{ icon: 'delete-outline', label: 'Remove', color: Colors.danger, onPress: () => subjectsRepo.removeMaterial(m.id) }]}
                />
              ))}
              <View style={styles.panel}>
                <FormField label="Item" value={materialName} onChangeText={setMaterialName} placeholder="e.g. Crayons" maxLength={60} />
                <BigButton label="Add item" icon="plus-circle" variant="secondary" minHeight={64} onPress={addMaterial} />
              </View>

              <BigButton label="Add an assignment for this subject" icon="pencil" variant="secondary" minHeight={64} onPress={() => navigation.navigate('EditAssignment', { subjectId })} />
              <BigButton label="Delete this subject" icon="delete-outline" variant="danger" minHeight={64} onPress={remove} />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  label: { fontFamily: Fonts.bold, color: Colors.text },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  hint: { color: Colors.textMuted, fontSize: 16 },
  panel: {
    gap: SPACING.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: '#CFCFCF',
    borderRadius: 14,
    backgroundColor: Colors.surface,
  },
});
