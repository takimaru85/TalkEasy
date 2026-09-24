import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Celebration, ChildScreen, EmptyState, Icon, IconTile, ProgressBar } from '@/components/common';
import { tileInk } from '@/constants/colors';
import { ROUTINE_SEGMENT_TINT } from '@/constants/school';
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
import { useI18n } from '@/i18n';

/** Each part of the day has its own colour, so the list reads at a glance: warm morning → night. */
const SEGMENTS: { key: RoutineSegment; label: string; icon: string; tint: string }[] = [
  { key: 'morning', label: 'Morning', icon: 'weather-sunset-up', tint: ROUTINE_SEGMENT_TINT.morning },
  { key: 'school', label: 'School', icon: 'school-outline', tint: ROUTINE_SEGMENT_TINT.school },
  { key: 'afternoon', label: 'After school', icon: 'weather-partly-cloudy', tint: ROUTINE_SEGMENT_TINT.afternoon },
  { key: 'evening', label: 'Evening', icon: 'weather-night', tint: ROUTINE_SEGMENT_TINT.evening },
];

const tintFor = (segment: RoutineSegment) => ROUTINE_SEGMENT_TINT[segment] ?? ROUTINE_SEGMENT_TINT.school;

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
  const { t, tContent } = useI18n();
  const award = useAwardStars();
  const [burst, setBurst] = useState(0);

  const done = items.filter((i) => i.isDone).length;
  const currentIndex = items.findIndex((i) => !i.isDone);
  const current = currentIndex >= 0 ? items[currentIndex] : null;
  const next = currentIndex >= 0 ? items.slice(currentIndex + 1).find((i) => !i.isDone) ?? null : null;

  const onPressItem = async (item: RoutineItem) => {
    speakPhrase(tContent(item.label));
    if (!item.isDone && settings.confirmComplete) {
      const ok = await confirm('Finished?', `Mark "${tContent(item.label)}" as done?`, 'Yes, done');
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
    <ChildScreen title={routine ? tContent(routine.name) : t('sectionMyDay')} emoji={SECTION_EMOJI.myday}>
      <Celebration trigger={burst} />
      {!loading && items.length === 0 ? (
        <EmptyState icon="calendar-check" title="No plan yet" message="A parent can build the day in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: sizes.horizontalPadding }]}>
          <Card color={theme.colors.primarySoft}>
            <ProgressBar value={items.length ? done / items.length : 0} label={`${done} / ${items.length}`} color={theme.colors.success} accessibilityLabel={`${done} of ${items.length} steps done`} />
            <View style={styles.nowRow}>
              <View style={styles.nowCol}>
                <Text style={[styles.caption, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('dayNow')}</Text>
                {current ? (
                  <View style={styles.nowItem}>
                    <IconTile name={current.icon} size={sizes.iconSize + 4} tint={tintFor(current.segment)} />
                    <Text style={[styles.nowText, { fontSize: sizes.tileLabel + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
                      {current.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.nowText, { fontSize: sizes.tileLabel, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('dayAllDone')} 🎉</Text>
                )}
              </View>
              <View style={[styles.nowCol, styles.nextCol, { borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.caption, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('dayNext')}</Text>
                {next ? (
                  <View style={styles.nowItem}>
                    <IconTile name={next.icon} size={sizes.iconSize - 6} tint={tintFor(next.segment)} muted />
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
                <View style={styles.segmentRow} accessibilityRole="header">
                  <Icon name={seg.icon} size={22} color={theme.highContrast ? theme.colors.text : tileInk(seg.tint)} />
                  <Text style={[styles.segmentTitle, { fontSize: sizes.body - 1, color: theme.highContrast ? theme.colors.text : tileInk(seg.tint) }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {seg.label.toUpperCase()}
                  </Text>
                </View>
                {segItems.map((item) => {
                  const isNow = current?.id === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => onPressItem(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`${tContent(item.label)}${item.startTime ? `, ${formatTime(item.startTime)}` : ''}${item.notes ? `, ${item.notes}` : ''}${item.isDone ? ', done' : isNow ? ', now' : ''}`}
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
                      <IconTile name={item.icon} size={56} tint={seg.tint} muted={item.isDone} />
                      <View style={styles.stepText}>
                        <Text style={[styles.label, { fontSize: sizes.tileLabel, color: item.isDone ? theme.colors.textMuted : theme.colors.text }, item.isDone && styles.labelDone]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                          {tContent(item.label)}
                        </Text>
                        {item.startTime || item.notes ? (
                          <Text style={[styles.meta, { fontSize: sizes.body - 3, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                            {[item.startTime ? formatTime(item.startTime) : null, item.notes ? tContent(item.notes) : null].filter(Boolean).join(' · ')}
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
  segmentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  segmentTitle: { fontFamily: Fonts.black, letterSpacing: 1.2 },
  step: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: Radius.lg },
  stepText: { flex: 1, gap: 2 },
  label: { fontFamily: Fonts.extrabold },
  labelDone: { textDecorationLine: 'line-through' },
  meta: { fontFamily: Fonts.bold },
  check: { width: 48, height: 48, borderRadius: 14, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  arrow: { fontSize: 26, fontFamily: Fonts.black },
});
