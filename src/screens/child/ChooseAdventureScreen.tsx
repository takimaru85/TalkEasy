import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChildScreen, Icon, PressableScale } from '@/components/common';
import { GradientSurface } from '@/components/adventure/GradientSurface';
import { WorldArt } from '@/components/adventure/WorldArt';
import { WORLDS, WORLD_IDS, WORLD_UNLOCK_ITEMS, isWorldUnlocked, type WorldId } from '@/adventure/worlds';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useAdventureWorld, useSizes, useSpeak } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { Adventure, AdventureRadius, AdventureShadow, Fonts, shade, useTheme } from '@/theme';
import { fitFontSize } from '@/utils/fitText';

/**
 * Choose Your Adventure: four big world cards. Picking one only changes the scenery and the
 * collection — every activity stays where it was. When a grown-up has fixed the world in Parent
 * Mode, the cards are shown but the choice is theirs, and the screen says so.
 */
export function ChooseAdventureScreen({ navigation }: RootScreenProps<'ChooseAdventure'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const { world, childChooses, unchosen, owned, chooseWorld } = useAdventureWorld();
  const { speakFeedback } = useSpeak();

  const contentWidth = width - sizes.horizontalPadding * 2;
  // Two by two on a phone; one row of four on a wide tablet.
  const columns = contentWidth >= 720 ? 4 : 2;
  const cardWidth = (contentWidth - SPACING.md * (columns - 1)) / columns;
  const art = Math.round(Math.min(112, cardWidth * 0.62));
  const nameSize = WORLD_IDS.reduce((min, id) => Math.min(min, fitFontSize(WORLDS[id].name.toUpperCase(), cardWidth - SPACING.md * 2, 20, 'line', 14)), 20);

  const pick = async (id: WorldId) => {
    if (!isWorldUnlocked(id, owned)) {
      // Worlds other than Space are bought as themes: take them to the Shop. Vehicles has nothing to buy yet.
      if (WORLD_UNLOCK_ITEMS[id].length) navigation.navigate('RewardsShop');
      return;
    }
    if (!childChooses) return;
    await chooseWorld(id);
    speakFeedback(t('advWorldBegins', { world: WORLDS[id].name }));
    navigation.goBack();
  };

  return (
    <ChildScreen title={t('advChooseTitle')} subtitle={t('advChooseTitleSub')} emoji="🚀" art="mission" back>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <View style={styles.intro}>
          <Text style={[styles.question, { fontSize: sizes.heading, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
            {t('advChooseQuestion')}
          </Text>
          <Text style={[styles.sub, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {childChooses ? t('advChooseSub') : t('advWorldPicked')}
          </Text>
        </View>

        <View style={[styles.grid, { gap: SPACING.md }]}>
          {WORLD_IDS.map((id) => {
            const w = WORLDS[id];
            const c = Adventure[w.color];
            const current = !unchosen && world.id === id;
            const locked = !isWorldUnlocked(id, owned);
            const soon = locked && WORLD_UNLOCK_ITEMS[id].length === 0;
            const disabled = (!childChooses && !current) || soon;
            return (
              <PressableScale
                key={id}
                onPress={() => pick(id)}
                accessibilityRole="button"
                accessibilityLabel={`${w.name}. ${w.tagline}${current ? `. ${t('advYourWorld')}` : ''}${locked ? `. ${soon ? t('advWorldSoon') : t('advWorldLocked')}` : ''}`}
                accessibilityState={{ selected: current, disabled: soon || (!locked && !childChooses) }}
                hitSlop={4}
                style={{ width: cardWidth }}
              >
                <View
                  style={[
                    styles.card,
                    theme.night
                      ? [AdventureShadow, { backgroundColor: c.to, borderColor: shade(c.from, 1.3), borderBottomColor: shade(c.to, 0.66) }]
                      : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    current && styles.cardCurrent,
                    disabled && styles.cardDisabled,
                  ]}
                >
                  {theme.night ? (
                    <>
                      <GradientSurface from={c.from} to={c.to} direction="vertical" />
                      {/* Gloss: fades out 50% of the way down (a full-size surface — see GradientSurface). */}
                      <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.32} toOpacity={0} toOffset={0.5} />
                    </>
                  ) : null}
                  <WorldArt name={w.emblem} size={art} />
                  <Text style={[styles.name, { fontSize: nameSize, color: theme.night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                    {w.name.toUpperCase()}
                  </Text>
                  <Text style={[styles.tagline, { color: theme.night ? 'rgba(255,255,255,0.92)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                    {w.tagline}
                  </Text>
                  {locked ? (
                    <View style={styles.badge}>
                      <Icon name="lock" size={14} color="#5A3A00" />
                      <Text style={styles.badgeText} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                        {soon ? t('advWorldSoon') : t('advWorldLocked')}
                      </Text>
                    </View>
                  ) : null}
                  {current ? (
                    <View style={styles.badge}>
                      <Icon name="check-bold" size={14} color="#5A3A00" />
                      <Text style={styles.badgeText} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                        {t('advYourWorld')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.lg, paddingBottom: SPACING.xl },
  intro: { alignItems: 'center', gap: 4 },
  question: { fontFamily: Fonts.black, textAlign: 'center' },
  sub: { fontFamily: Fonts.bold, fontSize: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    minHeight: 210,
    borderRadius: AdventureRadius.card,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  // The world in use: a gold rim and a "Your adventure" tag — shape and words, not colour alone.
  cardCurrent: { borderWidth: 3.5, borderBottomWidth: 6, borderColor: '#FFE27A', borderBottomColor: '#FFD84D' },
  cardDisabled: { opacity: 0.55 },
  name: { fontFamily: Fonts.black, letterSpacing: 0.8, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 2 },
  tagline: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 18, textAlign: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: '#FFD84D', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontFamily: Fonts.black, fontSize: 12, color: '#5A3A00' },
});
