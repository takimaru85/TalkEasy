import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ChildScreen, Icon, PressableScale, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useTherapyWeekCounts } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { THERAPY_GOAL_META } from '@/therapy/content';
import { activitiesForGoal, parseGoals, parseHidden, weekSummary, withGoal } from '@/therapy/day';
import type { TherapyGoalId } from '@/therapy/types';
import { Fonts, Radius, useTheme } from '@/theme';

/**
 * Practice Goals — "what would you like your child to practise?", and how that week has gone.
 *
 * Choosing goals NARROWS My Therapy Day to the activities that serve them, which is the only reason
 * to ask. Choosing nothing is a perfectly good answer and shows everything.
 *
 * The week is reported as a COUNT OF PRACTICES and nothing else. There is no target, no percentage,
 * no "on track", and no comparison with last week — because the app has measured nothing about the
 * child and any of those would imply it had. A family's therapist is the one who interprets
 * progress; this screen only says what has been practised.
 */
export function TherapyGoalsScreen(_: RootScreenProps<'TherapyGoals'>) {
  const theme = useTheme();
  const c = theme.colors;
  const { settings, updateSetting } = useSettings();
  const { data: weekCounts } = useTherapyWeekCounts();

  const chosen = parseGoals(settings.therapyGoals);
  const hidden = parseHidden(settings.therapyHidden);
  const goals = Object.keys(THERAPY_GOAL_META) as TherapyGoalId[];

  const toggle = (g: TherapyGoalId) =>
    void updateSetting('therapyGoals', withGoal(settings.therapyGoals, g, !chosen.includes(g)));

  /** Practices this week across the activities that serve a goal. */
  const countFor = (g: TherapyGoalId) =>
    activitiesForGoal(g, hidden).reduce((n, a) => n + (weekCounts[a.id] ?? 0), 0);

  return (
    <ChildScreen title="Practice Goals" emoji="🎯" subtitle="What you are working towards" back>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={[styles.lead, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            What would you like your child to practise?
          </Text>
          <Text style={[styles.meta, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Pick as many as you like. My Therapy Day will show the activities that help with them. Pick none and
            everything stays available.
          </Text>
        </Card>

        <View style={styles.chips}>
          {goals.map((g) => {
            const on = chosen.includes(g);
            return (
              <PressableScale
                key={g}
                onPress={() => toggle(g)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={THERAPY_GOAL_META[g]}
              >
                <View
                  style={[
                    styles.chip,
                    {
                      backgroundColor: on ? theme.tint(c.primarySoft) : c.surface,
                      borderColor: on ? c.primary : c.borderSoft,
                      borderWidth: on ? 2.5 : 1.5,
                    },
                  ]}
                >
                  <Icon name={on ? 'check-circle' : 'circle-outline'} size={20} color={on ? c.primary : c.textMuted} />
                  <Text style={[styles.chipText, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {THERAPY_GOAL_META[g]}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>

        {chosen.length > 0 ? (
          <>
            <SectionTitle title="This week" emoji="•" />
            {chosen.map((g) => (
              <Card key={g}>
                <Text style={[styles.goalLabel, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>GOAL</Text>
                <Text style={[styles.goalName, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {THERAPY_GOAL_META[g]}
                </Text>
                <Text style={[styles.week, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {weekSummary(countFor(g))}
                </Text>
              </Card>
            ))}
            <Text style={[styles.meta, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              This is a count of practice sessions, not a measure of how your child is doing. Your child&apos;s
              therapist is the person to talk to about progress.
            </Text>
          </>
        ) : null}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  lead: { fontFamily: Fonts.black, fontSize: 17, lineHeight: 24 },
  meta: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, marginTop: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: 10, borderRadius: Radius.lg, minHeight: 48 },
  chipText: { fontFamily: Fonts.extrabold, fontSize: 14 },
  goalLabel: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.8 },
  goalName: { fontFamily: Fonts.black, fontSize: 18, marginTop: 2 },
  week: { fontFamily: Fonts.bold, fontSize: 15, marginTop: SPACING.sm },
});
