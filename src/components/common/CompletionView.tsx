import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, useTheme } from '@/theme';
import { BigButton } from './BigButton';

interface Props {
  /** A big, happy picture: 🎉, 🌟. */
  emoji: string;
  title: string;
  /** One short line under the title. */
  message?: string;
  /** Anything else worth showing (stars earned…), between the message and the button. */
  extra?: React.ReactNode;
  actionLabel: string;
  actionIcon?: string;
  onAction: () => void;
}

/** The content never grows wider than this, and the button not wider than BUTTON_MAX. */
const CONTENT_MAX = 560;
const BUTTON_MAX = 420;

/**
 * The end of an activity: one centred group — picture, title, a short message, the next step.
 *
 * Plain column flow inside a flex: 1 area, centred both ways: nothing is placed with top/bottom
 * coordinates, so it sits correctly on any phone or tablet. On a wide screen the group keeps a
 * readable width and the button a comfortable one (it used to stretch edge to edge on a tablet),
 * and the group sits slightly above the true centre, where the eye lands first.
 */
export function CompletionView({ emoji, title, message, extra, actionLabel, actionIcon = 'check', onAction }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const { height } = useWindowDimensions();
  const night = theme.night;

  return (
    <View style={[styles.area, { paddingHorizontal: sizes.horizontalPadding, paddingBottom: Math.round(height * 0.08) }]}>
      <View style={styles.group}>
        <Text style={styles.emoji} allowFontScaling={false} accessibilityElementsHidden importantForAccessibility="no">
          {emoji}
        </Text>
        <Text
          style={[styles.title, { fontSize: sizes.heading + 4, color: night ? '#FFFFFF' : theme.colors.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {message ? (
          <Text style={[styles.message, { fontSize: sizes.body + 1, color: night ? 'rgba(255,255,255,0.88)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {message}
          </Text>
        ) : null}
        {extra}
        <View style={styles.action}>
          <BigButton label={actionLabel} icon={actionIcon} minHeight={MIN_CHILD_TARGET} onPress={onAction} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  group: { width: '100%', maxWidth: CONTENT_MAX, alignItems: 'center', gap: SPACING.sm },
  emoji: { fontSize: 72, lineHeight: 88, textAlign: 'center' },
  title: { fontFamily: Fonts.black, textAlign: 'center' },
  message: { fontFamily: Fonts.bold, textAlign: 'center', lineHeight: 24 },
  action: { width: '100%', maxWidth: BUTTON_MAX, marginTop: SPACING.md },
});
