import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChildScreen, EmptyState } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useLearningBest, useLearningConfigs, useSizes, useSpeak } from '@/hooks';
import { getSubject } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';

function stars(best: number | undefined): string {
  if (best === undefined) return '';
  if (best >= 0.99) return '⭐⭐⭐';
  if (best >= 0.66) return '⭐⭐';
  if (best >= 0.34) return '⭐';
  return '';
}

/** Activities inside one subject, as big rows. Stars show the best result so far. */
export function LearnSubjectScreen({ navigation, route }: RootScreenProps<'LearnSubject'>) {
  const sizes = useSizes();
  const subject = getSubject(route.params.subjectKey);
  const { data: configs } = useLearningConfigs();
  const { data: best } = useLearningBest();
  const { speakPhrase } = useSpeak();

  if (!subject) return <ChildScreen title="Learn" back />;
  const activities = subject.activities.filter((a) => configs.get(a.key)?.isEnabled ?? true);

  return (
    <ChildScreen title={`${subject.emoji} ${subject.name}`} back>
      {activities.length === 0 ? (
        <EmptyState icon="book-open-variant" title="Nothing to practise yet" message="A parent can turn activities on in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
          {activities.map((a) => (
            <Pressable
              key={a.key}
              onPress={() => {
                speakPhrase(a.title);
                navigation.navigate('LearnActivity', { activityKey: a.key });
              }}
              accessibilityRole="button"
              accessibilityLabel={`${a.title}. ${a.description}`}
              hitSlop={4}
              style={({ pressed }) => [styles.row, { backgroundColor: subject.color, minHeight: Math.max(sizes.tileHeight * 0.6, 88) }, pressed && styles.pressed]}
            >
              <Text style={[styles.emoji, { fontSize: sizes.iconSize - 8 }]} allowFontScaling={false}>{a.emoji}</Text>
              <View style={styles.text}>
                <Text style={[styles.title, { fontSize: sizes.tileLabel + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{a.title}</Text>
                <Text style={[styles.desc, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{a.description}</Text>
              </View>
              <Text style={styles.stars} allowFontScaling={false}>{stars(best.get(a.key))}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  pressed: { opacity: 0.8 },
  emoji: { lineHeight: 64, width: 64, textAlign: 'center' },
  text: { flex: 1, gap: 2 },
  title: { fontWeight: '800', color: Colors.text },
  desc: { color: Colors.textMuted, fontWeight: '600' },
  stars: { fontSize: 18, width: 66, textAlign: 'right' },
});
