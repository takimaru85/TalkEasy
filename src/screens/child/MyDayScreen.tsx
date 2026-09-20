import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Celebration, ChildScreen, EmptyState, Icon, ProgressBar } from '@/components/common';
import { SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile, personalize } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { routinesRepo } from '@/database';
import { useActiveRoutine, useActiveRoutineItems, useAwardStars, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';
import type { RoutineItem, RoutineSegment } from '@/types/models';
import { confirm } from '@/utils/confirm';
import { formatTime } from '@/utils/date';

const SEGMENTS: { key: RoutineSegment; label: string; emoji: string }[] = [
  { key: 'morning', label: 'Morning', emoji: '🌅' },
  { key: 'school', label: 'School', emoji: '🏫' },
  { key: 'afternoon', label: 'After school', emoji: '🌤️' },
  { key: 'evening', label: 'Evening', emoji: '🌙' },
];

/**
 * Visual daily schedule. A fixed card at the top shows NOW / NEXT and progress; below, the
 * steps are grouped by part of the day. Tap = speak + tick (tap again to un-tick). Ticking a
 * step earns a star; finishing the whole plan celebrates.
 */
export function MyDayScreen(_props: RootScreenProps<'MyDay'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { settings } = useSettings();
  const { profile, displayName } = useProfile();
  const { data: routine, loading } = useActiveRoutine();
  const { data: items } = useActiveRoutineItems();
  const { speakPhrase, speakFeedback } = useSpeak();
  const award = useAwardStars();
  const [burst, setBurst] = useState(0);

  const done = items.filter((i) => i.isDone).length;
  const currentIndex = items.findIndex((i) => !i.isDone);
  const current = currentIndex >= 0 ? items[currentIndex] : null;
  const next = currentIndex >= 0 ? items.slice(currentIndex + 1).find((i) => !i.isDone) ?? null : null;

  const onPressItem = async (item: RoutineItem) => {
    speakPhrase(item.label);
    if (!item.isDone && settings.confirmComplete) {
      const ok = await confirm('Finished?', `Mark "${item.label}" as done?`, 'Yes, done');
      if (!ok) return;
    }
    await routinesRepo.setItemDone(item.id, !item.isDone);
    if (!item.isDone) {
      const stars = await award('routine', item.label);
      const finishedAll = done + 1 === items.length;
      if (finishedAll) {
        setBurst((b) => b + 1);
        setTimeout(() => speakFeedback(`${personalize(profile.rewards.celebrationMessage, displayName)} Your plan is all done!`), 600);
      } else if (stars > 0) {
        setTimeout(() => speakFeedback('Done! One star.'), 600);
      }
    }
  };

  return (
    <ChildScreen title={routine?.name ?? 'My Day'} emoji={SECTION_EMOJI.myday}>
      <Celebration trigger={burst} />
      {!loading && items.length === 0 ? (
        <EmptyState icon="calendar-check" title="No plan yet" message="A parent can build the day in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Card color={theme.colors.primarySoft}>
            <ProgressBar value={items.length ? done / items.length : 0} label={`${done} / ${items.length}`} color={theme.colors.success} accessibilityLabel={`${done} of ${items.length} steps done`} />
            <View style={styles.nowRow}>
              <View style={styles.nowCol}>
                <Text style={[styles.caption, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>NOW</Text>
                {current ? (
                  <View style={styles.nowItem}>
                    <Icon name={current.icon} size={sizes.iconSize - 8} color={theme.colors.text} />
                    <Text style={[styles.nowText, { fontSize: sizes.tileLabel + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
                      {current.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.nowText, { fontSize: sizes.tileLabel, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>All done! 🎉</Text>
                )}
              </View>
              <View style={[styles.nowCol, styles.nextCol, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.caption, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>NEXT</Text>
                {next ? (
                  <View style={styles.nowItem}>
                    <Icon name={next.icon} size={sizes.iconSize - 14} color={theme.colors.textMuted} />
                    <Text style={[styles.nowText, { fontSize: sizes.tileLabel - 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
                      {next.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.nowText, { fontSize: sizes.tileLabel - 2, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>—</Text>
                )}
              </View>
            </View>
          </Card>

          {SEGMENTS.map((seg) => {
            const segItems = items.filter((i) => i.segment === seg.key);
            if (segItems.length === 0) return null;
            return (
              <View key={seg.key} style={styles.segment}>
                <Text style={[styles.segmentTitle, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {seg.emoji} {seg.label.toUpperCase()}
                </Text>
                {segItems.map((item) => {
                  const isNow = current?.id === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => onPressItem(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.label}${item.startTime ? `, ${formatTime(item.startTime)}` : ''}${item.notes ? `, ${item.notes}` : ''}${item.isDone ? ', done' : isNow ? ', now' : ''}`}
                      accessibilityState={{ checked: item.isDone }}
                      hitSlop={4}
                      style={({ pressed }) => [
                        styles.step,
                        theme.shadow,
                        {
                          minHeight: Math.max(sizes.tileHeight * 0.6, 84),
                          backgroundColor: item.isDone ? theme.colors.surfaceAlt : theme.colors.surface,
                          borderColor: isNow ? theme.colors.primary : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
                          borderWidth: isNow ? 3 : theme.highContrast ? theme.borderWidth : 1,
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <View style={[styles.stepIcon, { backgroundColor: item.isDone ? theme.colors.surfaceAlt : theme.tint(theme.colors.primarySoft) }]}>
                        <Icon name={item.icon} size={sizes.iconSize - 12} color={item.isDone ? theme.colors.textMuted : theme.colors.text} />
                      </View>
                      <View style={styles.stepText}>
                        <Text style={[styles.label, { fontSize: sizes.tileLabel, color: item.isDone ? theme.colors.textMuted : theme.colors.text }, item.isDone && styles.labelDone]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                          {item.label}
                        </Text>
                        {item.startTime || item.notes ? (
                          <Text style={[styles.meta, { fontSize: sizes.body - 3, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                            {[item.startTime ? formatTime(item.startTime) : null, item.notes || null].filter(Boolean).join(' · ')}
                          </Text>
                        ) : null}
                      </View>
                      <View style={[styles.check, { borderColor: item.isDone ? theme.colors.success : theme.colors.borderSoft, backgroundColor: item.isDone ? theme.colors.success : theme.colors.surface }]}>
                        {item.isDone ? <Icon name="check-bold" size={28} color="#FFFFFF" /> : isNow ? <Text style={[styles.arrow, { color: theme.colors.primaryDark }]} allowFontScaling={false}>→</Text> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: SPACING.sm, gap: SPACING.md, paddingBottom: SPACING.xl },
  nowRow: { flexDirection: 'row', marginTop: SPACING.md, gap: SPACING.md },
  nowCol: { flex: 1.3, gap: 4 },
  nextCol: { flex: 1, borderLeftWidth: 1.5, paddingLeft: SPACING.md },
  caption: { fontFamily: Fonts.black, fontSize: 13, letterSpacing: 1 },
  nowItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  nowText: { fontFamily: Fonts.black, flexShrink: 1 },
  segment: { gap: SPACING.sm },
  segmentTitle: { fontFamily: Fonts.black, letterSpacing: 1, marginTop: SPACING.xs },
  step: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: Radius.lg },
  stepIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1, gap: 2 },
  label: { fontFamily: Fonts.extrabold },
  labelDone: { textDecorationLine: 'line-through' },
  meta: { fontFamily: Fonts.bold },
  check: { width: 48, height: 48, borderRadius: 14, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  arrow: { fontSize: 26, fontFamily: Fonts.black },
});
