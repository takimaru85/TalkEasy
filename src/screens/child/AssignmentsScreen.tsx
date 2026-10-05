import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ChildScreen, EmptyState, SectionTitle } from '@/components/common';
import { AssignmentCard } from '@/components/school';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { assignmentsRepo } from '@/database';
import { useProfile } from '@/context/ProfileContext';
import { useAssignments, useClaimStars, useSizes, useSpeak, useToday } from '@/hooks';
import { rewardsRepo } from '@/database';
import { AWAITING_MESSAGE, claimKey } from '@/rewards/verification';
import type { RootScreenProps } from '@/navigation/types';
import type { AssignmentWithSubject } from '@/types/models';
import { confirm } from '@/utils/confirm';
import { Fonts, useTheme } from '@/theme';

/**
 * The child's assignment list: what is not finished (soonest first), then what is done.
 * The tick on each card marks it finished; tapping the card opens the detail.
 */
export function AssignmentsScreen({ navigation }: RootScreenProps<'Assignments'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { settings } = useSettings();
  const { isoDate } = useToday();
  const { data: assignments, loading } = useAssignments();
  const { speakPhrase, speakFeedback } = useSpeak();
  const { displayName } = useProfile();
  const claim = useClaimStars();

  const open = assignments.filter((a) => a.status !== 'done');
  const done = assignments.filter((a) => a.status === 'done');

  const toggle = async (a: AssignmentWithSubject) => {
    const finishing = a.status !== 'done';
    if (finishing && settings.confirmComplete) {
      const ok = await confirm('Finished?', `Mark "${a.title}" as finished?`, 'Yes, finished');
      if (!ok) return;
    }
    await assignmentsRepo.setStatus(a.id, finishing ? 'done' : 'todo');
    const key = claimKey.assignment(a.id);
    if (finishing) {
      const r = await claim('assignment', key, a.title);
      speakFeedback(r.outcome === 'awaiting_parent' ? `Finished! ${AWAITING_MESSAGE}` : `Finished! Great job, ${displayName}!${r.stars > 0 ? ` ${r.stars} stars.` : ''}`);
    } else {
      await rewardsRepo.withdrawClaim(key);
      speakPhrase(a.title);
    }
  };

  return (
    <ChildScreen title="Assignments" emoji="📝" art="school">
      {!loading && assignments.length === 0 ? (
        <EmptyState icon="pencil" title="No assignments" message="A parent can add assignments in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
          <SectionTitle title="To do" emoji="📝" trailing={open.length ? String(open.length) : undefined} />
          {open.length === 0 ? (
            <Text style={[styles.empty, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>All finished! 🎉</Text>
          ) : null}
          {open.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              today={isoDate}
              onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: a.id })}
              onToggleDone={() => toggle(a)}
            />
          ))}
          {done.length > 0 ? <SectionTitle title="Finished" emoji="✅" trailing={String(done.length)} /> : null}
          {done.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              today={isoDate}
              compact
              onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: a.id })}
              onToggleDone={() => toggle(a)}
            />
          ))}
        </ScrollView>
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  empty: { fontFamily: Fonts.semibold },
});
