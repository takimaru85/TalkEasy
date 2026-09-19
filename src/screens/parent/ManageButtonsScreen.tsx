import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ListRow, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { buttonsRepo, favoritesRepo } from '@/database';
import { useAllButtons, useCategories, useFavoriteIds, useSizes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';
import { confirm } from '@/utils/confirm';

/**
 * Lists every communication button grouped by category, with Up / Down / Star / Hide / Edit /
 * Delete actions. Default buttons can be hidden or edited; deleting is allowed for all.
 */
export function ManageButtonsScreen({ navigation }: ParentScreenProps<'ManageButtons'>) {
  const sizes = useSizes();
  const { data: categories } = useCategories();
  const { data: buttons } = useAllButtons();
  const { data: favoriteIds } = useFavoriteIds();

  const grouped = useMemo(
    () => categories.map((c) => ({ category: c, buttons: buttons.filter((b) => b.categoryId === c.id) })),
    [categories, buttons],
  );

  const onDelete = async (id: number, label: string) => {
    if (await confirm('Delete button?', `"${label}" will be removed from every screen.`)) {
      await buttonsRepo.remove(id);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Buttons" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.list}>
        <BigButton
          label="Add a new button"
          icon="plus-circle"
          onPress={() => navigation.navigate('EditButton', {})}
          minHeight={72}
        />
        {grouped.map(({ category, buttons: list }) => (
          <View key={category.id} style={styles.group}>
            <Text style={[styles.groupTitle, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {category.name}

            </Text>
            {list.length === 0 ? (
              <Text style={styles.empty} maxFontSizeMultiplier={MAX_FONT_SCALE}>No buttons in this category.</Text>
            ) : null}
            {list.map((b, index) => (
              <ListRow
                key={b.id}
                title={b.label}
                subtitle={b.isHidden ? `Hidden · says "${b.phrase}"` : `Says "${b.phrase}"`}
                icon={b.icon}
                iconBackground={b.color}
                dimmed={b.isHidden}
                onPress={() => navigation.navigate('EditButton', { buttonId: b.id })}
                actions={[
                  { icon: 'chevron-up', label: 'Move up', disabled: index === 0, onPress: () => buttonsRepo.move(b.id, -1) },
                  { icon: 'chevron-down', label: 'Move down', disabled: index === list.length - 1, onPress: () => buttonsRepo.move(b.id, 1) },
                  {
                    icon: favoriteIds.has(b.id) ? 'star' : 'star-outline',
                    label: favoriteIds.has(b.id) ? 'Remove from favorites' : 'Add to favorites',
                    color: favoriteIds.has(b.id) ? Colors.warning : Colors.text,
                    onPress: () => favoritesRepo.toggle(b.id),
                  },
                  {
                    icon: b.isHidden ? 'eye-off-outline' : 'eye-outline',
                    label: b.isHidden ? 'Show' : 'Hide',
                    onPress: () => buttonsRepo.setHidden(b.id, !b.isHidden),
                  },
                  { icon: 'delete-outline', label: 'Delete', color: Colors.danger, onPress: () => onDelete(b.id, b.label) },
                ]}
              />
            ))}
          </View>
        ))}
        <Text style={styles.hint} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Tap a row to edit it. Use the arrows to change the order the child sees.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  group: { gap: SPACING.sm },
  groupTitle: { fontWeight: '800', color: Colors.text },
  empty: { color: Colors.textMuted, fontStyle: 'italic' },
  hint: { color: Colors.textMuted, fontSize: 15, textAlign: 'center' },
});
