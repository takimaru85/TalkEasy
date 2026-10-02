import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ANSWER_METHOD_META, type AnswerMethod } from '@/adaptive/types';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { Adventure, Fonts, Radius, shade, useTheme } from '@/theme';
import { Glyph } from '@/components/common/Glyph';
import { Icon } from '@/components/common/Icon';

interface Props {
  methods: AnswerMethod[];
  value: AnswerMethod;
  onChange: (m: AnswerMethod) => void;
  /** Compact answer-mode section (inside a question) vs. big stacked buttons ("I can't write this"). */
  compact?: boolean;
}

/**
 * "How do you want to answer?" — the core of Adaptive Learning. Every allowed method is a button;
 * the child can switch at any time. Handwriting is never the only option.
 *
 * Compact (inside a question) it is a deliberate section: a heading, the main ways to answer as
 * equal buttons (Tap / Speak / Type …), and "Helper" — telling a grown-up — below them, always
 * there but quieter, so it never competes with the child answering on their own.
 */
export function AnswerMethodPicker({ methods, value, onChange, compact }: Props) {
  const theme = useTheme();
  if (!compact) {
    if (methods.length <= 1) return null;
    return (
      <View style={styles.stack} accessibilityRole="radiogroup" accessibilityLabel="How do you want to answer?">
        {methods.map((m) => (
          <BigMethod key={m} method={m} selected={m === value} onPress={() => onChange(m)} />
        ))}
      </View>
    );
  }

  const main = methods.filter((m) => m !== 'assisted');
  const helper = methods.includes('assisted');
  const night = theme.night;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={[styles.kicker, { color: night ? Adventure.sun.from : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
          CHOOSE YOUR ANSWER
        </Text>
        <Text style={[styles.question, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {methods.length > 1 ? 'How would you like to answer?' : ANSWER_METHOD_META[value].description}
        </Text>
      </View>

      {methods.length > 1 ? (
        <>
          <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="How do you want to answer?">
            {main.map((m) => {
              const meta = ANSWER_METHOD_META[m];
              const selected = m === value;
              return (
                <Pressable
                  key={m}
                  onPress={() => onChange(m)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, checked: selected }}
                  accessibilityLabel={`${meta.short}. ${meta.description}`}
                  hitSlop={4}
                  style={({ pressed }) => [
                    styles.pill,
                    night
                      ? selected
                        ? { backgroundColor: theme.colors.primary, borderColor: '#FFFFFF', borderWidth: 2.5, borderBottomWidth: 4, borderBottomColor: shade(theme.colors.primary, 0.6) }
                        : { backgroundColor: theme.colors.surfaceAlt, borderColor: shade(theme.colors.surfaceAlt, 1.5), borderWidth: 1.5, borderBottomWidth: 4, borderBottomColor: shade(theme.colors.surfaceAlt, 0.6) }
                      : {
                          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                          borderColor: selected ? theme.colors.primaryDark : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
                          borderWidth: theme.highContrast ? theme.borderWidth : 1.5,
                        },
                    pressed && styles.pressed,
                  ]}
                >
                  <Glyph value={meta.emoji} size={30} />
                  <Text style={[styles.label, { color: selected || night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                    {meta.short}
                  </Text>
                  {/* The chosen way is marked by a tick as well as the fill. */}
                  {selected ? <Icon name="check-circle" size={18} color="#FFFFFF" /> : null}
                </Pressable>
              );
            })}
          </View>

          {helper ? (
            <Pressable
              onPress={() => onChange('assisted')}
              accessibilityRole="radio"
              accessibilityState={{ selected: value === 'assisted', checked: value === 'assisted' }}
              accessibilityLabel={`${ANSWER_METHOD_META.assisted.short}. ${ANSWER_METHOD_META.assisted.description}`}
              hitSlop={6}
              style={({ pressed }) => [
                styles.helper,
                value === 'assisted'
                  ? { backgroundColor: theme.colors.primary, borderColor: night ? '#FFFFFF' : theme.colors.primaryDark, borderStyle: 'solid' }
                  : { borderColor: night ? 'rgba(255,255,255,0.4)' : theme.colors.borderSoft },
                pressed && styles.pressed,
              ]}
            >
              <Icon name="hand-back-right-outline" size={20} color={value === 'assisted' || night ? '#FFFFFF' : theme.colors.text} />
              <Text style={[styles.helperText, { color: value === 'assisted' || night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
                Ask a {ANSWER_METHOD_META.assisted.short.toLowerCase()}
              </Text>
              {value === 'assisted' ? <Icon name="check-circle" size={18} color="#FFFFFF" /> : null}
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function BigMethod({ method, selected, onPress }: { method: AnswerMethod; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  const meta = ANSWER_METHOD_META[method];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={`${meta.label}. ${meta.description}`}
      hitSlop={4}
      style={[
        styles.big,
        theme.shadow,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primaryDark : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
          borderWidth: theme.highContrast ? theme.borderWidth : 1.5,
        },
      ]}
    >
      <Glyph value={meta.emoji} size={48} />
      <View style={styles.text}>
        <Text style={[styles.bigLabel, { color: selected ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
          {selected ? '✓ ' : ''}{meta.label}
        </Text>
        <Text style={[styles.desc, { color: selected ? '#FFFFFF' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
          {meta.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: SPACING.sm },
  heading: { alignItems: 'center', gap: 2 },
  kicker: { fontFamily: Fonts.black, fontSize: 13, letterSpacing: 1.2 },
  question: { fontFamily: Fonts.bold, fontSize: 16, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pill: {
    flexGrow: 1,
    flexBasis: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: MIN_CHILD_TARGET - 8,
    paddingHorizontal: SPACING.sm,
    borderRadius: Radius.pill,
  },
  pressed: { opacity: 0.85 },
  label: { fontFamily: Fonts.extrabold, fontSize: 16, flexShrink: 1 },
  helper: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 48,
    paddingHorizontal: SPACING.lg,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  helperText: { fontFamily: Fonts.bold, fontSize: 15 },
  stack: { gap: SPACING.sm },
  big: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minHeight: 80, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: Radius.lg },
  text: { flexShrink: 1 },
  bigLabel: { fontFamily: Fonts.extrabold, fontSize: 20 },
  desc: { fontFamily: Fonts.semibold, fontSize: 15 },
});
