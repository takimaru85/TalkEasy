import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, ProgressBar, ScreenContainer, ScreenHeader, SectionTitle, StatTile } from '@/components/common';
import { ANSWER_METHOD_META, type AnswerMethod } from '@/adaptive/types';
import { WRITING_LEVELS } from '@/adaptive/handwriting';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useAdaptiveProgress, useHandwritingSessions, useRecentAttempts, useSizes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { formatDateTime } from '@/utils/date';

/** Supportive wording only — never "failed" or "poor". */
function describe(pct: number, total: number): string {
  if (total === 0) return 'Not started yet';
  if (pct >= 80) return 'Doing great';
  if (pct >= 60) return 'Making progress';
  if (pct >= 40) return 'Still developing';
  return 'Needs more practice';
}

/**
 * Parent view of Adaptive Learning. Learning progress and motor/handwriting practice are
 * shown as two separate things, so understanding is never measured by handwriting.
 */
export function AdaptiveProgressScreen({ navigation }: ParentScreenProps<'AdaptiveProgress'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { profile } = useProfile();
  const { data: p } = useAdaptiveProgress();
  const { data: attempts } = useRecentAttempts(12);
  const { data: sessions } = useHandwritingSessions(8);

  const methodPct = (m: AnswerMethod) => {
    const row = p.methods.find((x) => x.method === m);
    return row && row.count ? Math.round((row.correct / row.count) * 100) : null;
  };
  const preferred = [...p.methods].sort((a, b) => b.count - a.count)[0];

  // Strengths / areas to practise — derived, phrased supportively.
  const strengths: string[] = [];
  const practise: string[] = [];
  const good = (m: AnswerMethod, label: string) => { const v = methodPct(m); if (v !== null && v >= 70) strengths.push(label); };
  good('speak', 'Understands verbal questions');
  good('picture', 'Good picture recognition');
  good('tap', 'Good multiple-choice performance');
  good('type', 'Types answers well');
  good('match', 'Good at matching');
  for (const s of p.subjects) if (s.total >= 3 && s.correct / s.total >= 0.8) strengths.push(`Strong in ${s.name}`);
  for (const s of p.subjects) if (s.total >= 3 && s.correct / s.total < 0.5) practise.push(`${s.name} — needs more practice`);
  const tried = new Set(p.handwritingLevelsPractised);
  if (!tried.has(3)) practise.push('Letter tracing');
  if (!tried.has(6)) practise.push('Copying words');
  if (p.handwritingSessions < 3) practise.push('Writing control (more short practice sessions)');
  if (strengths.length === 0) strengths.push('Every completed lesson counts — keep going');

  return (
    <ScreenContainer>
      <ScreenHeader title="Learning progress" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.nameRow}>
          <Avatar avatar={profile.avatar} photoUri={profile.photoUri} size={52} />
          <Text style={[styles.name, { fontSize: sizes.heading, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{profile.name}</Text>
        </View>
        <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Learning progress and handwriting practice are shown separately. A child can understand a lesson well even
          while handwriting is still hard.
        </Text>

        <SectionTitle title="Learning progress" emoji="📚" trailing={`${p.learningPercent}%`} />
        <ProgressBar value={p.learningPercent / 100} label={`${p.learningPercent}%`} color={theme.colors.success} />
        <View style={styles.stats}>
          <StatTile label="Lessons done" value={`${p.lessonsCompleted}/${p.lessonsTotal}`} color="#DDF5E3" />
          <StatTile label="Questions" value={p.questionsAnswered} color="#DCEBFF" />
          <StatTile label="Correct" value={p.correctAnswers} color="#FFF1C2" />
        </View>
        <Card>
          {p.subjects.length === 0 ? <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>No lessons answered yet.</Text> : null}
          {p.subjects.map((s) => {
            const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <View key={String(s.subjectId)} style={styles.barRow}>
                <Text style={[styles.barLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{s.name} <Text style={styles.barNote}>· {describe(pct, s.total)}</Text></Text>
                <ProgressBar value={pct / 100} label={`${pct}%`} height={14} />
              </View>
            );
          })}
        </Card>

        <SectionTitle title="Handwriting practice" emoji="✏️" trailing={`${p.handwritingPercent}%`} />
        <Card>
          <Text style={[styles.barLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Levels tried · {describe(p.handwritingPercent, p.handwritingSessions)}</Text>
          <ProgressBar value={p.handwritingPercent / 100} label={`${p.handwritingLevelsPractised.length}/7`} color={theme.colors.selected} height={14} />
          <Text style={[styles.hint, { marginTop: SPACING.sm }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {p.handwritingSessions} practice session{p.handwritingSessions === 1 ? '' : 's'} · {WRITING_LEVELS.filter((l) => tried.has(l.level)).map((l) => l.title).join(', ') || 'none yet'}
          </Text>
        </Card>

        <SectionTitle title="Answer methods" emoji="🙋" />
        <Card>
          {p.methods.length === 0 ? <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>No answers yet.</Text> : null}
          {preferred ? <Text style={[styles.barLabel, { color: theme.colors.text, marginBottom: SPACING.sm }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Uses most: {ANSWER_METHOD_META[preferred.method].emoji} {ANSWER_METHOD_META[preferred.method].label}</Text> : null}
          {p.methods.map((m) => (
            <View key={m.method} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{ANSWER_METHOD_META[m.method].emoji} {ANSWER_METHOD_META[m.method].label} <Text style={styles.barNote}>· {m.count} answer{m.count === 1 ? '' : 's'}</Text></Text>
              <ProgressBar value={m.count ? m.correct / m.count : 0} label={`${m.count ? Math.round((m.correct / m.count) * 100) : 0}%`} height={14} />
            </View>
          ))}
        </Card>

        <SectionTitle title="Strengths" emoji="🌟" />
        <Card color="#DDF5E3">{strengths.map((s) => <Text key={s} style={[styles.bullet, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>• {s}</Text>)}</Card>
        <SectionTitle title="Areas to practise" emoji="🌱" />
        <Card color="#FFF1C2">
          {practise.length === 0 ? <Text style={[styles.bullet, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>• Keep up the balanced practice.</Text> : practise.map((s) => <Text key={s} style={[styles.bullet, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>• {s}</Text>)}
        </Card>

        <SectionTitle title="Recent answers" emoji="🕒" />
        {attempts.length === 0 ? <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>None yet.</Text> : null}
        {attempts.map((a) => (
          <Text key={a.id} style={[styles.line, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {a.correct ? '✅' : '↻'} {ANSWER_METHOD_META[a.answerMethod]?.emoji ?? '•'} {a.answerText || ANSWER_METHOD_META[a.answerMethod]?.short} <Text style={styles.barNote}>· {formatDateTime(a.completedAt)}</Text>
          </Text>
        ))}
        {sessions.length > 0 ? <SectionTitle title="Recent writing practice" emoji="✏️" /> : null}
        {sessions.map((s) => (
          <Text key={s.id} style={[styles.line, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Level {s.level} · {s.item} · {s.strokes} strokes <Text style={styles.barNote}>· {formatDateTime(s.completedAt)}</Text>
          </Text>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  name: { fontFamily: Fonts.black },
  hint: { fontFamily: Fonts.semibold, color: Colors.textMuted, fontSize: 15, lineHeight: 21 },
  stats: { flexDirection: 'row', gap: SPACING.sm },
  barRow: { gap: 4, marginBottom: SPACING.sm },
  barLabel: { fontFamily: Fonts.bold, fontSize: 16 },
  barNote: { fontFamily: Fonts.semibold, color: Colors.textMuted },
  bullet: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 26 },
  line: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 22 },
});
