import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET } from '@/constants/sizes';
import { Fonts } from '@/theme';
import { Adventure, AdventureRadius, shade, type AdventureKey } from '@/theme/adventure';
import { GradientSurface } from './GradientSurface';

/** A neutral grey-blue for secondary actions that should not draw the eye (Clear). */
const SLATE = { from: '#7D8BBE', to: '#4E5C8F' };

interface Props {
  label: string;
  icon?: string;
  /** A quest colour, or 'slate' for a neutral control. */
  tone: AdventureKey | 'slate';
  onPress: () => void;
  disabled?: boolean;
  /** The one action that matters most in a row (Done): a gold rim and a stronger glow. */
  primary?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * A compact game control for the night sky — a solid button with a light-to-deep gradient, a
 * fading gloss, a darker base underneath (3D depth) and a white icon and label. Used where a row
 * of equal controls needs colour to tell them apart (Undo / Clear / Done); the big one-per-screen
 * call to action stays AdventureButton.
 *
 * Draw it only on the night sky; in high contrast the caller keeps the plain BigButton.
 */
export function GameButton({ label, icon, tone, onPress, disabled, primary, height = MIN_CHILD_TARGET + 4, style, accessibilityLabel }: Props) {
  const c = tone === 'slate' ? SLATE : Adventure[tone];
  return (
    <PressableScale
      onPress={disabled ? () => {} : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={4}
      style={style}
    >
      <View
        style={[
          styles.button,
          {
            height,
            backgroundColor: c.to,
            borderColor: primary ? '#FFE27A' : shade(c.from, 1.3),
            borderBottomColor: shade(c.to, 0.62),
            shadowColor: primary ? c.from : '#070B26',
          },
          primary && styles.primary,
          disabled && styles.disabled,
        ]}
      >
        <GradientSurface from={c.from} to={c.to} direction="vertical" />
        {/* Gloss: fades out 55% of the way down (a full-size surface — see GradientSurface). */}
        <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.34} toOpacity={0} toOffset={0.55} />
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={primary ? 28 : 24} color="#FFFFFF" /> : null}
          <Text style={[styles.label, primary && styles.labelPrimary]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: AdventureRadius.disc,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primary: { borderWidth: 2.5, borderBottomWidth: 5, shadowOpacity: 0.7, shadowRadius: 14, elevation: 9 },
  disabled: { opacity: 0.45 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8 },
  label: {
    fontFamily: Fonts.black,
    fontSize: 17,
    color: '#FFFFFF',
    flexShrink: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  labelPrimary: { fontSize: 20 },
});
