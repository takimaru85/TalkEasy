import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChildScreen } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useLearningConfigs, useSizes, useSpeak } from '@/hooks';
import { LEARNING_SUBJECTS } from '@/learning';
import type { RootScreenProps } from '@/navigation/types';

/** Learn: pick a subject. Big emoji tiles, 2 columns. */
export function LearnScreen({ navigation }: RootScreenProps<'Learn'>) {
  const sizes = useSizes();
  const { speakPhrase } = useSpeak();
  const { data: configs } = useLearningConfigs();

  const subjects = LEARNING_SUBJECTS.filter((s) => s.activities.some((a) => configs.get(a.key)?.isEnabled ?? true));

  return (
    <ChildScreen title="Learn">
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <Text style={[styles.intro, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Pick a subject to practise.
        </Text>
        <View style={[styles.grid, { gap: sizes.gap }]}>
          {subjects.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => {
                speakPhrase(s.name);
                navigation.navigate('LearnSubject', { subjectKey: s.key });
              }}
              accessibilityRole="button"
              accessibilityLabel={s.name}
              hitSlop={4}
              style={({ pressed }) => [styles.tile, { backgroundColor: s.color, height: Math.max(sizes.tileHeight, 130) }, pressed && styles.pressed]}
            >
              <Text style={[styles.emoji, { fontSize: sizes.iconSize }]} allowFontScaling={false}>{s.emoji}</Text>
              <Text style={[styles.label, { fontSize: sizes.tileLabel }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
                {s.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  intro: { color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    width: '48%',
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  pressed: { opacity: 0.8 },
  emoji: { lineHeight: 80 },
  label: { fontWeight: '800', color: Colors.text, textAlign: 'center' },
});
