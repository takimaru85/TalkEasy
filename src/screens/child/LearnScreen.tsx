import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChildScreen, PressableScale } from '@/components/common';
import { SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useLearningConfigs, useLearningStats, useSizes, useSpeak } from '@/hooks';
import { LEARNING_SUBJECTS } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';

/** Learn: pick a subject. Favourite subjects come first and carry a ⭐ so they are easy to find. */
export function LearnScreen({ navigation }: RootScreenProps<'Learn'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { profile, displayName } = useProfile();
  const { speakFeedback } = useSpeak();
  const { data: configs } = useLearningConfigs();
  const { data: stats } = useLearningStats();

  const isFav = (name: string) => profile.favorites.subjects.some((f) => name.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(name.toLowerCase()));
  const subjects = LEARNING_SUBJECTS
    .filter((s) => s.activities.some((a) => configs.get(a.key)?.isEnabled ?? true))
    .sort((a, b) => Number(isFav(b.name)) - Number(isFav(a.name)));

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
                style={{ width: `${Math.floor(100 / sizes.gridColumns) - 2}%` }}
              >
                <View style={[styles.tile, theme.shadow, { height: Math.max(sizes.tileHeight, 130), backgroundColor: theme.tint(s.color), borderColor: theme.highContrast ? theme.colors.border : 'transparent', borderWidth: theme.highContrast ? theme.borderWidth : 0 }]}>
                  {isFav(s.name) ? <Text style={styles.fav} allowFontScaling={false}>⭐</Text> : null}
                  <Text style={[styles.emoji, { fontSize: sizes.iconSize }]} allowFontScaling={false}>{s.emoji}</Text>
                  <Text style={[styles.label, { fontSize: sizes.tileLabel, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
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
  tile: { borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, padding: SPACING.sm },
  fav: { position: 'absolute', top: 10, right: 12, fontSize: 20 },
  emoji: { lineHeight: 80 },
  label: { fontFamily: Fonts.extrabold, textAlign: 'center' },
  meta: { fontFamily: Fonts.bold, fontSize: 14 },
});
