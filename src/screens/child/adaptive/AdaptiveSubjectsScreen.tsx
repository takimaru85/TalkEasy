import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ChildScreen, EmptyState, Icon as LineIcon, PressableScale, ProgressBar, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useLessons, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';

/** All lessons grouped by subject, each with Start / Continue / Done. */
export function AdaptiveSubjectsScreen({ navigation }: RootScreenProps<'AdaptiveSubjects'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { data: lessons, loading } = useLessons();
  const { speakFeedback } = useSpeak();

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; icon: string; color: string; items: typeof lessons }>();
    for (const l of lessons) {
      const key = String(l.subjectId ?? 'none');
      const g = map.get(key) ?? { name: l.subjectName, icon: l.subjectIcon, color: l.subjectColor, items: [] };
      g.items.push(l);
      map.set(key, g);
    }
    return [...map.values()];
  }, [lessons]);

  return (
    <ChildScreen title="Subjects" emoji="📚" back>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        {!loading && lessons.length === 0 ? <EmptyState icon="school-outline" title="No lessons yet" message="A parent or teacher can add lessons in Parent Mode." /> : null}
        {groups.map((g) => {
          const total = g.items.reduce((n, l) => n + l.activityCount, 0);
          const done = g.items.reduce((n, l) => n + Math.min(l.completedCount, l.activityCount), 0);
          return (
            <View key={g.name} style={styles.group}>
              <SectionTitle title={g.name} emoji={g.icon} trailing={total ? `${done} / ${total}` : undefined} />
              {total > 0 ? <ProgressBar value={done / total} color={theme.colors.success} height={12} /> : null}
              {g.items.map((l) => {
                const complete = l.activityCount > 0 && l.completedCount >= l.activityCount;
                return (
                  <PressableScale key={l.id} onPress={() => { speakFeedback(l.title); navigation.navigate('AdaptiveLesson', { lessonId: l.id }); }} accessibilityRole="button" accessibilityLabel={`${l.title}. ${complete ? 'Completed' : `${l.completedCount} of ${l.activityCount} done`}`}>
                    <Card color={complete ? theme.colors.surfaceAlt : g.color} style={styles.row} padding={SPACING.md}>
                      <LineIcon name={complete ? 'check-circle' : l.completedCount > 0 ? 'progress-clock' : 'checkbox-blank-circle-outline'} size={32} color={complete ? theme.colors.success : l.completedCount > 0 ? theme.colors.primary : theme.colors.textMuted} />
                      <View style={styles.text}>
                        <Text style={[styles.title, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{l.title}</Text>
                        <Text style={[styles.meta, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{l.activityCount} question{l.activityCount === 1 ? '' : 's'}{l.gradeLevel ? ` · ${l.gradeLevel}` : ''}</Text>
                      </View>
                      <View style={[styles.cta, { backgroundColor: complete ? theme.colors.success : theme.colors.primary }]}>
                        <Text style={styles.ctaText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{complete ? 'Done' : l.completedCount > 0 ? 'Continue' : 'Start'}</Text>
                      </View>
                    </Card>
                  </PressableScale>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  group: { gap: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  mark: { fontSize: 26 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.extrabold },
  meta: { fontFamily: Fonts.semibold, fontSize: 14 },
  cta: { minHeight: 52, minWidth: 90, paddingHorizontal: SPACING.md, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 16 },
});
