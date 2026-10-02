import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ChildScreen, SectionTitle } from '@/components/common';
import { HeroPanel, MissionCard } from '@/components/adventure';
import { SPACING } from '@/constants/sizes';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { PurposeColor, PurposeLabelKey } from '@/theme/purpose';
import { activitiesFor, buildExercises, getCategory } from '@/practice/engine';
import { ACTIVITIES } from '@/speechpractice/activities';
import { MOVED_TO_PRACTICE } from '@/speechpractice/stages';
import type { PracticeAreaId, VoiceLevel } from '@/practice/types';

/** The same three headings Speech Practice groups its activities under. */
const LEVELS: { level: VoiceLevel; titleKey: 'spLevelBeginner' | 'spLevelIntermediate' | 'spLevelAdvanced' }[] = [
  { level: 'beginner', titleKey: 'spLevelBeginner' },
  { level: 'intermediate', titleKey: 'spLevelIntermediate' },
  { level: 'advanced', titleKey: 'spLevelAdvanced' },
];

/**
 * The activities inside one practice area.
 *
 * Grouped under the SAME beginner / intermediate / advanced headings Speech Practice uses, and
 * drawn with the same `MissionCard` as lessons and writing levels — so a child moving between the
 * two sections meets one set of conventions rather than two.
 *
 * Nothing is locked. An area's later activities are usually harder, but a child who wants to try
 * the hard one may: a locked tile teaches a child they are not ready, which is not a lesson this
 * app is willing to give.
 */
export function VoiceAreaScreen({ route, navigation }: RootScreenProps<'VoiceArea'>) {
  const category = route.params.category as PracticeAreaId;
  const { t } = useI18n();

  const cat = getCategory(category);
  const activities = activitiesFor(category);
  if (!cat) return null;
  const color = PurposeColor[cat.purpose];
  /**
   * Activities that used to sit on the Speech Practice screen but are listening, understanding,
   * vocabulary or social skills rather than speech production. They were moved here rather than
   * deleted: a family that used one still has it, in the section it actually belongs to.
   */
  const movedHere = ACTIVITIES.filter((a) => MOVED_TO_PRACTICE[a.id] === category);

  return (
    <ChildScreen title={t(cat.titleKey)} subtitle={t(cat.subtitleKey)} emoji={cat.emoji} back>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroPanel color={color} art="practice" title={t(cat.titleKey)} subtitle={t(cat.subtitleKey)} />

        {LEVELS.map(({ level, titleKey }) => {
          const inLevel = activities.filter((a) => a.level === level);
          if (inLevel.length === 0) return null;
          return (
            <React.Fragment key={level}>
              <SectionTitle title={t(titleKey)} />
              {inLevel.map((a) => (
                <MissionCard
                  key={a.id}
                  title={t(a.titleKey)}
                  subtitle={t(a.subtitleKey)}
                  // No progress bar here: every activity inside an area would show an empty one,
                  // and a row of 0% bars reads as a row of failures. The eyebrow says how long the
                  // activity is instead, which is what a child or a grown-up actually wants to know.
                  eyebrow={t('vcSteps', { n: buildExercises(a.id).length })}
                  glyph={a.emoji}
                  color={color}
                  onPress={() => navigation.navigate('VoiceActivity', { activityId: a.id })}
                  accessibilityLabel={`${t(a.titleKey)}. ${t(a.subtitleKey)}.`}
                />
              ))}
            </React.Fragment>
          );
        })}
        {movedHere.length > 0 ? (
          <>
            <SectionTitle title={t('spTitle')} />
            {movedHere.map((a) => (
              <MissionCard
                key={a.id}
                title={t(a.titleKey)}
                eyebrow={t('spMovedHere')}
                glyph={a.icon}
                tint={a.tint}
                onPress={() => (a.route ? navigation.navigate(a.route) : navigation.navigate('SpeechActivity', { activityId: a.id }))}
                accessibilityLabel={t(a.titleKey)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.sm, paddingBottom: SPACING.xl * 2 },
});
