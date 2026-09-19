import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { EVENT_TYPE_META, KIND_META } from '@/constants/school';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import type { CalendarEntry } from '@/types/models';
import { describeDueDate, formatTime } from '@/utils/date';
import { Icon } from '@/components/common/Icon';

interface Props {
  entry: CalendarEntry;
  today: string;
  onPress?: () => void;
  /** Hide the date (when the row is already inside a day section). */
  hideDate?: boolean;
}

/** One calendar line: icon, title, type, date/time. Used by the Calendar and dashboards. */
export function EventRow({ entry, today, onPress, hideDate }: Props) {
  const sizes = useSizes();
  const typeLabel =
    entry.source === 'assignment' && entry.assignment
      ? `${entry.assignment.subject?.name ?? ''} ${KIND_META[entry.assignment.kind].label}`.trim()
      : entry.event
        ? EVENT_TYPE_META[entry.event.eventType].label
        : '';
  const when = [hideDate ? null : describeDueDate(entry.date, today), entry.time ? formatTime(entry.time) : null]
    .filter(Boolean)
    .join(' · ');
  const done = entry.assignment?.status === 'done';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${typeLabel}: ${entry.title}. ${when}`}
      style={({ pressed }) => [styles.row, { backgroundColor: entry.color }, done && styles.done, pressed && onPress && styles.pressed]}
    >
      <Icon name={entry.icon} size={34} color={Colors.text} />
      <View style={styles.text}>
        <Text style={[styles.title, { fontSize: sizes.body + 1 }, done && styles.titleDone]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
          {entry.title}
        </Text>
        <Text style={[styles.meta, { fontSize: sizes.body - 3 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
          {[typeLabel, when].filter(Boolean).join(' · ')}
        </Text>
      </View>
      {onPress ? <Icon name="chevron-right" size={26} color={Colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    minHeight: 72,
    borderRadius: RADIUS.button,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  done: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  text: { flex: 1, gap: 2 },
  title: { fontWeight: '800', color: Colors.text },
  titleDone: { textDecorationLine: 'line-through' },
  meta: { color: Colors.textMuted, fontWeight: '600' },
});
