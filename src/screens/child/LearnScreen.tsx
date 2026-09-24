import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChildScreen, Glyph, Icon, PressableScale } from '@/components/common';
import { SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useLearningConfigs, useLearningStats, useSizes, useSpeak } from '@/hooks';
import { LEARNING_SUBJECTS } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';
import { fitFontSize } from '@/utils/fitText';

/** Learn: pick a subject. Favourite subjects come first and carry a ⭐ so they are easy to find. */
export function LearnScreen({ navigation }: RootScreenProps<'Learn'>) {
  const sizes = useSizes();
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const { profile, displayName } = useProfile();
  const { speakFeedback } = useSpeak();
  const { data: configs } = useLearningConfigs();
  const { data: stats } = useLearningStats();

  // One label size for the whole board: the largest that fits every subject. Without a width
  // of its own a centred <Text> keeps its natural width and paints outside the card
  // ("Mathematics"), and adjustsFontSizeToFit has no constraint to shrink against.
  const columnPercent = Math.floor(100 / sizes.gridColumns) - 2;
  const tileInner = ((windowWidth - sizes.horizontalPadding * 2) * columnPercent) / 100 - SPACING.sm * 2;

  const isFav = (name: string) => profile.favorites.subjects.some((f) => name.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(name.toLowerCase()));
  const subjects = LEARNING_SUBJECTS
    .filter((s) => s.activities.some((a) => configs.get(a.key)?.isEnabled ?? true))
    .sort((a, b) => Number(isFav(b.name)) - Number(isFav(a.name)));

  const labelSize = subjects.reduce((min, s) => Math.min(min, fitFontSize(s.name, tileInner, sizes.tileLabel, 'word', 13)), sizes.tileLabel);

  return (
    <ChildScreen title="Learn" emoji={SECTION_EMOJI.learn}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <Text style={[styles.intro, { fontSize: sizes.body + 1, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          What do you want to practise, {displayName}?
        </Text>
        <View style={[styles.grid, { gap: sizes.gap }]}>
          {subjects.map((s) => {
            const st = stats.find((x) => x.subjectKey === s.key);
            const sessions = st?.sessions ?? 0;
            return (
              <PressableScale
                key={s.key}
                onPress={() => {
                  speakFeedback(s.name);
                  navigation.navigate('LearnSubject', { subjectKey: s.key });
                }}
                accessibilityRole="button"
                accessibilityLabel={`${s.name}${isFav(s.name) ? ', favourite' : ''}${sessions ? `, ${sessions} sessions played` : ''}`}
                hitSlop={4}
                style={{ width: `${columnPercent}%` }}
              >
                <View style={[styles.tile, theme.shadow, { height: Math.max(sizes.tileHeight, 130), backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.border : theme.colors.borderSoft, borderWidth: theme.highContrast ? theme.borderWidth : 1 }]}>
                  {isFav(s.name) ? <View style={styles.fav}><Icon name="star" size={22} color="#E0A800" /></View> : null}
                  <Glyph value={s.emoji} size={Math.round(sizes.iconSize + 16)} />
                  <Text
                    style={[styles.label, { fontSize: labelSize, lineHeight: Math.round(labelSize * 1.18), color: theme.colors.text }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                    numberOfLines={2}
                    textBreakStrategy="simple"
                  >
                    {s.name}
                  </Text>
                  {sessions > 0 ? (
                    <Text style={[styles.meta, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {sessions} played
                    </Text>
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
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  intro: { fontFamily: Fonts.bold, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  tile: { borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, padding: SPACING.sm, overflow: 'hidden' },
  fav: { position: 'absolute', top: 10, right: 12, fontSize: 20 },
  emoji: { lineHeight: 80 },
  // alignSelf stretch is what keeps a long subject name inside its own card.
  label: { fontFamily: Fonts.extrabold, textAlign: 'center', alignSelf: 'stretch' },
  meta: { fontFamily: Fonts.bold, fontSize: 14 },
});
