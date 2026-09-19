import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/common';
import { Colors } from '@/constants/colors';
import { SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';

type SectionScreen = 'Communicate' | 'School' | 'Assignments' | 'Learn' | 'MyDay' | 'Activities' | 'Favorites' | 'ParentPin';

type Section = {
  screen: SectionScreen;
  label: string;
  emoji: string;
  color: string;
};

const SECTIONS: Section[] = [
  { screen: 'Communicate', label: 'Talk', emoji: SECTION_EMOJI.communicate, color: '#BFE0FF' },
  { screen: 'School', label: 'School', emoji: SECTION_EMOJI.school, color: '#C4F2C8' },
  { screen: 'Assignments', label: 'Assignments', emoji: SECTION_EMOJI.assignments, color: '#FFF3A8' },
  { screen: 'Learn', label: 'Learn', emoji: SECTION_EMOJI.learn, color: '#DED0FF' },
  { screen: 'MyDay', label: 'My Day', emoji: SECTION_EMOJI.myday, color: '#FFD9B0' },
  { screen: 'Activities', label: 'Activities', emoji: SECTION_EMOJI.activities, color: '#BDF0EA' },
  { screen: 'Favorites', label: 'Favorites', emoji: SECTION_EMOJI.favorites, color: '#FFC9DC' },
  { screen: 'ParentPin', label: 'Parent', emoji: SECTION_EMOJI.parent, color: '#E4E4E4' },
];

/**
 * The child's home: one wide School Mode button and a 2-column grid of the eight sections.
 * Positions never change. Everything is a single tap.
 */
export function ChildHomeScreen({ navigation }: RootScreenProps<'ChildHome'>) {
  const sizes = useSizes();
  const tileHeight = Math.max(sizes.tileHeight, 130);

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
        <Text style={[styles.title, { fontSize: sizes.heading + 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
          TalkEasy
        </Text>

        <Pressable
          onPress={() => navigation.navigate('SchoolMode')}
          accessibilityRole="button"
          accessibilityLabel="School Mode"
          hitSlop={4}
          style={({ pressed }) => [styles.schoolMode, pressed && styles.pressed]}
        >
          <Text style={styles.schoolModeEmoji} allowFontScaling={false}>{SECTION_EMOJI.schoolMode}</Text>
          <Text style={[styles.schoolModeText, { fontSize: sizes.tileLabel + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            School Mode
          </Text>
        </Pressable>

        <View style={[styles.grid, { gap: sizes.gap }]}>
          {SECTIONS.map((s) => (
            <Pressable
              key={s.screen}
              onPress={() => navigation.navigate(s.screen)}
              accessibilityRole="button"
              accessibilityLabel={s.label}
              hitSlop={4}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: s.color, height: tileHeight, width: '48%' },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.emoji, { fontSize: sizes.iconSize }]} allowFontScaling={false}>{s.emoji}</Text>
              <Text style={[styles.label, { fontSize: sizes.tileLabel }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.md, paddingBottom: SPACING.xl, gap: SPACING.md },
  title: { fontWeight: '900', color: Colors.primaryDark, textAlign: 'center' },
  schoolMode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    minHeight: 88,
    borderRadius: RADIUS.tile,
    borderWidth: 4,
    borderColor: Colors.primaryDark,
    backgroundColor: '#FFF7CC',
  },
  schoolModeEmoji: { fontSize: 40, lineHeight: 48 },
  schoolModeText: { fontWeight: '900', color: Colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  emoji: { lineHeight: 80 },
  label: { fontWeight: '800', color: Colors.text, textAlign: 'center' },
});
