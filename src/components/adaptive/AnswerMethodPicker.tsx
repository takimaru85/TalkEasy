import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ANSWER_METHOD_META, type AnswerMethod } from '@/adaptive/types';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { Fonts, Radius, useTheme } from '@/theme';

interface Props {
  methods: AnswerMethod[];
  value: AnswerMethod;
  onChange: (m: AnswerMethod) => void;
  /** Compact row of pills (inside an activity) vs. big stacked buttons ("I can't write this"). */
  compact?: boolean;
}

/**
 * "How do you want to answer?" — the core of the feature. Every allowed method is one big
 * button; the child can switch at any time. Handwriting is never the only option.
 */
export function AnswerMethodPicker({ methods, value, onChange, compact }: Props) {
  const theme = useTheme();
  if (methods.length <= 1) return null;
  return (
    <View style={compact ? styles.row : styles.stack} accessibilityRole="radiogroup" accessibilityLabel="How do you want to answer?">
      {methods.map((m) => {
        const meta = ANSWER_METHOD_META[m];
        const selected = m === value;
        return (
          <Pressable
            key={m}
            onPress={() => onChange(m)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={`${meta.label}. ${meta.description}`}
            hitSlop={4}
            style={[
              compact ? styles.pill : styles.big,
              theme.shadow,
              {
                backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                borderColor: selected ? theme.colors.primaryDark : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
                borderWidth: theme.highContrast ? theme.borderWidth : 1.5,
              },
            ]}
          >
            <Text style={[styles.emoji, compact && styles.emojiSmall]} allowFontScaling={false}>{meta.emoji}</Text>
            <View style={styles.text}>
              <Text style={[styles.label, compact && styles.labelSmall, { color: selected ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                {selected && !compact ? '✓ ' : ''}{compact ? meta.short : meta.label}
              </Text>
              {!compact ? (
                <Text style={[styles.desc, { color: selected ? '#FFFFFF' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                  {meta.description}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: SPACING.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  big: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minHeight: 80, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: Radius.lg },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: MIN_CHILD_TARGET - 8, paddingHorizontal: SPACING.md, borderRadius: Radius.pill, flexGrow: 1, justifyContent: 'center' },
  emoji: { fontSize: 32, lineHeight: 40 },
  emojiSmall: { fontSize: 22, lineHeight: 28 },
  text: { flexShrink: 1 },
  label: { fontFamily: Fonts.extrabold, fontSize: 20 },
  labelSmall: { fontSize: 16 },
  desc: { fontFamily: Fonts.semibold, fontSize: 15 },
});
