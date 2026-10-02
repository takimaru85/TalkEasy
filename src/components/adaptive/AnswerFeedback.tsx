import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { Fonts, Radius, useTheme } from '@/theme';

export type FeedbackKind = 'correct' | 'retry' | 'reveal';

const LOOK: Record<FeedbackKind, { icon: string; bg: string; border: string; iconBg: string; iconFg: string; dayBg: string; dayBorder: string }> = {
  correct: { icon: 'check-bold', bg: '#1B6B47', border: '#5BE39A', iconBg: '#3DDC84', iconFg: '#063B22', dayBg: '#DDF5E3', dayBorder: '#2FA055' },
  retry: { icon: 'refresh', bg: '#5A3A2E', border: '#FFA06B', iconBg: '#FFA06B', iconFg: '#4A1E0A', dayBg: '#FFE9D9', dayBorder: '#D9661A' },
  reveal: { icon: 'lightbulb-on', bg: '#1F3F7A', border: '#7FB6FF', iconBg: '#FFD84D', iconFg: '#4A3A00', dayBg: '#DCEBFF', dayBorder: '#2F66D6' },
};

/**
 * AnswerFeedback — what happened, in words and with an icon (never colour alone), shown under the
 * answers so the cards never move while the child is tapping. Gentle on purpose: a wrong answer
 * is "Not quite — try again", never a buzzer.
 */
export function AnswerFeedback({ kind, text }: { kind: FeedbackKind | null; text: string }) {
  const theme = useTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    if (kind) Animated.timing(fade, { toValue: 1, duration: theme.duration(220), useNativeDriver: true }).start();
  }, [kind, text, fade, theme]);

  if (!kind) return null;
  const l = LOOK[kind];
  return (
    <Animated.View
      style={[
        styles.banner,
        theme.night ? { backgroundColor: l.bg, borderColor: l.border } : { backgroundColor: l.dayBg, borderColor: l.dayBorder },
        { opacity: kind ? fade : 0 },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
    >
      <View style={[styles.icon, { backgroundColor: l.iconBg }]}>
        <Icon name={l.icon} size={20} color={l.iconFg} />
      </View>
      <Text style={[styles.text, { color: theme.night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: Radius.lg, borderWidth: 2 },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, fontFamily: Fonts.extrabold, fontSize: 18, lineHeight: 24 },
});
