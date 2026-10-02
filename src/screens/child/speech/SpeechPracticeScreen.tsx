import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common';
import { GrownUpsCard, HeroPanel, MissionCard, SpeechPracticeLayout, StatPill } from '@/components/adventure';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useAdventure, useSizes, useTodaySpeechPractice } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { parseHiddenActivities } from '@/speechpractice/activities';
import { STAGE_ART } from '@/speechpractice/stageArt';
import { SPEECH_STAGES, visibleMembers } from '@/speechpractice/stages';
import { useSubscription } from '@/context/SubscriptionContext';
import { Fonts, useTheme } from '@/theme';

/**
 * Speech Practice — the production ladder.
 *
 * WHAT CHANGED AND WHY. This screen used to list all twenty activities at once under Beginner /
 * Intermediate / Advanced. Level is a note for a grown-up about difficulty; to a child it says
 * nothing about what they are doing, so the screen answered "what is available?" when the only
 * question worth answering is "what am I practising right now?".
 *
 * It now shows FIVE things, in the order speech is built: sounds, syllables, words, phrases,
 * sentences. Each opens to its own activities. Nothing was deleted — every activity lives inside
 * the stage it belongs to, except the ones that were never speech production (listening, memory,
 * vocabulary, following directions, and the social ones), which moved to Listen & Talk where they
 * belong and where several of them already had a home.
 *
 * The cards are the shared `MissionCard`, the same component Listen & Talk and Lessons use. The
 * two sections keep DIFFERENT layouts — a ladder here, a pathway there, a grid inside a stage —
 * but one card, one radius, one shadow, one progress bar, one press animation.
 *
 * THE LATEST RESTYLE is look only: each stage wears an illustration (a megaphone, letter blocks, a
 * book, speech bubbles, a page and pencil), the banner carries Pip and two real counts, and a
 * "Grown-ups" card points to Parent Mode. Which stages show, which are locked behind Plus, what
 * they count and where they go are exactly what they were.
 */
export function SpeechPracticeScreen({ navigation }: RootScreenProps<'SpeechPractice'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { settings } = useSettings();
  const adventure = useAdventure();
  const { data: stats } = useTodaySpeechPractice();
  const hidden = useMemo(() => parseHiddenActivities(settings.speechPracticeHidden), [settings.speechPracticeHidden]);

  // A stage with everything hidden by a parent is not shown at all, rather than opening empty.
  const stages = SPEECH_STAGES.filter((s) => visibleMembers(s, hidden).length > 0);
  // The free plan opens the beginning of the ladder; the rest asks for Plus. The index counted is
  // the position in the list the CHILD sees, so a stage a grown-up hid never silently uses up part
  // of the free allowance.
  const { can } = useSubscription();

  // Settings and Parent Mode live behind the PIN, exactly as the Parent tab on Home.
  const openParentMode = () => navigation.navigate('ParentPin');

  return (
    <SpeechPracticeLayout title={t('spTitle')} subtitle={t('spSubtitle')} emoji="microphone-outline" emojiTint="#FFD9D3" art="speech">
          {/* Pip and the day's two counts: the child's total stars, and what they finished today. */}
          <HeroPanel
            color="lagoon"
            art="speech"
            title={t('advPipLine')}
            subtitle={t('spSubtitle')}
            mascot
            mascotLeft
            onSettings={openParentMode}
            settingsLabel={t('advParentSettings')}
          >
            <View style={styles.pills}>
              <StatPill
                wide
                icon="star"
                value={String(adventure.totalStars)}
                caption={t('advStatStars')}
                label={`${t('advStatStars')}: ${adventure.totalStars}`}
                color="sun"
              />
              <StatPill
                wide
                icon="microphone"
                value={String(stats.activitiesCompleted)}
                caption={t('spStatToday')}
                label={`${t('spStatToday')}: ${stats.activitiesCompleted}`}
                color="lagoon"
              />
            </View>
          </HeroPanel>

          {stages.length === 0 ? (
            <Card>
              <Text style={[styles.plain, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('spAllHidden')}
              </Text>
            </Card>
          ) : (
            stages.map((stage, i) => {
              const locked = !can('speechPractice', i).allowed;
              return (
                <MissionCard
                  key={stage.id}
                  locked={locked}
                  title={t(stage.titleKey)}
                  subtitle={t(stage.subtitleKey)}
                  // Step AND length in the eyebrow. A progress bar here would sit at 0% on every stage
                  // a child has not started, and a column of empty bars reads as a column of failures
                  // rather than as a menu.
                  eyebrow={`${t('spStageStep', { n: i + 1 })} · ${t('spStageActivities', { n: visibleMembers(stage, hidden).length })}`}
                  colorArt={STAGE_ART[stage.id]}
                  bare
                  arrowIcon="chevron-right"
                  color={stage.color}
                  // A locked card still responds: it explains Plus rather than doing nothing, because a
                  // card that ignores a child's tap just looks broken to them.
                  onPress={() => {
                    if (locked) return navigation.navigate('Plus');
                    navigation.navigate('SpeechStage', { stageId: stage.id });
                  }}
                  accessibilityLabel={`${t(stage.titleKey)}. ${t(stage.subtitleKey)}.${locked ? '. Needs TalkEasy Plus' : ''}`}
                />
              );
            })
          )}

          {/* A door for grown-ups: the existing Parent PIN, not a second route into Parent Mode. */}
          <GrownUpsCard title={t('spGrownUpsTitle')} text={t('spGrownUpsText')} onPress={openParentMode} />
    </SpeechPracticeLayout>
  );
}

const styles = StyleSheet.create({
  plain: { fontFamily: Fonts.bold, textAlign: 'center' },
  pills: { gap: 6 },
});
