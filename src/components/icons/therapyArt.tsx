import React from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import { Tone } from './tokens';

/**
 * Therapy practice icons.
 *
 * Same grid, light and tonal rules as the routine set (tokens.ts) — including the one that matters
 * most here: the ink is white on a coloured card, so separations are GAPS and anything on the body
 * is brighter, never darker.
 *
 * TWO DESIGN DECISIONS SPECIFIC TO THIS SET.
 *
 * They are not medical. No crutches, no braces, no clinical equipment, no red crosses: this is a
 * child's app, and a section about a child's own practice should not look like a hospital chart. A
 * parent opening it has quite enough of that elsewhere.
 *
 * And the figure is deliberately abstract — a round head and a soft body, no face, no hands, no
 * indication of how the child moves. A drawn figure walking unaided would quietly tell a family
 * using a walker or a wheelchair that the activity is not for them, which is the opposite of what
 * this section is for. Supports are drawn as neutral bars, so they read as "something to hold"
 * rather than as one particular piece of equipment.
 */

type Art = (c: string) => React.ReactNode;

/** The shared figure: a head and a soft body. Used wherever a whole-body activity is shown. */
function Figure({ c, x = 32, headY = 15, bodyY = 23, bodyH = 20 }: { c: string; x?: number; headY?: number; bodyY?: number; bodyH?: number }) {
  return (
    <G>
      <Circle cx={x} cy={headY} r={6.5} fill={c} opacity={Tone.body} />
      <Rect x={x - 7} y={bodyY} width={14} height={bodyH} rx={7} fill={c} opacity={Tone.body} />
    </G>
  );
}

/** SIT TO STAND — a figure rising from a seat, with the direction marked. */
export const sitToStandArt: Art = (c) => (
  <G>
    {/* Seat, low and to the right so the figure is clearly leaving it. */}
    <G opacity={Tone.detail}>
      <Rect x={36} y={38} width={22} height={5} rx={2.5} fill={c} />
      <Rect x={53} y={24} width={5} height={16} rx={2.5} fill={c} />
      <Rect x={38} y={43} width={4} height={10} rx={2} fill={c} />
    </G>
    <Figure c={c} x={24} headY={16} bodyY={24} bodyH={18} />
    {/* Legs. */}
    <G opacity={Tone.body}>
      <Rect x={18} y={42} width={5} height={12} rx={2.5} fill={c} />
      <Rect x={25} y={42} width={5} height={12} rx={2.5} fill={c} />
    </G>
    {/* Up. The one mark that says which way this is going. */}
    <Path d="M9 24l5-6 5 6" stroke={c} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={Tone.lit} />
    <Rect x={12} y={22} width={4} height={12} rx={2} fill={c} opacity={Tone.lit} />
  </G>
);

/** SUPPORTED STANDING — a figure upright beside something to hold. */
export const standingArt: Art = (c) => (
  <G>
    <Figure c={c} x={26} headY={14} bodyY={22} bodyH={20} />
    <G opacity={Tone.body}>
      <Rect x={20} y={42} width={5} height={13} rx={2.5} fill={c} />
      <Rect x={27} y={42} width={5} height={13} rx={2.5} fill={c} />
    </G>
    {/* A rail: neutral, so it reads as "something to hold" and not as one device. */}
    <G opacity={Tone.detail}>
      <Rect x={44} y={26} width={5} height={29} rx={2.5} fill={c} />
      <Rect x={38} y={26} width={17} height={4.5} rx={2.25} fill={c} />
    </G>
    {/* The hand reaching it. */}
    <Rect x={32} y={27} width={10} height={4.5} rx={2.25} fill={c} opacity={Tone.lit} />
  </G>
);

/** REACHING WHILE SITTING — seated, arm out to something just beyond. */
export const reachArt: Art = (c) => (
  <G>
    {/* Seat. */}
    <G opacity={Tone.detail}>
      <Rect x={10} y={38} width={22} height={5} rx={2.5} fill={c} />
      <Rect x={10} y={24} width={5} height={16} rx={2.5} fill={c} />
    </G>
    <Figure c={c} x={22} headY={16} bodyY={24} bodyH={15} />
    {/* The reaching arm, and the thing worth reaching for. */}
    <Rect x={28} y={27} width={18} height={4.5} rx={2.25} fill={c} opacity={Tone.lit} />
    <Circle cx={51} cy={29} r={6} fill={c} opacity={Tone.lit} />
  </G>
);

/** WALKING PRACTICE — a figure moving forward with a support in front. */
export const walkArt: Art = (c) => (
  <G>
    <Figure c={c} x={22} headY={14} bodyY={22} bodyH={18} />
    {/* Legs mid-stride. */}
    <G opacity={Tone.body}>
      <Rect x={15} y={39} width={5} height={15} rx={2.5} fill={c} transform="rotate(-14 17.5 46)" />
      <Rect x={24} y={39} width={5} height={15} rx={2.5} fill={c} transform="rotate(14 26.5 46)" />
    </G>
    {/* A frame ahead — again neutral, a thing to hold rather than a named aid. */}
    <G opacity={Tone.detail}>
      <Rect x={38} y={24} width={17} height={4.5} rx={2.25} fill={c} />
      <Rect x={39} y={28} width={4.5} height={27} rx={2.25} fill={c} />
      <Rect x={50} y={28} width={4.5} height={27} rx={2.25} fill={c} />
    </G>
    <Rect x={29} y={25} width={11} height={4.5} rx={2.25} fill={c} opacity={Tone.lit} />
  </G>
);

/** BALANCE PRACTICE — steady on a rounded base. */
export const balanceArt: Art = (c) => (
  <G>
    <Figure c={c} x={32} headY={13} bodyY={21} bodyH={18} />
    {/* Arms out, which is what balancing looks like. */}
    <G opacity={Tone.lit}>
      <Rect x={12} y={25} width={14} height={4.5} rx={2.25} fill={c} transform="rotate(-16 19 27)" />
      <Rect x={38} y={25} width={14} height={4.5} rx={2.25} fill={c} transform="rotate(16 45 27)" />
    </G>
    <G opacity={Tone.body}>
      <Rect x={26} y={39} width={5} height={10} rx={2.5} fill={c} />
      <Rect x={33} y={39} width={5} height={10} rx={2.5} fill={c} />
    </G>
    {/* A rounded base: the thing that makes staying still an achievement. */}
    <Path d="M14 54a18 7 0 0 1 36 0Z" fill={c} opacity={Tone.detail} />
  </G>
);

/** REACH & GRASP — a hand closing around something. */
export const graspArt: Art = (c) => (
  <G>
    {/* The object. */}
    <Circle cx={40} cy={26} r={9} fill={c} opacity={Tone.detail} />
    {/* Palm. */}
    <Rect x={12} y={28} width={22} height={18} rx={8} fill={c} opacity={Tone.body} />
    {/* Fingers, curling towards the object — three, because five is noise at this size. */}
    <G opacity={Tone.lit}>
      <Rect x={27} y={21} width={14} height={5} rx={2.5} fill={c} transform="rotate(-20 34 23)" />
      <Rect x={28} y={28} width={14} height={5} rx={2.5} fill={c} />
      <Rect x={27} y={35} width={13} height={5} rx={2.5} fill={c} transform="rotate(14 33 37)" />
    </G>
    {/* Wrist. */}
    <Rect x={6} y={33} width={10} height={8} rx={4} fill={c} opacity={Tone.detail} />
  </G>
);

/** TWO-HAND ACTIVITIES — two hands working on one thing together. */
export const twoHandsArt: Art = (c) => (
  <G>
    {/* The shared object, between them. */}
    <Rect x={23} y={20} width={18} height={18} rx={5} fill={c} opacity={Tone.lit} />
    {/* Left hand. */}
    <G opacity={Tone.body}>
      <Rect x={5} y={26} width={18} height={13} rx={6} fill={c} />
      <Rect x={4} y={40} width={12} height={7} rx={3.5} fill={c} />
    </G>
    {/* Right hand. */}
    <G opacity={Tone.body}>
      <Rect x={41} y={26} width={18} height={13} rx={6} fill={c} />
      <Rect x={48} y={40} width={12} height={7} rx={3.5} fill={c} />
    </G>
  </G>
);

/** OBJECT TRANSFER — something moving from one hand to the other. */
export const transferArt: Art = (c) => (
  <G>
    <G opacity={Tone.body}>
      <Rect x={4} y={34} width={18} height={12} rx={6} fill={c} />
      <Rect x={42} y={34} width={18} height={12} rx={6} fill={c} />
    </G>
    {/* The thing, and the way it is going. */}
    <Circle cx={32} cy={38} r={7} fill={c} opacity={Tone.lit} />
    <Path d="M20 20h20" stroke={c} strokeWidth={3.2} strokeLinecap="round" fill="none" opacity={Tone.detail} />
    <Path d="M35 15l6 5-6 5" stroke={c} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={Tone.detail} />
  </G>
);

/** ACTIVE RANGE OF MOTION — a child's own movement, shown as arcs they make themselves. */
export const moveArt: Art = (c) => (
  <G>
    <Figure c={c} x={32} headY={16} bodyY={24} bodyH={20} />
    {/* Arms up — the movement, not a position to be put into. */}
    <G opacity={Tone.lit}>
      <Rect x={14} y={20} width={15} height={5} rx={2.5} fill={c} transform="rotate(-40 21 22)" />
      <Rect x={35} y={20} width={15} height={5} rx={2.5} fill={c} transform="rotate(40 43 22)" />
    </G>
    {/* Motion arcs, which say "moving" without saying how far. */}
    <G opacity={Tone.detail}>
      <Path d="M10 18a10 10 0 0 1 6-7" stroke={c} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M54 18a10 10 0 0 0-6-7" stroke={c} strokeWidth={3} strokeLinecap="round" fill="none" />
    </G>
  </G>
);

/**
 * STRETCHING — deliberately the gentlest mark in the set.
 *
 * No figure being stretched, and nothing resembling a technique: this activity's whole content is
 * "do what your therapist showed you", and an illustration that implied a particular stretch would
 * undercut that before a parent read a word.
 */
export const stretchArt: Art = (c) => (
  <G>
    <Figure c={c} x={32} headY={17} bodyY={25} bodyH={18} />
    <G opacity={Tone.lit}>
      <Rect x={16} y={27} width={14} height={5} rx={2.5} fill={c} transform="rotate(-22 23 29)" />
      <Rect x={34} y={27} width={14} height={5} rx={2.5} fill={c} transform="rotate(22 41 29)" />
    </G>
    {/* Soft arcs either side: easy movement, no direction, no extent. */}
    <G opacity={Tone.detail}>
      <Path d="M9 36a13 13 0 0 1 0-16" stroke={c} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M55 36a13 13 0 0 0 0-16" stroke={c} strokeWidth={3} strokeLinecap="round" fill="none" />
    </G>
  </G>
);

/** GENTLE MOVEMENT — winding down: a crescent and slow waves. */
export const gentleArt: Art = (c) => (
  <G>
    <Path d="M40 10a17 17 0 1 0 14 26A19 19 0 0 1 40 10Z" fill={c} opacity={Tone.body} />
    <G opacity={Tone.lit}>
      <Path d="M10 44q7-6 14 0t14 0" stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Path d="M10 53q7-6 14 0t14 0" stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" />
    </G>
    <Path d="M52 48q0 4 4 4-4 0-4 4 0-4-4-4 4 0 4-4Z" fill={c} opacity={Tone.detail} />
  </G>
);
