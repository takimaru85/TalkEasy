import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ScreenContainer, ScreenHeader, EmptyState, Icon } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { exercisesRepo } from '@/database';
import { useExercises, useSizes, useSpeak } from '@/hooks';
import type { ChildTabScreenProps } from '@/navigation/types';
import type { Exercise } from '@/types/models';

/**
 * Therapy / exercise cards. Tapping a card opens it (large instructions + "Done" button);
 * everything is a plain tap. The parent creates and edits cards in Parent Mode.
 */
export function ActivitiesScreen({ navigation }: ChildTabScreenProps<'Activities'>) {
  const sizes = useSizes();
  const { data: exercises, loading } = useExercises();
  const { speakPhrase } = useSpeak();
  const [openId, setOpenId] = useState<number | null>(null);

  const open = exercises.find((e) => e.id === openId) ?? null;

  const openCard = (ex: Exercise) => {
    setOpenId(ex.id);
    speakPhrase(ex.name);
  };

  const markDone = async (ex: Exercise) => {
    await exercisesRepo.setCompleted(ex.id, !ex.isCompleted);
    speakPhrase(ex.isCompleted ? ex.name : 'Well done!');
    setOpenId(null);
  };

  if (open) {
    return (
      <ScreenContainer>
        <ScreenHeader title={open.name} onBack={() => setOpenId(null)} />
        <ScrollView contentContainerStyle={[styles.detail, { paddingHorizontal: sizes.horizontalPadding }]}>
          <View style={styles.detailIcon}>
            <Icon name={open.icon} size={sizes.iconSize + 40} color={Colors.text} />
          </View>
          {open.durationMinutes > 0 ? (
            <View style={styles.durationRow}>
              <Icon name="clock-outline" size={30} color={Colors.text} />
              <Text style={[styles.duration, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {open.durationMinutes} minutes
              </Text>
            </View>
          ) : null}
          <Text style={[styles.instructions, { fontSize: sizes.body + 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {open.instructions || 'No instructions yet.'}
          </Text>
          <BigButton
            label="Read it to me"
            icon="volume-high"
            variant="secondary"
            onPress={() => speakPhrase(`${open.name}. ${open.instructions}`)}
            minHeight={80}
          />
          <BigButton
            label={open.isCompleted ? 'Not done yet' : 'Done!'}
            icon={open.isCompleted ? 'close' : 'check-bold'}
            variant={open.isCompleted ? 'secondary' : 'success'}
            onPress={() => markDone(open)}
            minHeight={96}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Activities"
        rightIcon="lock"
        rightLabel="Parent"
        onRightPress={() => navigation.navigate('ParentPin')}
      />
      {!loading && exercises.length === 0 ? (
        <EmptyState icon="dumbbell" title="No activities yet" message="A parent can add activities in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: sizes.horizontalPadding }]}>
          {exercises.map((ex) => (
            <Pressable
              key={ex.id}
              onPress={() => openCard(ex)}
              accessibilityRole="button"
              accessibilityLabel={`${ex.name}${ex.isCompleted ? ', done' : ''}`}
              hitSlop={4}
              style={({ pressed }) => [
                styles.card,
                { minHeight: Math.max(sizes.tileHeight * 0.75, 96) },
                ex.isCompleted && styles.cardDone,
                pressed && styles.pressed,
              ]}
            >
              <Icon name={ex.icon} size={sizes.iconSize} color={Colors.text} />
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { fontSize: sizes.tileLabel + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                  {ex.name}
                </Text>
                {ex.durationMinutes > 0 ? (
                  <Text style={[styles.cardMeta, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {ex.durationMinutes} min
                  </Text>
                ) : null}
              </View>
              <View style={[styles.check, ex.isCompleted && styles.checkDone]}>
                {ex.isCompleted ? <Icon name="check-bold" size={30} color={Colors.textOnDark} /> : null}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: '#E6F7EE',
  },
  cardDone: { backgroundColor: '#E8E8E8', borderColor: '#9E9E9E' },
  pressed: { opacity: 0.8 },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontWeight: '800', color: Colors.text },
  cardMeta: { color: Colors.textMuted, fontWeight: '600' },
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
  detail: { paddingVertical: SPACING.md, gap: SPACING.lg, paddingBottom: SPACING.xl },
  detailIcon: { alignItems: 'center', paddingVertical: SPACING.md },
  durationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  duration: { fontWeight: '700', color: Colors.text },
  instructions: { color: Colors.text, lineHeight: 34, textAlign: 'center' },
});
