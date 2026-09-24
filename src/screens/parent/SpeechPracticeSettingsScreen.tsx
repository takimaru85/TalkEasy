import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChoiceRow, ListRow, ScreenContainer, ScreenHeader, SectionTitle, StatTile } from '@/components/common';
import { Colors, DEFAULT_TILE_COLOR } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { buttonsRepo } from '@/database';
import {
  useAllButtons,
  useCategories,
  useMyWords,
  useSizes,
  useSpeechPracticeByActivity,
  useSpeechPracticeHistory,
  useTodaySpeechPractice,
} from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import {
  ACTIVITIES,
  ACTIVITY_NAMES,
  LEVELS,
  isActivityId,
  parseHiddenActivities,
  serializeHiddenActivities,
} from '@/speechpractice/activities';
import { VOCAB_CATEGORIES, vocabInCategory } from '@/speechpractice/vocabulary';
import type { ActivityId } from '@/speechpractice/types';
import { alertMessage, confirm } from '@/utils/confirm';
import { formatDate } from '@/utils/date';
import { Fonts } from '@/theme';

const LEVEL_NAMES = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } as const;

/** Which Talk category a practised vocabulary word lands in when added to Talk. */
const TALK_CATEGORY: Record<string, string> = {
  food: 'food',
  drinks: 'drinks',
  people: 'people',
  feelings: 'feelings',
  school: 'school',
  home: 'home',
};

function minutes(ms: number): number {
  return ms > 0 ? Math.max(1, Math.round(ms / 60000)) : 0;
}

/**
 * Parent Mode → Speech Practice.
 *
 * Practice Activity (today and the last 7 days — counts and minutes, never a score), which
 * activities the child sees, My Words, and "Practice → Talk": adding a practised word to the
 * child's communication board. My Words are Talk cards with a practice flag, so a word and its
 * photo are stored once and shared by both.
 */
export function SpeechPracticeSettingsScreen({ navigation }: ParentScreenProps<'SpeechPracticeSettings'>) {
  const sizes = useSizes();
  const { settings, updateSetting } = useSettings();
  const { data: today } = useTodaySpeechPractice();
  const { data: byActivity } = useSpeechPracticeByActivity();
  const { data: history } = useSpeechPracticeHistory(7);
  const { data: myWords } = useMyWords();
  const { data: allButtons } = useAllButtons();
  const { data: categories } = useCategories();
  const [vocabCategory, setVocabCategory] = useState(VOCAB_CATEGORIES[0].key);

  const hidden = useMemo(() => parseHiddenActivities(settings.speechPracticeHidden), [settings.speechPracticeHidden]);
  const talkLabels = useMemo(() => new Set(allButtons.map((b) => b.label.trim().toLowerCase())), [allButtons]);

  const toggle = (id: ActivityId) => {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updateSetting('speechPracticeHidden', serializeHiddenActivities(next));
  };

  const addToTalk = async (label: string, picture: string) => {
    const key = TALK_CATEGORY[vocabCategory] ?? 'custom';
    const category = categories.find((c) => c.key === key) ?? categories.find((c) => c.key === 'custom');
    if (!category) return alertMessage('No communication category to add this to.');
    await buttonsRepo.create({ categoryId: category.id, label, phrase: label, icon: picture, imageUri: null, color: DEFAULT_TILE_COLOR });
    alertMessage(`"${label}" is now a Talk card in ${category.name}.`);
  };

  const removeWord = async (id: number, label: string) => {
    if (await confirm('Stop practising this word?', `"${label}" stays on the Talk board; it just leaves Speech Practice.`)) {
      await buttonsRepo.setPractice(id, false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Speech Practice" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.notice} accessibilityRole="text">
          <Text style={[styles.noticeText, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            TalkEasy provides general communication and speech-practice activities. It is not a substitute for assessment or
            individualized therapy from a licensed speech-language pathologist.
          </Text>
          <Text style={styles.noticeSmall} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Nothing here is a score. TalkEasy records that practice happened — never how it sounded — and your child's recordings
            are deleted right after they hear them.
          </Text>
        </View>

        {/* ---- Model pronunciations ----------------------------------------------------- */}
        <SectionTitle title="Model pronunciations" emoji="🎤" />
        <Text style={styles.help} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Syllables are spoken from a pronunciation dictionary, so BO sounds like the o in "go" rather than whatever the
          device voice guesses. Test and adjust each one on this phone.
        </Text>
        <BigButton label="Pronunciation test" icon="volume-high" variant="secondary" minHeight={64} onPress={() => navigation.navigate('PronunciationTest')} />

        {/* ---- Practice Activity ---------------------------------------------------------- */}
        <SectionTitle title="Today's practice" emoji="📋" />
        <View style={styles.stats}>
          <StatTile label="Activities finished" value={today.activitiesCompleted} color="#DDF5E3" />
          <StatTile label="Words practiced" value={today.wordsPracticed} color="#DCEBFF" />
        </View>
        <View style={styles.stats}>
          <StatTile label="Attempts" value={today.attempts} color="#FFF1C2" />
          <StatTile label="Minutes" value={minutes(today.practiceMs)} color="#E8DFFF" />
        </View>
        {byActivity.length === 0 ? (
          <Text style={styles.empty} maxFontSizeMultiplier={MAX_FONT_SCALE}>No practice yet today.</Text>
        ) : (
          <View style={styles.table}>
            {byActivity.map((r) => (
              <View key={r.activityId} style={styles.tableRow}>
                <Text style={[styles.tableMain, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {isActivityId(r.activityId) ? ACTIVITY_NAMES[r.activityId] : r.activityId}
                </Text>
                <Text style={styles.tableSub} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {r.exercises} done · {r.attempts} tries · {minutes(r.practiceMs)} min
                </Text>
              </View>
            ))}
          </View>
        )}

        <SectionTitle title="Practice history" emoji="🗓️" trailing="last 7 days" />
        <View style={styles.table}>
          {history.map((d) => (
            <View key={d.date} style={styles.tableRow}>
              <Text style={[styles.tableMain, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {formatDate(d.date)}
              </Text>
              <Text style={styles.tableSub} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {d.exercises + d.attempts + d.practiceMs === 0 ? '—' : `${d.exercises} done · ${d.attempts} tries · ${minutes(d.practiceMs)} min`}
              </Text>
            </View>
          ))}
        </View>

        {/* ---- Which activities ----------------------------------------------------------- */}
        <SectionTitle title="Activities to practise" emoji="🎯" />
        <Text style={styles.help} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Levels are only a guide — nothing is locked. Hide anything that is not right for your child yet.
        </Text>
        {LEVELS.map(({ level }) => (
          <View key={level} style={styles.group}>
            <Text style={[styles.groupTitle, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {LEVEL_NAMES[level]}
            </Text>
            {ACTIVITIES.filter((a) => a.level === level).map((a) => {
              const isHidden = hidden.has(a.id);
              return (
                <ListRow
                  key={a.id}
                  title={ACTIVITY_NAMES[a.id]}
                  icon={a.icon}
                  iconBackground={a.tint}
                  subtitle={isHidden ? 'Hidden from your child' : 'Shown'}
                  dimmed={isHidden}
                  actions={[{ icon: isHidden ? 'eye' : 'eye-off', label: isHidden ? 'Show' : 'Hide', onPress: () => toggle(a.id) }]}
                />
              );
            })}
          </View>
        ))}
        {hidden.size > 0 ? (
          <BigButton label="Show every activity" icon="eye" variant="outline" minHeight={60} onPress={() => updateSetting('speechPracticeHidden', '')} />
        ) : null}

        {/* ---- My Words ------------------------------------------------------------------- */}
        <SectionTitle title="My Words" emoji="⭐" trailing={`${myWords.length}`} />
        <Text style={styles.help} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Your own words — "Grandma" with her photo, a pet, a favourite snack. Each is a Talk card too, so practising a word and
          saying it use the same card. They appear in Words, Vocabulary, Picture Naming, Phrases and Sentence Building.
        </Text>
        {myWords.map((w) => (
          <ListRow
            key={w.id}
            title={w.label}
            subtitle={w.phrase !== w.label ? `Says: "${w.phrase}"` : w.imageUri ? 'With photo' : undefined}
            icon={w.icon}
            actions={[
              { icon: 'pencil', label: 'Edit', onPress: () => navigation.navigate('EditButton', { buttonId: w.id }) },
              { icon: 'close', label: 'Stop practising', onPress: () => removeWord(w.id, w.label) },
            ]}
          />
        ))}
        <BigButton label="Add a word" icon="plus" minHeight={64} onPress={() => navigation.navigate('EditButton', { practice: true })} />
        <Text style={styles.help} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Already have the card? Open it in Communication cards and choose "Practise this word".
        </Text>

        {/* ---- Practice → Talk ------------------------------------------------------------ */}
        <SectionTitle title="Practice → Talk" emoji="💬" />
        <Text style={styles.help} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          When a practice word is ready to use, add it to your child's Talk board. Words already on the board show there.
        </Text>
        <ChoiceRow label="Group" value={vocabCategory} onChange={setVocabCategory} choices={VOCAB_CATEGORIES.map((c) => ({ value: c.key, label: `${c.picture} ${c.name}` }))} />
        {vocabInCategory(vocabCategory).map((v) => {
          const onBoard = talkLabels.has(v.text.toLowerCase());
          return (
            <ListRow
              key={v.id}
              title={v.text}
              subtitle={onBoard ? 'On the Talk board' : undefined}
              icon={v.picture}
              dimmed={onBoard}
              actions={onBoard ? [] : [{ icon: 'plus', label: 'Add to Talk', onPress: () => addToTalk(v.text, v.picture) }]}
            />
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  notice: { backgroundColor: Colors.surfaceAlt, borderRadius: RADIUS.button, padding: SPACING.lg, gap: SPACING.sm, borderWidth: 1, borderColor: Colors.border },
  noticeText: { fontFamily: Fonts.bold, color: Colors.text, lineHeight: 24 },
  noticeSmall: { fontFamily: Fonts.semibold, color: Colors.textMuted, fontSize: 14, lineHeight: 20 },
  stats: { flexDirection: 'row', gap: SPACING.sm },
  empty: { color: Colors.textMuted, fontSize: 16 },
  table: { borderWidth: 2, borderColor: Colors.border, borderRadius: RADIUS.button, overflow: 'hidden' },
  tableRow: { minHeight: 56, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#DADADA', justifyContent: 'center' },
  tableMain: { fontFamily: Fonts.bold, color: Colors.text },
  tableSub: { fontFamily: Fonts.semibold, color: Colors.textMuted, fontSize: 14 },
  help: { color: Colors.textMuted, fontSize: 15, lineHeight: 21 },
  group: { gap: SPACING.sm },
  groupTitle: { fontFamily: Fonts.extrabold, color: Colors.text },
});
