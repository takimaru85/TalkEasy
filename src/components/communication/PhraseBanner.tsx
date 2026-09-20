import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, useTheme } from '@/theme';
import { Icon } from '@/components/common/Icon';

interface Props {
  phrase: string | null;
  onRepeat: () => void;
  placeholder?: string;
  /** Sentence starter waiting for its ending ("I want …"). Shown with a blinking-free cue. */
  pending?: string | null;
  onClear?: () => void;
}

/**
 * Fixed area at the top of every communication screen. Shows the last phrase in very large
 * text with a big "Again" button. When a starter like "I want..." is active it shows
 * "I want ___" so the child knows the next tap completes the sentence.
 */
export function PhraseBanner({ phrase, onRepeat, placeholder = 'Tap a card to talk', pending, onClear }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const hasPhrase = !!phrase;
  const text = pending ? `${pending.replace(/\.\.\.$/, '').trim()} ___` : (phrase ?? placeholder);
  const active = hasPhrase || !!pending;

  return (
    <View
      style={[
        styles.banner,
        theme.shadow,
        {
          backgroundColor: active ? theme.tint(theme.colors.primarySoft) : theme.colors.surface,
          borderColor: active ? theme.colors.primary : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
          borderWidth: active ? 2.5 : theme.highContrast ? theme.borderWidth : 1,
        },
      ]}
    >
      <View style={styles.textCol}>
        <Text
          style={[
            styles.phrase,
            { fontSize: active ? sizes.phrase : sizes.body + 2, color: active ? theme.colors.text : theme.colors.textMuted },
            !active && styles.placeholder,
          ]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={3}
          adjustsFontSizeToFit
          accessibilityLiveRegion="polite"
          accessibilityRole="text"
        >
          {text}
        </Text>
        {pending ? (
          <Text style={[styles.hint, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Tap what you want
          </Text>
        ) : null}
      </View>

      {pending && onClear ? (
        <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel="Cancel sentence" hitSlop={6} style={[styles.side, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]}>
          <Icon name="close" size={30} color={theme.colors.text} />
          <Text style={[styles.sideLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Cancel</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onRepeat}
          disabled={!hasPhrase}
          accessibilityRole="button"
          accessibilityLabel="Say it again"
          accessibilityState={{ disabled: !hasPhrase }}
          hitSlop={6}
          style={({ pressed }) => [
            styles.side,
            { backgroundColor: hasPhrase ? theme.colors.primary : theme.colors.surfaceAlt, borderColor: hasPhrase ? theme.colors.primaryDark : theme.colors.borderSoft },
            pressed && styles.pressed,
          ]}
        >
          <Icon name="replay" size={32} color={hasPhrase ? '#FFFFFF' : theme.colors.textMuted} />
          <Text style={[styles.sideLabel, { color: hasPhrase ? '#FFFFFF' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Again
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    minHeight: 108,
    borderRadius: Radius.lg,
  },
  textCol: { flex: 1, gap: 2 },
  phrase: { fontFamily: Fonts.black },
  placeholder: { fontFamily: Fonts.semibold },
  hint: { fontFamily: Fonts.bold, fontSize: 15 },
  side: {
    width: MIN_CHILD_TARGET + 14,
    height: MIN_CHILD_TARGET + 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: { fontFamily: Fonts.bold, fontSize: 14 },
  pressed: { opacity: 0.85 },
});
