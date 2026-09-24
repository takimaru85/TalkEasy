import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChoiceRow, ScreenContainer, ScreenHeader, SectionTitle } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useSizes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { soundPracticeAudio } from '@/services/soundPracticeAudio';
import { SOUND_EXERCISES } from '@/soundpractice/content';
import { PHRASES } from '@/speechpractice/content';
import { SPOKEN_OVERRIDES, syllablePronunciation, type SpokenForm } from '@/speechpractice/pronunciationDictionary';
import {
  PRONUNCIATION_SETS,
  SYLLABLE_CONSONANTS,
  VOWEL_MODEL,
  modelKey,
  overrideKey,
  parseOverrides,
  syllablesFor,
  type PronunciationSet,
} from '@/speechpractice/pronunciation';
import { VOCAB_CATEGORIES, vocabInCategory } from '@/speechpractice/vocabulary';
import { Fonts } from '@/theme';

type Kind = 'syllable' | 'sound' | 'word' | 'phrase';

interface Row {
  key: string;
  display: string;
  ipa?: string;
  guide: string;
  /** The dictionary default first, then its tested alternatives. */
  forms: SpokenForm[];
}

const KINDS: { value: Kind; label: string }[] = [
  { value: 'syllable', label: 'Syllables' },
  { value: 'sound', label: 'Sounds' },
  { value: 'word', label: 'Words' },
  { value: 'phrase', label: 'Phrases' },
];

const same = (a: SpokenForm, b: SpokenForm) => a.text === b.text && a.locale === b.locale;

/**
 * Parent Mode → Pronunciation test.
 *
 * For every practice target: what the child SEES (display), what the voice engine is GIVEN (the
 * pronunciation-safe spoken form and its locale), the intended pronunciation (IPA + guide), and a
 * Play button — so each model can be heard on this device before a child relies on it.
 * "Try alternative" cycles the dictionary's tested alternatives; "Use this" keeps one on this
 * device (voice engines differ between phones). Defaults live in pronunciationDictionary.ts.
 * Grown-ups only — it sits behind the Parent Mode PIN.
 */
export function PronunciationTestScreen({ navigation }: ParentScreenProps<'PronunciationTest'>) {
  const sizes = useSizes();
  const { settings, updateSetting } = useSettings();
  const set = settings.speechPronunciationSet as PronunciationSet;
  const [kind, setKind] = useState<Kind>('syllable');
  const [consonant, setConsonant] = useState<string>(SYLLABLE_CONSONANTS[0]);
  const [vocabCategory, setVocabCategory] = useState(VOCAB_CATEGORIES[0].key);
  /** Which form each row is currently showing (0 = the one in use). */
  const [showing, setShowing] = useState<Record<string, number>>({});
  const overrides = useMemo(() => parseOverrides(settings.speechPronunciationOverrides), [settings.speechPronunciationOverrides]);

  const rows: Row[] = useMemo(() => {
    switch (kind) {
      case 'syllable':
        return syllablesFor(consonant).map((s) => {
          const key = modelKey('syllable', s.id);
          const entry = syllablePronunciation(set, s.id);
          return {
            key,
            display: s.display,
            ipa: entry?.ipa ?? s.pronunciation[set].ipa,
            guide: entry?.guide ?? `No dictionary entry — ${s.display} is not spoken.`,
            forms: entry ? [entry.spoken, ...entry.alternatives] : [],
          };
        });
      case 'sound':
        return SOUND_EXERCISES.map((s) => ({
          key: modelKey('sound', s.id),
          display: s.sound,
          guide: `The sound on its own, as in "${s.exampleWord}" — never the letter name.`,
          forms: [{ text: `${s.cue}. ${s.cue}.`, locale: 'en-US' }],
        }));
      case 'word':
        return vocabInCategory(vocabCategory).map((v) => {
          const key = modelKey('word', v.id);
          return { key, display: v.text, guide: 'A real word: the voice reads it as written.', forms: [SPOKEN_OVERRIDES[key] ?? { text: v.text, locale: 'en-US' }] };
        });
      case 'phrase':
        return PHRASES.map((p) => {
          const key = modelKey('phrase', p.id);
          return { key, display: p.text, guide: 'A real phrase: the voice reads it as written.', forms: [SPOKEN_OVERRIDES[key] ?? { text: p.text, locale: 'en-US' }] };
        });
    }
  }, [kind, consonant, vocabCategory, set]);

  /** The form the child hears now: this device's choice, else the dictionary default. */
  const inUse = (row: Row): SpokenForm | undefined => overrides[overrideKey(set, row.key)] ?? row.forms[0];
  const current = (row: Row): SpokenForm | undefined => {
    const i = showing[row.key];
    return i === undefined ? inUse(row) : row.forms[i % row.forms.length];
  };

  const play = (form: SpokenForm | undefined) => form && soundPracticeAudio.trySpoken(form, settings);

  const tryAlternative = (row: Row) => {
    const now = current(row);
    const at = now ? row.forms.findIndex((f) => same(f, now)) : -1;
    const next = (at + 1) % row.forms.length;
    setShowing((m) => ({ ...m, [row.key]: next }));
    play(row.forms[next]);
  };

  const useThis = (row: Row) => {
    const form = current(row);
    if (!form) return;
    const next = { ...overrides };
    // Choosing the default again just removes this device's override.
    if (same(form, row.forms[0])) delete next[overrideKey(set, row.key)];
    else next[overrideKey(set, row.key)] = form;
    updateSetting('speechPronunciationOverrides', JSON.stringify(next));
    setShowing((m) => {
      const copy = { ...m };
      delete copy[row.key];
      return copy;
    });
  };

  // Hear a whole consonant row in order: BA … BE … BI … BO … BU.
  const playAll = () => {
    rows.forEach((row, i) => setTimeout(() => play(inUse(row)), i * 1600));
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Pronunciation test" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.notice}>
          <Text style={[styles.noticeText, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Your child sees the target ("BO"); the device voice is given a pronunciation-safe spelling ("beau") so it says
            the intended sound. Play each one on this phone. If one sounds wrong, tap "Try alternative" until it matches the
            guide, then "Use this".
          </Text>
          <Text style={styles.noticeSmall} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            A device voice is an approximation — listen and say it together with your child. The accent follows the app
            language (US, UK, Australian or New Zealand English). Your choices apply to this phone only. Grown-ups only;
            children never see this screen.
          </Text>
        </View>

        {PRONUNCIATION_SETS.length > 1 ? (
          <ChoiceRow
            label="Pronunciation set"
            value={set}
            onChange={(v) => updateSetting('speechPronunciationSet', v as PronunciationSet)}
            choices={PRONUNCIATION_SETS.map((s) => ({ value: s.key, label: s.name }))}
          />
        ) : null}
        <Text style={styles.help} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {PRONUNCIATION_SETS.find((s) => s.key === set)?.name} vowels:{' '}
          {(['a', 'e', 'i', 'o', 'u'] as const).map((v) => `${v.toUpperCase()} = ${VOWEL_MODEL[set][v].like}`).join(' · ')}.
        </Text>

        <ChoiceRow label="Show" value={kind} onChange={(v) => setKind(v as Kind)} choices={KINDS} />
        {kind === 'syllable' ? (
          <ChoiceRow label="Consonant" value={consonant} onChange={setConsonant} choices={SYLLABLE_CONSONANTS.map((c) => ({ value: c, label: c.toUpperCase() }))} />
        ) : null}
        {kind === 'word' ? (
          <ChoiceRow label="Group" value={vocabCategory} onChange={setVocabCategory} choices={VOCAB_CATEGORIES.map((c) => ({ value: c.key, label: c.name }))} />
        ) : null}

        <SectionTitle title={KINDS.find((k) => k.value === kind)!.label} emoji="🔊" />
        {kind === 'syllable' ? <BigButton label="Play all five in order" icon="play-circle-outline" variant="secondary" minHeight={60} onPress={playAll} /> : null}

        {rows.map((row) => {
          const form = current(row);
          const used = inUse(row);
          const changed = !!overrides[overrideKey(set, row.key)];
          const previewing = !!form && !!used && !same(form, used);
          return (
            <View key={`${set}-${row.key}`} style={[styles.row, changed && styles.rowChanged]}>
              <Text style={[styles.display, { fontSize: sizes.heading }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{row.display}</Text>
              <Field label="Spoken" value={form ? `"${form.text}"  ·  ${form.locale}` : '— not spoken'} strong />
              {row.ipa ? <Field label="IPA" value={row.ipa} /> : null}
              <Field label="Guide" value={row.guide} />
              <Text style={[styles.state, changed && styles.stateChanged]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {previewing ? `Trying ${row.forms.findIndex((f) => form && same(f, form)) + 1} of ${row.forms.length} — not saved yet` : changed ? 'Changed on this phone' : 'Dictionary default'}
              </Text>
              {/* Full-width buttons stacked: half-width buttons were too narrow for "Try alternative"
                  on a phone, and a wrapping row spilled over the next card. */}
              <View style={styles.buttonStack}>
                <BigButton label="Play" icon="volume-high" variant="secondary" compact minHeight={56} disabled={!form} onPress={() => play(form)} />
                {row.forms.length > 1 ? (
                  <BigButton label="Try alternative" icon="refresh" variant="outline" compact minHeight={56} onPress={() => tryAlternative(row)} />
                ) : null}
                {previewing ? <BigButton label="Use this" icon="check" variant="success" compact minHeight={56} onPress={() => useThis(row)} /> : null}
                {changed && !previewing ? (
                  <BigButton
                    label="Reset to default"
                    icon="restore"
                    variant="outline"
                    compact
                    minHeight={56}
                    onPress={() => {
                      const next = { ...overrides };
                      delete next[overrideKey(set, row.key)];
                      updateSetting('speechPronunciationOverrides', JSON.stringify(next));
                    }}
                  />
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Text style={styles.field} maxFontSizeMultiplier={MAX_FONT_SCALE}>
      <Text style={styles.fieldLabel}>{label}: </Text>
      <Text style={strong ? styles.fieldStrong : styles.fieldValue}>{value}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  notice: { backgroundColor: Colors.surfaceAlt, borderRadius: RADIUS.button, padding: SPACING.lg, gap: SPACING.sm, borderWidth: 1, borderColor: Colors.border },
  noticeText: { fontFamily: Fonts.bold, color: Colors.text, lineHeight: 24 },
  noticeSmall: { fontFamily: Fonts.semibold, color: Colors.textMuted, fontSize: 14, lineHeight: 20 },
  help: { color: Colors.textMuted, fontSize: 15, lineHeight: 21 },
  row: { backgroundColor: Colors.surface, borderRadius: RADIUS.button, borderWidth: 1.5, borderColor: Colors.borderSoft, padding: SPACING.md, gap: SPACING.xs + 2 },
  rowChanged: { borderColor: Colors.primary },
  display: { fontFamily: Fonts.black, color: Colors.text },
  field: { fontSize: 15, lineHeight: 21 },
  fieldLabel: { fontFamily: Fonts.bold, color: Colors.textMuted },
  fieldValue: { fontFamily: Fonts.semibold, color: Colors.text },
  fieldStrong: { fontFamily: Fonts.extrabold, color: Colors.text },
  state: { fontFamily: Fonts.bold, color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  stateChanged: { color: Colors.primary },
  buttonStack: { gap: SPACING.sm, marginTop: SPACING.sm },
});
