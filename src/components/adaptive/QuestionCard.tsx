import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, useTheme } from '@/theme';

interface ActionProps {
  label: string;
  icon: string;
  onPress: () => void;
  /** 'primary' = the main secondary action (Hear again); 'quiet' = Hint. */
  tone?: 'primary' | 'quiet';
  accessibilityLabel?: string;
}

/**
 * The small action buttons on a question card (Hear again, Hint): one component, so they share
 * height, radius, icon size and spacing. 52dp tall with a 6dp hit slop — 64dp to the finger.
 */
export function QuestionAction({ label, icon, onPress, tone = 'primary', accessibilityLabel }: ActionProps) {
  const theme = useTheme();
  const primary = tone === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.action,
        primary
          ? { backgroundColor: theme.colors.primary, borderColor: theme.night ? 'rgba(255,255,255,0.85)' : theme.colors.primaryDark }
          : theme.night
            ? { backgroundColor: 'rgba(8,11,38,0.35)', borderColor: 'rgba(255,255,255,0.55)' }
            : { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft },
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={22} color={primary || theme.night ? '#FFFFFF' : theme.colors.text} />
      <Text style={[styles.actionText, { color: primary || theme.night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

interface Props {
  question: string;
  /** Emoji illustration above the question. */
  image?: string | null;
  /** The subject's soft tint (drawn solid on the night sky). */
  color?: string;
  onHear: () => void;
  /** Optional hint: shows the Hint button until it is opened. */
  hint?: string | null;
  showHint?: boolean;
  onHint?: () => void;
}

/**
 * QuestionCard — the question, the main focus of every question screen: an illustration, the
 * question in large type, and Hear again / Hint. Used by Lessons and Play & Learn alike.
 */
export function QuestionCard({ question, image, color, onHear, hint, showHint, onHint }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const fontSize = question.length > 60 ? sizes.body + 3 : question.length > 32 ? sizes.phrase - 6 : sizes.phrase - 2;
  const imageSize = image && image.length > 6 ? sizes.iconSize - 6 : sizes.iconSize + 22;

  return (
    <Card color={color} style={styles.card} padding={SPACING.lg}>
      {image ? (
        <Text style={[styles.image, { fontSize: imageSize, lineHeight: Math.round(imageSize * 1.2) }]} allowFontScaling={false} accessibilityElementsHidden importantForAccessibility="no">
          {image}
        </Text>
      ) : null}
      <Text
        style={[styles.question, { fontSize, lineHeight: Math.round(fontSize * 1.22), color: theme.colors.text }, theme.night && styles.questionNight]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        accessibilityRole="header"
      >
        {question}
      </Text>
      <View style={styles.actions}>
        <QuestionAction label="Hear again" icon="volume-high" onPress={onHear} accessibilityLabel="Hear the question again" />
        {hint && !showHint && onHint ? <QuestionAction label="Hint" icon="lightbulb-on-outline" tone="quiet" onPress={onHint} accessibilityLabel="Show a hint" /> : null}
      </View>
      {hint && showHint ? (
        <View style={[styles.hint, theme.night ? styles.hintNight : { backgroundColor: theme.colors.surface }]} accessibilityLiveRegion="polite">
          <Icon name="lightbulb-on" size={20} color={theme.night ? '#FFD84D' : theme.colors.text} />
          <Text style={[styles.hintText, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {hint}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: SPACING.md },
  image: { textAlign: 'center', marginBottom: -SPACING.xs },
  question: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  questionNight: { textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 3 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 52,
    minWidth: 120,
    paddingHorizontal: SPACING.lg,
    borderRadius: Radius.pill,
    borderWidth: 2,
  },
  actionText: { fontFamily: Fonts.extrabold, fontSize: 16 },
  pressed: { opacity: 0.8 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, alignSelf: 'stretch', padding: SPACING.md, borderRadius: Radius.md },
  hintNight: { backgroundColor: 'rgba(8,11,38,0.3)' },
  hintText: { flex: 1, fontFamily: Fonts.bold, fontSize: 17, lineHeight: 23 },
});
