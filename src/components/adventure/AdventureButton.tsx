import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, AdventureShadow, shade, type AdventureKey } from '@/theme/adventure';
import { GameIcon, type GameIconName } from './GameIcon';
import { GradientSurface } from './GradientSurface';
import { fitFontSize } from '@/utils/fitText';

interface Props {
  label: string;
  onPress: () => void;
  icon?: string;
  /** Illustrated game icon, drawn instead of `icon` (not in high contrast). */
  art?: GameIconName;
  /**
   * A ready-made illustration, drawn instead of `art` — how a themed screen supplies the active
   * theme's artwork without this component having to know the theme system exists.
   */
  artNode?: React.ReactNode;
  /** Quieter second line, e.g. "Continue your journey". */
  sublabel?: string;
  color?: AdventureKey;
  accessibilityLabel?: string;
}

/**
 * The big call to action. One per screen: it is the thing a child should press if they press
 * nothing else, so it is the largest, brightest and most central control on the page.
 *
 * White text on the deeper gradient stop, which clears 4.5:1 on every colour in the set. In high
 * contrast mode the gradient is dropped for a flat fill and a hard border, because a gradient
 * behind text is exactly what high contrast exists to remove.
 */
export function AdventureButton({ label, onPress, icon, art, artNode, sublabel, color = 'sun', accessibilityLabel }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const c = Adventure[color];
  // The label is fitted to the room the icon and arrow leave, measured, rather than trusting
  // adjustsFontSizeToFit, which Android often ignores.
  const [textWidth, setTextWidth] = useState(0);
  const labelSize = textWidth ? fitFontSize(label, textWidth, sizes.buttonLabel + 4, 'line', 15) : sizes.buttonLabel + 4;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (sublabel ? `${label}. ${sublabel}` : label)}
      hitSlop={6}
    >
      {/* The shell casts the glow; the button inside clips its gradient. iOS clips a view's shadow
          to its own overflow:hidden, so one layer lost the glow on iPhones only. */}
      <View style={[styles.shell, theme.highContrast ? null : [AdventureShadow, styles.glowShadow, { shadowColor: c.to, backgroundColor: c.to }]]}>
      <View
        style={[
          styles.button,
          theme.highContrast
            ? { backgroundColor: c.to, borderWidth: theme.borderWidth, borderColor: theme.colors.border }
            : [styles.rim, { borderColor: shade(c.from, 1.3), borderBottomColor: shade(c.to, 0.7) }],
        ]}
      >
        {theme.highContrast ? null : (
          <>
            <GradientSurface from={c.from} to={c.to} direction="vertical" />
            {/* Gloss: fades out 55% of the way down (a full-size surface — see GradientSurface). */}
            <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.34} toOpacity={0} toOffset={0.55} />
          </>
        )}
        <View style={styles.row}>
          {artNode && !theme.highContrast ? (
            <View style={styles.art}>{artNode}</View>
          ) : art && !theme.highContrast ? (
            <View style={styles.art}>
              <GameIcon name={art} size={46} />
            </View>
          ) : icon ? (
            <Icon name={icon} size={30} color="#FFFFFF" />
          ) : null}
          <View style={styles.text} onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}>
            <Text
              style={[styles.label, { fontSize: labelSize }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              // Fitted to one line where it can be; on the narrowest phones it wraps to two rather
              // than truncating. (No adjustsFontSizeToFit: Android ignores it, so the platforms differed.)
              numberOfLines={2}
            >
              {label}
            </Text>
            {sublabel ? (
              <Text style={styles.sublabel} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                {sublabel}
              </Text>
            ) : null}
          </View>
          {/* Where the press takes you — an action cue, not decoration. */}
          <View style={[styles.arrow, !theme.highContrast && { backgroundColor: shade(c.to, 0.8) }]}>
            <Icon name="chevron-right" size={26} color="#FFFFFF" />
          </View>
        </View>
      </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_CHILD_TARGET + 20,
    borderRadius: AdventureRadius.card,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  // Icon | words (centred in the space left) | arrow — the arrow always sits at the right edge.
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  shell: { borderRadius: AdventureRadius.card },
  glowShadow: { shadowOpacity: 0.55, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 9 },
  rim: { borderWidth: 2, borderBottomWidth: 5 },
  art: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  arrow: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, alignItems: 'center', gap: 1 },
  label: { fontFamily: Fonts.black, color: '#FFFFFF', textAlign: 'center', alignSelf: 'stretch', letterSpacing: 0.4, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  sublabel: { fontFamily: Fonts.bold, color: '#FFFFFF', opacity: 0.92, fontSize: 14, textAlign: 'center', alignSelf: 'stretch' },
});
