import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChildScreen, Icon, PressableScale } from '@/components/common';
import { GradientSurface } from '@/components/adventure/GradientSurface';
import { CosmeticThumb, SpacePet } from '@/components/adventure/SpacePet';
import { COSMETICS } from '@/adventure/pet';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, MIN_SUPPORTED_WIDTH, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks';
import { usePetReaction, usePetWardrobe } from '@/hooks/usePet';
import { useAdventureMap } from '@/hooks/useTodayAdventure';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import { AdventureRadius } from '@/theme/adventure';

const THUMB = 64;
const STATION = require('../../../assets/backgrounds/pet-station.webp');

/**
 * Dress up the Space Pet. Cosmetics are earned by real practice (adventure/pet.ts) and can be put on
 * or taken off freely; a locked one just says how to earn it. Nothing is bought, nothing expires and
 * nothing is ever taken away for being away.
 *
 * Layout: the pet stands on a glowing space-station pad with a speech pill under it; each accessory is a
 * card with its own picture, a status pill ("Wearing it" in green) and a round arrow button, and the ones
 * being worn get a gold glowing rim.
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
  const { width } = useWindowDimensions();
  // Floored: the window reports 0 on the first frame (see MIN_SUPPORTED_WIDTH).
  const stageW = Math.min(Math.max(MIN_SUPPORTED_WIDTH, width) - sizes.horizontalPadding * 2, 600);
  const stageH = Math.round(stageW * 0.72);

  return (
    <ChildScreen title={t('petTitle')} subtitle={t('petSub')} emoji="🤖">
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {/* The supplied purple space-station scene (cleaned of the mockup's robot and text), the pet standing on its pad. */}
          <View style={[styles.stage, { width: stageW, height: stageH }]}>
            {plain ? null : <Image source={STATION} resizeMode="cover" style={{ position: 'absolute', left: 0, top: 0, width: stageW - 4, height: stageH - 4 }} accessibilityIgnoresInvertColors />}
            <View style={[styles.petOnPad, { bottom: stageH * 0.06 }]}>
              <SpacePet size={Math.round(stageH * 0.78)} mood={pet.mood} equipped={equipped} burst={pet.burst} />
            </View>
          </View>
          <View style={[styles.say, plain && { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {plain ? null : <GradientSurface from="#4D5BFF" to="#2B2F9E" direction="vertical" />}
            <Text style={[styles.sayText, { color: ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>⭐ {pet.message}</Text>
          </View>
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
              <View
                style={[
                  styles.item,
                  { backgroundColor: plain ? theme.colors.surface : open ? 'rgba(18,22,92,0.9)' : 'rgba(18,22,92,0.55)', borderColor: worn ? '#FFD84D' : plain ? theme.colors.border : 'rgba(140,160,255,0.45)' },
                  worn && styles.worn,
                ]}
              >
                <View style={[styles.thumb, { opacity: open ? 1 : 0.55 }]}>
                  <GradientSurface from="#7CC4FF" to="#3C8CF0" direction="vertical" />
                  {/* In a View: on the web a bare svg paints under the absolute gradient. */}
                  <View><CosmeticThumb id={c.id} slot={c.slot} size={THUMB - 10} /></View>
                </View>
                <View style={styles.itemText}>
                  <Text style={[styles.name, { color: ink, opacity: open ? 1 : 0.75 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{c.name}</Text>
                  {worn ? (
                    <View style={styles.wearPill}>
                      <View style={styles.tick}>
                        <Icon name="check-bold" size={11} color="#FFFFFF" />
                      </View>
                      <Text style={styles.wearText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Wearing it</Text>
                    </View>
                  ) : (
                    <Text style={[styles.status, { color: ink, opacity: open ? 0.9 : 0.7 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                      {open ? 'Tap to wear' : `🔒 ${c.hint}`}
                    </Text>
                  )}
                </View>
                <View style={[styles.go, !open && styles.goLocked]}>
                  <Icon name={open ? 'chevron-right' : 'lock'} size={22} color="#FFFFFF" />
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
  stage: { borderRadius: AdventureRadius.card, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(160,180,255,0.5)', backgroundColor: '#1B2478' },
  petOnPad: { position: 'absolute', alignSelf: 'center' },
  say: { overflow: 'hidden', borderRadius: 999, borderWidth: 2, borderColor: '#9FB0FF', paddingHorizontal: SPACING.lg, paddingVertical: 8, minHeight: 44, justifyContent: 'center', backgroundColor: '#3340C8' },
  sayText: { fontFamily: Fonts.black, fontSize: 18, textAlign: 'center' },
  item: { minHeight: MIN_CHILD_TARGET + 20, borderRadius: AdventureRadius.card, borderWidth: 2, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  worn: { borderWidth: 3, shadowColor: '#FFD84D', shadowOpacity: 0.7, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  thumb: { width: THUMB + 20, height: THUMB, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
  itemText: { flex: 1, gap: 4 },
  name: { fontFamily: Fonts.black, fontSize: 19 },
  status: { fontFamily: Fonts.bold, fontSize: 15 },
  wearPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(63,180,110,0.28)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  tick: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#3FB46E', alignItems: 'center', justifyContent: 'center' },
  wearText: { fontFamily: Fonts.black, fontSize: 15, color: '#C9FFE0' },
  go: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3D7BFF', borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  goLocked: { backgroundColor: 'rgba(120,130,190,0.6)' },
});
