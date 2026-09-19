import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BigButton, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks';
import type { ParentScreenProps } from '@/navigation/types';

type MenuScreen = 'ManageButtons' | 'ManageFavorites' | 'ManageRoutine' | 'ManageExercises' | 'CareNotes' | 'Settings';

const MENU: { screen: MenuScreen; label: string; icon: string }[] = [
  { screen: 'ManageButtons', label: 'Communication buttons', icon: 'message-text' },
  { screen: 'ManageFavorites', label: 'Favorites', icon: 'star' },
  { screen: 'ManageRoutine', label: 'Visual routine', icon: 'calendar-check' },
  { screen: 'ManageExercises', label: 'Therapy & activities', icon: 'dumbbell' },
  { screen: 'CareNotes', label: 'Care notes', icon: 'note-text-outline' },
  { screen: 'Settings', label: 'Speech, sizes & PIN', icon: 'cog-outline' },
];

/** Parent Mode menu. */
export function ParentHomeScreen({ navigation }: ParentScreenProps<'ParentHome'>) {
  const sizes = useSizes();
  const exitToChild = () => navigation.navigate('ChildTabs', { screen: 'Talk' });
  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Parent Mode" rightIcon="lock-open-variant" rightLabel="Exit" onRightPress={exitToChild} />
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={[styles.intro, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Everything here stays on this device. Nothing is sent anywhere.
        </Text>
        {MENU.map((item) => (
          <BigButton
            key={item.screen}
            label={item.label}
            icon={item.icon}
            variant="secondary"
            minHeight={80}
            onPress={() => navigation.navigate(item.screen)}
          />
        ))}
        <BigButton
          label="Back to child mode"
          icon="account-child"
          variant="primary"
          minHeight={80}
          onPress={exitToChild}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  intro: { color: Colors.textMuted, marginBottom: SPACING.sm },
});
