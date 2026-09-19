import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer, ScreenHeader, EmptyState } from '@/components/common';
import { CommunicationTile, PhraseBanner, TileGrid } from '@/components/communication';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useFavoriteButtons, useMostUsedButtons, useSizes, useSpeak } from '@/hooks';
import type { ChildTabScreenProps } from '@/navigation/types';

/**
 * Favorites — tiles the parent starred, followed by the most-used tiles
 * (so frequently needed phrases surface automatically).
 */
export function FavoritesScreen({ navigation }: ChildTabScreenProps<'Favorites'>) {
  const sizes = useSizes();
  const { data: favorites, loading } = useFavoriteButtons();
  const { data: mostUsed } = useMostUsedButtons(6);
  const { lastPhrase, lastButtonId, speakButton, repeat } = useSpeak();

  const favoriteIds = new Set(favorites.map((b) => b.id));
  const extraMostUsed = mostUsed.filter((b) => !favoriteIds.has(b.id));

  const footer =
    extraMostUsed.length > 0 ? (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Used a lot
        </Text>
        <View style={[styles.grid, { gap: sizes.gap }]}>
          {extraMostUsed.map((b) => (
            <CommunicationTile key={b.id} button={b} selected={b.id === lastButtonId} onPress={speakButton} />
          ))}
        </View>
      </View>
    ) : null;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Favorites"
        rightIcon="lock"
        rightLabel="Parent"
        onRightPress={() => navigation.navigate('ParentPin')}
      />
      <PhraseBanner phrase={lastPhrase} onRepeat={repeat} />
      {!loading && favorites.length === 0 && extraMostUsed.length === 0 ? (
        <EmptyState icon="star" title="No favorites yet" message="A parent can star buttons in Parent Mode." />
      ) : (
        <TileGrid buttons={favorites} selectedId={lastButtonId} onPress={speakButton} footer={footer} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: SPACING.lg, gap: SPACING.sm },
  sectionTitle: { fontWeight: '800', color: Colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
