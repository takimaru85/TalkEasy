import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChildScreen, EmptyState, Glyph, Icon, PressableScale } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useLearningBest, useLearningConfigs, useSizes, useSpeak } from '@/hooks';
import { getSubject } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';

function stars(best: number | undefined): string {
  if (best === undefined) return '';
  if (best >= 0.99) return '⭐⭐⭐';
  if (best >= 0.66) return '⭐⭐';
  if (best >= 0.34) return '⭐';
  return '';
}

/** Activities inside one subject, as big cards. Stars show the best result so far. */
export function LearnSubjectScreen({ navigation, route }: RootScreenProps<'LearnSubject'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const subject = getSubject(route.params.subjectKey);
  const { data: configs } = useLearningConfigs();
  const { data: best } = useLearningBest();
  const { speakFeedback } = useSpeak();

  if (!subject) return <ChildScreen title="Learn" back />;
  const activities = subject.activities.filter((a) => configs.get(a.key)?.isEnabled ?? true);

  return (
    <ChildScreen title={subject.name} emoji={subject.emoji} back>
      {activities.length === 0 ? (
        <EmptyState icon="book-open-variant" title="Nothing to practise yet" message="A parent can turn activities on in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
          {activities.map((a) => (
            <PressableScale
              key={a.key}
              onPress={() => {
                speakFeedback(a.title);
                navigation.navigate('LearnActivity', { activityKey: a.key });
              }}
              accessibilityRole="button"
              accessibilityLabel={`${a.title}. ${a.description}${best.get(a.key) !== undefined ? `. Best ${Math.round((best.get(a.key) ?? 0) * 100)} percent` : ''}`}
              hitSlop={4}
            >
              <View style={[styles.row, theme.shadow, { minHeight: Math.max(sizes.tileHeight * 0.62, 90), backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.border : theme.colors.borderSoft, borderWidth: theme.highContrast ? theme.borderWidth : 1 }]}>
                <Glyph value={a.emoji} size={60} />
                <View style={styles.text}>
                  <Text style={[styles.title, { fontSize: sizes.tileLabel + 1, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{a.title}</Text>
                  <Text style={[styles.desc, { fontSize: sizes.body - 3, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{a.description}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.stars} allowFontScaling={false}>{stars(best.get(a.key))}</Text>
                  <View style={[styles.play, { backgroundColor: theme.colors.primary }]}>
                    <Icon name="play" size={26} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </PressableScale>
          ))}
        </ScrollView>
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: Radius.lg },
  disc: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  emoji: { lineHeight: 52 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.extrabold },
  desc: { fontFamily: Fonts.semibold },
  right: { alignItems: 'center', gap: 4 },
  stars: { fontSize: 14, minHeight: 18 },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  playText: { color: '#FFFFFF', fontSize: 18, marginLeft: 3 },
});
