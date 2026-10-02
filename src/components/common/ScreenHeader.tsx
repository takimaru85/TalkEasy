import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, useTheme , AdventureInk, AdventureRadius, shade, useIsAdventure } from '@/theme';
import { GameIcon, type GameIconName } from '@/components/adventure/GameIcon';
import { ColorArt, type ColorArtName } from '@/components/adventure/ColorArt';
import { fitFontSize } from '@/utils/fitText';
import { Icon } from './Icon';
import { Glyph } from './Glyph';

interface Props {
  title: string;
  onBack?: () => void;
  /** Icon/label for the left button (defaults to a back arrow). Child screens pass 'home'. */
  backIcon?: string;
  backLabel?: string;
  /** Right-hand action (e.g. the parent lock button on child screens). */
  rightIcon?: string;
  rightLabel?: string;
  /** What a screen reader says for the right button when it has no visible label (an icon-only button). */
  rightAccessibilityLabel?: string;
  onRightPress?: () => void;
  /** Optional icon before the title: an interface emoji or a line-icon name. */
  emoji?: string;
  /** Tint for `emoji` when it is a plain icon name. */
  emojiTint?: string;
  /** Illustrated game icon before the title, used instead of `emoji` on the night sky. */
  art?: GameIconName;
  /** A colourful illustration (ColorArt) in place of `art` — for sections that wear their own drawing. */
  colorArt?: ColorArtName;
  /** One short line under the title ("Tap a card to talk"). */
  subtitle?: string;
}

/**
 * Header with optional back button (left) and one optional action (right).
 * Both controls are pill-shaped, at least 64pt, and always in the same position.
 */
export function ScreenHeader({ title, onBack, backIcon = 'arrow-left', backLabel, rightIcon, rightLabel, rightAccessibilityLabel, onRightPress, emoji, emojiTint, art, colorArt, subtitle }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const adventure = useIsAdventure();
  const ink = adventure && !theme.highContrast && !theme.night ? AdventureInk : theme.colors.text;
  // Room left for the title between the two buttons; the title is sized to fit it on one line.
  const [titleWidth, setTitleWidth] = useState(0);
  const showArt = (!!art || !!colorArt) && theme.night;
  const titleSize = fitFontSize(title, titleWidth - (showArt ? 48 : emoji ? 42 : 0), sizes.heading, 'line', 18);
  // Navigation buttons are compact: 56dp, plus an 8dp hit slop on every side, so the touch target
  // (72dp) stays above the 64dp child minimum without the button dominating the title. A labelled
  // button ("Home") is a little wider for its word. Both sides take the same width, so the title
  // stays truly centred.
  const labelled = !!backLabel || !!rightLabel;
  const buttonWidth = labelled ? NAV_SIZE + 16 : NAV_SIZE;
  const buttonStyle = [
    styles.iconButton,
    theme.shadow,
    adventure ? { borderRadius: AdventureRadius.disc } : null,
    theme.night
      ? // A solid game button: lighter rim, darker base underneath.
        { backgroundColor: theme.colors.surfaceAlt, borderColor: shade(theme.colors.surfaceAlt, 1.5), borderWidth: 1.5, borderBottomColor: shade(theme.colors.surfaceAlt, 0.6), borderBottomWidth: 4 }
      : { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.border : theme.colors.borderSoft, borderWidth: theme.highContrast ? theme.borderWidth : 1 },
  ];

  return (
    <View style={styles.row}>
      <View style={[styles.side, { width: buttonWidth }]}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel ?? 'Back'}
            hitSlop={8}
            style={({ pressed }) => [buttonStyle, { width: backLabel ? NAV_SIZE + 16 : NAV_SIZE }, pressed && styles.pressed]}
          >
            <Icon name={backIcon} size={backLabel ? 24 : 28} color={theme.colors.text} />
            {backLabel ? (
              <Text style={[styles.iconLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {backLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      <View style={styles.titleWrap} onLayout={(e) => setTitleWidth(e.nativeEvent.layout.width)}>
        {showArt && colorArt ? <ColorArt name={colorArt} size={42} /> : showArt && art ? <GameIcon name={art} size={42} /> : emoji ? <Glyph value={emoji} size={34} tint={emojiTint} /> : null}
        <View style={styles.titleCol}>
        <Text
          style={[styles.title, { fontSize: titleSize, color: ink }, theme.night && styles.titleNight]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        </View>
      </View>

      <View style={[styles.side, styles.sideRight, { width: buttonWidth }]}>
        {rightIcon && onRightPress ? (
          <Pressable
            onPress={onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightLabel ?? rightAccessibilityLabel ?? 'Menu'}
            hitSlop={8}
            style={({ pressed }) => [buttonStyle, { width: rightLabel ? NAV_SIZE + 16 : NAV_SIZE }, pressed && styles.pressed]}
          >
            <Icon name={rightIcon} size={24} color={theme.colors.text} />
            {rightLabel ? (
              <Text style={[styles.iconLabel, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {rightLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** Visual size of a header navigation button (the hit slop adds 8dp on every side). */
const NAV_SIZE = 56;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: NAV_SIZE + SPACING.sm * 2,
  },
  side: { alignItems: 'flex-start' },
  sideRight: { alignItems: 'flex-end' },
  titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: SPACING.sm },
  emoji: { fontSize: 24, lineHeight: 30 },
  titleCol: { flexShrink: 1, alignItems: 'center' },
  title: { fontFamily: Fonts.black, textAlign: 'center', flexShrink: 1 },
  titleNight: { textShadowColor: 'rgba(80,150,255,0.55)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontFamily: Fonts.bold, fontSize: 14, textAlign: 'center', marginTop: 1 },
  iconButton: {
    height: NAV_SIZE,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: { fontFamily: Fonts.bold, fontSize: 11, marginTop: -2 },
  pressed: { opacity: 0.7 },
});
