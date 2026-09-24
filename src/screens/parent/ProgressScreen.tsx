import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ListRow, ScreenContainer, ScreenHeader, SectionTitle, StatTile } from '@/components/common';
import { Colors } from '@/constants/colors';
import { DIFFICULTY_META } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useActivityLogs, useAssignmentCounts, useLearningStats, useRecentLearning, useSizes } from '@/hooks';
import { LEARNING_SUBJECT_MAP, getActivity } from '@/learning';
import type { LearningSubjectKey } from '@/learning';
import type { ParentScreenProps } from '@/navigation/types';
import { formatDateTime } from '@/utils/date';

/**
 * Progress: assignment totals, learning results per subject, recent practice sessions,
 * and the therapy/activity completion log. All local; nothing is scored against other children.
 */
export function ProgressScreen({ navigation }: ParentScreenProps<'Progress'>) {
  const sizes = useSizes();
  const { data: counts } = useAssignmentCounts();
  const { data: stats } = useLearningStats();
  const { data: recent } = useRecentLearning(15);
  const { data: logs } = useActivityLogs(20);

  const totalAssignments = counts.todo + counts.in_progress + counts.done;
  const pct = (c: number, t: number) => (t === 0 ? '–' : `${Math.round((c / t) * 100)}%`);

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Progress" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <SectionTitle title="Assignments" emoji="📝" />
        <View style={styles.stats}>
          <StatTile label="Completed" value={counts.done} color="#C4F2C8" />
          <StatTile label="Still open" value={counts.todo + counts.in_progress} color="#FFF3A8" />
          <StatTile label="Done rate" value={pct(counts.done, totalAssignments)} color="#BFE0FF" />
        </View>

        <SectionTitle title="Learning" emoji="📚" />
        {stats.length === 0 ? (
          <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>No practice sessions yet. Results appear here after the child plays in Learn.</Text>
        ) : (
          <View style={styles.stats}>
            {stats.map((s) => {
              const subject = LEARNING_SUBJECT_MAP[s.subjectKey as LearningSubjectKey];
              return (
                <StatTile
                  key={s.subjectKey}
                  emoji={subject?.emoji}
                  label={`${subject?.name ?? s.subjectKey} · ${s.sessions} session${s.sessions === 1 ? '' : 's'}`}
                  value={pct(s.correct, s.total)}
                  color={subject?.color}
                />
              );
            })}
          </View>
        )}

        {recent.length > 0 ? (
          <>
            <SectionTitle title="Recent practice" emoji="🕒" />
            {recent.map((r) => {
              const a = getActivity(r.activityKey);
              return (
                <ListRow
                  key={r.id}
                  title={a?.title ?? r.activityKey}
                  icon={a?.emoji ?? '📚'}
                  iconBackground="#E8DFFF"
                  subtitle={`${r.correct} / ${r.total} correct · ${DIFFICULTY_META[r.difficulty].label} · ${formatDateTime(r.playedAt)}`}
                />
              );
            })}
          </>
        ) : null}

        <SectionTitle title="Activities completed" emoji="🧩" />
        {logs.length === 0 ? (
          <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>No completed activities logged yet.</Text>
        ) : (
          logs.map((l) => <ListRow key={l.id} title={l.activityName} subtitle={formatDateTime(l.completedAt)} icon="check-circle" />)
        )}

        <Text style={[styles.hint, { fontSize: sizes.body - 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          These numbers are only for you and the child's caregivers. They are practice records, not assessments.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  hint: { color: Colors.textMuted, fontSize: 16 },
});
