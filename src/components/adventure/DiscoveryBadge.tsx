import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Fonts, useTheme } from '@/theme';
import { Adventure } from '@/theme/adventure';
import { BADGE } from './badgeGeometry';

const RAY = '#FFD84D';

/** A four-point star, drawn on a 24-unit grid. */
const STAR = 'M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z';

/**
 * A small floating sticker for the corner of a card: "New!", "Explore!", whatever the card wants to
 * be curious about.
 *
 * PURELY DECORATIVE, and built so it cannot get in the way:
 *  - `pointerEvents="none"`, so a tap on it is a tap on the card underneath — it has no handler and
 *    no navigation of its own;
 *  - hidden from screen readers, because the card's own label already says what it is;
 *  - it floats (a few points up and down, a touch of scale, about 3.5 s a cycle) rather than
 *    bouncing or flashing, and holds perfectly still when motion is reduced.
 *
 * Place it INSIDE the card's outer wrapper as a sibling of the clipping tile, never inside it: the
 * tile clips (`overflow: hidden`), and a sticker that overlaps the edge is the whole idea. The
 * wrapper that holds it needs a `zIndex` so a neighbouring card does not paint over its overhang.
 * Its geometry lives in `badgeGeometry.ts`, where `check:layout` proves it clears the card's icon.
 */
export function DiscoveryBadge({ label }: { label: string }) {
  const theme = useTheme();
  const still = useReducedMotion();
  const t = useRef(new Animated.Value(0)).current;
  const hue = Adventure.magenta;
  const plain = theme.highContrast;

  useEffect(() => {
    if (still) {
      t.stopAnimation();
      t.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 1750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 1750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [still, t]);

  return (
    <Animated.View
      pointerEvents="none"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.anchor,
        {
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
            { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
          ],
        },
      ]}
    >
      {/* Rays and sparkles: an overlay with OFFSETS (never a percentage on the absolute box), and the
          drawing scales to it on an in-flow child. */}
      {!plain ? (
        <View style={styles.burst}>
          <Svg width="100%" height="100%" viewBox="0 0 75 44" preserveAspectRatio="xMidYMid meet">
            <Line x1="10" y1="26" x2="3" y2="22" stroke={RAY} strokeWidth="3.4" strokeLinecap="round" />
            <Line x1="13" y1="16" x2="7" y2="10" stroke={RAY} strokeWidth="3.4" strokeLinecap="round" />
            <Line x1="22" y1="9" x2="20" y2="2" stroke={RAY} strokeWidth="3.4" strokeLinecap="round" />
            {/* The right-hand rays stop short on purpose: the next card is only SPACING.sm away, and a
                decoration must not reach it (see BADGE.reachRight and check:layout). */}
            <Line x1="68" y1="15" x2="71" y2="11.5" stroke={RAY} strokeWidth="3.4" strokeLinecap="round" />
            <Line x1="69" y1="24" x2="71" y2="24" stroke={RAY} strokeWidth="3.4" strokeLinecap="round" />
            <Path d={STAR} fill={RAY} transform="translate(61 1) scale(0.34)" />
            <Path d={STAR} fill="#FFFFFF" transform="translate(40 -1) scale(0.22)" />
          </Svg>
        </View>
      ) : null}

      <View
        style={[
          styles.pill,
          { backgroundColor: hue.to, borderColor: '#FFFFFF' },
          plain ? null : { shadowColor: '#FFD84D' },
          plain ? styles.noGlow : styles.glow,
        ]}
      >
        <Text style={styles.label} maxFontSizeMultiplier={1} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Top-right corner, overlapping the card's top edge. Offsets only — no percentage on an absolute box.
  // `zIndex` puts it above later siblings on iOS and web; `elevation` does the same on Android, where
  // elevation outranks tree order (see BADGE.elevation). Small, local numbers — not a global z-index.
  anchor: { position: 'absolute', top: -BADGE.rise, right: BADGE.inset, alignItems: 'center', justifyContent: 'center', zIndex: 1, elevation: BADGE.elevation },
  burst: { position: 'absolute', top: -12, bottom: -10, left: -17, right: -8 },
  pill: {
    height: BADGE.height,
    minWidth: BADGE.minWidth,
    paddingHorizontal: 9,
    borderRadius: BADGE.height / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: `-${BADGE.tilt}deg` }],
  },
  glow: {
    shadowOpacity: 0.9,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  noGlow: { elevation: 0, shadowOpacity: 0 },
  label: {
    fontFamily: Fonts.black,
    fontSize: 12,
    lineHeight: 15,
    color: '#FFFFFF',
    textShadowColor: 'rgba(120,10,50,0.55)',
    textShadowRadius: 2,
    textShadowOffset: { width: 0, height: 1 },
  },
});
