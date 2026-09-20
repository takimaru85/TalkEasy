import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { KIND_META, STATUS_META } from '@/constants/school';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import type { AssignmentWithSubject } from '@/types/models';
import { describeDueDate, isPast } from '@/utils/date';
import { Icon } from '@/components/common/Icon';
import { Fonts } from '@/theme';

interface Props {
  assignment: AssignmentWithSubject;
  today: string;
  onPress?: () => void;
  /** Big tick button on the right; omitted when undefined. */
  onToggleDone?: () => void;
  compact?: boolean;
}

/**
 * The child's view of an assignment:
 *   📝 Math Assignment / 📅 Due Monday / ⬜ Not finished   →   ✅ Math Assignment / Completed
 */
export function AssignmentCard({ assignment: a, today, onPress, onToggleDone, compact }: Props) {
  const sizes = useSizes();
  const done = a.status === 'done';
  const overdue = !done && isPast(a.dueDate, today);
  const subjectName = a.subject?.name ?? KIND_META[a.kind].label;
  const status = STATUS_META[a.status];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${subjectName} ${KIND_META[a.kind].label}: ${a.title}. ${a.dueDate ? `Due ${describeDueDate(a.dueDate, today)}.` : ''} ${status.childLabel}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: done ? '#E8E8E8' : a.subject?.color ?? '#FFF3A8', minHeight: compact ? 84 : Math.max(sizes.tileHeight * 0.7, 96) },
        done && styles.cardDone,
        overdue && styles.cardOverdue,
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={styles.iconBox}>
        <Icon name={done ? 'check-circle' : (a.subject?.icon ?? KIND_META[a.kind].icon)} size={compact ? 36 : 44} color={done ? Colors.success : Colors.text} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.subject, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
          {subjectName} {a.kind !== 'assignment' ? `· ${KIND_META[a.kind].label}` : ''}
        </Text>
        <Text style={[styles.title, { fontSize: compact ? sizes.body + 2 : sizes.tileLabel }, done && styles.titleDone]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
          {a.title}
        </Text>
        <Text style={[styles.meta, { fontSize: sizes.body - 2 }, overdue && styles.metaOverdue]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
          {done ? '✅ Completed' : `📅 Due ${describeDueDate(a.dueDate, today)} · ${status.childLabel}`}
        </Text>
      </View>
      {onToggleDone ? (
        <Pressable
          onPress={onToggleDone}
          accessibilityRole="button"
          accessibilityLabel={done ? `Mark ${a.title} not finished` : `Mark ${a.title} finished`}
          accessibilityState={{ checked: done }}
          hitSlop={6}
          style={({ pressed }) => [styles.check, done && styles.checkDone, pressed && styles.pressed]}
        >
          {done ? <Icon name="check-bold" size={30} color={Colors.textOnDark} /> : null}
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  cardDone: { borderColor: '#9E9E9E' },
  cardOverdue: { borderColor: Colors.danger, borderWidth: 4 },
  pressed: { opacity: 0.8 },
  iconBox: { width: 56, alignItems: 'center' },
  text: { flex: 1, gap: 2 },
  subject: { fontFamily: Fonts.bold, color: Colors.textMuted },
  title: { fontFamily: Fonts.extrabold, color: Colors.text },
  titleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  meta: { fontFamily: Fonts.bold, color: Colors.text },
  metaOverdue: { color: Colors.danger },
  check: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: Colors.success, borderColor: '#0F5E28' },
});
