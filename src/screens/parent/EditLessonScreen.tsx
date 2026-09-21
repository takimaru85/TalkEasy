import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChoiceRow, DateField, FormField, ListRow, ScreenContainer, ScreenHeader, SectionTitle } from '@/components/common';
import { ACTIVITY_TYPE_META, ALL_ANSWER_METHODS, ANSWER_METHOD_META, type ActivityType, type AnswerMethod, type Choice, type LessonActivity, type LessonActivityInput, type MatchPair } from '@/adaptive/types';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import { lessonsRepo } from '@/database';
import { useLesson, useLessonActivities, useSizes, useSubjects } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';
import { alertMessage, confirm } from '@/utils/confirm';

const EMOJI_RE = /^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*)\s*/u;

/** "☀️ Sunlight *" → { emoji:'☀️', label:'Sunlight', correct:true } — one choice per line. */
function parseChoices(text: string): Choice[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
    const correct = /\*\s*$/.test(line);
    let rest = line.replace(/\*\s*$/, '').trim();
    const m = EMOJI_RE.exec(rest);
    const emoji = m ? m[1] : undefined;
    if (m) rest = rest.slice(m[0].length).trim();
    return { label: rest, emoji, correct };
  });
}
function choicesToText(choices: Choice[]): string {
  return choices.map((c) => `${c.emoji ? `${c.emoji} ` : ''}${c.label}${c.correct ? ' *' : ''}`).join('\n');
}
/** "🐶 Dog = Woof" per line. */
function parsePairs(text: string): MatchPair[] {
  return text.split('\n').map((l) => l.trim()).filter((l) => l.includes('=')).map((line) => {
    const [l, r] = line.split('=').map((s) => s.trim());
    const lm = EMOJI_RE.exec(l);
    const rm = EMOJI_RE.exec(r);
    return { left: lm ? l.slice(lm[0].length).trim() : l, leftEmoji: lm?.[1], right: rm ? r.slice(rm[0].length).trim() : r, rightEmoji: rm?.[1] };
  });
}
function pairsToText(pairs: MatchPair[]): string {
  return pairs.map((p) => `${p.leftEmoji ? `${p.leftEmoji} ` : ''}${p.left} = ${p.rightEmoji ? `${p.rightEmoji} ` : ''}${p.right}`).join('\n');
}

type ActivityForm = { type: ActivityType; question: string; image: string; choices: string; pairs: string; answers: string; hint: string; methods: AnswerMethod[] };
const emptyActivity = (type: ActivityType = 'mcq'): ActivityForm => ({ type, question: '', image: '', choices: '', pairs: '', answers: '', hint: '', methods: ACTIVITY_TYPE_META[type].defaultMethods });

/**
 * Create / edit a lesson (the objective) and its questions, each with the answer methods the
 * parent/teacher allows. This is the manual "lesson → accessible activity" step; an offline
 * generator can pre-fill it later without changing this screen.
 */
export function EditLessonScreen({ navigation, route }: ParentScreenProps<'EditLesson'>) {
  const { lessonId } = route.params ?? {};
  const isNew = lessonId === undefined;
  const sizes = useSizes();
  const theme = useTheme();
  const { data: existing } = useLesson(lessonId);
  const { data: activities } = useLessonActivities(lessonId);
  const { data: subjects } = useSubjects(true);

  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('Grade 2');
  const [content, setContent] = useState('');
  const [vocab, setVocab] = useState('');
  const [objectives, setObjectives] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [hydrated, setHydrated] = useState(isNew);

  const [editing, setEditing] = useState<LessonActivity | 'new' | null>(null);
  const [form, setForm] = useState<ActivityForm>(emptyActivity());

  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setSubjectId(existing.subjectId);
      setTitle(existing.title);
      setGrade(existing.gradeLevel);
      setContent(existing.content);
      setVocab(existing.vocabulary.join('\n'));
      setObjectives(existing.objectives);
      setDate(existing.assignedDate);
      setActive(existing.isActive);
      setHydrated(true);
    }
  }, [isNew, existing, hydrated]);

  const setF = <K extends keyof ActivityForm>(k: K, v: ActivityForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const saveLesson = async () => {
    if (!title.trim()) return alertMessage('Please give the lesson a title.');
    const input = { subjectId, title, gradeLevel: grade, content, vocabulary: vocab.split('\n').map((v) => v.trim()).filter(Boolean), objectives, assignedDate: date, isActive: active };
    if (isNew) {
      const id = await lessonsRepo.create(input);
      navigation.replace('EditLesson', { lessonId: id });
    } else {
      await lessonsRepo.update(lessonId, input);
      navigation.goBack();
    }
  };

  const startNewActivity = () => { setForm(emptyActivity()); setEditing('new'); };
  const startEdit = (a: LessonActivity) => {
    setForm({ type: a.type, question: a.question, image: a.image ?? '', choices: choicesToText(a.choices), pairs: pairsToText(a.pairs), answers: a.answers.join(', '), hint: a.hint, methods: a.allowedMethods });
    setEditing(a);
  };

  const saveActivity = async () => {
    if (!lessonId) return;
    if (!form.question.trim()) return alertMessage('Please type the question.');
    const choices = parseChoices(form.choices);
    const pairs = parsePairs(form.pairs);
    const answers = form.answers.split(',').map((s) => s.trim()).filter(Boolean);
    if ((form.type === 'mcq' || form.type === 'picture') && !choices.some((c) => c.correct)) return alertMessage('Mark at least one correct choice with a * at the end of its line.');
    if (form.type === 'matching' && pairs.length < 2) return alertMessage('Add at least two pairs, one per line, like "🐶 Dog = Woof".');
    if ((form.type === 'typing' || form.type === 'speaking') && answers.length === 0 && !choices.some((c) => c.correct)) return alertMessage('Add at least one accepted answer.');
    if (form.methods.length === 0) return alertMessage('Allow at least one answer method.');
    const input: LessonActivityInput = { type: form.type, question: form.question, image: form.image.trim() || null, choices, pairs, answers, hint: form.hint, difficulty: 'easy', allowedMethods: form.methods };
    if (editing === 'new') await lessonsRepo.addActivity(lessonId, input);
    else if (editing) await lessonsRepo.updateActivity(editing.id, input);
    setEditing(null);
  };

  const toggleMethod = (m: AnswerMethod) => setF('methods', form.methods.includes(m) ? form.methods.filter((x) => x !== m) : [...form.methods, m]);

  return (
    <ScreenContainer>
      <ScreenHeader title={isNew ? 'New lesson' : title || 'Edit lesson'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <ChoiceRow
            label="Subject"
            value={subjectId === null ? 'none' : String(subjectId)}
            onChange={(v) => setSubjectId(v === 'none' ? null : Number(v))}
            choices={[...subjects.map((s) => ({ value: String(s.id), label: `${s.icon} ${s.name}` })), { value: 'none', label: 'Other' }]}
          />
          <FormField label="Lesson title" value={title} onChangeText={setTitle} placeholder='e.g. "What plants need"' maxLength={80} />
          <FormField label="Grade level" value={grade} onChangeText={setGrade} placeholder="Grade 2" maxLength={30} />
          <FormField label="Lesson text (paste the school lesson, then simplify)" value={content} onChangeText={setContent} placeholder="Plants need sunlight, water and air to make food." multiline maxLength={2000} />
          <FormField label="Visual vocabulary (one per line, emoji first)" value={vocab} onChangeText={setVocab} placeholder={'☀️ Sunlight\n💧 Water\n🌬️ Air'} multiline maxLength={600} />
          <FormField label="Learning objective" value={objectives} onChangeText={setObjectives} placeholder="Name what a plant needs to grow." maxLength={200} />
          <DateField label="Show under Today's schoolwork on" value={date} onChange={setDate} />
          <ChoiceRow label="Visible to the child" value={active ? 'yes' : 'no'} onChange={(v) => setActive(v === 'yes')} choices={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'Hidden' }]} />
          <BigButton label={isNew ? 'Save and add questions' : 'Save lesson'} icon="content-save" minHeight={72} onPress={saveLesson} />

          {!isNew ? (
            <>
              <SectionTitle title="Questions" emoji="❓" trailing={String(activities.length)} />
              {activities.map((a, index) => (
                <ListRow
                  key={a.id}
                  title={`${ACTIVITY_TYPE_META[a.type].emoji} ${a.question}`}
                  subtitle={`${ACTIVITY_TYPE_META[a.type].label} · Methods: ${a.allowedMethods.map((m) => ANSWER_METHOD_META[m].emoji).join(' ')}`}
                  onPress={() => startEdit(a)}
                  actions={[
                    { icon: 'chevron-up', label: 'Move up', disabled: index === 0, onPress: () => lessonsRepo.moveActivity(a.id, -1) },
                    { icon: 'chevron-down', label: 'Move down', disabled: index === activities.length - 1, onPress: () => lessonsRepo.moveActivity(a.id, 1) },
                    { icon: 'pencil-outline', label: 'Edit', onPress: () => startEdit(a) },
                    { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: async () => { if (await confirm('Delete question?', a.question)) lessonsRepo.removeActivity(a.id); } },
                  ]}
                />
              ))}

              {editing ? (
                <View style={[styles.panel, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.primary }]}>
                  <Text style={[styles.panelTitle, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{editing === 'new' ? 'New question' : 'Edit question'}</Text>
                  <ChoiceRow<ActivityType>
                    label="Type"
                    value={form.type}
                    onChange={(t) => setForm((f) => ({ ...f, type: t, methods: editing === 'new' ? ACTIVITY_TYPE_META[t].defaultMethods : f.methods }))}
                    choices={(Object.keys(ACTIVITY_TYPE_META) as ActivityType[]).map((t) => ({ value: t, label: `${ACTIVITY_TYPE_META[t].emoji} ${ACTIVITY_TYPE_META[t].label}` }))}
                  />
                  <FormField label="Question" value={form.question} onChangeText={(v) => setF('question', v)} placeholder="What does a plant need to grow?" maxLength={200} />
                  <FormField label="Picture (emoji, optional)" value={form.image} onChangeText={(v) => setF('image', v)} placeholder="🌱" maxLength={12} />
                  {form.type === 'matching' ? (
                    <FormField label='Pairs — one per line: "🐶 Dog = Woof"' value={form.pairs} onChangeText={(v) => setF('pairs', v)} placeholder={'🐶 Dog = Woof\n🐱 Cat = Meow'} multiline maxLength={800} />
                  ) : (
                    <FormField label="Choices — one per line, * marks a correct one" value={form.choices} onChangeText={(v) => setF('choices', v)} placeholder={'☀️ Sunlight *\n👟 Shoes\n📺 Television'} multiline maxLength={800} hint="Emoji first is optional. Several * lines = choose all that apply." />
                  )}
                  {form.type !== 'matching' ? (
                    <FormField label="Accepted typed / spoken answers (comma-separated)" value={form.answers} onChangeText={(v) => setF('answers', v)} placeholder="sunlight, sun" hint="Correct choices count automatically. Number words match digits (ten = 10)." />
                  ) : null}
                  <FormField label="Hint" value={form.hint} onChangeText={(v) => setF('hint', v)} placeholder="It comes from the sky in the daytime." maxLength={150} />

                  <Text style={[styles.label, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Allowed answer methods</Text>
                  <View style={styles.methods}>
                    {ALL_ANSWER_METHODS.filter((m) => (m === 'match' ? form.type === 'matching' : form.type !== 'matching' || m === 'assisted')).map((m) => {
                      const on = form.methods.includes(m);
                      return (
                        <Pressable key={m} onPress={() => toggleMethod(m)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={ANSWER_METHOD_META[m].label} style={[styles.methodPill, { backgroundColor: on ? theme.colors.primary : theme.colors.surface, borderColor: on ? theme.colors.primaryDark : theme.colors.borderSoft }]}>
                          <Text style={[styles.methodText, { color: on ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{on ? '☑' : '☐'} {ANSWER_METHOD_META[m].emoji} {ANSWER_METHOD_META[m].short}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <BigButton label="Save question" icon="content-save" minHeight={64} onPress={saveActivity} />
                  <BigButton label="Cancel" variant="outline" minHeight={56} onPress={() => setEditing(null)} />
                </View>
              ) : (
                <BigButton label="Add a question" icon="plus-circle" variant="secondary" minHeight={72} onPress={startNewActivity} />
              )}
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
  panel: { gap: SPACING.md, padding: SPACING.md, borderWidth: 2, borderRadius: Radius.md },
  panelTitle: { fontFamily: Fonts.extrabold },
  label: { fontFamily: Fonts.bold },
  methods: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  methodPill: { minHeight: MIN_PARENT_TARGET - 8, paddingHorizontal: SPACING.md, borderRadius: Radius.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  methodText: { fontFamily: Fonts.bold, fontSize: 15 },
});
