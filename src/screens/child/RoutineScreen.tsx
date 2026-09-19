import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer, ScreenHeader, EmptyState, Icon } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { routinesRepo } from '@/database';
import { useActiveRoutine, useRoutineItems, useSizes, useSpeak } from '@/hooks';
import type { ChildTabScreenProps } from '@/navigation/types';
import type { RoutineItem } from '@/types/models';

/**
 * Visual schedule. Steps are listed top-to-bottom with an arrow between them.
 * The first unfinished step is highlighted as "Now". Tapping a step speaks its name and
 * ticks it off; tapping again un-ticks it. No gestures, no drag.
 */
export function RoutineScreen({ navigation }: ChildTabScreenProps<'Routine'>) {
  const sizes = useSizes();
  const { data: routine, loading } = useActiveRoutine();
  const { data: items } = useRoutineItems(routine?.id);
  const { speakPhrase } = useSpeak();

  const nowIndex = items.findIndex((i) => !i.isDone);

  const onPressItem = async (item: RoutineItem) => {
    speakPhrase(item.label);
    await routinesRepo.setItemDone(item.id, !item.isDone);
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title={routine?.name ?? 'My day'}
        rightIcon="lock"
        rightLabel="Parent"
        onRightPress={() => navigation.navigate('ParentPin')}
      />
      {!loading && items.length === 0 ? (
        <EmptyState icon="calendar-check" title="No routine yet" message="A parent can build the day in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: sizes.horizontalPadding }]}>
          {items.map((item, index) => {
            const isNow = index === nowIndex;
            return (
              <View key={item.id}>
                <Pressable
                  onPress={() => onPressItem(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label}${item.isDone ? ', done' : isNow ? ', now' : ''}`}
                  accessibilityState={{ checked: item.isDone }}
                  hitSlop={4}
                  style={({ pressed }) => [
                    styles.step,
                    { minHeight: Math.max(sizes.tileHeight * 0.7, 88) },
                    item.isDone && styles.stepDone,
                    isNow && styles.stepNow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.number}>
                    <Text style={styles.numberText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{index + 1}</Text>
                  </View>
                  <Icon name={item.icon} size={sizes.iconSize} color={Colors.text} />
                  <Text
                    style={[styles.label, { fontSize: sizes.tileLabel + 2 }, item.isDone && styles.labelDone]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                  <View style={[styles.check, item.isDone && styles.checkDone]}>
                    {item.isDone ? <Icon name="check-bold" size={30} color={Colors.textOnDark} /> : null}
                  </View>
                  {isNow ? (
                    <View style={styles.nowBadge}>
                      <Text style={styles.nowText} maxFontSizeMultiplier={MAX_FONT_SCALE}>NOW</Text>
                    </View>
                  ) : null}
                </Pressable>
                {index < items.length - 1 ? (
                  <View style={styles.arrow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    <Icon name="arrow-down-bold" size={30} color={Colors.textMuted} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: SPACING.md, paddingBottom: SPACING.xl },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: '#E9F1FF',
  },
  stepDone: { backgroundColor: '#E8E8E8', borderColor: '#9E9E9E' },
  stepNow: { backgroundColor: '#FFF3A8', borderColor: Colors.primaryDark, borderWidth: 5 },
  pressed: { opacity: 0.8 },
  number: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontSize: 20, fontWeight: '800', color: Colors.text },
  label: { flex: 1, fontWeight: '800', color: Colors.text },
  labelDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  check: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: Colors.success, borderColor: '#0F5E28' },
  nowBadge: {
    position: 'absolute',
    top: -12,
    left: 16,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nowText: { color: Colors.textOnDark, fontWeight: '800', fontSize: 14 },
  arrow: { alignItems: 'center', paddingVertical: 2 },
});
