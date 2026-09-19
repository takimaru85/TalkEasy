import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChildScreen, EmptyState, Icon } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { routinesRepo } from '@/database';
import { useActiveRoutine, useActiveRoutineItems, useSizes, useSpeak } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import type { RoutineItem } from '@/types/models';
import { confirm } from '@/utils/confirm';
import { formatTime } from '@/utils/date';

/**
 * Visual daily schedule. A fixed banner at the top shows CURRENT and NEXT; the list below shows
 * every step with an arrow between them. Tapping a step speaks it and ticks it (tapping a done
 * step un-ticks it). No gestures, no drag.
 */
export function MyDayScreen(_props: RootScreenProps<'MyDay'>) {
  const sizes = useSizes();
  const { settings } = useSettings();
  const { data: routine, loading } = useActiveRoutine();
  const { data: items } = useActiveRoutineItems();
  const { speakPhrase } = useSpeak();

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
  };

  return (
    <ChildScreen title={routine?.name ?? 'My Day'}>
      <View style={styles.banner}>
        <View style={[styles.bannerCol, styles.bannerCurrent]}>
          <Text style={styles.bannerCaption} maxFontSizeMultiplier={MAX_FONT_SCALE}>NOW</Text>
          {current ? (
            <Pressable onPress={() => speakPhrase(current.label)} accessibilityRole="button" accessibilityLabel={`Now: ${current.label}`} style={styles.bannerItem}>
              <Icon name={current.icon} size={sizes.iconSize} />
              <Text style={[styles.bannerText, { fontSize: sizes.tileLabel + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
                {current.label}
              </Text>
            </Pressable>
          ) : (
            <Text style={[styles.bannerText, { fontSize: sizes.tileLabel }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {items.length ? 'All done! 🎉' : '—'}
            </Text>
          )}
        </View>
        <View style={[styles.bannerCol, styles.bannerNext]}>
          <Text style={styles.bannerCaption} maxFontSizeMultiplier={MAX_FONT_SCALE}>NEXT</Text>
          {next ? (
            <Pressable onPress={() => speakPhrase(`Next, ${next.label}`)} accessibilityRole="button" accessibilityLabel={`Next: ${next.label}`} style={styles.bannerItem}>
              <Icon name={next.icon} size={sizes.iconSize - 8} color={Colors.textMuted} />
              <Text style={[styles.bannerText, styles.bannerNextText, { fontSize: sizes.tileLabel }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
                {next.label}
              </Text>
            </Pressable>
          ) : (
            <Text style={[styles.bannerText, styles.bannerNextText, { fontSize: sizes.tileLabel }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>—</Text>
          )}
        </View>
      </View>

      {!loading && items.length === 0 ? (
        <EmptyState icon="calendar-check" title="No routine yet" message="A parent can build the day in Parent Mode." />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: sizes.horizontalPadding }]}>
          {items.map((item, index) => {
            const isNow = index === currentIndex;
            return (
              <View key={item.id}>
                <Pressable
                  onPress={() => onPressItem(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label}${item.startTime ? `, ${formatTime(item.startTime)}` : ''}${item.isDone ? ', done' : isNow ? ', now' : ''}`}
                  accessibilityState={{ checked: item.isDone }}
                  hitSlop={4}
                  style={({ pressed }) => [
                    styles.step,
                    { minHeight: Math.max(sizes.tileHeight * 0.65, 84) },
                    item.isDone && styles.stepDone,
                    isNow && styles.stepNow,
                    pressed && styles.pressed,
                  ]}
                >
                  <Icon name={item.icon} size={sizes.iconSize} color={Colors.text} />
                  <View style={styles.stepText}>
                    <Text style={[styles.label, { fontSize: sizes.tileLabel + 2 }, item.isDone && styles.labelDone]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                      {item.label}
                    </Text>
                    {item.startTime ? (
                      <Text style={[styles.time, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                        {formatTime(item.startTime)}
                      </Text>
                    ) : null}
                  </View>
                  <View style={[styles.check, item.isDone && styles.checkDone]}>
                    {item.isDone ? <Icon name="check-bold" size={30} color={Colors.textOnDark} /> : null}
                  </View>
                </Pressable>
                {index < items.length - 1 ? (
                  <View style={styles.arrow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    <Icon name="arrow-down-bold" size={28} color={Colors.textMuted} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  bannerCol: {
    flex: 1,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    padding: SPACING.sm,
    minHeight: 120,
    alignItems: 'center',
    gap: 4,
  },
  bannerCurrent: { flex: 1.3, backgroundColor: '#FFF3A8', borderColor: Colors.primaryDark, borderWidth: 4 },
  bannerNext: { backgroundColor: Colors.surface, borderColor: '#BDBDBD' },
  bannerCaption: { fontSize: 14, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1 },
  bannerItem: { alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' },
  bannerText: { fontWeight: '900', color: Colors.text, textAlign: 'center' },
  bannerNextText: { color: Colors.textMuted },
  list: { paddingVertical: SPACING.sm, paddingBottom: SPACING.xl },
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
  stepText: { flex: 1, gap: 2 },
  label: { fontWeight: '800', color: Colors.text },
  labelDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  time: { color: Colors.textMuted, fontWeight: '700' },
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
  arrow: { alignItems: 'center', paddingVertical: 2 },
});
