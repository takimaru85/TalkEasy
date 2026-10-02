import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ChildScreen } from '@/components/common';
import { HeroPanel, MissionCard } from '@/components/adventure';
import { SafetyNotice } from '@/components/therapy/SafetyNotice';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useTherapyDoneToday } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { parseGoals, parseHidden, todaysPlan, dayProgress } from '@/therapy/day';
import { Fonts, useTheme } from '@/theme';

/**
 * Therapy — the hub, reached from Activities.
 *
 * Three ways in, matching how a family actually uses this: what are we doing today, what else is
 * there, and what are we working towards. The safety notice stands in front of all of it until a
 * grown-up has read it.
 *
 * The tone throughout is encouragement, not compliance. There is no streak, no "you missed a day",
 * and the day's count is shown as "3 of 6 done" rather than as a percentage — because a family
 * whose child has had a hard week should not open this section and be told they are failing.
 */
export function TherapyHomeScreen({ navigation }: RootScreenProps<'TherapyHome'>) {
  const theme = useTheme();
  const { settings, updateSetting } = useSettings();
  const { data: doneToday } = useTherapyDoneToday();

  const accepted = settings.therapySafetyAcceptedAt.length > 0;
  const hidden = parseHidden(settings.therapyHidden);
  const goals = parseGoals(settings.therapyGoals);
  const plan = todaysPlan(hidden, goals);
  const progress = dayProgress(plan, new Set(doneToday));

  if (!accepted) {
    return (
      <ChildScreen title="Therapy" emoji="🤸" back>
        <SafetyNotice onAccept={() => void updateSetting('therapySafetyAcceptedAt', new Date().toISOString())} />
      </ChildScreen>
    );
  }

  return (
    <ChildScreen title="Therapy" emoji="🤸" subtitle="Practice at home, a little at a time" back>
      <ScrollView contentContainerStyle={styles.content}>
        <HeroPanel
          color="lagoon"
          art="play"
          title="Today's practice"
          subtitle={progress.total === 0 ? 'Nothing scheduled — have a look at the activities' : `${progress.done} of ${progress.total} done`}
          mascot
        />

        <MissionCard
          title="My Therapy Day"
          subtitle="Today's practice, step by step"
          colorArt="therapy:sit-to-stand"
          color="sky"
          progress={progress.total > 0 ? { value: progress.done / progress.total, label: `${progress.done} / ${progress.total}` } : undefined}
          onPress={() => navigation.navigate('TherapyDay')}
          accessibilityLabel={`My Therapy Day. ${progress.done} of ${progress.total} done today.`}
        />
        <MissionCard
          title="Therapy Activities"
          subtitle="The whole library, by what it practises"
          colorArt="therapy:reach-grasp"
          color="grass"
          onPress={() => navigation.navigate('TherapyLibrary')}
          accessibilityLabel="Therapy Activities. The whole library."
        />
        <MissionCard
          title="Practice Goals"
          subtitle="What you are working towards"
          colorArt="therapy:balance-practice"
          color="grape"
          onPress={() => navigation.navigate('TherapyGoals')}
          accessibilityLabel="Practice goals. What you are working towards."
        />

        {/* One quiet line, always present — never buried in a settings screen. */}
        <Text style={[styles.note, { color: theme.night ? 'rgba(255,255,255,0.72)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          These activities support practice at home. They are not a replacement for your child&apos;s
          physiotherapist or occupational therapist — if they have given you a home programme, follow that first.
        </Text>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  note: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, marginTop: SPACING.md },
});
