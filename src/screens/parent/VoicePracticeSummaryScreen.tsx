import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ScreenContainer, ScreenHeader } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes, useVoiceAreas, useVoiceToday } from '@/hooks';
import { useI18n } from '@/i18n';
import type { ParentScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { HOME_IDEAS } from '@/practice/content';
import { activityCount, getActivity, getCategory } from '@/practice/engine';
import type { PracticeAreaId } from '@/practice/types';

/**
 * Parent Mode — what was practised in Voice & Communication.
 *
 * This screen reports ACTIVITY, not ability. It can say "you practised rising and falling voice
 * four times today"; it cannot say how any of it sounded, because the app never listens to the
 * child's attempts and stores nothing about them. Every number here is a count of practice, and
 * the screen says so in plain words rather than leaving a parent to assume otherwise.
 *
 * The home idea at the bottom is a suggestion for PLAYING TOGETHER. It is deliberately not advice:
 * TalkEasy is a practice app, not a clinician, and nothing in it should read like a treatment plan.
 * A grown-up who is worried about their child's speech should be talking to a professional, and
 * this screen must never imply it is a substitute for that.
 */
export function VoicePracticeSummaryScreen({ navigation }: ParentScreenProps<'VoicePracticeSummary'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { data: today } = useVoiceToday();
  const { data: areas } = useVoiceAreas();

  // Group today's rows by area, keeping the repository's "most recent first" order.
  const byArea = new Map<PracticeAreaId, typeof today>();
  for (const row of today) {
    const list = byArea.get(row.category) ?? [];
    list.push(row);
    byArea.set(row.category, list);
  }

  // The idea offered is for the area practised most today, so it follows the child's own interest.
  const busiest = [...byArea.entries()].sort((a, b) => sum(b[1]) - sum(a[1]))[0]?.[0];

  return (
    <ScreenContainer>
      <ScreenHeader title={t('vcTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.section, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('vcParentToday')}
        </Text>

        {byArea.size === 0 ? (
          <Card>
            <Text style={[styles.body, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('vcNothingYet')}
            </Text>
          </Card>
        ) : (
          [...byArea.entries()].map(([category, rows]) => {
            const cat = getCategory(category);
            if (!cat) return null;
            const names = rows
              .map((r) => getActivity(r.activityId))
              .filter((a): a is NonNullable<typeof a> => !!a)
              .map((a) => t(a.titleKey));
            return (
              <Card key={category}>
                <View style={styles.row}>
                  <Text style={styles.emoji} allowFontScaling={false}>{cat.emoji}</Text>
                  <View style={styles.words}>
                    <Text style={[styles.title, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {t(cat.titleKey)}
                    </Text>
                    <Text style={[styles.body, { fontSize: sizes.body - 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {names.join(' · ')}
                    </Text>
                    <Text style={[styles.count, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {t('vcPractised')}: {sum(rows)}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        {/* All-time coverage per area — how much of each has been tried, never how well. */}
        <Text style={[styles.section, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('vcAreaProgress')}
        </Text>
        <Card>
          <View style={styles.bars}>
            {areas.map((area) => {
              const cat = getCategory(area.category);
              if (!cat) return null;
              const total = activityCount(area.category);
              return (
                <View key={area.category} style={styles.bar}>
                  <Text style={[styles.barLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                    {cat.emoji} {t(cat.titleKey)}
                  </Text>
                  <View style={[styles.track, { backgroundColor: theme.colors.surfaceAlt }]}>
                    <View style={[styles.fill, { width: `${Math.round(area.coverage * 100)}%`, backgroundColor: theme.colors.primary }]} />
                  </View>
                  <Text style={[styles.barCount, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {area.activities}/{total}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.note, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('vcNotAssessment')}
          </Text>
        </Card>

        <Text style={[styles.section, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('vcParentTryHome')}
        </Text>
        <Card>
          <Text style={[styles.body, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {HOME_IDEAS[busiest ?? 'conversation']}
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function sum(rows: { practised: number }[]): number {
  return rows.reduce((n, r) => n + r.practised, 0);
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  section: { fontFamily: Fonts.black, marginTop: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  emoji: { fontSize: 28 },
  words: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontFamily: Fonts.black, alignSelf: 'stretch' },
  body: { fontFamily: Fonts.bold, lineHeight: 22, alignSelf: 'stretch' },
  count: { fontFamily: Fonts.bold, fontSize: 12 },
  bars: { gap: SPACING.sm },
  bar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  barLabel: { fontFamily: Fonts.bold, fontSize: 13, width: 132 },
  track: { flex: 1, height: 10, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  barCount: { fontFamily: Fonts.bold, fontSize: 12, width: 38, textAlign: 'right' },
  note: { fontFamily: Fonts.bold, fontSize: 11, lineHeight: 16, marginTop: SPACING.md },
});
