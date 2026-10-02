import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChoiceRow, IconTile, ProgressBar, ScreenContainer, ScreenHeader, SectionTitle } from '@/components/common';
import { Colors, tileColor } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useSizes, useWeeklySummary } from '@/hooks';
import { useI18n } from '@/i18n';
import { getActivity } from '@/learning';
import type { ParentScreenProps } from '@/navigation/types';
import { getSoundExercise } from '@/soundpractice/content';
import { ACTIVITIES } from '@/speechpractice/activities';
import { Fonts } from '@/theme';
import { formatShortDate } from '@/utils/date';

interface Metric {
  key: string;
  label: string;
  value: string;
  detail: string;
  icon: string;
  tint: string;
  /** 0..1 when the metric has a natural "out of". */
  progress?: number;
}

/**
 * Weekly Progress: what was practised this week (or last week), counted from the app's own logs,
 * and a few plain-language highlights. An activity summary for a family — never an assessment:
 * it counts what was DONE, not how well.
 */
export function WeeklyProgressScreen({ navigation }: ParentScreenProps<'WeeklyProgress'>) {
  const sizes = useSizes();
  const { displayName } = useProfile();
  const { t } = useI18n();
  const [offset, setOffset] = useState<0 | 1>(0);
  const { data: w, range } = useWeeklySummary(offset);

  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const metrics: Metric[] = [
    { key: 'speech', label: 'Speech Practice', value: plural(w.speechSessions, 'session'), detail: plural(w.soundsPracticed, 'sound') + ' practiced', icon: 'microphone-outline', tint: tileColor('coral') },
    { key: 'words', label: 'Words practiced', value: plural(w.wordsPracticed, 'word'), detail: w.newWords ? `${w.newWords} new this week` : 'In Speech Practice', icon: 'alphabetical-variant', tint: tileColor('pink') },
    { key: 'lessons', label: 'Lessons', value: `${w.lessonsCompleted} completed`, detail: 'Every question answered', icon: 'school-outline', tint: tileColor('purple') },
    {
      key: 'assignments',
      label: 'Assignments',
      value: w.assignmentsTotal ? `${w.assignmentsDone} / ${w.assignmentsTotal} completed` : `${w.assignmentsDone} completed`,
      detail: 'Due or finished this week',
      icon: 'file-document-edit-outline',
      tint: tileColor('orange'),
      progress: w.assignmentsTotal ? w.assignmentsDone / w.assignmentsTotal : undefined,
    },
    { key: 'learning', label: 'Learning activities', value: plural(w.learningActivities, 'activity', 'activities'), detail: w.handwritingSessions ? `+ ${plural(w.handwritingSessions, 'tracing page')}` : 'Play & Learn games', icon: 'book-open-page-variant-outline', tint: tileColor('teal') },
    { key: 'stars', label: 'Stars', value: `${w.starsEarned} earned`, detail: 'Rewards spent are not counted', icon: 'star-outline', tint: tileColor('yellow') },
    {
      key: 'routine',
      label: 'Daily routine',
      value: w.routinePercent === null ? 'Not used yet' : `${w.routinePercent}% completed`,
      detail: w.routineDays ? `On ${plural(w.routineDays, 'day')} My Day was used` : 'Steps ticked in My Day',
      icon: 'calendar-check-outline',
      tint: tileColor('green'),
      progress: w.routinePercent === null ? undefined : w.routinePercent / 100,
    },
  ];

  // Plain sentences, only for things that actually happened.
  const highlights: { icon: string; text: string }[] = [];
  if (w.topSound) {
    const sound = getSoundExercise(w.topSound.soundId)?.letter ?? w.topSound.soundId.toUpperCase();
    highlights.push({ icon: 'microphone-outline', text: `Practiced the ${sound} sound ${plural(w.topSound.count, 'time')}` });
  }
  if (w.newWords) highlights.push({ icon: 'alphabetical-variant', text: `Practiced ${plural(w.newWords, 'new word')}` });
  if (w.handwritingSessions) highlights.push({ icon: 'pencil-outline', text: `Completed ${plural(w.handwritingSessions, 'handwriting activity', 'handwriting activities')}` });
  if (w.speechSessions) highlights.push({ icon: 'account-voice', text: `Completed ${plural(w.speechSessions, 'speech practice session')}` });
  if (w.topSpeechActivity) {
    const def = ACTIVITIES.find((a) => a.id === w.topSpeechActivity?.activityId);
    if (def) highlights.push({ icon: 'heart-outline', text: `Favorite speech activity: ${t(def.titleKey)}` });
  }
  if (w.topLearnActivity) {
    const act = getActivity(w.topLearnActivity.activityKey);
    if (act) highlights.push({ icon: 'puzzle-outline', text: `Favorite learning activity: ${act.title}` });
  }
  if (w.lessonsCompleted) highlights.push({ icon: 'school-outline', text: `Finished ${plural(w.lessonsCompleted, 'lesson')}` });

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Weekly progress" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={[styles.title, { fontSize: sizes.body + 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
          {displayName}'s Weekly Progress
        </Text>
        <Text style={styles.range} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {formatShortDate(range.days[0])} – {formatShortDate(range.days[6])}
        </Text>
        <ChoiceRow<'0' | '1'>
          label="Week"
          value={String(offset) as '0' | '1'}
          onChange={(v) => setOffset(v === '1' ? 1 : 0)}
          choices={[
            { value: '0', label: 'This week' },
            { value: '1', label: 'Last week' },
          ]}
        />

        <View style={styles.grid}>
          {metrics.map((m) => (
            <View key={m.key} style={styles.card} accessible accessibilityLabel={`${m.label}: ${m.value}. ${m.detail}`}>
              <View style={styles.cardHead}>
                <IconTile name={m.icon} size={40} tint={m.tint} />
                <Text style={styles.cardLabel} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                  {m.label}
                </Text>
              </View>
              <Text style={[styles.cardValue, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                {m.value}
              </Text>
              {m.progress !== undefined ? <ProgressBar value={m.progress} height={10} color={Colors.success} /> : null}
              <Text style={styles.cardDetail} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                {m.detail}
              </Text>
            </View>
          ))}
        </View>

        <SectionTitle title={offset === 0 ? "This week's highlights" : "Last week's highlights"} emoji="✨" />
        <View style={styles.panel}>
          {highlights.length === 0 ? (
            <Text style={styles.empty} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Nothing recorded yet for this week. Highlights appear as {displayName} practices.
            </Text>
          ) : (
            highlights.map((h, i) => (
              <View key={i} style={[styles.highlight, i > 0 && styles.divider]}>
                <IconTile name={h.icon} size={36} tint={tileColor('blue')} />
                <Text style={[styles.highlightText, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {h.text}
                </Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.note} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          A summary of activities — what was practiced and how often. It is not a test, a score or a
          clinical assessment.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  title: { fontFamily: Fonts.black, color: Colors.text },
  range: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.textMuted, marginTop: -SPACING.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  card: {
    flexGrow: 1,
    flexBasis: '46%',
    gap: 6,
    padding: SPACING.md,
    borderRadius: RADIUS.tile,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardLabel: { flex: 1, fontFamily: Fonts.bold, fontSize: 15, color: Colors.textMuted },
  cardValue: { fontFamily: Fonts.black, color: Colors.text },
  cardDetail: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 18, color: Colors.textMuted },
  panel: { borderRadius: RADIUS.tile, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderSoft, overflow: 'hidden' },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minHeight: 56, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.borderSoft },
  highlightText: { flex: 1, fontFamily: Fonts.bold, color: Colors.text },
  empty: { padding: SPACING.md, fontFamily: Fonts.semibold, fontSize: 16, color: Colors.textMuted },
  note: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 20, color: Colors.textMuted, textAlign: 'center' },
});
