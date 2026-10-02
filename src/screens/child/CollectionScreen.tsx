import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChildScreen, Icon, PressableScale } from '@/components/common';
import { GameButton } from '@/components/adventure/GameButton';
import { GradientSurface } from '@/components/adventure/GradientSurface';
import { WorldArt } from '@/components/adventure/WorldArt';
import type { CollectedItem, CollectionMetrics } from '@/adventure/worlds';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useAdventureWorld, useCollection, useSizes, useSpeak } from '@/hooks';
import { useI18n } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { Adventure, AdventureRadius, AdventureShadow, Fonts, shade, useTheme } from '@/theme';

/**
 * My Collection — the prizes of the child's adventure world, found by practising.
 *
 * A found prize is shown big and bright (tap to hear its name). One still to find is a faded ghost
 * with what to do in plain words ("Say BA, BE, BI, BO and BU."), and tapping it goes straight to
 * that activity: the collection is a way INTO learning, not a shop.
 */
export function CollectionScreen({ navigation }: RootScreenProps<'Collection'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const { speakFeedback } = useSpeak();
  const { childChooses } = useAdventureWorld();
  const { world, items, found } = useCollection();
  const c = Adventure[world.color];

  /** Where each milestone is earned. */
  const goTo = (metric: keyof CollectionMetrics) => {
    switch (metric) {
      case 'speechPractice':
        return navigation.navigate('SpeechPractice');
      case 'baRowSyllables':
        return navigation.navigate('SpeechActivity', { activityId: 'syllables', category: 'b' });
      case 'tracingSessions':
        return navigation.navigate('WritingPractice');
      case 'missionDays':
        return navigation.navigate('SoundPractice');
      case 'talkTaps':
        return navigation.navigate('Communicate');
    }
  };

  const onItem = (item: CollectedItem) => {
    if (item.found) speakFeedback(item.name);
    else goTo(item.milestone.metric);
  };

  return (
    <ChildScreen title={t('advMyCollection')} subtitle={t('advMyCollectionSub')} emoji="🏆" art="progress" back>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        {/* The world banner: emblem, collection name, how many found. */}
        <View style={[styles.banner, theme.night ? [AdventureShadow, { backgroundColor: c.to, borderColor: shade(c.from, 1.3), borderBottomColor: shade(c.to, 0.66) }] : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {theme.night ? (
            <>
              <GradientSurface from={c.from} to={c.to} direction="vertical" />
              {/* Gloss: fades out 45% of the way down (a full-size surface — see GradientSurface). */}
              <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.3} toOpacity={0} toOffset={0.45} />
            </>
          ) : null}
          <View style={styles.bannerRow}>
            <WorldArt name={world.emblem} size={84} />
            <View style={styles.bannerText}>
              <Text style={[styles.bannerTitle, { fontSize: sizes.tileLabel + 1, color: theme.night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                {world.collectionName}
              </Text>
              <Text style={[styles.bannerSub, { color: theme.night ? 'rgba(255,255,255,0.92)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('advFoundOf', { n: found, total: items.length })}
              </Text>
              <View
                style={[styles.track, { backgroundColor: theme.night ? 'rgba(0,0,0,0.25)' : theme.colors.surfaceAlt }]}
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: items.length, now: found }}
              >
                <View style={[styles.fill, { width: `${Math.max(4, Math.round((found / items.length) * 100))}%` }]} />
              </View>
            </View>
          </View>
          {childChooses && theme.night ? (
            <GameButton label={t('advChangeWorld')} icon="earth" tone="slate" height={MIN_CHILD_TARGET - 4} onPress={() => navigation.navigate('ChooseAdventure')} />
          ) : null}
        </View>

        {items.map((item) => (
          <PressableScale
            key={item.id}
            onPress={() => onItem(item)}
            accessibilityRole="button"
            accessibilityLabel={item.found ? `${item.name}. ${t('advFound')}` : `${item.name}. ${t('advToFind')}: ${item.milestone.hint}`}
            hitSlop={4}
          >
            <View
              style={[
                styles.item,
                item.found
                  ? theme.night
                    ? [AdventureShadow, { backgroundColor: '#27336F', borderColor: '#FFE27A', borderBottomColor: '#C99A0A' }]
                    : { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }
                  : { backgroundColor: theme.night ? '#161F4E' : theme.colors.surfaceAlt, borderColor: theme.night ? '#3A4A96' : theme.colors.border, borderBottomColor: theme.night ? '#0E1538' : theme.colors.border },
              ]}
            >
              <View style={styles.art}>
                <WorldArt name={item.art} size={72} locked={!item.found} />
                {!item.found ? (
                  <View style={styles.question}>
                    <Text style={styles.questionText} allowFontScaling={false}>?</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.itemText}>
                <Text style={[styles.itemName, { fontSize: sizes.tileLabel - 1, color: item.found ? theme.colors.text : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.found ? (
                  <View style={styles.foundRow}>
                    <Icon name="star" size={18} color="#FFD84D" />
                    <Text style={[styles.foundText, { color: theme.night ? '#FFE27A' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {t('advFound')}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={[styles.hint, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                      {item.milestone.hint}
                    </Text>
                    <View style={styles.whereRow}>
                      <Icon name={item.milestone.icon} size={15} color={theme.colors.textMuted} />
                      <Text style={[styles.where, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                        {item.milestone.activity}
                        {item.milestone.target > 1 ? `  ·  ${item.current} / ${item.milestone.target}` : ''}
                      </Text>
                    </View>
                  </>
                )}
              </View>
              {item.found ? null : (
                <View style={[styles.go, { backgroundColor: theme.night ? '#27336F' : theme.colors.primary }]}>
                  <Icon name="play" size={22} color="#FFFFFF" />
                </View>
              )}
            </View>
          </PressableScale>
        ))}
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.sm + 2, paddingBottom: SPACING.xl },
  banner: { borderRadius: AdventureRadius.hero, borderWidth: 1.5, borderBottomWidth: 6, padding: SPACING.md, gap: SPACING.md, overflow: 'hidden', marginBottom: SPACING.xs },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  bannerText: { flex: 1, gap: 4 },
  bannerTitle: { fontFamily: Fonts.black, textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 2 },
  bannerSub: { fontFamily: Fonts.bold, fontSize: 15 },
  track: { height: 12, borderRadius: 999, overflow: 'hidden', marginTop: 2 },
  fill: { height: '100%', borderRadius: 999, backgroundColor: '#FFD84D' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: MIN_CHILD_TARGET + 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: AdventureRadius.card,
    borderWidth: 2,
    borderBottomWidth: 4.5,
  },
  art: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  question: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  questionText: { fontFamily: Fonts.black, fontSize: 18, color: '#3A4A96' },
  itemText: { flex: 1, gap: 2 },
  itemName: { fontFamily: Fonts.black },
  foundRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  foundText: { fontFamily: Fonts.black, fontSize: 15 },
  hint: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 20 },
  whereRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  where: { fontFamily: Fonts.bold, fontSize: 13 },
  go: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
});
