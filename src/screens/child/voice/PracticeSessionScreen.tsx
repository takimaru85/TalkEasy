import React, { useCallback, useMemo, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BigButton, ChildScreen, CompletionView, PressableScale } from '@/components/common';
import { MissionCard } from '@/components/adventure';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useClaimStars, useSizes } from '@/hooks';
import { claimKey } from '@/rewards/verification';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { Adventure } from '@/theme/adventure';
import { PurposeColor } from '@/theme/purpose';
import { getActivity, getCategory } from '@/practice/engine';
import { buildSession, sessionSeed, type SessionStep } from '@/practice/session';

/**
 * A short practice session: warm up, two activities, a little practice, then finish.
 *
 * THE FINISH BUTTON IS ALWAYS THERE, from the first screen to the last, and it is not a "give up"
 * button — it says "finish", it awards the stars, and it never asks the child to confirm. A grown-up
 * who can see the session is going badly must be able to end it in one tap without the app
 * bargaining, and a child who stops after two minutes has two minutes of real practice recorded,
 * because every exercise is logged as it is finished rather than at the end.
 *
 * The plan is fixed for the day (see `sessionSeed`) so that leaving and coming back continues the
 * same session instead of reshuffling it, and it is capped at MAX_SESSION_EXERCISES so it cannot
 * grow into a long one.
 */
export function PracticeSessionScreen({ route, navigation }: RootScreenProps<'PracticeSession'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const claim = useClaimStars();
  // One id per session: the claim key, so finishing twice (or reopening) is one claim.
  const sessionId = useRef(Date.now()).current;
  const night = !!theme.night;

  const plan = useMemo(() => buildSession(sessionSeed()), []);
  const [done, setDone] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(0);

  /**
   * A step counts as done only when the activity screen SAYS it finished (it navigates back with
   * `completed`). Advancing merely because this screen regained focus would tick off a step the
   * child backed out of half way — their practice is still recorded either way, but the session
   * should not claim they got through something they did not.
   */
  const completed = route.params?.completed;
  useFocusEffect(
    useCallback(() => {
      if (completed === undefined) return;
      setDone((n) => Math.max(n, Math.min(completed + 1, plan.steps.length)));
      // Clear it, so coming back here again later does not re-apply an old result.
      navigation.setParams({ completed: undefined });
    }, [completed, plan.steps.length, navigation]),
  );

  const finish = async () => {
    if (finished) return; // a second tap on Finish / Stop must not start a second claim
    setFinished(true);
    // The reward needs at least ONE completed practice step: the screen can be opened and closed without
    // earning anything, but a child who does one step and then needs to stop still earns it (so does a child
    // who cannot finish them all). Nothing here judges how the child spoke.
    if (done < 1) return;
    const r = await claim('practice', claimKey.practice(sessionId), 'Practice session').catch(() => ({ stars: 0 }));
    setStars(r.stars);
  };

  const startStep = (index: number) => {
    const step = plan.steps[index];
    if (!step) return;
    navigation.navigate('VoiceActivity', { activityId: step.activityId, limit: step.count, sessionStep: index });
  };

  if (finished) {
    return (
      <ChildScreen title={t('vcSessionTitle')} emoji="🎉" back>
        <CompletionView
          emoji="🌟"
          title={t('vcSessionDone')}
          extra={
            stars > 0 ? (
              <Text style={[styles.stars, { color: Adventure.sun.from }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('vcSessionStars', { n: stars })}
              </Text>
            ) : null
          }
          actionLabel={t('vcSessionHome')}
          actionIcon="home"
          onAction={() => navigation.navigate('ChildHome')}
        />
      </ChildScreen>
    );
  }

  const allDone = done >= plan.steps.length;

  return (
    <ChildScreen title={t('vcSessionTitle')} subtitle={t('vcSessionMinutes', { n: plan.estimatedMinutes })} emoji="⏱️" back>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* The whole session, visible from the start: a child can see it is short and see the end. */}
        {plan.steps.map((step, i) => (
          <StepRow
            key={`${step.activityId}-${i}`}
            step={step}
            index={i}
            state={i < done ? 'done' : i === done ? 'now' : 'later'}
            label={t(stepLabelKey(step.kind))}
            onPress={() => startStep(i)}
          />
        ))}

        <View style={styles.rewardRow}>
          <Text style={styles.rewardEmoji} allowFontScaling={false}>🌟</Text>
          <Text style={[styles.rewardText, { color: night ? 'rgba(255,255,255,0.9)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('vcSessionReward')}
          </Text>
        </View>

        {allDone ? (
          <BigButton label={t('vcSessionFinish')} icon="flag-checkered" minHeight={MIN_CHILD_TARGET + 8} onPress={finish} />
        ) : (
          <BigButton label={done === 0 ? t('vcSessionStart') : t('vcSessionContinue')} icon="play" minHeight={MIN_CHILD_TARGET + 8} onPress={() => startStep(done)} />
        )}

        {/* Always available, from the very first screen. Never asks "are you sure?". */}
        <PressableScale onPress={finish} accessibilityRole="button" accessibilityLabel={t('vcSessionStopNow')}>
          <Text style={[styles.stop, { color: night ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('vcSessionStopNow')}
          </Text>
        </PressableScale>
      </ScrollView>
    </ChildScreen>
  );
}

function stepLabelKey(kind: SessionStep['kind']): 'vcStepWarmup' | 'vcStepActivity' | 'vcStepPractice' {
  return kind === 'warmup' ? 'vcStepWarmup' : kind === 'practice' ? 'vcStepPractice' : 'vcStepActivity';
}

/**
 * One step of the session, drawn with the SAME MissionCard as everything else in the app — the
 * marker, the radius, the shadow and the press animation all come from the shared component
 * rather than from this screen.
 */
function StepRow({
  step, index, state, label, onPress,
}: {
  step: SessionStep; index: number; state: 'done' | 'now' | 'later'; label: string; onPress: () => void;
}) {
  const { t } = useI18n();
  const activity = getActivity(step.activityId);
  const area = activity ? getCategory(activity.category) : undefined;
  if (!activity || !area) return null;

  return (
    <MissionCard
      title={t(activity.titleKey)}
      subtitle={t(activity.subtitleKey)}
      eyebrow={`${index + 1}. ${label}`}
      glyph={activity.emoji}
      color={PurposeColor[area.purpose]}
      done={state === 'done'}
      doneLabel={t('vcStepDone')}
      current={state === 'now'}
      currentLabel={t('vcStepNow')}
      compact={state === 'done'}
      onPress={onPress}
      accessibilityLabel={`${label}. ${t(activity.titleKey)}.`}
    />
  );
}
const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.sm, paddingBottom: SPACING.xl * 2 },
  // The step row's own styling is gone: MissionCard owns the card, the disc, the radius, the
  // shadow and the press animation, exactly as it does for lessons and writing levels.
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  rewardEmoji: { fontSize: 26 },
  rewardText: { fontFamily: Fonts.bold, fontSize: 13, flex: 1 },
  stop: { fontFamily: Fonts.bold, fontSize: 13, textAlign: 'center', paddingVertical: SPACING.md },
  stars: { fontFamily: Fonts.black, fontSize: 20, textAlign: 'center' },
});
