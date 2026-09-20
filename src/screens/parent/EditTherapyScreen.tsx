import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChoiceRow, FormField, IconPicker, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { ACTIVITY_CATEGORY_META, FREQUENCY_META } from '@/constants/school';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { therapyRepo } from '@/database';
import { useSizes, useTherapyActivity } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { deleteImported, pickPhoto } from '@/services/files';
import type { ActivityCategory, ActivityFrequency } from '@/types/models';
import { alertMessage, confirm } from '@/utils/confirm';
import { Fonts } from '@/theme';

const DURATIONS = ['0', '2', '5', '10', '15', '20', '30'];

/** Create or edit an activity card (name, picture or icon, instructions, duration, frequency). */
export function EditTherapyScreen({ navigation, route }: ParentScreenProps<'EditTherapy'>) {
  const { activityId } = route.params ?? {};
  const isNew = activityId === undefined;
  const sizes = useSizes();
  const { data: existing, loading } = useTherapyActivity(activityId);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('arm-flex');
  const [instructions, setInstructions] = useState('');
  const [duration, setDuration] = useState<string>('10');
  const [frequency, setFrequency] = useState<ActivityFrequency>('daily');
  const [category, setCategory] = useState<ActivityCategory>('games');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(isNew);

  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setName(existing.name);
      setIcon(existing.icon);
      setInstructions(existing.instructions);
      setDuration(String(existing.durationMinutes));
      setFrequency(existing.frequency);
      setCategory(existing.category);
      setImageUri(existing.imageUri);
      setHydrated(true);
    }
  }, [isNew, existing, hydrated]);

  const save = async () => {
    if (!name.trim()) return alertMessage('Please give the activity a name.');
    const input = { name, icon, instructions, durationMinutes: Number(duration) || 0, frequency, category, imageUri };
    if (isNew) await therapyRepo.create(input);
    else await therapyRepo.update(activityId, input);
    navigation.goBack();
  };

  const remove = async () => {
    if (isNew) return;
    if (await confirm('Delete activity?', `"${name}" will be removed.`)) {
      deleteImported(imageUri);
      await therapyRepo.remove(activityId);
      navigation.goBack();
    }
  };

  const choosePhoto = async (source: 'library' | 'camera') => {
    const picked = await pickPhoto(source);
    if (picked) {
      deleteImported(imageUri);
      setImageUri(picked.uri);
    }
  };

  if (!isNew && loading) return <ScreenContainer edges={['top', 'bottom', 'left', 'right']} />;

  const durationChoices = [...DURATIONS.map((d) => ({ value: d, label: d === '0' ? 'None' : `${d} min` }))];
  if (!DURATIONS.includes(duration)) durationChoices.push({ value: duration, label: `${duration} min` });

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title={isNew ? 'New activity' : 'Edit activity'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <FormField label="Name" value={name} onChangeText={setName} placeholder="e.g. Stretching" maxLength={40} />
          <FormField label="Instructions" value={instructions} onChangeText={setInstructions} placeholder="Step-by-step, in simple words." multiline maxLength={800} />
          <ChoiceRow<ActivityCategory>
            label="Category"
            value={category}
            onChange={setCategory}
            choices={(Object.keys(ACTIVITY_CATEGORY_META) as ActivityCategory[]).map((k) => ({ value: k, label: `${ACTIVITY_CATEGORY_META[k].emoji} ${ACTIVITY_CATEGORY_META[k].label}` }))}
          />
          <ChoiceRow label="Duration" value={duration} onChange={setDuration} choices={durationChoices} />
          <ChoiceRow<ActivityFrequency>
            label="How often"
            value={frequency}
            onChange={setFrequency}
            choices={(Object.keys(FREQUENCY_META) as ActivityFrequency[]).map((f) => ({ value: f, label: FREQUENCY_META[f].label }))}
          />

          <Text style={[styles.label, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Picture (optional)</Text>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.photo} accessibilityIgnoresInvertColors accessibilityLabel={name} /> : null}
          <View style={styles.row}>
            <BigButton label="Take photo" icon="camera-outline" variant="secondary" minHeight={60} compact onPress={() => choosePhoto('camera')} style={styles.half} />
            <BigButton label="Choose photo" icon="image-outline" variant="secondary" minHeight={60} compact onPress={() => choosePhoto('library')} style={styles.half} />
          </View>
          {imageUri ? <BigButton label="Remove picture" icon="close" variant="outline" minHeight={56} onPress={() => { deleteImported(imageUri); setImageUri(null); }} /> : null}

          <IconPicker value={icon} onChange={setIcon} />
          <BigButton label="Save" icon="content-save" minHeight={72} onPress={save} />
          {!isNew ? <BigButton label="Delete this activity" icon="delete-outline" variant="danger" minHeight={64} onPress={remove} /> : null}
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
});
