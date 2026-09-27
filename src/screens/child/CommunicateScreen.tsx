import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChildScreen, EmptyState, SectionLabel } from '@/components/common';
import { CategoryBar, CommunicationTile, PhraseBanner, TileGrid } from '@/components/communication';
import { SECTION_EMOJI } from '@/constants/school';
import { SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useHomeCategories, useRecentButtons, useSizes, useSpeak, useVisibleButtons } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { useI18n } from '@/i18n';

/**
 * Talk — the communication board.
 * Layout (top to bottom, never changes): header, phrase banner, Recent strip (optional),
 * category pills, card grid. Sentence starters ("I want...") compose with the next tap.
 */
export function CommunicateScreen(_props: RootScreenProps<'Communicate'>) {
  const sizes = useSizes();
  const { t } = useI18n();
  const { profile } = useProfile();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const { data: categories } = useHomeCategories();
  const { data: buttons, loading } = useVisibleButtons(categoryId ?? undefined);
  const { data: recent } = useRecentButtons(4);
  const { lastPhrase, lastButtonId, pendingStarter, speakButton, repeat, cancelStarter } = useSpeak();

  const showRecent = profile.communication.showRecent && recent.length > 0 && categoryId === null;
  const stripWidth = (sizes.tileWidth * sizes.columns + sizes.gap * (sizes.columns - 1) - sizes.gap * 3) / 4;

  const header = showRecent ? (
    <View style={styles.recent}>
      <SectionLabel icon="history" text={t('talkRecent')} />
      <View style={[styles.recentRow, { gap: sizes.gap }]}>
        {recent.map((b) => (
          <CommunicationTile key={`r${b.id}`} button={b} selected={b.id === lastButtonId} onPress={speakButton} width={stripWidth} compact />
        ))}
      </View>
    </View>
  ) : null;

  return (
    <ChildScreen title={t('sectionTalk')} emoji={SECTION_EMOJI.communicate} art="talk" subtitle={t('talkSub')}>
      <PhraseBanner phrase={lastPhrase} onRepeat={repeat} pending={pendingStarter} onClear={cancelStarter} />
      <CategoryBar categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
      {!loading && buttons.length === 0 ? (
        <EmptyState icon="message-text" title="No cards yet" message="A parent can add cards in Parent Mode." />
      ) : (
        <TileGrid buttons={buttons} selectedId={lastButtonId} onPress={speakButton} header={header} />
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  recent: { marginBottom: SPACING.md, gap: SPACING.xs },
  recentRow: { flexDirection: 'row' },
});
