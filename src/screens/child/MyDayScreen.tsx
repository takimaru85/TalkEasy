import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Celebration, ChildScreen, EmptyState, Icon, IconTile } from '@/components/common';
import { MyDayUpcoming } from '@/components/myday/MyDayUpcoming';
import { startsIn, type ScheduleEntry } from '@/myday/schedule';
import { tileInk } from '@/constants/colors';
import { ROUTINE_SEGMENT_TINT } from '@/constants/school';
import { SECTION_EMOJI } from '@/constants/school';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile, personalize } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { routinesRepo } from '@/database';
import { useActiveRoutine, useAwardStars, useMyDay, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme, shade } from '@/theme';
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
 * My Day — the child's LIVE daily schedule. At the top, the same live card as Home (NOW / NEXT,
 * "Starts in…", "It's time!"), here with "I did it!" and Skip. Below, the steps by part of the
 * day, each showing its state: ✓ done, → now, ○ still to come, or skipped. Tap a step = speak +
 * tick (tap again to un-tick). Ticking earns a star; finishing the whole plan celebrates.
 * Everything updates by itself as the time passes (useMyDay).
 */
export function MyDayScreen({ navigation }: RootScreenProps<'MyDay'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { settings } = useSettings();
  const { profile, displayName } = useProfile();
  const { data: routine, loading } = useActiveRoutine();
  const day = useMyDay();
  const items = day.entries.map((e) => e.item);
  const statusOf = new Map(day.entries.map((e) => [e.item.id, e] as const));
  const { speakPhrase, speakFeedback } = useSpeak();
  const { t, tContent } = useI18n();
  const award = useAwardStars();
  const [burst, setBurst] = useState(0);

  const done = day.done;
  const current = day.now?.item ?? null;
  const next = day.next?.item ?? null;

  /** "I did it!" from the live card ticks the step exactly as tapping it in the list does. */
  const tick = (e: ScheduleEntry) => (e.item.isDone ? undefined : onPressItem(e.item));
  const skip = async (e: ScheduleEntry) => {
    if (await confirm('Skip this?', `Skip "${tContent(e.item.label)}" for today?`, 'Skip')) await routinesRepo.setItemSkipped(e.item.id, true);
  };

  const onPressItem = async (item: RoutineItem) => {
    speakPhrase(tContent(item.label));
    if (!item.isDone && settings.confirmComplete) {
      const ok = await confirm('Finished?', `Mark "${tContent(item.label)}" as done?`, 'Yes, done');
      if (!ok) return;
    }
    await routinesRepo.setItemDone(item.id, !item.isDone);
    if (!item.isDone) {
      const stars = await award('routine', item.label);
      const finishedAll = day.entries.filter((e) => e.status !== 'completed' && e.status !== 'skipped').length === 1;
      if (finishedAll) {
        setBurst((b) => b + 1);
        setTimeout(() => speakFeedback(`${personalize(profile.rewards.celebrationMessage, displayName)} Your plan is all done!`), 600);
      } else if (stars > 0) {
        setTimeout(() => speakFeedback('Done! One star.'), 600);
      }
    }
  };

  return (
    <ChildScreen title={routine ? tContent(routine.name) : t('sectionMyDay')} subtitle={t('myDaySubtitle')} emoji={SECTION_EMOJI.myday} art="myday">
      <Celebration trigger={burst} />
      {!loading && items.length === 0 ? (
        <EmptyState icon="calendar-check" title="No plan yet" message="A parent can build the day in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: sizes.horizontalPadding }]}>
          <MyDayUpcoming
            state={day}
            variant="full"
            onGo={(e) => (e.item.linkedActivity ? navigation.navigate(e.item.linkedActivity) : tick(e))}
            onDone={tick}
            onSkip={skip}
          />

          {SEGMENTS.map((seg) => {
            const segItems = items.filter((i) => i.segment === seg.key);
            if (segItems.length === 0) return null;
            return (
              <View key={seg.key} style={styles.segment}>
                <View style={styles.segmentRow} accessibilityRole="header">
                  <Icon name={seg.icon} size={22} color={theme.highContrast ? theme.colors.text : theme.night ? seg.tint : tileInk(seg.tint)} />
                  <Text style={[styles.segmentTitle, { fontSize: sizes.body - 1, color: theme.highContrast ? theme.colors.text : theme.night ? seg.tint : tileInk(seg.tint) }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {seg.label.toUpperCase()}
                  </Text>
                </View>
                {segItems.map((item) => {
                  const isNow = current?.id === item.id;
                  const entry = statusOf.get(item.id);
                  const skipped = entry?.status === 'skipped';
                  const isNext = next?.id === item.id;
                  // On the night sky a step is a solid card in its part of the day's colour; the
                  // step happening now gets the gold rim, a finished one steps back to the panel.
                  const deep = item.isDone || skipped ? theme.colors.surfaceAlt : tileInk(seg.tint);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => onPressItem(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`${tContent(item.label)}${item.startTime ? `, ${formatTime(item.startTime)}` : ''}${item.notes ? `, ${item.notes}` : ''}${item.isDone ? ', done' : skipped ? ', skipped' : isNow ? ', now' : isNext ? ', next' : ''}`}
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
                        theme.night && {
                          backgroundColor: deep,
                          borderColor: isNow ? theme.colors.selected : shade(deep, 1.4),
                          borderWidth: isNow ? 3.5 : 1.5,
                          borderBottomWidth: 5,
                          borderBottomColor: isNow ? theme.colors.selected : shade(deep, 0.64),
                        },
                        skipped && styles.skipped,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <IconTile name={item.icon} size={56} tint={seg.tint} muted={item.isDone || skipped} />
                      <View style={styles.stepText}>
                        <Text style={[styles.label, { fontSize: sizes.tileLabel, color: item.isDone ? theme.colors.textMuted : theme.colors.text }, item.isDone && styles.labelDone]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                          {tContent(item.label)}
                        </Text>
                        {item.startTime || item.notes || skipped || (isNext && day.minutesUntilNext !== null) ? (
                          <Text style={[styles.meta, { fontSize: sizes.body - 3, color: theme.night && !item.isDone && !skipped ? 'rgba(255,255,255,0.88)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                            {[
                              skipped ? 'Skipped today' : null,
                              item.startTime ? formatTime(item.startTime) : null,
                              isNext && day.minutesUntilNext !== null && day.nextPhase !== 'later' ? startsIn(day.minutesUntilNext) : null,
                              item.notes ? tContent(item.notes) : null,
                            ].filter(Boolean).join(' · ')}
                          </Text>
                        ) : null}
                      </View>
                      <View style={[styles.check, { borderColor: item.isDone ? theme.colors.success : theme.colors.borderSoft, backgroundColor: item.isDone ? theme.colors.success : theme.colors.surface }, theme.night && !item.isDone && { backgroundColor: shade(deep, 0.78), borderColor: 'rgba(255,255,255,0.9)' }]}>
                        {item.isDone ? <Icon name="check-bold" size={28} color="#FFFFFF" /> : skipped ? <Icon name="skip-next" size={24} color={theme.colors.textMuted} /> : isNow ? <Text style={[styles.arrow, { color: theme.night ? '#FFFFFF' : theme.colors.primaryDark }]} allowFontScaling={false}>→</Text> : <Icon name="circle-outline" size={22} color={theme.night ? 'rgba(255,255,255,0.75)' : theme.colors.textMuted} />}
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
  skipped: { opacity: 0.7 },
});
