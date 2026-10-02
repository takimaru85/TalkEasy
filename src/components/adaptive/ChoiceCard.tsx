import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, shade, useTheme } from '@/theme';
import { AdventureRadius } from '@/theme/adventure';
import { fitFontSize } from '@/utils/fitText';
import { AnswerPicture } from './AnswerPicture';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong' | 'hint';

interface Props {
  label: string;
  emoji?: string;
  state?: ChoiceState;
  onPress: () => void;
  /** Answering is over (or paused): the card cannot be tapped and steps back visually. */
  disabled?: boolean;
  /** Picture-first layout: the picture above the label. Otherwise picture beside the label. */
  pictureMode?: boolean;
  /** Draw the TalkEasy illustration rather than the emoji (decided per set, see illustratedSet). */
  illustrated?: boolean;
  width?: number | `${number}%`;
  accessibilityLabel?: string;
}

/** Night-sky colours per state. Every state also has its own icon badge — never colour alone. */
const NIGHT = {
  idle: { bg: '#1E2A63', border: '#4A5AA8', base: '#111943', width: 1.5 },
  selected: { bg: '#26357A', border: '#7FB6FF', base: '#16205A', width: 3 },
  correct: { bg: '#1B6B47', border: '#5BE39A', base: '#0F4A30', width: 3.5 },
  // Gentle, not alarming: a warm orange rather than a warning red.
  wrong: { bg: '#5A3A2E', border: '#FFA06B', base: '#3A2219', width: 3 },
  hint: { bg: '#4E4320', border: '#FFD84D', base: '#332B12', width: 3 },
} as const;

const BADGE: Record<Exclude<ChoiceState, 'idle'>, { icon: string; bg: string; fg: string; label: string }> = {
  selected: { icon: 'check-bold', bg: '#7FB6FF', fg: '#0E2350', label: 'selected' },
  correct: { icon: 'check-bold', bg: '#3DDC84', fg: '#063B22', label: 'correct' },
  wrong: { icon: 'close-thick', bg: '#FFA06B', fg: '#4A1E0A', label: 'not this one' },
  hint: { icon: 'lightbulb-on', bg: '#FFD84D', fg: '#4A3A00', label: 'hint' },
};

/**
 * AnswerChoiceCard — the one answer card for every question screen (Lessons, Play & Learn,
 * Speech Practice): a picture on its plate, a label, and a state.
 *
 * States: idle, selected, correct, wrong (shown gently), hint, and disabled. Each is told by a
 * border, a fill, an icon badge in the corner and the accessibility label — never colour alone.
 * Correct gives a small "pop", wrong a small sideways nudge; both are skipped in reduced motion.
 * The badge sits in the corner, so a card never changes size when its state changes.
 */
export function ChoiceCard({ label, emoji, state = 'idle', onPress, disabled, pictureMode, illustrated, width = '100%', accessibilityLabel }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const c = theme.colors;
  const night = theme.night;
  const scale = useRef(new Animated.Value(1)).current;
  const nudge = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'correct') {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.04, duration: theme.duration(140), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: theme.duration(180), useNativeDriver: true }),
      ]).start();
    } else if (state === 'wrong') {
      const step = (to: number) => Animated.timing(nudge, { toValue: to, duration: theme.duration(70), useNativeDriver: true });
      Animated.sequence([step(6), step(-6), step(3), step(0)]).start();
    }
  }, [state, scale, nudge, theme]);

  const day = {
    idle: { bg: c.surface, border: theme.highContrast ? c.border : c.borderSoft, width: theme.highContrast ? theme.borderWidth : 1.5 },
    selected: { bg: theme.tint(c.primarySoft), border: c.primary, width: 4 },
    correct: { bg: theme.tint(c.successSoft), border: c.success, width: 4 },
    wrong: { bg: theme.tint('#FFE0E0'), border: c.danger, width: 4 },
    hint: { bg: theme.tint('#FFF1C2'), border: c.selected, width: 4 },
  }[state];
  const look = night ? NIGHT[state] : { ...day, base: day.border };

  const plate = pictureMode ? Math.max(64, sizes.iconSize + 28) : Math.max(52, sizes.iconSize + 4);
  const height = pictureMode ? Math.max(sizes.tileHeight, 140) : Math.max(sizes.tileHeight * 0.62, 84);
  // The label is fitted to the room the card really has (one size per card, never clipped).
  const numericWidth = typeof width === 'number' ? width : null;
  const room = numericWidth ? (pictureMode ? numericWidth - SPACING.md * 2 : numericWidth - plate - SPACING.md * 3 - 26) : 0;
  const base = pictureMode ? sizes.body + 2 : sizes.tileLabel + 1;
  const labelSize = room > 0 ? fitFontSize(label, room, base, 'word', 14) : base;
  const badge = state === 'idle' ? null : BADGE[state];
  const stepBack = disabled && (state === 'idle' || state === 'selected');

  return (
    <Animated.View style={{ width, flexShrink: 1, minWidth: 0, transform: [{ scale }, { translateX: nudge }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel ?? label}${badge ? `, ${badge.label}` : ''}`}
        accessibilityState={{ selected: state === 'selected', disabled }}
        hitSlop={4}
        style={({ pressed }) => [
          styles.card,
          night ? styles.cardNight : theme.shadow,
          {
            minHeight: height,
            backgroundColor: look.bg,
            borderColor: look.border,
            borderWidth: look.width,
            borderBottomColor: night ? (state === 'idle' ? look.base : look.border) : look.border,
            borderBottomWidth: night ? Math.max(look.width, 4) : look.width,
            borderRadius: night ? AdventureRadius.disc : Radius.lg,
            flexDirection: pictureMode ? 'column' : 'row',
            justifyContent: pictureMode ? 'center' : 'flex-start',
            paddingRight: pictureMode ? SPACING.md : SPACING.md + 22,
          },
          pressed && !disabled && { backgroundColor: night ? shade(look.bg, 1.12) : theme.tint(c.primarySoft) },
          stepBack && styles.disabled,
        ]}
      >
        {emoji ? <AnswerPicture emoji={emoji} size={plate} illustrated={illustrated} /> : null}
        <Text
          style={[
            styles.label,
            { fontSize: labelSize, lineHeight: Math.round(labelSize * 1.2), color: c.text, textAlign: pictureMode || !emoji ? 'center' : 'left' },
            night && styles.labelNight,
          ]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={3}
          textBreakStrategy="simple"
        >
          {label}
        </Text>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: night || theme.highContrast ? badge.bg : look.border }]} accessibilityElementsHidden>
            <Icon name={badge.icon} size={16} color={night ? badge.fg : '#FFFFFF'} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

/** The same component under the name the design system uses. */
export const AnswerChoiceCard = ChoiceCard;

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingLeft: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cardNight: {
    shadowColor: '#050823',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  disabled: { opacity: 0.55 },
  label: { fontFamily: Fonts.extrabold, flexShrink: 1 },
  labelNight: { fontFamily: Fonts.black },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

/**
 * The answer grid: the cards, in rows of `columns`.
 *
 * IT DOES NOT WRAP. A wrapping row decides for itself how many cards fit, using widths that were
 * worked out from the WINDOW — and the moment those two disagree it re-packs. Three full-width
 * cards become two on one line and a lonely third below, with its picture hanging off the edge;
 * that is the bug this shape exists to make impossible. Rotating the device, split screen, or a
 * parent that adds padding are all enough to cause the disagreement.
 *
 * Laying out explicit rows means the card count per row is a DECISION (useChoiceLayout) rather
 * than a side effect of arithmetic, and each row's cards may shrink to share whatever width the
 * row really has. A final short row stays left-aligned, which is what reads as "and one more"
 * rather than as a mistake.
 */
export function ChoiceGrid({ children, columns = 1 }: { children: React.ReactNode; columns?: number }) {
  const sizes = useSizes();
  const items = React.Children.toArray(children).filter(Boolean);
  const perRow = Math.max(1, Math.floor(columns));
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow));

  return (
    <View style={{ gap: sizes.gap }}>
      {rows.map((row, i) => (
        <View key={i} style={[styles2.row, { gap: sizes.gap }]}>
          {row}
        </View>
      ))}
    </View>
  );
}

export const AnswerChoiceGrid = ChoiceGrid;

const styles2 = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
});
