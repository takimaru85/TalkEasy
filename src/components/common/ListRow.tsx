import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Icon } from './Icon';
import { Fonts } from '@/theme';

export interface RowAction {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}

interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  iconBackground?: string;
  /** Muted styling for hidden / completed rows. */
  dimmed?: boolean;
  onPress?: () => void;
  /** Large action buttons rendered in a full-width row under the text (Up / Down / Edit / Delete...). */
  actions?: RowAction[];
}

/**
 * Parent-mode list item: icon + text on top, a row of big action buttons underneath.
 * Reordering uses explicit Up / Down buttons — no drag-and-drop anywhere.
 */
export function ListRow({ title, subtitle, icon, iconBackground = Colors.surface, dimmed, onPress, actions = [] }: Props) {
  const sizes = useSizes();

  const top = (
    <View style={styles.top}>
      {icon ? (
        <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
          <Icon name={icon} size={30} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={[styles.title, { fontSize: sizes.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? <Icon name="chevron-right" size={28} color={Colors.textMuted} /> : null}
    </View>
  );

  return (
    <View style={[styles.card, dimmed && styles.dimmed]}>
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Edit ${title}`} style={({ pressed }) => pressed && styles.pressedTop}>
          {top}
        </Pressable>
      ) : (
        top
      )}

      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((a) => (
            <Pressable
              key={a.label}
              onPress={a.onPress}
              disabled={a.disabled}
              accessibilityRole="button"
              accessibilityLabel={`${a.label}: ${title}`}
              accessibilityState={{ disabled: !!a.disabled }}
              hitSlop={4}
              style={({ pressed }) => [styles.action, a.disabled && styles.actionDisabled, pressed && styles.pressed]}
            >
              <Icon name={a.icon} size={28} color={a.disabled ? '#9E9E9E' : (a.color ?? Colors.text)} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: Colors.background,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  dimmed: { opacity: 0.55 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: MIN_PARENT_TARGET,
  },
  pressedTop: { opacity: 0.7 },
  iconBox: {
    width: MIN_PARENT_TARGET,
    height: MIN_PARENT_TARGET,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.bold, color: Colors.text },
  subtitle: { color: Colors.textMuted, fontSize: 15 },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  action: {
    flex: 1,
    minHeight: MIN_PARENT_TARGET,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: '#CFCFCF',
  },
  actionDisabled: { opacity: 0.35 },
  pressed: { backgroundColor: Colors.selected },
});
