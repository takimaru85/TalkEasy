import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, ChildScreen, EmptyState, Icon } from '@/components/common';
import { Colors } from '@/constants/colors';
import { FREQUENCY_META } from '@/constants/school';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { therapyRepo } from '@/database';
import { useSizes, useSpeak, useTherapyActivities } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import type { TherapyActivity } from '@/types/models';
import { confirm } from '@/utils/confirm';

/**
 * Therapy / activity cards. Tapping a card opens it (picture, instructions, duration,
 * "Read it to me", "Done!"). The parent creates and edits cards in Parent Mode.
 * This is an organiser for activities given by the child's caregivers/professionals — nothing here
 * is medical advice.
 */
export function ActivitiesScreen(_props: RootScreenProps<'Activities'>) {
  const sizes = useSizes();
  const { settings } = useSettings();
  const { data: activities, loading } = useTherapyActivities();
  const { speakPhrase } = useSpeak();
  const [openId, setOpenId] = useState<number | null>(null);

  const open = activities.find((e) => e.id === openId) ?? null;

  const openCard = (ex: TherapyActivity) => {
    setOpenId(ex.id);
    speakPhrase(ex.name);
  };

  const toggleDone = async (ex: TherapyActivity) => {
    if (!ex.isCompleted && settings.confirmComplete) {
      const ok = await confirm('Finished?', `Mark "${ex.name}" as done?`, 'Yes, done');
      if (!ok) return;
    }
    await therapyRepo.setCompleted(ex.id, !ex.isCompleted);
    speakPhrase(ex.isCompleted ? ex.name : 'Well done!');
    setOpenId(null);
  };

  if (open) {
    return (
      <ChildScreen title={open.name} back>
        <ScrollView contentContainerStyle={[styles.detail, { paddingHorizontal: sizes.horizontalPadding }]}>
          <View style={styles.detailIcon}>
            {open.imageUri ? (
              <Image source={{ uri: open.imageUri }} style={styles.image} accessibilityIgnoresInvertColors accessibilityLabel={open.name} />
            ) : (
              <Icon name={open.icon} size={sizes.iconSize + 40} color={Colors.text} />
            )}
          </View>
          <View style={styles.metaRow}>
            {open.durationMinutes > 0 ? (
              <View style={styles.metaChip}>
                <Icon name="clock-outline" size={28} color={Colors.text} />
                <Text style={[styles.meta, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {open.durationMinutes} min
                </Text>
              </View>
            ) : null}
            <View style={styles.metaChip}>
              <Icon name="calendar-refresh" size={28} color={Colors.text} />
              <Text style={[styles.meta, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {FREQUENCY_META[open.frequency].label}
              </Text>
            </View>
          </View>
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
            onPress={() => toggleDone(open)}
            minHeight={96}
          />
        </ScrollView>
      </ChildScreen>
    );
  }

  return (
    <ChildScreen title="Activities">
      {!loading && activities.length === 0 ? (
        <EmptyState icon="dumbbell" title="No activities yet" message="A parent can add activities in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: sizes.horizontalPadding }]}>
          {activities.map((ex) => (
            <Pressable
              key={ex.id}
              onPress={() => openCard(ex)}
              accessibilityRole="button"
              accessibilityLabel={`${ex.name}${ex.isCompleted ? ', done' : ', not completed'}`}
              hitSlop={4}
              style={({ pressed }) => [
                styles.card,
                { minHeight: Math.max(sizes.tileHeight * 0.75, 96) },
                ex.isCompleted && styles.cardDone,
                pressed && styles.pressed,
              ]}
            >
              {ex.imageUri ? (
                <Image source={{ uri: ex.imageUri }} style={styles.thumb} accessibilityIgnoresInvertColors />
              ) : (
                <Icon name={ex.icon} size={sizes.iconSize} color={Colors.text} />
              )}
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { fontSize: sizes.tileLabel + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                  {ex.name}
                </Text>
                <Text style={[styles.cardMeta, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {ex.durationMinutes > 0 ? `${ex.durationMinutes} min · ` : ''}
                  {ex.isCompleted ? '✅ Completed' : '⬜ Not completed'}
                </Text>
              </View>
              <View style={[styles.check, ex.isCompleted && styles.checkDone]}>
                {ex.isCompleted ? <Icon name="check-bold" size={30} color={Colors.textOnDark} /> : null}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </ChildScreen>
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
  thumb: { width: 72, height: 72, borderRadius: 12, borderWidth: 2, borderColor: Colors.border },
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
  detailIcon: { alignItems: 'center', paddingVertical: SPACING.sm },
  image: { width: 240, height: 240, borderRadius: RADIUS.tile, borderWidth: 3, borderColor: Colors.border },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 2, borderColor: '#CFCFCF' },
  meta: { fontWeight: '700', color: Colors.text },
  instructions: { color: Colors.text, lineHeight: 34, textAlign: 'center' },
});
