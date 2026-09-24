import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, BigButton, ChoiceRow, FormField, ScreenContainer, ScreenHeader, SectionTitle } from '@/components/common';
import { AVATAR_CHOICES } from '@/constants/defaults';
import { avatarId, avatarName } from '@/constants/avatars';
import { AvatarArt } from '@/components/common/AvatarArt';
import { DIFFICULTY_META } from '@/constants/school';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { profileRepo } from '@/database';
import { useSizes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { deleteImported, pickPhoto } from '@/services/files';
import { ACCENTS, ACCENT_KEYS, Fonts, Radius, useTheme } from '@/theme';
import type { ChildProfileInput, Difficulty, ThemeColorKey } from '@/types/models';
import { alertMessage } from '@/utils/confirm';
import { ANSWER_METHOD_META, ASSISTANCE_META, type AnswerMethod, type AssistanceLevel } from '@/adaptive/types';

/** Avatar picker cells: big enough to see each character clearly (and a parent-safe target). */
const AVATAR_CELL = 76;

const DIFF_CHOICES = (Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => ({ value: d, label: DIFFICULTY_META[d].label }));

/** Comma-separated list <-> string[] for the favourites fields. */
const toList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
const fromList = (l: string[]) => l.join(', ');

/**
 * "My child": everything that personalises the app. Saved as one profile row; the app reads it
 * through ProfileContext so the name, avatar, colour and preferences update everywhere at once.
 */
export function ChildProfileScreen({ navigation }: ParentScreenProps<'ChildProfile'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { profile } = useProfile();

  const [form, setForm] = useState<ChildProfileInput>(() => stripMeta(profile));
  const [ageText, setAgeText] = useState(profile.age ? String(profile.age) : '');
  const [subjects, setSubjects] = useState(fromList(profile.favorites.subjects));
  const [activities, setActivities] = useState(fromList(profile.favorites.activities));
  const [foods, setFoods] = useState(fromList(profile.favorites.foods));
  const [people, setPeople] = useState(fromList(profile.favorites.people));
  const [hydratedId, setHydratedId] = useState(profile.id);

  // If the profile loads after mount, re-hydrate once.
  useEffect(() => {
    if (profile.id !== hydratedId) {
      setForm(stripMeta(profile));
      setAgeText(profile.age ? String(profile.age) : '');
      setSubjects(fromList(profile.favorites.subjects));
      setActivities(fromList(profile.favorites.activities));
      setFoods(fromList(profile.favorites.foods));
      setPeople(fromList(profile.favorites.people));
      setHydratedId(profile.id);
    }
  }, [profile, hydratedId]);

  const set = <K extends keyof ChildProfileInput>(key: K, value: ChildProfileInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) return alertMessage("Please type your child's name.");
    const input: ChildProfileInput = {
      ...form,
      age: ageText.trim() ? Number(ageText) || null : null,
      favorites: { subjects: toList(subjects), activities: toList(activities), foods: toList(foods), people: toList(people) },
    };
    if (profile.id) await profileRepo.update(profile.id, input);
    else await profileRepo.create(input);
    navigation.goBack();
  };

  const choosePhoto = async (source: 'library' | 'camera') => {
    const picked = await pickPhoto(source);
    if (picked) {
      deleteImported(form.photoUri);
      set('photoUri', picked.uri);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="My child" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <View style={styles.preview}>
            <Avatar avatar={form.avatar} photoUri={form.photoUri} size={96} ring={ACCENTS[form.favoriteColor].strong} />
            <Text style={[styles.previewName, { fontSize: sizes.heading, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Hi {form.nickname || form.name || '…'}! 👋
            </Text>
          </View>

          <SectionTitle title="About" emoji="🙂" />
          <FormField label="Name" value={form.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Brayden" maxLength={40} />
          <FormField label="Nickname (used in greetings)" value={form.nickname} onChangeText={(v) => set('nickname', v)} placeholder="optional" maxLength={30} />
          <View style={styles.row}>
            <View style={styles.half}><FormField label="Age" value={ageText} onChangeText={setAgeText} keyboardType="number-pad" maxLength={2} placeholder="8" /></View>
            <View style={styles.half}><FormField label="Grade" value={form.grade} onChangeText={(v) => set('grade', v)} placeholder="Grade 2" maxLength={30} /></View>
          </View>
          <FormField label="School" value={form.school} onChangeText={(v) => set('school', v)} placeholder="optional" maxLength={80} />

          <SectionTitle title="Picture" emoji="🖼️" />
          <View style={styles.row}>
            <BigButton label="Take photo" icon="camera-outline" variant="secondary" minHeight={60} compact onPress={() => choosePhoto('camera')} style={styles.half} />
            <BigButton label="Choose photo" icon="image-outline" variant="secondary" minHeight={60} compact onPress={() => choosePhoto('library')} style={styles.half} />
          </View>
          {form.photoUri ? <BigButton label="Use an avatar instead" icon="close" variant="outline" minHeight={56} onPress={() => { deleteImported(form.photoUri); set('photoUri', null); }} /> : null}
          <Text style={[styles.label, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Avatar</Text>
          <View style={styles.emojiRow}>
            {AVATAR_CHOICES.map((e) => (
              <Pressable key={e} onPress={() => set('avatar', e)} accessibilityRole="button" accessibilityLabel={`Avatar: ${avatarName(e)}`} accessibilityState={{ selected: form.avatar === e }} style={[styles.avatarCell, { borderColor: form.avatar === e ? theme.colors.primary : theme.colors.borderSoft, borderWidth: form.avatar === e ? 3 : 1.5, backgroundColor: form.avatar === e ? theme.colors.primarySoft : theme.colors.surface }]}>
                <AvatarArt id={avatarId(e)!} size={AVATAR_CELL - 12} />
              </Pressable>
            ))}
          </View>

          <SectionTitle title="Favourite colour" emoji="🎨" />
          <Text style={[styles.hint, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>This becomes the app's accent colour.</Text>
          <View style={styles.emojiRow}>
            {ACCENT_KEYS.map((k: ThemeColorKey) => {
              const a = ACCENTS[k];
              const selected = form.favoriteColor === k;
              return (
                <Pressable key={k} onPress={() => set('favoriteColor', k)} accessibilityRole="button" accessibilityLabel={`Colour ${a.name}`} accessibilityState={{ selected }} style={[styles.swatch, { backgroundColor: a.soft, borderColor: selected ? a.dark : theme.colors.borderSoft, borderWidth: selected ? 4 : 1.5 }]}>
                  <View style={[styles.swatchDot, { backgroundColor: a.strong }]} />
                  <Text style={[styles.swatchText, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{selected ? '✓ ' : ''}{a.name}</Text>
                </Pressable>
              );
            })}
          </View>

          <SectionTitle title="Favourites" emoji="⭐" />
          <FormField label="Favourite subjects" value={subjects} onChangeText={setSubjects} placeholder="Mathematics, English" hint="Separate with commas. Shown first in Learn." />
          <FormField label="Favourite activities" value={activities} onChangeText={setActivities} placeholder="Drawing, Music" hint="Separate with commas." />
          <FormField label="Favourite foods" value={foods} onChangeText={setFoods} placeholder="Pancakes, Mango" hint="Separate with commas." />
          <FormField label="Favourite people" value={people} onChangeText={setPeople} placeholder="Mom, Dad, Sister" hint="Separate with commas." />

          <SectionTitle title="Communication" emoji="🗣️" />
          <ChoiceRow label='Show "Recent" on Talk' value={form.communication.showRecent ? 'on' : 'off'} onChange={(v) => set('communication', { ...form.communication, showRecent: v === 'on' })} choices={[{ value: 'on', label: 'Yes' }, { value: 'off', label: 'No' }]} />
          <ChoiceRow label='Sentence builder ("I want..." + card)' value={form.communication.sentenceBuilder ? 'on' : 'off'} onChange={(v) => set('communication', { ...form.communication, sentenceBuilder: v === 'on' })} choices={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]} />
          <ChoiceRow label="What a card says" value={form.communication.speakFullPhrase ? 'full' : 'label'} onChange={(v) => set('communication', { ...form.communication, speakFullPhrase: v === 'full' })} choices={[{ value: 'full', label: 'Full sentence' }, { value: 'label', label: 'Just the word' }]} />

          <SectionTitle title="Learning" emoji="📚" />
          <ChoiceRow<Difficulty> label="Difficulty" value={form.difficulty} onChange={(v) => set('difficulty', v)} choices={DIFF_CHOICES} />
          <FormField label="Learning goals" value={form.learningGoals} onChangeText={(v) => set('learningGoals', v)} placeholder="What are we working on?" multiline maxLength={600} />

          <SectionTitle title="Adaptive Learning" emoji="🎓" />
          <ChoiceRow<AssistanceLevel>
            label="Assistance level"
            value={form.assistanceLevel}
            onChange={(v) => set('assistanceLevel', v)}
            choices={(Object.keys(ASSISTANCE_META) as AssistanceLevel[]).map((k) => ({ value: k, label: `${ASSISTANCE_META[k].emoji} ${ASSISTANCE_META[k].label}` }))}
          />
          <Text style={[styles.hint, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{ASSISTANCE_META[form.assistanceLevel].description}</Text>
          <ChoiceRow
            label="Preferred answer method (offered first)"
            value={form.preferredMethod ?? 'auto'}
            onChange={(v) => set('preferredMethod', v === 'auto' ? null : (v as AnswerMethod))}
            choices={[{ value: 'auto', label: 'Let the question decide' }, ...(Object.keys(ANSWER_METHOD_META) as AnswerMethod[]).map((m) => ({ value: m, label: `${ANSWER_METHOD_META[m].emoji} ${ANSWER_METHOD_META[m].short}` }))]}
          />

          <SectionTitle title="Rewards" emoji="🏆" />
          <FormField label="Celebration message" value={form.rewards.celebrationMessage} onChangeText={(v) => set('rewards', { ...form.rewards, celebrationMessage: v })} hint="{name} is replaced with the child's name." maxLength={80} />
          <StarStepper label="Stars per learning session" value={form.rewards.starsPerLearningSession} onChange={(n) => set('rewards', { ...form.rewards, starsPerLearningSession: n })} />
          <StarStepper label="Bonus for a perfect session" value={form.rewards.starsPerPerfectSession} onChange={(n) => set('rewards', { ...form.rewards, starsPerPerfectSession: n })} />
          <StarStepper label="Stars per routine step" value={form.rewards.starsPerRoutineStep} onChange={(n) => set('rewards', { ...form.rewards, starsPerRoutineStep: n })} />
          <StarStepper label="Stars per activity" value={form.rewards.starsPerActivity} onChange={(n) => set('rewards', { ...form.rewards, starsPerActivity: n })} />
          <StarStepper label="Stars per assignment" value={form.rewards.starsPerAssignment} onChange={(n) => set('rewards', { ...form.rewards, starsPerAssignment: n })} />
          <BigButton label="Manage rewards list" icon="gift-outline" variant="secondary" minHeight={60} onPress={() => navigation.navigate('ManageRewards')} />

          <BigButton label="Save" icon="content-save" minHeight={72} onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function StarStepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.stepper}>
      <Text style={[styles.stepperLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{label}</Text>
      <Pressable onPress={() => onChange(Math.max(0, value - 1))} accessibilityRole="button" accessibilityLabel={`Fewer stars for ${label}`} style={[styles.stepBtn, { borderColor: theme.colors.borderSoft }]}>
        <Text style={styles.stepBtnText} allowFontScaling={false}>−</Text>
      </Pressable>
      <Text style={[styles.stepValue, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{value} ⭐</Text>
      <Pressable onPress={() => onChange(Math.min(10, value + 1))} accessibilityRole="button" accessibilityLabel={`More stars for ${label}`} style={[styles.stepBtn, { borderColor: theme.colors.borderSoft }]}>
        <Text style={styles.stepBtnText} allowFontScaling={false}>+</Text>
      </Pressable>
    </View>
  );
}

function stripMeta(p: { id: number; isActive: boolean; createdAt: string } & ChildProfileInput): ChildProfileInput {
  const { id: _i, isActive: _a, createdAt: _c, ...rest } = p;
  return rest;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  preview: { alignItems: 'center', gap: SPACING.sm },
  previewName: { fontFamily: Fonts.black },
  row: { flexDirection: 'row', gap: SPACING.sm },
  half: { flex: 1 },
  label: { fontFamily: Fonts.bold },
  hint: { fontFamily: Fonts.semibold, fontSize: 15 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  avatarCell: { width: AVATAR_CELL, height: AVATAR_CELL, borderRadius: AVATAR_CELL / 2, alignItems: 'center', justifyContent: 'center' },
  swatch: { flexGrow: 1, flexBasis: '30%', minHeight: MIN_PARENT_TARGET, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6 },
  swatchDot: { width: 22, height: 22, borderRadius: 11 },
  swatchText: { fontFamily: Fonts.bold, fontSize: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: MIN_PARENT_TARGET },
  stepperLabel: { flex: 1, fontFamily: Fonts.bold, fontSize: 16 },
  stepBtn: { width: MIN_PARENT_TARGET - 8, height: MIN_PARENT_TARGET - 8, borderRadius: Radius.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 26, fontFamily: Fonts.black },
  stepValue: { fontFamily: Fonts.extrabold, fontSize: 18, minWidth: 54, textAlign: 'center' },
});
