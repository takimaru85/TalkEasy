import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { useIsFocused } from '@react-navigation/native';
import type { PetMood } from '@/adventure/pet';
import { Celebration } from '@/components/common';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// The supplied robot, a transparent WebP bundled locally (assets/avatars); nothing is fetched.
const PET_IMAGE = require('../../../assets/avatars/space-pet.webp');

/** A five-point star centred on cx, cy. */
function star(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
}

/**
 * Cosmetics are drawn over the picture on a 100-unit grid, so they scale with the pet at any size.
 *
 * The coordinates are measured from the robot image (1312 x 1199, shown with `contain` in a square, so
 * it fills the width and is inset about 4.3 units top and bottom). In grid units: the head spans
 * x 26-75 and y 22-61 (its ears reach x 22-80), the teal star sits at about (58, 10) on a stem rising from
 * (54.5, 22), the neck is at y 61-63, the chest badge is centred at (47, 71) with radius 9, and the
 * shoulder joints are at about (34, 63) and (63, 65). If the picture is ever replaced, re-measure these.
 */
function Cosmetic({ id, compact }: { id: string; compact: boolean }) {
  switch (id) {
    case 'helmet':
      return (
        <G>
          <Ellipse cx={51} cy={41.5} rx={31} ry={23.5} fill="#BFE6FF" fillOpacity={compact ? 0.1 : 0.2} stroke="#FFFFFF" strokeOpacity={compact ? 0.7 : 0.9} strokeWidth={compact ? 1.2 : 1.6} />
          {compact ? null : <Path d="M29 34 Q34 23 46 19.5" stroke="#FFFFFF" strokeOpacity={0.95} strokeWidth={2.2} strokeLinecap="round" fill="none" />}
        </G>
      );
    case 'explorer-hat':
      return (
        <G>
          <Ellipse cx={50.5} cy={25} rx={27} ry={4.6} fill="#A87626" />
          <Path d="M36.5 25 Q36.5 13.5 50.5 13.5 Q64.5 13.5 64.5 25 Z" fill="#D9A646" />
          <Path d="M36.5 25 L64.5 25 L64.2 21 L36.8 21 Z" fill="#7A4A1A" />
        </G>
      );
    case 'star-antenna':
      return (
        <G>
          <Path d="M55 22 Q56.2 18 57.8 15" stroke="#E0A800" strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <Path d={star(57.9, 10, 8.4, 3.8)} fill="#FFD84D" stroke="#E0A800" strokeWidth={1} strokeLinejoin="round" />
        </G>
      );
    case 'scarf':
      return (
        <G>
          {/* Arched over the neck so its middle stays clear of the chest badge, whose ring starts at y 62. */}
          <Path d="M34.5 63 Q49 57.5 63.5 63" stroke="#FF6B6B" strokeWidth={5.5} strokeLinecap="round" fill="none" />
          <Rect x={58.5} y={62} width={7} height={13} rx={3.4} fill="#FF8E8E" />
          <Rect x={58.5} y={68.5} width={7} height={2.3} fill="#FFD84D" />
        </G>
      );
    case 'space-suit':
      return (
        <G>
          <Circle cx={34.3} cy={63.5} r={5.2} fill="#FFB347" stroke="#E08A00" strokeWidth={1.4} />
          <Circle cx={63.3} cy={65.5} r={5.2} fill="#FFB347" stroke="#E08A00" strokeWidth={1.4} />
          {/* The thin collar and belt lines turn to noise at small sizes; the shoulder pads carry the suit. */}
          {compact ? null : <Path d="M40 62.6 Q49 66.5 59 63" stroke="#FFB347" strokeWidth={2.4} strokeLinecap="round" fill="none" />}
          {compact ? null : <Path d="M36.5 84 Q47.5 89 58.5 84" stroke="#FFB347" strokeWidth={3} strokeLinecap="round" fill="none" />}
        </G>
      );
    case 'gold-visor':
      return (
        <G>
          <Ellipse cx={51} cy={41.5} rx={31} ry={23.5} fill="#FFD84D" fillOpacity={compact ? 0.14 : 0.22} stroke="#E0A800" strokeOpacity={0.95} strokeWidth={compact ? 1.4 : 1.8} />
          {compact ? null : <Path d="M30 34 Q35 24 46 20" stroke="#FFFFFF" strokeOpacity={0.95} strokeWidth={2.2} strokeLinecap="round" fill="none" />}
        </G>
      );
    case 'galaxy-suit':
      return (
        <G>
          <Circle cx={34.3} cy={63.5} r={5.2} fill="#7B5CFF" stroke="#C9B8FF" strokeWidth={1.4} />
          <Circle cx={63.3} cy={65.5} r={5.2} fill="#7B5CFF" stroke="#C9B8FF" strokeWidth={1.4} />
          {compact ? null : <Path d="M40 62.6 Q49 66.5 59 63" stroke="#7B5CFF" strokeWidth={2.4} strokeLinecap="round" fill="none" />}
          {compact ? null : <Path d="M36.5 84 Q47.5 89 58.5 84" stroke="#4D9BE8" strokeWidth={3} strokeLinecap="round" fill="none" />}
          {compact ? null : <Path d={star(34.3, 63.5, 2.6, 1.1)} fill="#FFD84D" />}
        </G>
      );
    default:
      return null;
  }
}

/** Back to front, so the suit is under the scarf, the scarf under the helmet and the star on top. */
const DRAW_ORDER = ['space-suit', 'galaxy-suit', 'scarf', 'helmet', 'gold-visor', 'explorer-hat', 'star-antenna'];

interface Props {
  size: number;
  mood?: PetMood;
  /** Ids of the worn cosmetics (already filtered to unlocked ones). */
  equipped?: string[];
  /** Bump to play the celebration sparkles once. 0 = none. */
  burst?: number;
}

/**
 * The Space Pet. Idle bobs gently; happy does one little hop; celebrate hops, wiggles and throws the
 * shared star burst; wave sways once. All of it is skipped under reduced motion (the picture and its
 * cosmetics still show), and nothing loops unless the screen is in front. No state here can be sad
 * or neglected: there is only ever idle, happy, celebrating or waving.
 */
export function SpacePet({ size, mood = 'idle', equipped = [], burst = 0 }: Props) {
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const bob = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  // Idle: a slow bob, only while visible.
  useEffect(() => {
    if (reduced || !focused) {
      bob.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, focused, bob]);

  // Happy / celebrate: one hop (celebrate adds a wiggle). Wave: one sway.
  useEffect(() => {
    if (reduced) return;
    if (mood === 'happy' || mood === 'celebrate') {
      hop.setValue(0);
      Animated.sequence([
        Animated.timing(hop, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(hop, { toValue: 0, friction: 4, useNativeDriver: true }),
      ]).start();
    }
    if (mood === 'celebrate' || mood === 'wave') {
      sway.setValue(0);
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(sway, { toValue: -1, duration: 260, useNativeDriver: true }),
        Animated.timing(sway, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [mood, burst, reduced, hop, sway]);

  const translateY = Animated.add(bob.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.03] }), hop.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.12] }));
  const rotate = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] });

  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel="Your Space Pet, a friendly robot">
      <Animated.View style={{ width: size, height: size, transform: [{ translateY }, { rotate }] }}>
        <Image source={PET_IMAGE} style={{ width: size, height: size }} resizeMode="contain" />
        <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill} pointerEvents="none">
          {DRAW_ORDER.filter((id) => equipped.includes(id)).map((id) => (
            <Cosmetic key={id} id={id} compact={size < 110} />
          ))}
        </Svg>
      </Animated.View>
      <Celebration trigger={burst} />
    </View>
  );
}
