import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChildScreen, EmptyState } from '@/components/common';
import { CommunicationTile, PhraseBanner, TileGrid } from '@/components/communication';
import { useProfile } from '@/context/ProfileContext';
import { Fonts, useTheme } from '@/theme';
import { SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useFavoriteButtons, useMostUsedButtons, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';

/**
 * Favorites — tiles the parent starred, followed by the most-used tiles
 * (so frequently needed phrases surface automatically).
 */
export function FavoritesScreen(_props: RootScreenProps<'Favorites'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { displayName } = useProfile();
  const { data: favorites, loading } = useFavoriteButtons();
  const { data: mostUsed } = useMostUsedButtons(6);
  const { lastPhrase, lastButtonId, speakButton, repeat } = useSpeak();

  const favoriteIds = new Set(favorites.map((b) => b.id));
  const extraMostUsed = mostUsed.filter((b) => !favoriteIds.has(b.id));

  const footer =
    extraMostUsed.length > 0 ? (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          USED A LOT
        </Text>
        <View style={[styles.grid, { gap: sizes.gap }]}>
          {extraMostUsed.map((b) => (
            <CommunicationTile key={b.id} button={b} selected={b.id === lastButtonId} onPress={speakButton} />
          ))}
        </View>
      </View>
    ) : null;

  return (
    <ChildScreen title={`${displayName}'s favorites`} emoji={SECTION_EMOJI.favorites}>
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
  sectionTitle: { fontFamily: Fonts.extrabold, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
