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

/** A heart centred on cx, cy; k scales it (about 2.4k wide). */
function heart(cx: number, cy: number, k: number): string {
  return `M${cx} ${cy + 1.9 * k} C${cx - 2.4 * k} ${cy - 0.2 * k} ${cx - 1.6 * k} ${cy - 2.2 * k} ${cx} ${cy - 0.9 * k} C${cx + 1.6 * k} ${cy - 2.2 * k} ${cx + 2.4 * k} ${cy - 0.2 * k} ${cx} ${cy + 1.9 * k} Z`;
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
    case 'rosy-cheeks':
      return (
        <G>
          <Ellipse cx={34.5} cy={50} rx={4.2} ry={2.6} fill="#FF7FA8" fillOpacity={0.6} />
          <Ellipse cx={67.5} cy={50} rx={4.2} ry={2.6} fill="#FF7FA8" fillOpacity={0.6} />
        </G>
      );
    case 'bunny-ears':
      return (
        <G>
          <G transform="rotate(-12 40 24)">
            <Ellipse cx={40} cy={11} rx={5} ry={13} fill="#FFFFFF" stroke="#C9D3F0" strokeWidth={1.2} />
            <Ellipse cx={40} cy={12} rx={2.4} ry={9} fill="#FFB6CC" />
          </G>
          <G transform="rotate(12 61 24)">
            <Ellipse cx={61} cy={11} rx={5} ry={13} fill="#FFFFFF" stroke="#C9D3F0" strokeWidth={1.2} />
            <Ellipse cx={61} cy={12} rx={2.4} ry={9} fill="#FFB6CC" />
          </G>
        </G>
      );
    case 'cat-ears':
      return (
        <G>
          <Path d="M30 30 L31.5 11 L46 23 Z" fill="#FFB347" stroke="#E08A00" strokeWidth={1.2} strokeLinejoin="round" />
          <Path d="M33.5 25 L34.2 16.5 L41 22.5 Z" fill="#FFC9D6" />
          <Path d="M71 30 L69.5 11 L55 23 Z" fill="#FFB347" stroke="#E08A00" strokeWidth={1.2} strokeLinejoin="round" />
          <Path d="M67.5 25 L66.8 16.5 L60 22.5 Z" fill="#FFC9D6" />
        </G>
      );
    case 'pink-bow':
      return (
        <G>
          <Path d="M39 21 L28 14 L28 28 Z" fill="#FF6BB5" stroke="#D93C8E" strokeWidth={1} strokeLinejoin="round" />
          <Path d="M39 21 L50 14 L50 28 Z" fill="#FF6BB5" stroke="#D93C8E" strokeWidth={1} strokeLinejoin="round" />
          <Circle cx={39} cy={21} r={3.3} fill="#FF9BD0" stroke="#D93C8E" strokeWidth={1} />
        </G>
      );
    case 'party-hat':
      return (
        <G>
          <Path d="M39 27 L50.5 3.5 L62 27 Z" fill="#FF6BB5" stroke="#D93C8E" strokeWidth={1} strokeLinejoin="round" />
          <Path d="M43 19.5 L58 19.5 M40.5 24.5 L60.5 24.5" stroke="#FFE27A" strokeWidth={2.2} strokeLinecap="round" />
          <Circle cx={50.5} cy={3.5} r={3.2} fill="#FFD84D" stroke="#E0A800" strokeWidth={1} />
        </G>
      );
    case 'flower-crown':
      return (
        <G>
          <Path d="M32 27 Q50.5 17 69 27" stroke="#4FBF6B" strokeWidth={2.4} strokeLinecap="round" fill="none" />
          {[[35, 25.5, '#FF7FA8'], [42, 21.5, '#FFD84D'], [50.5, 19.8, '#B58CFF'], [59, 21.5, '#FF7FA8'], [66, 25.5, '#FFD84D']].map(([x, y, c]) => (
            <G key={String(x)}>
              <Circle cx={Number(x)} cy={Number(y)} r={3.6} fill={String(c)} stroke="#FFFFFF" strokeWidth={0.8} />
              <Circle cx={Number(x)} cy={Number(y)} r={1.2} fill="#FFFFFF" />
            </G>
          ))}
        </G>
      );
    case 'royal-crown':
      return (
        <G>
          <Path d="M35 27 L36.5 11.5 L43.5 19.5 L50.5 8.5 L57.5 19.5 L64.5 11.5 L66 27 Z" fill="#FFD84D" stroke="#E0A800" strokeWidth={1.2} strokeLinejoin="round" />
          <Circle cx={50.5} cy={22} r={2.2} fill="#FF5DA2" />
          <Circle cx={42} cy={23} r={1.6} fill="#4D9BE8" />
          <Circle cx={59} cy={23} r={1.6} fill="#5BD98A" />
        </G>
      );
    case 'heart-glasses':
      return (
        <G>
          <Path d={heart(42, 43, 3.6)} fill="#FF7FA8" fillOpacity={0.35} stroke="#FF3D8B" strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={heart(60, 43, 3.6)} fill="#FF7FA8" fillOpacity={0.35} stroke="#FF3D8B" strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M47 42 Q51 40.5 55 42" stroke="#FF3D8B" strokeWidth={1.4} fill="none" />
        </G>
      );
    case 'star-glasses':
      return (
        <G>
          <Path d={star(42, 43, 7, 3.2)} fill="#FFD84D" fillOpacity={0.4} stroke="#E0A800" strokeWidth={1.4} strokeLinejoin="round" />
          <Path d={star(60, 43, 7, 3.2)} fill="#FFD84D" fillOpacity={0.4} stroke="#E0A800" strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M48.5 42 Q51 40.8 53.5 42" stroke="#E0A800" strokeWidth={1.4} fill="none" />
        </G>
      );
    case 'bow-tie':
      return (
        <G>
          <Path d="M50 62.5 L41 58 L41 67 Z" fill="#4D9BE8" stroke="#2F6FB8" strokeWidth={1} strokeLinejoin="round" />
          <Path d="M50 62.5 L59 58 L59 67 Z" fill="#4D9BE8" stroke="#2F6FB8" strokeWidth={1} strokeLinejoin="round" />
          <Circle cx={50} cy={62.5} r={2.4} fill="#7DB8F2" stroke="#2F6FB8" strokeWidth={1} />
        </G>
      );
    case 'bell-collar':
      return (
        <G>
          <Path d="M35 62.5 Q49 67 64 62.5" stroke="#FF5DA2" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Circle cx={49.5} cy={66.2} r={3} fill="#FFD84D" stroke="#E0A800" strokeWidth={1} />
          <Path d="M47.5 66.6 L51.5 66.6" stroke="#E0A800" strokeWidth={0.9} />
        </G>
      );
    case 'heart-antenna':
      return (
        <G>
          <Path d="M55 22 Q56.2 18 57.8 15" stroke="#E0457F" strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <Path d={heart(57.9, 10.5, 4.2)} fill="#FF5DA2" stroke="#E0457F" strokeWidth={1} strokeLinejoin="round" />
        </G>
      );
    case 'rainbow-antenna':
      return (
        <G>
          <Path d="M55 22 Q56.2 18 57.8 15" stroke="#8A6FD8" strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <Circle cx={57.9} cy={10.5} r={6.2} fill="#FF6B6B" />
          <Circle cx={57.9} cy={10.5} r={4.6} fill="#FFD84D" />
          <Circle cx={57.9} cy={10.5} r={3} fill="#5BD98A" />
          <Circle cx={57.9} cy={10.5} r={1.5} fill="#4D9BE8" />
        </G>
      );
    case 'angel-wings':
      return (
        <G>
          <Path d="M29 64 Q5 50 7 74 Q12 85 30 76 Z" fill="#FFFFFF" stroke="#C9D3F0" strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M70 64 Q94 50 92 74 Q87 85 69 76 Z" fill="#FFFFFF" stroke="#C9D3F0" strokeWidth={1.4} strokeLinejoin="round" />
        </G>
      );
    case 'butterfly-wings':
      return (
        <G>
          <Ellipse cx={17} cy={63} rx={11} ry={8} fill="#B58CFF" stroke="#7B5CFF" strokeWidth={1.2} transform="rotate(-25 17 63)" />
          <Ellipse cx={19} cy={77} rx={8} ry={6} fill="#FF9BD0" stroke="#D93C8E" strokeWidth={1.2} transform="rotate(20 19 77)" />
          <Ellipse cx={82} cy={63} rx={11} ry={8} fill="#B58CFF" stroke="#7B5CFF" strokeWidth={1.2} transform="rotate(25 82 63)" />
          <Ellipse cx={80} cy={77} rx={8} ry={6} fill="#FF9BD0" stroke="#D93C8E" strokeWidth={1.2} transform="rotate(-20 80 77)" />
        </G>
      );
    case 'fairy-wings':
      return (
        <G>
          <Path d="M29 62 Q6 40 8 66 Q12 78 30 72 Z" fill="#7CF0FF" fillOpacity={0.55} stroke="#FFFFFF" strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M70 62 Q93 40 91 66 Q87 78 69 72 Z" fill="#7CF0FF" fillOpacity={0.55} stroke="#FFFFFF" strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M29 72 Q14 84 22 90 Q30 90 31 76 Z" fill="#FF9BD0" fillOpacity={0.55} stroke="#FFFFFF" strokeWidth={1.2} strokeLinejoin="round" />
          <Path d="M70 72 Q85 84 77 90 Q69 90 68 76 Z" fill="#FF9BD0" fillOpacity={0.55} stroke="#FFFFFF" strokeWidth={1.2} strokeLinejoin="round" />
        </G>
      );
    default:
      return null;
  }
}

/** Back to front, so the suit is under the scarf, the scarf under the helmet and the star on top. */
const DRAW_ORDER = [
  'angel-wings', 'butterfly-wings', 'fairy-wings',
  'space-suit', 'galaxy-suit', 'scarf', 'bow-tie', 'bell-collar', 'rosy-cheeks',
  'helmet', 'gold-visor', 'heart-glasses', 'star-glasses',
  'explorer-hat', 'bunny-ears', 'cat-ears', 'pink-bow', 'party-hat', 'flower-crown', 'royal-crown',
  'star-antenna', 'heart-antenna', 'rainbow-antenna',
];

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

/** The part of the 100-unit pet grid each accessory lives in, so its thumbnail can crop to just that. */
const THUMB_BOX: Record<string, string> = {
  head: '22 0 58 38',
  antenna: '46 0 24 26',
  neck: '30 54 40 20',
  body: '22 56 56 36',
  face: '32 33 40 20',
  cheeks: '28 43 46 14',
  back: '2 44 96 50',
  helmet: '18 16 66 52',
  'gold-visor': '18 16 66 52',
};

/** One accessory on its own, cropped, for the dress-up list. Decorative: the row carries the name. */
export function CosmeticThumb({ id, slot, size }: { id: string; slot: string; size: number }) {
  const box = THUMB_BOX[id] ?? THUMB_BOX[slot] ?? '0 0 100 100';
  return (
    <Svg width={size} height={size} viewBox={box} pointerEvents="none">
      <Cosmetic id={id} compact={false} />
    </Svg>
  );
}
