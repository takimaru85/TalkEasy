import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChildScreen, PressableScale } from '@/components/common';
import { SpacePet } from '@/components/adventure/SpacePet';
import { COSMETICS } from '@/adventure/pet';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks';
import { usePetReaction, usePetWardrobe } from '@/hooks/usePet';
import { useAdventureMap } from '@/hooks/useTodayAdventure';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { AdventureRadius } from '@/theme/adventure';

/**
 * Dress up the Space Pet. Cosmetics are earned by real practice (adventure/pet.ts) and can be put on
 * or taken off freely; a locked one just says how to earn it. Nothing is bought, nothing expires and
 * nothing is ever taken away for being away.
 */
export function SpacePetScreen(_: RootScreenProps<'SpacePet'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const map = useAdventureMap();
  const { unlocked, equipped, toggle } = usePetWardrobe(map);
  const pet = usePetReaction(map);
  const plain = theme.highContrast;
  const ink = plain ? theme.colors.text : '#FFFFFF';

  return (
    <ChildScreen title={t('petTitle')} subtitle={t('petSub')} emoji="🤖">
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SpacePet size={200} mood={pet.mood} equipped={equipped} burst={pet.burst} />
          <Text style={[styles.say, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{pet.message}</Text>
        </View>
        {COSMETICS.map((c) => {
          const open = unlocked.has(c.id);
          const worn = equipped.includes(c.id);
          return (
            <PressableScale
              key={c.id}
              onPress={() => (open ? toggle(c.id) : undefined)}
              disabled={!open}
              accessibilityRole="button"
              accessibilityState={{ disabled: !open, selected: worn }}
              accessibilityLabel={open ? `${c.name}. ${worn ? 'Wearing. Tap to take off.' : 'Tap to wear.'}` : `${c.name}. Locked. ${c.hint}`}
              hitSlop={4}
            >
              <View style={[styles.item, { backgroundColor: plain ? theme.colors.surface : open ? 'rgba(14,10,60,0.78)' : 'rgba(14,10,60,0.5)', borderColor: worn ? '#FFD84D' : plain ? theme.colors.border : 'rgba(255,255,255,0.25)' }]}>
                <View style={styles.itemText}>
                  <Text style={[styles.name, { color: ink, opacity: open ? 1 : 0.7 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{c.name}</Text>
                  <Text style={[styles.status, { color: ink, opacity: open ? 0.95 : 0.7 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {open ? (worn ? '✓ Wearing it' : 'Tap to wear') : `🔒 ${c.hint}`}
                  </Text>
                </View>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.md, paddingBottom: SPACING.xl, gap: SPACING.sm },
  hero: { alignItems: 'center', gap: SPACING.sm, paddingBottom: SPACING.sm },
  say: { fontFamily: Fonts.black, fontSize: 20, textAlign: 'center' },
  item: { minHeight: MIN_CHILD_TARGET + 8, borderRadius: AdventureRadius.card, borderWidth: 2, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, justifyContent: 'center' },
  itemText: { gap: 2 },
  name: { fontFamily: Fonts.black, fontSize: 18 },
  status: { fontFamily: Fonts.bold, fontSize: 15 },
});
