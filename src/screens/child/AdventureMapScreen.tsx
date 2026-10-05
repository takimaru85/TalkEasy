import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, PressableScale, ScreenContainer } from '@/components/common';
import { SpaceAdventureMap } from '@/components/adventure/SpaceAdventureMap';
import { SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { AdventureZone } from '@/theme';

/**
 * The Space Adventure Map on its own screen, opened from Home. Its header is the map's own wooden
 * sign with a small round back button beside it, which is more compact than the standard header and
 * is the one deliberate exception to it (this is a game board, not a list screen).
 */
export function AdventureMapScreen({ navigation }: RootScreenProps<'AdventureMap'>) {
  const sizes = useSizes();
  const { t } = useI18n();
  const back = (
    <PressableScale onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel={t('actionBack')} hitSlop={6}>
      <View style={styles.back}>
        <Icon name="arrow-left" size={26} color="#FFFFFF" />
      </View>
    </PressableScale>
  );
  return (
    <AdventureZone>
      <ScreenContainer>
        <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]} showsVerticalScrollIndicator={false}>
          <SpaceAdventureMap leading={back} />
        </ScrollView>
      </ScreenContainer>
    </AdventureZone>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.md, paddingBottom: SPACING.xl },
  back: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(30,22,100,0.85)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center' },
});
