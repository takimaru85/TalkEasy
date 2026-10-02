import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Card, Icon, PressableScale, ScreenContainer, ScreenHeader, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useTherapyWeekCounts } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { THERAPY_ACTIVITIES, THERAPY_GOAL_META, THERAPY_GROUP_META, THERAPY_SAFETY_NOTICE } from '@/therapy/content';
import { activitiesForGoal, parseGoals, parseHidden, weekSummary, withGoal, withHidden } from '@/therapy/day';
import type { TherapyGoalId, TherapyGroup } from '@/therapy/types';
import { Fonts, Radius, useTheme } from '@/theme';

/**
 * Parent Mode → Therapy: goals, which activities are on, and what has been practised.
 *
 * WHY THIS IS A GROWN-UP'S SCREEN. Switching an activity off is a decision about a particular
 * child's body, usually taken on a therapist's advice, and it is not something a child should be
 * able to do by tapping around. It sits behind the PIN with the rest of Parent Mode, dressed plainly
 * (AGENTS.md) so the two are never confused.
 *
 * TURNING THINGS OFF IS A FIRST-CLASS FEATURE HERE, not a buried setting. TalkEasy ships a general
 * set of practice ideas; a real child has a real programme, and most families will want to switch
 * several of these off. A section that cannot be narrowed is a section that gets abandoned.
 *
 * The week is reported as a COUNT OF PRACTICES. There is no target, no percentage and no comparison
 * with last week, because nothing here has measured the child — and a number that looks like a
 * result invites a parent to read progress into it that the app has no basis for.
 */
export function TherapySettingsScreen({ navigation }: ParentScreenProps<'TherapySettings'>) {
  const theme = useTheme();
  const c = theme.colors;
  const { settings, updateSetting } = useSettings();
  const { data: weekCounts } = useTherapyWeekCounts();

  const goals = parseGoals(settings.therapyGoals);
  const hidden = parseHidden(settings.therapyHidden);
  const allGoals = Object.keys(THERAPY_GOAL_META) as TherapyGoalId[];
  const groups = Object.keys(THERAPY_GROUP_META) as TherapyGroup[];

  const toggleGoal = (g: TherapyGoalId) =>
    void updateSetting('therapyGoals', withGoal(settings.therapyGoals, g, !goals.includes(g)));

  const toggleActivity = (id: string, on: boolean) =>
    void updateSetting('therapyHidden', withHidden(settings.therapyHidden, id, !on));

  const weekTotal = Object.values(weekCounts).reduce((n, v) => n + v, 0);
  const practisedCount = Object.keys(weekCounts).length;

  return (
    <ScreenContainer>
      <ScreenHeader title="Therapy" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* ---- goals ------------------------------------------------------------------------- */}
        <Card>
          <Text style={[styles.lead, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            What would you like your child to practise?
          </Text>
          <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Pick as many as you like. My Therapy Day will show the activities that help with them. Pick none and
            the whole routine stays available.
          </Text>
        </Card>

        <View style={styles.chips}>
          {allGoals.map((g) => {
            const on = goals.includes(g);
            return (
              <PressableScale
                key={g}
                onPress={() => toggleGoal(g)}
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

        {/* ---- this week --------------------------------------------------------------------- */}
        <SectionTitle title="This week" emoji="calendar-week" />
        <Card>
          <Text style={[styles.statBig, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {weekSummary(weekTotal)}
          </Text>
          <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {practisedCount === 0
              ? 'Nothing practised yet.'
              : `${practisedCount} different ${practisedCount === 1 ? 'activity' : 'activities'} practised.`}
          </Text>
          {goals.map((g) => {
            const n = activitiesForGoal(g, hidden).reduce((sum, a) => sum + (weekCounts[a.id] ?? 0), 0);
            return (
              <Text key={g} style={[styles.goalLine, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                • {THERAPY_GOAL_META[g]}: {weekSummary(n).toLowerCase()}
              </Text>
            );
          })}
          <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            This is a count of practice sessions, not a measure of how your child is doing. Their therapist is
            the person to talk to about progress.
          </Text>
        </Card>

        {/* ---- which activities are on ------------------------------------------------------- */}
        <SectionTitle title="Activities" emoji="tune" />
        <Card>
          <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Switch off anything that is not right for your child. Most families will turn several off — these are
            general ideas, and your therapist&apos;s own programme comes first.
          </Text>
        </Card>

        {groups.map((group) => (
          <View key={group} style={styles.group}>
            <Text style={[styles.groupLabel, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {THERAPY_GROUP_META[group].label.toUpperCase()}
            </Text>
            {THERAPY_ACTIVITIES.filter((a) => a.group === group).map((a) => {
              const on = !hidden.has(a.id);
              return (
                <View key={a.id} style={[styles.row, { borderColor: c.borderSoft }]}>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {a.name}
                    </Text>
                    <Text style={[styles.rowSub, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                      {a.goal}
                    </Text>
                  </View>
                  <Switch
                    value={on}
                    onValueChange={(next) => toggleActivity(a.id, next)}
                    accessibilityLabel={`${a.name}, ${on ? 'on' : 'off'}`}
                  />
                </View>
              );
            })}
          </View>
        ))}

        {/* ---- the notice, always re-readable ------------------------------------------------- */}
        <SectionTitle title="Safety" emoji="shield-heart-outline" />
        <Card>
          {THERAPY_SAFETY_NOTICE.split('\n\n').map((para) => (
            <Text key={para} style={[styles.notice, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {para}
            </Text>
          ))}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  lead: { fontFamily: Fonts.black, fontSize: 17, lineHeight: 24 },
  note: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, marginTop: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: 10, borderRadius: Radius.lg, minHeight: 48 },
  chipText: { fontFamily: Fonts.extrabold, fontSize: 14 },
  statBig: { fontFamily: Fonts.black, fontSize: 18 },
  goalLine: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 22, marginTop: 4 },
  group: { gap: 2 },
  groupLabel: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.8, marginTop: SPACING.sm, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: Fonts.extrabold, fontSize: 15 },
  rowSub: { fontFamily: Fonts.bold, fontSize: 12, lineHeight: 17, marginTop: 2 },
  notice: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 20, marginBottom: SPACING.sm },
});
