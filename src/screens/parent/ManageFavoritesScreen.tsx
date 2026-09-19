import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { EmptyState, ListRow, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { favoritesRepo } from '@/database';
import { useFavoriteButtons } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';

/** Reorder / remove favorites. Adding is done from the Buttons list (star icon). */
export function ManageFavoritesScreen({ navigation }: ParentScreenProps<'ManageFavorites'>) {
  const { data: favorites, loading } = useFavoriteButtons();

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Favorites" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          These appear on the child's Favorites tab, in this order. To add one, tap the star next to a
          button in "Communication buttons".
        </Text>
        {!loading && favorites.length === 0 ? (
          <EmptyState icon="star-outline" title="No favorites yet" />
        ) : null}
        {favorites.map((b, index) => (
          <ListRow
            key={b.id}
            title={b.label}
            subtitle={`Says "${b.phrase}"`}
            icon={b.icon}
            iconBackground={b.color}
            actions={[
              { icon: 'chevron-up', label: 'Move up', disabled: index === 0, onPress: () => favoritesRepo.move(b.id, -1) },
              { icon: 'chevron-down', label: 'Move down', disabled: index === favorites.length - 1, onPress: () => favoritesRepo.move(b.id, 1) },
              { icon: 'pencil-outline', label: 'Edit', onPress: () => navigation.navigate('EditButton', { buttonId: b.id }) },
              { icon: 'star-off', label: 'Remove from favorites', color: Colors.danger, onPress: () => favoritesRepo.remove(b.id) },
            ]}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  hint: { color: Colors.textMuted, fontSize: 16 },
});
