import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChildScreen, EmptyState, SectionLabel } from '@/components/common';
import { useI18n } from '@/i18n';
import { CommunicationTile, PhraseBanner, TileGrid } from '@/components/communication';
import { useProfile } from '@/context/ProfileContext';
import { SPACING } from '@/constants/sizes';
import { useFavoriteButtons, useMostUsedButtons, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';

/**
 * Favorites — tiles the parent starred, followed by the most-used tiles
 * (so frequently needed phrases surface automatically).
 */
export function FavoritesScreen(_props: RootScreenProps<'Favorites'>) {
  const sizes = useSizes();
  const { displayName } = useProfile();
  const { t } = useI18n();
  const { data: favorites, loading } = useFavoriteButtons();
  const { data: mostUsed } = useMostUsedButtons(6);
  const { lastPhrase, lastButtonId, speakButton, repeat } = useSpeak();

  const favoriteIds = new Set(favorites.map((b) => b.id));
  const extraMostUsed = mostUsed.filter((b) => !favoriteIds.has(b.id));

  const footer =
    extraMostUsed.length > 0 ? (
      <View style={styles.section}>
        <SectionLabel icon="fire" text={t('favUsedALot')} />
        <View style={[styles.grid, { gap: sizes.gap }]}>
          {extraMostUsed.map((b) => (
            <CommunicationTile key={b.id} button={b} selected={b.id === lastButtonId} onPress={speakButton} />
          ))}
        </View>
      </View>
    ) : null;

  return (
    <ChildScreen title={t('favTitle', { name: displayName })} subtitle={t('favSub')} emoji="⭐" art="words">
      <PhraseBanner phrase={lastPhrase} onRepeat={repeat} />
      {!loading && favorites.length === 0 && extraMostUsed.length === 0 ? (
        <EmptyState icon="star" title="No favorites yet" message="A parent can star buttons in Parent Mode." />
      ) : (
        <TileGrid buttons={favorites} selectedId={lastButtonId} onPress={speakButton} footer={footer} />
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: SPACING.lg, gap: SPACING.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
