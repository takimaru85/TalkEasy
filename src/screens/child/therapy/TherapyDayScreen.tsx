import React from 'react';
import type { ColorArtName } from '@/components/adventure/ColorArt';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChildScreen, EmptyState, ProgressBar, SectionTitle } from '@/components/common';
import { MissionCard } from '@/components/adventure';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useTherapyDoneToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { DAY_PARTS, activitiesForDayPart, dayProgress, parseGoals, parseHidden, todaysPlan } from '@/therapy/day';
import { Fonts, useTheme } from '@/theme';

/**
 * My Therapy Day — today's practice, in the order a day happens.
 *
 * An activity practised today shows as done. It can still be opened again: practice is not a
 * checklist to be cleared once, and a child who wants another go should never be told they have
 * already had it.
 *
 * There is no "overdue", no missed-day marker and no streak. A child with cerebral palsy has days
 * when movement is harder, and a section that punished those days would be worse than no section.
 */
export function TherapyDayScreen({ navigation }: RootScreenProps<'TherapyDay'>) {
  const theme = useTheme();
  const { settings } = useSettings();
  const { data: doneToday } = useTherapyDoneToday();

  const hidden = parseHidden(settings.therapyHidden);
  const goals = parseGoals(settings.therapyGoals);
  const done = new Set(doneToday);
  const progress = dayProgress(todaysPlan(hidden, goals), done);

  return (
    <ChildScreen title="My Therapy Day" emoji="🗓️" subtitle="A little practice, through the day" back>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <Text style={[styles.count, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Today&apos;s therapy · {progress.done} / {progress.total} done
          </Text>
          <ProgressBar
            value={progress.total > 0 ? progress.done / progress.total : 0}
            label={`${progress.done} / ${progress.total}`}
            color={theme.colors.success}
            accessibilityLabel={`${progress.done} of ${progress.total} practised today`}
          />
        </View>

        {progress.total === 0 ? (
          <EmptyState
            icon="clipboard-text-outline"
            title="Nothing scheduled"
            message="Choose some goals in Parent Mode, or switch activities back on, and they will appear here."
          />
        ) : null}

        {DAY_PARTS.map((part) => {
          const items = activitiesForDayPart(part.id, hidden, goals);
          if (items.length === 0) return null;
          return (
            <View key={part.id} style={styles.block}>
              <SectionTitle title={part.label} emoji="•" />
              {items.map((a) => (
                <MissionCard
                  key={a.id}
                  title={a.name}
                  subtitle={a.goal}
                  eyebrow={`About ${a.suggestedMinutes} min`}
                  colorArt={`therapy:${a.id}` as ColorArtName}
                  color="lagoon"
                  done={done.has(a.id)}
                  doneLabel="Done"
                  compact={done.has(a.id)}
                  onPress={() => navigation.navigate('TherapyActivity', { activityId: a.id })}
                  accessibilityLabel={`${a.name}. ${a.goal}${done.has(a.id) ? '. Practised today' : ''}`}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  summary: { gap: SPACING.sm },
  count: { fontFamily: Fonts.black, fontSize: 16 },
  block: { gap: SPACING.md },
});
