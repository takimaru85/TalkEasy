import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { GameTile, HeroPanel, SpeechPracticeLayout, SyllableChips } from '@/components/adventure';
import { MIN_SUPPORTED_WIDTH } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useSizes } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { ACTIVITIES, parseHiddenActivities } from '@/speechpractice/activities';
import { ACTIVITY_ART, STAGE_ART, stageTileRows, stageTileWidth, tileColorFor } from '@/speechpractice/stageArt';
import { getStage, visibleMembers, type StageMember } from '@/speechpractice/stages';
import { getActivity as getPracticeActivity } from '@/practice/engine';
import { Adventure } from '@/theme/adventure';

/**
 * One rung of the speech ladder: the activities that practise it. The same screen for all five stages.
 *
 * A GRID here on purpose. The stages themselves are a sequence, so the home screen lists them; the
 * activities inside a stage are interchangeable ways of practising the same thing, so they are
 * tiles to pick from. That is the same reasoning that keeps Listen & Talk a pathway and this
 * section a game area — layout follows what the content actually is.
 *
 * LOOK, from the Sounds reference: Pip and the stage's own banner, then each activity as a glossy tile
 * with a big illustration on a dark disc and a ring arrow, in a COORDINATED palette — every tile its own
 * colour, so a child can tell them apart at a glance, with each stage keeping its own mood
 * (`STAGE_TILE_COLORS`). Five tiles are three over two; a narrow phone drops to twos
 * (`stageTileRows`). Which activities show, and where each one goes, are exactly what they were.
 *
 * A stage can hold activities from both modules — Speech Practice's own and the sound-ladder ones
 * in `src/practice` — and opens whichever screen each belongs to.
 */
export function SpeechStageScreen({ route, navigation }: RootScreenProps<'SpeechStage'>) {
  const { stageId } = route.params;
  const sizes = useSizes();
  const { t } = useI18n();
  const { settings } = useSettings();
  const { width } = useWindowDimensions();
  const hidden = useMemo(() => parseHiddenActivities(settings.speechPracticeHidden), [settings.speechPracticeHidden]);

  const stage = getStage(stageId);
  if (!stage) return null;

  const members = visibleMembers(stage, hidden);
  // Floored: the window reports 0 on a first frame (see MIN_SUPPORTED_WIDTH).
  const contentWidth = Math.max(MIN_SUPPORTED_WIDTH, width) - sizes.horizontalPadding * 2;
  // The shared responsive column count decides how wide the grid may go (a phone two, a tablet four).
  const rows = stageTileRows(members.length, contentWidth, sizes.gridColumns);

  const open = (member: StageMember) => {
    if (member.module === 'practice') {
      navigation.navigate('VoiceActivity', { activityId: member.id });
      return;
    }
    const activity = ACTIVITIES.find((a) => a.id === member.id);
    if (!activity) return;
    if (activity.route) navigation.navigate(activity.route);
    else navigation.navigate('SpeechActivity', { activityId: activity.id });
  };

  const labelFor = (member: StageMember): string => {
    if (member.module === 'practice') {
      const a = getPracticeActivity(member.id);
      return a ? t(a.titleKey) : member.id;
    }
    const a = ACTIVITIES.find((x) => x.id === member.id);
    return a ? t(a.titleKey) : member.id;
  };

  // Rows of tiles, built by hand rather than wrapped: the last row's tiles stretch to fill it.
  let next = 0;
  const grid = rows.map((perRow, r) => {
    const tileWidth = stageTileWidth(contentWidth, perRow, sizes.gap);
    const cells = members.slice(next, next + perRow).map((member, c) => {
      const index = next + c;
      const label = labelFor(member);
      return (
        <GameTile
          key={`${member.module}-${member.id}`}
          label={label}
          tint={Adventure[tileColorFor(stage.id, index)].tint}
          colorKey={tileColorFor(stage.id, index)}
          colorArt={ACTIVITY_ART[member.id]}
          arrow
          stretch
          onPress={() => open(member)}
          accessibilityLabel={`${label}, ${t(stage.titleKey)}`}
          width={tileWidth}
          minHeight={Math.max(sizes.tileHeight * 0.95, 150)}
        />
      );
    });
    next += perRow;
    return (
      <View key={r} style={[styles.row, { gap: sizes.gap }]}>
        {cells}
      </View>
    );
  });

  return (
    <SpeechPracticeLayout title={t(stage.titleKey)} subtitle={t(stage.subtitleKey)} colorArt={STAGE_ART[stage.id]} back>
      <HeroPanel
        color={stage.color}
        art="speech"
        title={t(stage.titleKey)}
        subtitle={t(stage.subtitleKey)}
        mascot
        mascotLeft
        onSettings={() => navigation.navigate('ParentPin')}
        settingsLabel={t('advParentSettings')}
      >
        {/* Choosing a target sound is the first thing that happens in Sounds, so the chips live
            here rather than on a screen where they sat beside a dozen unrelated tiles. */}
        {stage.id === 'sounds' ? <SyllableChips onSelect={(id) => navigation.navigate('SoundTarget', { targetId: id })} /> : null}
      </HeroPanel>

      <View style={{ gap: sizes.gap }}>{grid}</View>
    </SpeechPracticeLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch' },
});
