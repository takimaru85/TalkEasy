import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  BigButton,
  ChoiceRow,
  ColorPicker,
  FormField,
  IconPicker,
  ScreenContainer,
  ScreenHeader,
} from '@/components/common';
import { CommunicationTile } from '@/components/communication';
import { Colors, DEFAULT_TILE_COLOR } from '@/constants/colors';
import { DEFAULT_ICON } from '@/constants/icons';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { buttonsRepo, favoritesRepo } from '@/database';
import { useButton, useCategories, useFavoriteIds, useSizes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { speakWithSettings } from '@/services/speech';
import { deleteImported, pickPhoto } from '@/services/files';
import type { CommunicationButton } from '@/types/models';
import { alertMessage, confirm } from '@/utils/confirm';
import { Fonts } from '@/theme';

/**
 * Create or edit a communication button: label, spoken phrase, category, icon, color,
 * favorite. A live preview tile shows exactly what the child will see.
 */
export function EditButtonScreen({ navigation, route }: ParentScreenProps<'EditButton'>) {
  const { buttonId, categoryId: initialCategoryId } = route.params ?? {};
  const isNew = buttonId === undefined;
  const sizes = useSizes();
  const { settings } = useSettings();
  const { data: existing, loading } = useButton(buttonId);
  const { data: categories } = useCategories();
  const { data: favoriteIds, loading: favoritesLoading } = useFavoriteIds();

  const [label, setLabel] = useState('');
  const [phrase, setPhrase] = useState('');
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [color, setColor] = useState(DEFAULT_TILE_COLOR);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId ?? null);
  const [favorite, setFavorite] = useState(false);
  const [hydrated, setHydrated] = useState(isNew);
  const [saving, setSaving] = useState(false);

  // Populate the form once the existing button loads.
  useEffect(() => {
    if (!isNew && existing && !favoritesLoading && !hydrated) {
      setLabel(existing.label);
      setPhrase(existing.phrase);
      setIcon(existing.icon);
      setColor(existing.color);
      setImageUri(existing.imageUri);
      setCategoryId(existing.categoryId);
      setFavorite(favoriteIds.has(existing.id));
      setHydrated(true);
    }
  }, [isNew, existing, hydrated, favoriteIds, favoritesLoading]);

  // Default new buttons to the "My phrases" category (or the first one).
  useEffect(() => {
    if (categoryId === null && categories.length > 0) {
      const custom = categories.find((c) => c.key === 'custom');
      setCategoryId((custom ?? categories[0]).id);
    }
  }, [categories, categoryId]);

  const preview: CommunicationButton = {
    id: existing?.id ?? -1,
    categoryId: categoryId ?? 0,
    label: label || 'Label',
    phrase: phrase || label || 'Phrase',
    icon,
    imageUri,
    color,
    sortOrder: 0,
    isSystem: false,
    isHidden: false,
    tapCount: 0,
    lastUsedAt: null,
    createdAt: '',
    updatedAt: '',
  };

  const save = async () => {
    if (!label.trim()) return alertMessage('Please give the button a name.');
    if (categoryId === null) return alertMessage('Please choose a category.');
    const spoken = phrase.trim() || label.trim();
    setSaving(true);
    try {
      const input = { categoryId, label: label.trim(), phrase: spoken, icon, imageUri, color };
      const id = isNew ? await buttonsRepo.create(input) : (await buttonsRepo.update(buttonId, input), buttonId);
      const currentlyFav = favoriteIds.has(id);
      if (favorite && !currentlyFav) await favoritesRepo.add(id);
      if (!favorite && currentlyFav) await favoritesRepo.remove(id);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (isNew) return;
    if (await confirm('Delete button?', `"${label}" will be removed from every screen.`)) {
      await buttonsRepo.remove(buttonId);
      navigation.goBack();
    }
  };

  if (!isNew && loading) return <ScreenContainer edges={['top', 'bottom', 'left', 'right']} />;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title={isNew ? 'New button' : 'Edit button'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <View style={styles.previewRow}>
            <Text style={[styles.previewLabel, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Preview
            </Text>
            <CommunicationTile
              button={preview}
              selected={false}
              width={Math.min(sizes.tileWidth, 220)}
              onPress={() => speakWithSettings(preview.phrase, settings)}
            />
            <Text style={styles.previewHint} maxFontSizeMultiplier={MAX_FONT_SCALE}>Tap the preview to hear it.</Text>
          </View>

          <FormField
            label="Name on the button"
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Blanket"
            autoCapitalize="sentences"
            maxLength={30}
          />
          <FormField
            label="What it says out loud"
            value={phrase}
            onChangeText={setPhrase}
            placeholder="e.g. I want my blanket, please."
            hint="Leave empty to say the name."
            autoCapitalize="sentences"
            maxLength={200}
            multiline
          />

          {categories.length > 0 && categoryId !== null ? (
            <ChoiceRow
              label="Category"
              value={String(categoryId)}
              onChange={(v) => setCategoryId(Number(v))}
              choices={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            />
          ) : null}

          <ColorPicker value={color} onChange={setColor} />

          <Text style={[styles.previewLabel, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Photo (optional — e.g. a real picture of Mom)</Text>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.photo} accessibilityIgnoresInvertColors accessibilityLabel={label} /> : null}
          <View style={styles.photoRow}>
            <BigButton label="Take photo" icon="camera-outline" variant="secondary" minHeight={60} compact onPress={async () => { const p = await pickPhoto('camera'); if (p) { deleteImported(imageUri); setImageUri(p.uri); } }} style={styles.half} />
            <BigButton label="Choose photo" icon="image-outline" variant="secondary" minHeight={60} compact onPress={async () => { const p = await pickPhoto('library'); if (p) { deleteImported(imageUri); setImageUri(p.uri); } }} style={styles.half} />
          </View>
          {imageUri ? <BigButton label="Remove photo (use icon)" icon="close" variant="outline" minHeight={56} onPress={() => { deleteImported(imageUri); setImageUri(null); }} /> : null}
          <IconPicker value={icon} onChange={setIcon} previewColor={color} />

          <ChoiceRow
            label="Favorites"
            value={favorite ? 'yes' : 'no'}
            onChange={(v) => setFavorite(v === 'yes')}
            choices={[
              { value: 'yes', label: 'In Favorites' },
              { value: 'no', label: 'Not in Favorites' },
            ]}
          />

          <BigButton label={saving ? 'Saving…' : 'Save'} icon="content-save" onPress={save} disabled={saving} minHeight={72} />
          {!isNew ? (
            <BigButton label="Delete this button" icon="delete-outline" variant="danger" onPress={remove} minHeight={64} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  previewRow: { alignItems: 'center', gap: SPACING.sm },
  previewLabel: { fontFamily: Fonts.bold, color: Colors.text, alignSelf: 'flex-start' },
  previewHint: { color: Colors.textMuted, fontSize: 15 },
  photo: { width: 160, height: 160, borderRadius: 80, alignSelf: 'center', borderWidth: 2, borderColor: Colors.border },
  photoRow: { flexDirection: 'row', gap: SPACING.sm },
  half: { flex: 1 },
});
