import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Gloss, Sparkle, starPath, type Drawn, type Fill, type Grad } from './kit';

/**
 * The drawings for the Space Collection that are not already somewhere else (the four companions with an
 * official picture, and the five original collectibles, reuse `AvatarArt` / `WorldArt`). Same house style as
 * every TalkEasy drawing: 64-unit grid, light from the top-left, outlines in a darker shade of the object's
 * own hue, a white gloss, a sparkle. Objects and friendly animals only, round and smiling.
 */
import type { CollectionArtKey } from '@/collection/artKeys';


const GLASS = '#7CF0FF';

/** A pet-style face with two eyes and a smile, centred at (cx, cy). */
function Face({ cx, cy, s = 1, ink = '#27325F' }: { cx: number; cy: number; s?: number; ink?: string }) {
  return (
    <G>
      <Ellipse cx={cx - 5 * s} cy={cy} rx={1.7 * s} ry={2.3 * s} fill={ink} />
      <Ellipse cx={cx + 5 * s} cy={cy} rx={1.7 * s} ry={2.3 * s} fill={ink} />
      <Path d={`M${cx - 3 * s} ${cy + 4 * s} Q${cx} ${cy + 7 * s} ${cx + 3 * s} ${cy + 4 * s}`} stroke={ink} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </G>
  );
}

/** A glass helmet bubble over a head at (cx, cy) with radius r. */
function Bubble({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill="#FFFFFF" opacity={0.22} stroke="#8AA2E6" strokeWidth={2} />
      <Path d={`M${cx - r * 0.6} ${cy - r * 0.45} Q${cx - r * 0.3} ${cy - r * 0.8} ${cx + r * 0.1} ${cy - r * 0.78}`} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.8} />
    </G>
  );
}

/** A planet disc with optional bands, a ring and craters. */
function Orb({ cx, cy, r, fill, ink, bands, ring, spots }: { cx: number; cy: number; r: number; fill: string; ink: string; bands?: string; ring?: string; spots?: string }) {
  return (
    <G>
      {ring ? <Ellipse cx={cx} cy={cy} rx={r * 1.7} ry={r * 0.45} fill="none" stroke={ring} strokeWidth={2.6} transform={`rotate(-18 ${cx} ${cy})`} opacity={0.55} /> : null}
      <Circle cx={cx} cy={cy} r={r} fill={fill} stroke={ink} strokeWidth={2} />
      {bands ? (
        <>
          <Path d={`M${cx - r * 0.9} ${cy - r * 0.3} Q${cx} ${cy - r * 0.55} ${cx + r * 0.9} ${cy - r * 0.3}`} stroke={bands} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.7} />
          <Path d={`M${cx - r * 0.95} ${cy + r * 0.2} Q${cx} ${cy} ${cx + r * 0.95} ${cy + r * 0.2}`} stroke={bands} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.7} />
          <Path d={`M${cx - r * 0.7} ${cy + r * 0.6} Q${cx} ${cy + r * 0.45} ${cx + r * 0.7} ${cy + r * 0.6}`} stroke={bands} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.6} />
        </>
      ) : null}
      {spots ? (
        <>
          <Circle cx={cx - r * 0.35} cy={cy - r * 0.2} r={r * 0.2} fill={spots} opacity={0.6} />
          <Circle cx={cx + r * 0.3} cy={cy + r * 0.3} r={r * 0.15} fill={spots} opacity={0.6} />
          <Circle cx={cx + r * 0.2} cy={cy - r * 0.45} r={r * 0.1} fill={spots} opacity={0.6} />
        </>
      ) : null}
      {ring ? <Path d={`M${cx - r * 1.7} ${cy} A${r * 1.7} ${r * 0.45} -18 0 0 ${cx + r * 1.7} ${cy}`} stroke={ring} strokeWidth={2.6} fill="none" transform={`rotate(-18 ${cx} ${cy}) translate(0 ${r * 0.05})`} /> : null}
      <Ellipse cx={cx - r * 0.35} cy={cy - r * 0.45} rx={r * 0.32} ry={r * 0.14} fill="#FFFFFF" opacity={0.55} transform={`rotate(-30 ${cx - r * 0.35} ${cy - r * 0.45})`} />
    </G>
  );
}

export function drawCollectible(name: CollectionArtKey, grad: Grad, g: Fill): Drawn {
  switch (name) {
    // ============ A. Companions ============
    case 'astro-dog':
      return {
        defs: <>{grad('fur', '#FFD9A8', '#E8923B')}{grad('suit', '#FFFFFF', '#C9D6F7')}</>,
        art: (
          <>
            <Path d="M10 60 Q10 46 32 46 Q54 46 54 60 Z" fill={g('suit')} stroke="#6F86CF" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M14 26 Q6 24 8 40 Q12 44 18 36 Z M50 26 Q58 24 56 40 Q52 44 46 36 Z" fill="#B8671F" stroke="#7A3F0E" strokeWidth={1.8} strokeLinejoin="round" />
            <Ellipse cx={32} cy={30} rx={17} ry={15} fill={g('fur')} stroke="#8A4A12" strokeWidth={2} />
            <Ellipse cx={32} cy={37} rx={8} ry={6} fill="#FFF1DC" />
            <Ellipse cx={32} cy={34} rx={3} ry={2.2} fill="#27325F" />
            <Face cx={32} cy={27} s={1.1} />
            <Bubble cx={32} cy={29} r={23} />
            <Sparkle cx={55} cy={10} r={4} />
          </>
        ),
      };
    case 'baby-martian':
      return {
        defs: <>{grad('skin', '#A8F0A0', '#3FB05A')}</>,
        art: (
          <>
            <Path d="M22 14 Q18 6 13 5 M42 14 Q46 6 51 5" stroke="#2A8A44" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <Circle cx={12} cy={5} r={3.2} fill="#FFE066" stroke="#B97809" strokeWidth={1.2} />
            <Circle cx={52} cy={5} r={3.2} fill="#FFE066" stroke="#B97809" strokeWidth={1.2} />
            <Path d="M16 60 Q16 46 32 46 Q48 46 48 60 Z" fill={g('skin')} stroke="#1F6B35" strokeWidth={2} strokeLinejoin="round" />
            <Ellipse cx={32} cy={28} rx={21} ry={19} fill={g('skin')} stroke="#1F6B35" strokeWidth={2} />
            <Ellipse cx={24} cy={26} rx={6.5} ry={8} fill="#FFFFFF" stroke="#1F6B35" strokeWidth={1.4} />
            <Ellipse cx={40} cy={26} rx={6.5} ry={8} fill="#FFFFFF" stroke="#1F6B35" strokeWidth={1.4} />
            <Circle cx={25} cy={27} r={3.6} fill="#27325F" />
            <Circle cx={39} cy={27} r={3.6} fill="#27325F" />
            <Circle cx={26} cy={25.6} r={1.1} fill="#FFFFFF" />
            <Circle cx={40} cy={25.6} r={1.1} fill="#FFFFFF" />
            <Path d="M26 38 Q32 43 38 38" stroke="#1F6B35" strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Gloss cx={21} cy={16} rx={6} ry={2} rotate={-25} opacity={0.6} />
          </>
        ),
      };
    case 'space-bunny':
      return {
        defs: <>{grad('fur', '#FFFFFF', '#DCE4FF')}</>,
        art: (
          <>
            <Ellipse cx={22} cy={13} rx={5} ry={13} fill={g('fur')} stroke="#7F9BE0" strokeWidth={1.8} />
            <Ellipse cx={42} cy={13} rx={5} ry={13} fill={g('fur')} stroke="#7F9BE0" strokeWidth={1.8} />
            <Ellipse cx={22} cy={14} rx={2.4} ry={9} fill="#FFB3C7" />
            <Ellipse cx={42} cy={14} rx={2.4} ry={9} fill="#FFB3C7" />
            <Path d="M10 60 Q10 48 32 48 Q54 48 54 60 Z" fill="#8FB4FF" stroke="#3D63D6" strokeWidth={2} strokeLinejoin="round" />
            <Ellipse cx={32} cy={36} rx={18} ry={15} fill={g('fur')} stroke="#7F9BE0" strokeWidth={2} />
            <Face cx={32} cy={34} s={1.1} />
            <Ellipse cx={32} cy={39} rx={2} ry={1.4} fill="#FF8FA8" />
            <Ellipse cx={22} cy={39} rx={3} ry={2} fill="#FFB3C7" opacity={0.7} />
            <Ellipse cx={42} cy={39} rx={3} ry={2} fill="#FFB3C7" opacity={0.7} />
            <Bubble cx={32} cy={35} r={22} />
          </>
        ),
      };
    case 'cosmic-panda':
      return {
        defs: <>{grad('fur', '#FFFFFF', '#E6ECFF')}{grad('galaxy', '#5A3FD0', '#1B1F6B')}</>,
        art: (
          <>
            <Circle cx={16} cy={14} r={8} fill="#27325F" stroke="#12183F" strokeWidth={1.6} />
            <Circle cx={48} cy={14} r={8} fill="#27325F" stroke="#12183F" strokeWidth={1.6} />
            <Path d="M12 60 Q12 46 32 46 Q52 46 52 60 Z" fill={g('galaxy')} stroke="#12183F" strokeWidth={2} strokeLinejoin="round" />
            <Circle cx={24} cy={53} r={1.2} fill="#FFE066" /><Circle cx={38} cy={55} r={1.2} fill="#8BF0FF" /><Circle cx={44} cy={51} r={1} fill="#FFFFFF" />
            <Ellipse cx={32} cy={30} rx={20} ry={17} fill={g('fur')} stroke="#6F86CF" strokeWidth={2} />
            <Ellipse cx={23} cy={28} rx={5.5} ry={7} fill="#27325F" transform="rotate(-15 23 28)" />
            <Ellipse cx={41} cy={28} rx={5.5} ry={7} fill="#27325F" transform="rotate(15 41 28)" />
            <Circle cx={23.5} cy={28} r={2} fill="#FFFFFF" /><Circle cx={40.5} cy={28} r={2} fill="#FFFFFF" />
            <Ellipse cx={32} cy={36} rx={3} ry={2.2} fill="#27325F" />
            <Path d="M28 40 Q32 43 36 40" stroke="#27325F" strokeWidth={1.6} strokeLinecap="round" fill="none" />
            <Path d={starPath(32, 12, 4, 1.8)} fill="#FFE066" />
          </>
        ),
      };

    // ============ B. Planets ============
    case 'mars':
      return { defs: <>{grad('p', '#FF9A6B', '#C23A1E')}</>, art: (<><Orb cx={32} cy={32} r={22} fill={g('p')} ink="#7A2310" spots="#7A2310" /><Sparkle cx={55} cy={9} r={4} /></>) };
    case 'jupiter':
      return { defs: <>{grad('p', '#FFE0B0', '#D98A3D')}</>, art: (<><Orb cx={32} cy={32} r={24} fill={g('p')} ink="#8A4A12" bands="#B8671F" /><Ellipse cx={42} cy={38} rx={5} ry={3} fill="#C8451E" opacity={0.85} /><Sparkle cx={8} cy={10} r={4} /></>) };
    case 'neptune':
      return { defs: <>{grad('p', '#8FB4FF', '#2A4FC8')}</>, art: (<><Orb cx={32} cy={32} r={22} fill={g('p')} ink="#1B2E8A" bands="#BFD6FF" /><Path d="M14 22 Q20 18 26 22" stroke="#FFFFFF" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} /><Sparkle cx={55} cy={10} r={4} color="#8BF0FF" /></>) };
    case 'venus':
      return { defs: <>{grad('p', '#FFF0A8', '#E8A53A')}</>, art: (<><Orb cx={32} cy={32} r={22} fill={g('p')} ink="#9C6A05" bands="#FFFFFF" /><Sparkle cx={54} cy={11} r={4.5} /></>) };
    case 'mercury':
      return { defs: <>{grad('p', '#E0E4EE', '#8A93AB')}</>, art: (<><Orb cx={32} cy={32} r={19} fill={g('p')} ink="#4A5470" spots="#4A5470" /><Sparkle cx={53} cy={12} r={4} /></>) };

    // ============ C. Vehicles ============
    case 'space-shuttle':
      return {
        defs: <>{grad('hull', '#FFFFFF', '#C9D6F7')}{grad('tank', '#FFC27A', '#E8672B')}</>,
        art: (
          <>
            <G transform="rotate(-35 32 32)">
              <Path d="M2 32 Q8 24 22 24 H50 Q60 24 60 32 Q60 40 50 40 H22 Q8 40 2 32 Z" fill={g('tank')} stroke="#8A3A0E" strokeWidth={2} />
              <Path d="M14 38 L4 52 L26 44 Z M14 26 L4 12 L26 20 Z" fill="#E4452E" stroke="#8A1F12" strokeWidth={1.8} strokeLinejoin="round" />
              <Path d="M24 28 Q40 24 52 30 Q58 32 52 36 Q40 40 24 36 Z" fill={g('hull')} stroke="#6F86CF" strokeWidth={1.8} />
              <Circle cx={50} cy={32} r={3} fill={GLASS} stroke="#12409A" strokeWidth={1.4} />
            </G>
            <Path d="M4 52 Q10 60 18 54 Z" fill="#FFB347" stroke="#C0561C" strokeWidth={1.4} />
            <Sparkle cx={56} cy={10} r={4} />
          </>
        ),
      };
    case 'lunar-rover':
      return {
        defs: <>{grad('body', '#E4ECFF', '#8AA2E6')}</>,
        art: (
          <>
            <Path d="M10 36 H46 L40 26 H18 Z" fill={g('body')} stroke="#4A63B8" strokeWidth={2} strokeLinejoin="round" />
            <Rect x={6} y={34} width={46} height={10} rx={4} fill={g('body')} stroke="#4A63B8" strokeWidth={2} />
            <Rect x={22} y={28} width={10} height={6} rx={2} fill={GLASS} stroke="#12409A" strokeWidth={1.4} />
            <Circle cx={14} cy={48} r={7.5} fill="#27325F" stroke="#12183F" strokeWidth={1.6} />
            <Circle cx={44} cy={48} r={7.5} fill="#27325F" stroke="#12183F" strokeWidth={1.6} />
            <Circle cx={14} cy={48} r={3} fill="#9FB0DA" /><Circle cx={44} cy={48} r={3} fill="#9FB0DA" />
            <Path d="M50 30 L58 14 M54 14 H62" stroke="#8AA2E6" strokeWidth={2.4} strokeLinecap="round" />
            <Ellipse cx={32} cy={58} rx={26} ry={3} fill="#9FB0DA" opacity={0.6} />
            <Sparkle cx={9} cy={14} r={4} />
          </>
        ),
      };
    case 'flying-saucer':
      return {
        defs: <>{grad('disc', '#E4ECFF', '#8AA2E6')}{grad('dome', '#BFF6FF', '#3FB6E8')}</>,
        art: (
          <>
            <Path d="M24 54 L18 62 M40 54 L46 62" stroke="#FFE066" strokeWidth={2.6} strokeLinecap="round" opacity={0.7} />
            <Path d="M22 28 Q22 12 32 12 Q42 12 42 28 Z" fill={g('dome')} stroke="#12409A" strokeWidth={2} />
            <Circle cx={32} cy={21} r={3.4} fill="#8FE86B" stroke="#2A8A44" strokeWidth={1.2} />
            <Ellipse cx={32} cy={34} rx={28} ry={11} fill={g('disc')} stroke="#4A63B8" strokeWidth={2} />
            <Circle cx={14} cy={35} r={2.4} fill="#FFE066" /><Circle cx={24} cy={39} r={2.4} fill="#FF8FC0" /><Circle cx={40} cy={39} r={2.4} fill="#7BE3A0" /><Circle cx={50} cy={35} r={2.4} fill="#FFE066" />
            <Gloss cx={18} cy={30} rx={7} ry={2} rotate={-8} opacity={0.7} />
          </>
        ),
      };
    case 'space-capsule':
      return {
        defs: <>{grad('cap', '#FFC27A', '#E8672B')}</>,
        art: (
          <>
            <Path d="M10 22 Q32 -6 54 22" fill="#FF8FC0" stroke="#B22C68" strokeWidth={2} />
            <Path d="M10 22 L26 40 M54 22 L38 40 M32 12 V40" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.8} />
            <Path d="M22 40 H42 L48 58 H16 Z" fill={g('cap')} stroke="#8A3A0E" strokeWidth={2} strokeLinejoin="round" />
            <Circle cx={32} cy={48} r={5} fill={GLASS} stroke="#12409A" strokeWidth={1.6} />
            <Gloss cx={24} cy={46} rx={4} ry={1.6} rotate={-30} opacity={0.6} />
            <Sparkle cx={56} cy={46} r={3.6} />
          </>
        ),
      };
    case 'star-cruiser':
      return {
        defs: <>{grad('hull', '#C7A8FF', '#6A3FD0')}</>,
        art: (
          <>
            <Path d="M4 40 L22 34 L56 32 Q62 32 62 36 Q62 40 56 40 L22 44 Z" fill={g('hull')} stroke="#3A1F8F" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M24 34 L34 14 L42 34 Z" fill="#8FB4FF" stroke="#1F3A9E" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M24 44 L34 60 L42 42 Z" fill="#8FB4FF" stroke="#1F3A9E" strokeWidth={1.8} strokeLinejoin="round" />
            <Circle cx={52} cy={36} r={3.2} fill={GLASS} stroke="#12409A" strokeWidth={1.4} />
            <Path d={starPath(33, 29, 4.5, 2)} fill="#FFE066" />
            <Path d="M4 40 Q-2 36 2 30" stroke="#FFB347" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Sparkle cx={55} cy={14} r={4} />
          </>
        ),
      };
    case 'planet-hopper':
      return {
        defs: <>{grad('pod', '#8CF0A8', '#1F9E55')}</>,
        art: (
          <>
            <Path d="M20 50 L14 60 M44 50 L50 60 M14 60 H8 M50 60 H56" stroke="#136237" strokeWidth={3} strokeLinecap="round" />
            <Ellipse cx={32} cy={34} rx={22} ry={18} fill={g('pod')} stroke="#136237" strokeWidth={2} />
            <Circle cx={32} cy={30} r={9} fill={GLASS} stroke="#12409A" strokeWidth={1.8} />
            <Ellipse cx={32} cy={30} rx={4} ry={5} fill="#27325F" />
            <Circle cx={32} cy={30} r={1.5} fill="#FFFFFF" />
            <Path d="M32 16 V8" stroke="#136237" strokeWidth={2.4} strokeLinecap="round" />
            <Circle cx={32} cy={7} r={3} fill="#FFE066" stroke="#B97809" strokeWidth={1.2} />
            <Gloss cx={20} cy={26} rx={5} ry={2} rotate={-35} opacity={0.6} />
          </>
        ),
      };
    case 'cosmic-explorer-ship':
      return {
        defs: <>{grad('hull', '#FFFFFF', '#C9D6F7')}{grad('wing', '#FF9A88', '#E4452E')}{grad('glass', '#8BF0FF', '#1D8FE0')}</>,
        art: (
          <>
            <Path d="M32 2 Q46 14 44 40 H20 Q18 14 32 2 Z" fill={g('hull')} stroke="#6F86CF" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M20 34 L4 54 L22 48 Z M44 34 L60 54 L42 48 Z" fill={g('wing')} stroke="#9E2616" strokeWidth={1.8} strokeLinejoin="round" />
            <Circle cx={32} cy={20} r={6} fill={g('glass')} stroke="#12409A" strokeWidth={1.8} />
            <Path d="M26 40 Q32 62 38 40 Z" fill="#FFB347" stroke="#C0561C" strokeWidth={1.6} strokeLinejoin="round" />
            <Path d={starPath(32, 33, 4.5, 2)} fill="#FFE066" />
            <Sparkle cx={8} cy={12} r={4} /><Sparkle cx={57} cy={14} r={3.4} color="#8BF0FF" />
          </>
        ),
      };

    // ============ D. Discoveries ============
    case 'shooting-star':
      return {
        defs: <>{grad('s', '#FFF0A0', '#FFB800')}</>,
        art: (
          <>
            <Path d="M2 54 L36 28" stroke="#8BF0FF" strokeWidth={6} strokeLinecap="round" opacity={0.35} />
            <Path d="M8 58 L38 34" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
            <Path d={starPath(42, 24, 19, 8.5)} fill={g('s')} stroke="#B97809" strokeWidth={2} strokeLinejoin="round" />
            <Gloss cx={36} cy={16} rx={5} ry={1.8} rotate={-40} opacity={0.7} />
            <Sparkle cx={10} cy={12} r={3.6} color="#8BF0FF" />
          </>
        ),
      };
    case 'meteor':
      return {
        defs: <>{grad('rock', '#B5A08A', '#5E4A3A')}</>,
        art: (
          <>
            <Path d="M4 6 Q20 12 28 28" stroke="#FFB347" strokeWidth={7} strokeLinecap="round" opacity={0.5} />
            <Path d="M8 14 Q22 18 30 30" stroke="#FFE066" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
            <Path d="M30 22 L48 20 L58 32 L54 50 L38 58 L24 48 L22 32 Z" fill={g('rock')} stroke="#3E2F22" strokeWidth={2} strokeLinejoin="round" />
            <Circle cx={36} cy={34} r={4} fill="#3E2F22" opacity={0.5} /><Circle cx={46} cy={44} r={3} fill="#3E2F22" opacity={0.5} /><Circle cx={46} cy={28} r={2.4} fill="#3E2F22" opacity={0.5} />
            <Gloss cx={34} cy={26} rx={5} ry={1.8} rotate={-30} opacity={0.5} />
          </>
        ),
      };
    case 'comet':
      return {
        defs: <>{grad('head', '#FFFFFF', '#8BF0FF')}</>,
        art: (
          <>
            <Path d="M4 6 Q24 14 38 36" stroke="#8BF0FF" strokeWidth={14} strokeLinecap="round" opacity={0.3} />
            <Path d="M8 8 Q26 16 38 36" stroke="#8BF0FF" strokeWidth={8} strokeLinecap="round" opacity={0.5} />
            <Path d="M12 10 Q28 18 40 36" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.85} />
            <Circle cx={44} cy={42} r={12} fill={g('head')} stroke="#1B7FB8" strokeWidth={2} />
            <Circle cx={44} cy={42} r={18} fill="#8BF0FF" opacity={0.18} />
            <Gloss cx={39} cy={37} rx={5} ry={2} rotate={-35} opacity={0.8} />
            <Sparkle cx={56} cy={12} r={4} />
          </>
        ),
      };
    case 'galaxy-crystal':
      return {
        defs: <>{grad('c', '#D7C0FF', '#6A3FD0')}</>,
        art: (
          <>
            <Path d="M32 4 L50 22 L44 56 H20 L14 22 Z" fill={g('c')} stroke="#3A1F8F" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M14 22 H50 M32 4 L26 22 L32 56 L38 22 Z" stroke="#FFFFFF" strokeWidth={1.4} fill="none" opacity={0.6} />
            <Ellipse cx={32} cy={34} rx={9} ry={3.2} fill="#FFE8FF" opacity={0.6} transform="rotate(-20 32 34)" />
            <Circle cx={32} cy={34} r={2.2} fill="#FFFFFF" />
            <Sparkle cx={55} cy={10} r={4} /><Sparkle cx={8} cy={40} r={3} color="#8BF0FF" />
          </>
        ),
      };
    case 'cosmic-diamond':
      return {
        defs: <>{grad('d', '#CFFAFF', '#3FA8E8')}</>,
        art: (
          <>
            <Path d="M18 12 H46 L58 26 L32 58 L6 26 Z" fill={g('d')} stroke="#12409A" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M6 26 H58 M18 12 L26 26 L32 58 M46 12 L38 26 L32 58 M26 26 L32 12 L38 26" stroke="#FFFFFF" strokeWidth={1.4} fill="none" opacity={0.75} />
            <Path d="M10 26 L18 12 L24 26 Z" fill="#FF8FC0" opacity={0.4} /><Path d="M40 26 L46 12 L54 26 Z" fill="#FFE066" opacity={0.45} />
            <Sparkle cx={55} cy={10} r={4.4} /><Sparkle cx={9} cy={14} r={3} color="#FF8FC0" />
          </>
        ),
      };
    case 'nebula-orb':
      return {
        defs: <>{grad('o', '#E0C0FF', '#5A3FD0')}</>,
        art: (
          <>
            <Circle cx={32} cy={32} r={24} fill={g('o')} stroke="#3A1F8F" strokeWidth={2} />
            <Ellipse cx={26} cy={30} rx={14} ry={7} fill="#FF8FC0" opacity={0.55} transform="rotate(-25 26 30)" />
            <Ellipse cx={38} cy={38} rx={13} ry={6} fill="#6BD8FF" opacity={0.55} transform="rotate(20 38 38)" />
            <Circle cx={22} cy={22} r={1.4} fill="#FFFFFF" /><Circle cx={42} cy={26} r={1.2} fill="#FFFFFF" /><Circle cx={34} cy={46} r={1.4} fill="#FFE066" /><Circle cx={46} cy={40} r={1} fill="#FFFFFF" />
            <Gloss cx={22} cy={18} rx={7} ry={2.4} rotate={-35} opacity={0.7} />
          </>
        ),
      };
    case 'black-hole':
      return {
        defs: <></>,
        art: (
          <>
            <Ellipse cx={32} cy={32} rx={28} ry={10} fill="none" stroke="#FF8FC0" strokeWidth={4} opacity={0.6} transform="rotate(-20 32 32)" />
            <Ellipse cx={32} cy={32} rx={22} ry={7} fill="none" stroke="#FFB347" strokeWidth={3} opacity={0.8} transform="rotate(-20 32 32)" />
            <Circle cx={32} cy={32} r={13} fill="#0A0E2E" stroke="#5A3FD0" strokeWidth={2.4} />
            <Circle cx={32} cy={32} r={8} fill="#000000" />
            <Path d="M10 18 Q22 24 22 32" stroke="#8BF0FF" strokeWidth={1.8} fill="none" opacity={0.6} strokeLinecap="round" />
            <Sparkle cx={55} cy={10} r={4} /><Sparkle cx={8} cy={52} r={3} color="#8BF0FF" />
          </>
        ),
      };

    // ============ E. Equipment ============
    case 'astronaut-helmet':
      return {
        defs: <>{grad('s', '#FFFFFF', '#C9D6F7')}{grad('v', '#2A3A86', '#121A4A')}</>,
        art: (
          <>
            <Circle cx={32} cy={30} r={24} fill={g('s')} stroke="#6F86CF" strokeWidth={2} />
            <Rect x={14} y={18} width={36} height={24} rx={12} fill={g('v')} stroke="#4A63B8" strokeWidth={2} />
            <Path d="M20 24 Q26 20 34 22" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.7} />
            <Rect x={8} y={26} width={6} height={12} rx={3} fill="#4D9BE8" stroke="#1B4AA0" strokeWidth={1.6} /><Rect x={50} y={26} width={6} height={12} rx={3} fill="#4D9BE8" stroke="#1B4AA0" strokeWidth={1.6} />
            <Rect x={22} y={52} width={20} height={7} rx={2} fill="#C9D6F7" stroke="#6F86CF" strokeWidth={1.6} />
            <Sparkle cx={55} cy={9} r={4} />
          </>
        ),
      };
    case 'jetpack':
      return {
        defs: <>{grad('t', '#E4ECFF', '#8AA2E6')}</>,
        art: (
          <>
            <Rect x={10} y={8} width={16} height={34} rx={7} fill={g('t')} stroke="#4A63B8" strokeWidth={2} />
            <Rect x={38} y={8} width={16} height={34} rx={7} fill={g('t')} stroke="#4A63B8" strokeWidth={2} />
            <Rect x={24} y={16} width={16} height={10} rx={3} fill="#E4452E" stroke="#8A1F12" strokeWidth={1.6} />
            <Path d="M12 44 Q18 62 24 44 Z M40 44 Q46 62 52 44 Z" fill="#FFB347" stroke="#C0561C" strokeWidth={1.6} strokeLinejoin="round" />
            <Path d="M15 46 Q18 54 21 46 Z M43 46 Q46 54 49 46 Z" fill="#FFF6B8" />
            <Gloss cx={15} cy={14} rx={3} ry={1.4} rotate={-70} opacity={0.7} />
            <Sparkle cx={57} cy={8} r={3.6} />
          </>
        ),
      };
    case 'space-suit':
      return {
        defs: <>{grad('s', '#FFFFFF', '#C9D6F7')}</>,
        art: (
          <>
            <Path d="M22 8 H42 L58 16 V28 L48 30 V58 H36 L32 40 L28 58 H16 V30 L6 28 V16 Z" fill={g('s')} stroke="#6F86CF" strokeWidth={2} strokeLinejoin="round" />
            <Rect x={25} y={18} width={14} height={10} rx={3} fill="#4D9BE8" stroke="#1B4AA0" strokeWidth={1.4} />
            <Path d={starPath(32, 23, 3.4, 1.5)} fill="#FFE066" />
            <Path d="M6 22 H16 M48 22 H58 M16 50 H28 M36 50 H48" stroke="#FF9A3D" strokeWidth={3} strokeLinecap="round" />
            <Path d="M26 8 Q32 14 38 8" stroke="#6F86CF" strokeWidth={2} fill="none" />
          </>
        ),
      };
    case 'moon-boots':
      return {
        defs: <>{grad('b', '#FFFFFF', '#C9D6F7')}</>,
        art: (
          <>
            <Path d="M10 8 H28 V36 L38 42 Q42 50 38 56 H8 Q6 48 10 40 Z" fill={g('b')} stroke="#6F86CF" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M8 52 H38 Q40 58 36 60 H8 Q4 58 8 52 Z" fill="#3D63D6" stroke="#1B3A9E" strokeWidth={1.6} />
            <Rect x={10} y={14} width={18} height={6} fill="#FF9A3D" />
            <Path d="M40 22 H54 V44 L60 48 Q62 54 58 58 H38" fill={g('b')} stroke="#6F86CF" strokeWidth={2} strokeLinejoin="round" />
            <Rect x={40} y={26} width={14} height={5} fill="#FF9A3D" />
            <Sparkle cx={54} cy={10} r={3.6} />
          </>
        ),
      };
    case 'satellite':
      return {
        defs: <>{grad('p', '#58C4FF', '#1B6FD0')}{grad('b', '#E4ECFF', '#8AA2E6')}</>,
        art: (
          <>
            <G transform="rotate(-30 32 32)">
              <Rect x={2} y={24} width={17} height={16} rx={2} fill={g('p')} stroke="#12409A" strokeWidth={1.8} />
              <Path d="M8 24 V40 M13 24 V40" stroke="#BFE6FF" strokeWidth={1.2} />
              <Rect x={45} y={24} width={17} height={16} rx={2} fill={g('p')} stroke="#12409A" strokeWidth={1.8} />
              <Path d="M51 24 V40 M56 24 V40" stroke="#BFE6FF" strokeWidth={1.2} />
              <Rect x={19} y={30} width={26} height={4} fill="#8AA2E6" />
              <Rect x={22} y={21} width={20} height={22} rx={6} fill={g('b')} stroke="#4A63B8" strokeWidth={2} />
              <Circle cx={32} cy={32} r={5} fill="#27325F" /><Circle cx={32} cy={32} r={2.4} fill={GLASS} />
            </G>
            <Path d="M50 8 Q58 14 56 24" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Sparkle cx={8} cy={12} r={4} />
          </>
        ),
      };
    case 'space-telescope':
      return {
        defs: <>{grad('t', '#E4ECFF', '#8AA2E6')}</>,
        art: (
          <>
            <Path d="M30 40 L18 60 M34 40 L46 60 M32 40 V60" stroke="#6F86CF" strokeWidth={3} strokeLinecap="round" />
            <G transform="rotate(-30 32 30)">
              <Rect x={12} y={20} width={40} height={18} rx={4} fill={g('t')} stroke="#4A63B8" strokeWidth={2} />
              <Rect x={46} y={17} width={10} height={24} rx={3} fill="#3D63D6" stroke="#1B3A9E" strokeWidth={1.8} />
              <Circle cx={56} cy={29} r={5} fill="#8BF0FF" stroke="#12409A" strokeWidth={1.4} />
              <Rect x={6} y={23} width={8} height={12} rx={2} fill="#FF9A3D" stroke="#C0561C" strokeWidth={1.4} />
            </G>
            <Sparkle cx={55} cy={8} r={4} /><Sparkle cx={8} cy={10} r={3} color="#8BF0FF" />
          </>
        ),
      };
    case 'robot-companion':
      return {
        defs: <>{grad('h', '#F2F6FF', '#A9BBE6')}{grad('e', '#B8FBFF', '#2FB6FF')}</>,
        art: (
          <>
            <Path d="M32 12 V6" stroke="#6F86CF" strokeWidth={2.4} strokeLinecap="round" /><Circle cx={32} cy={5} r={3} fill={GLASS} stroke="#1B7FB8" strokeWidth={1.2} />
            <Rect x={14} y={12} width={36} height={28} rx={11} fill={g('h')} stroke="#4A63B8" strokeWidth={2} />
            <Rect x={19} y={18} width={26} height={16} rx={7} fill="#16205A" />
            <Path d="M24 26 Q27 22 30 26 M34 26 Q37 22 40 26" stroke={GLASS} strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Path d="M28 31 Q32 34 36 31" stroke={GLASS} strokeWidth={1.8} strokeLinecap="round" fill="none" />
            <Rect x={22} y={42} width={20} height={16} rx={5} fill={g('h')} stroke="#4A63B8" strokeWidth={2} />
            <Circle cx={32} cy={50} r={3.2} fill={g('e')} />
            <Rect x={8} y={44} width={8} height={5} rx={2.5} fill="#A9BBE6" stroke="#4A63B8" strokeWidth={1.4} /><Rect x={48} y={44} width={8} height={5} rx={2.5} fill="#A9BBE6" stroke="#4A63B8" strokeWidth={1.4} />
          </>
        ),
      };
    case 'space-backpack':
      return {
        defs: <>{grad('b', '#E4ECFF', '#8AA2E6')}</>,
        art: (
          <>
            <Rect x={12} y={10} width={40} height={46} rx={10} fill={g('b')} stroke="#4A63B8" strokeWidth={2} />
            <Rect x={18} y={34} width={28} height={16} rx={4} fill="#3D63D6" stroke="#1B3A9E" strokeWidth={1.6} />
            <Path d="M24 42 H40" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
            <Rect x={20} y={14} width={24} height={12} rx={4} fill="#FF9A3D" stroke="#C0561C" strokeWidth={1.6} />
            <Path d="M16 4 Q32 -2 48 4" stroke="#4A63B8" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Circle cx={32} cy={20} r={3} fill="#FFE066" />
            <Gloss cx={20} cy={20} rx={4} ry={1.6} rotate={-70} opacity={0.7} />
          </>
        ),
      };

    // ============ F. Special ============
    case 'alien-egg':
      return {
        defs: <>{grad('e', '#D8FFB0', '#5CC85A')}</>,
        art: (
          <>
            <Path d="M32 4 Q52 16 52 38 Q52 58 32 58 Q12 58 12 38 Q12 16 32 4 Z" fill={g('e')} stroke="#1F6B35" strokeWidth={2} />
            <Circle cx={24} cy={24} r={4} fill="#8A55E0" opacity={0.85} /><Circle cx={40} cy={32} r={5} fill="#6BD8FF" opacity={0.85} /><Circle cx={26} cy={44} r={4.4} fill="#FF8FC0" opacity={0.85} /><Circle cx={42} cy={48} r={3} fill="#FFE066" opacity={0.9} />
            <Path d="M32 8 L28 16 L34 20" stroke="#1F6B35" strokeWidth={1.8} fill="none" strokeLinecap="round" />
            <Gloss cx={22} cy={18} rx={5} ry={2.2} rotate={-50} opacity={0.7} />
            <Sparkle cx={56} cy={10} r={4} />
          </>
        ),
      };
    case 'mystery-planet':
      return {
        defs: <>{grad('p', '#9A80F0', '#2A1F7A')}</>,
        art: (
          <>
            <Ellipse cx={32} cy={36} rx={30} ry={8} fill="none" stroke="#FFE066" strokeWidth={2.4} opacity={0.5} transform="rotate(-16 32 36)" />
            <Circle cx={32} cy={32} r={22} fill={g('p')} stroke="#1B1060" strokeWidth={2} />
            <Path d="M26 24 Q26 18 32 18 Q38 18 38 24 Q38 28 32 30 V34" stroke="#FFFFFF" strokeWidth={3.6} strokeLinecap="round" fill="none" />
            <Circle cx={32} cy={41} r={2.4} fill="#FFFFFF" />
            <Gloss cx={21} cy={20} rx={6} ry={2.2} rotate={-35} opacity={0.5} />
            <Sparkle cx={55} cy={9} r={4} /><Sparkle cx={8} cy={52} r={3} color="#8BF0FF" />
          </>
        ),
      };
    case 'treasure-chest':
      return {
        defs: <>{grad('w', '#C9863F', '#7A4A1E')}{grad('g', '#FFE680', '#E8A012')}</>,
        art: (
          <>
            <Path d="M6 28 Q6 10 32 10 Q58 10 58 28 Z" fill={g('w')} stroke="#4A2A0E" strokeWidth={2} />
            <Rect x={6} y={28} width={52} height={28} rx={3} fill={g('w')} stroke="#4A2A0E" strokeWidth={2} />
            <Rect x={6} y={26} width={52} height={6} fill={g('g')} stroke="#9C6A05" strokeWidth={1.6} />
            <Rect x={27} y={26} width={10} height={14} rx={2} fill={g('g')} stroke="#9C6A05" strokeWidth={1.6} />
            <Circle cx={32} cy={33} r={2} fill="#4A2A0E" />
            <Path d="M14 12 V56 M50 12 V56" stroke="#9C6A05" strokeWidth={3} opacity={0.6} />
            <Path d={starPath(46, 6, 5, 2.2)} fill="#FFE066" /><Sparkle cx={12} cy={6} r={3.6} /><Sparkle cx={58} cy={18} r={3} color="#8BF0FF" />
          </>
        ),
      };
    case 'golden-rocket':
      return {
        defs: <>{grad('hull', '#FFF0A0', '#E8A012')}{grad('fin', '#FFD36B', '#B97809')}</>,
        art: (
          <>
            <Path d="M10 54 Q26 50 20 36" stroke="#FFE066" strokeWidth={2.6} strokeLinecap="round" strokeDasharray="0.1 5" fill="none" />
            <G transform="rotate(30 34 30)">
              <Path d="M34 2 Q50 16 48 40 H20 Q18 16 34 2 Z" fill={g('hull')} stroke="#9C6A05" strokeWidth={2} strokeLinejoin="round" />
              <Path d="M20 38 L10 52 L24 46 Z M48 38 L58 52 L44 46 Z" fill={g('fin')} stroke="#9C6A05" strokeWidth={1.8} strokeLinejoin="round" />
              <Circle cx={34} cy={22} r={6} fill="#8BF0FF" stroke="#12409A" strokeWidth={1.8} />
              <Path d="M26 40 Q34 58 42 40 Z" fill="#FF8A3A" stroke="#C0561C" strokeWidth={1.6} strokeLinejoin="round" />
            </G>
            <Sparkle cx={8} cy={12} r={4.6} /><Sparkle cx={57} cy={10} r={4} /><Sparkle cx={56} cy={52} r={3} />
          </>
        ),
      };
    case 'rainbow-nebula':
      return {
        defs: <>{grad('n', '#3A2A8E', '#150F40')}</>,
        art: (
          <>
            <Circle cx={32} cy={32} r={26} fill={g('n')} stroke="#5A3FD0" strokeWidth={2} />
            {['#FF6B8A', '#FFB347', '#FFE066', '#7BE3A0', '#6BB6FF', '#B58CFF'].map((c, i) => (
              <Path key={c} d={`M10 ${40 - i * 1.6} Q32 ${6 + i * 3} 54 ${40 - i * 1.6}`} stroke={c} strokeWidth={3.4} fill="none" strokeLinecap="round" opacity={0.9} />
            ))}
            <Circle cx={20} cy={46} r={1.4} fill="#FFFFFF" /><Circle cx={44} cy={48} r={1.2} fill="#FFFFFF" /><Circle cx={32} cy={52} r={1.4} fill="#FFE066" />
            <Sparkle cx={56} cy={9} r={4.4} />
          </>
        ),
      };
    case 'legendary-badge':
      return {
        defs: <>{grad('b', '#FFF0A0', '#E8A012')}{grad('r', '#B58CFF', '#5A3FD0')}</>,
        art: (
          <>
            <Path d="M20 38 L12 60 L24 54 L30 62 L34 40 Z" fill="#FF6B8A" stroke="#A5204A" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M44 38 L52 60 L40 54 L34 62 L30 40 Z" fill="#4D9BE8" stroke="#1B4AA0" strokeWidth={1.8} strokeLinejoin="round" />
            <Circle cx={32} cy={26} r={22} fill={g('b')} stroke="#9C6A05" strokeWidth={2.2} />
            <Circle cx={32} cy={26} r={16} fill={g('r')} stroke="#3A1F8F" strokeWidth={1.8} />
            <Path d={starPath(32, 26, 11, 4.8)} fill="#FFE066" stroke="#B97809" strokeWidth={1.4} strokeLinejoin="round" />
            <Gloss cx={21} cy={13} rx={6} ry={2.2} rotate={-40} opacity={0.8} />
            <Sparkle cx={57} cy={8} r={4.4} /><Sparkle cx={7} cy={10} r={3.4} />
          </>
        ),
      };
    case 'trophy':
      return {
        defs: <>{grad('c', '#FFF0A0', '#E8A012')}</>,
        art: (
          <>
            <Path d="M18 8 H46 V26 Q46 40 32 42 Q18 40 18 26 Z" fill={g('c')} stroke="#9C6A05" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M18 12 Q6 12 8 24 Q10 32 20 32 M46 12 Q58 12 56 24 Q54 32 44 32" stroke="#9C6A05" strokeWidth={3} fill="none" strokeLinecap="round" />
            <Rect x={28} y={42} width={8} height={10} fill={g('c')} stroke="#9C6A05" strokeWidth={1.6} />
            <Rect x={18} y={52} width={28} height={8} rx={2} fill="#B97809" stroke="#7A4F05" strokeWidth={1.6} />
            <Path d={starPath(32, 22, 8, 3.6)} fill="#FFFFFF" opacity={0.9} />
            <Gloss cx={24} cy={14} rx={4} ry={1.6} rotate={-70} opacity={0.8} />
            <Sparkle cx={56} cy={8} r={4} />
          </>
        ),
      };
  }
}
