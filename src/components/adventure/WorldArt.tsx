import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { WorldArtName } from '@/adventure/worlds';

/**
 * Choose Your Adventure artwork — the world emblems and every collectible. Original TalkEasy art,
 * drawn as SVG by the same rules as GameIcon so the sets sit together:
 *  - a 64-unit grid, objects filling roughly 4..60, a soft ground shadow;
 *  - light from the top-left: two-stop gradients, light on top;
 *  - outlines in a DARKER SHADE OF THE OBJECT'S OWN HUE, never black;
 *  - a white highlight, and small sparkles as the accent.
 * Every creature is round, smiling and soft-edged: friendly, never fierce — no teeth, no claws.
 *
 * A collectible not found yet is drawn faded (`locked`), so the child can see what is waiting.
 */

const INK = '#27325F';

/** A four-point sparkle star. */
function sparkle(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z`;
}

/** A five-point star centred on cx, cy. */
function starPath(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
}

type Grad = (id: string, top: string, bottom: string) => React.ReactNode;
type Fill = (id: string) => string;
interface Drawn {
  defs: React.ReactNode;
  art: React.ReactNode;
}

/** Each drawing gets its own gradient helpers (prefixed by name) so emblems can combine them. */
function draw(name: WorldArtName, grad: Grad, g: Fill): Drawn {
  const star = (cx: number, cy: number, r: number, color = '#FFE066') => <Path d={sparkle(cx, cy, r)} fill={color} />;

  switch (name) {
    // ------------------------------------------------------------------------------ space
    case 'star':
      return {
        defs: grad('s', '#FFF0A0', '#F5B41C'),
        art: (
          <>
            <Path d={starPath(32, 32, 27, 12.5)} fill={g('s')} stroke="#C98A00" strokeWidth={2.2} strokeLinejoin="round" />
            <Ellipse cx={24} cy={21} rx={5} ry={2.6} fill="#FFFFFF" opacity={0.6} transform="rotate(-30 24 21)" />
            <Circle cx={27.5} cy={31} r={2.2} fill={INK} />
            <Circle cx={36.5} cy={31} r={2.2} fill={INK} />
            <Path d="M28 36 Q32 40 36 36" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Ellipse cx={24} cy={36} rx={2.6} ry={1.6} fill="#FF8FA8" opacity={0.7} />
            <Ellipse cx={40} cy={36} rx={2.6} ry={1.6} fill="#FF8FA8" opacity={0.7} />
            {star(56, 10, 3.5, '#FFFFFF')}
          </>
        ),
      };
    case 'earth':
      return {
        defs: (
          <>
            {grad('o', '#8BE0FF', '#1F7FE0')}
            {grad('l', '#9AF2B0', '#2BAA5E')}
          </>
        ),
        art: (
          <>
            <Circle cx={32} cy={31} r={24} fill={g('o')} stroke="#1B5FA8" strokeWidth={2} />
            <Path d="M17 17 Q26 12 30 19 Q27 26 20 25 Q14 23 17 17 Z" fill={g('l')} stroke="#1E7A44" strokeWidth={1.5} />
            <Path d="M35 28 Q44 23 50 30 Q50 41 41 45 Q34 42 37 37 Q32 34 35 28 Z" fill={g('l')} stroke="#1E7A44" strokeWidth={1.5} />
            <Path d="M13 34 Q20 33 21 40 Q18 45 13 41 Z" fill={g('l')} stroke="#1E7A44" strokeWidth={1.5} />
            <Ellipse cx={22} cy={14} rx={7} ry={3} fill="#FFFFFF" opacity={0.5} transform="rotate(-25 22 14)" />
            {star(56, 8, 3.5)}
          </>
        ),
      };
    case 'moon':
      return {
        defs: grad('m', '#F6F7FF', '#AEB6D8'),
        art: (
          <>
            <Circle cx={32} cy={31} r={23} fill={g('m')} stroke="#7C86B0" strokeWidth={2} />
            <Circle cx={20} cy={22} r={4.5} fill="#C7CDE6" />
            <Circle cx={44} cy={40} r={5.5} fill="#C7CDE6" />
            <Circle cx={42} cy={20} r={2.8} fill="#C7CDE6" />
            <Path d="M24 31 Q27 34 30 31 M34 31 Q37 34 40 31" stroke={INK} strokeWidth={2} strokeLinecap="round" fill="none" />
            <Path d="M29 38 Q32 40.5 35 38" stroke={INK} strokeWidth={2} strokeLinecap="round" fill="none" />
            <Ellipse cx={22} cy={36} rx={2.6} ry={1.6} fill="#FF8FA8" opacity={0.6} />
            {star(57, 9, 3.5)}
            {star(8, 50, 2.6, '#FFFFFF')}
          </>
        ),
      };
    case 'saturn':
      return {
        defs: grad('p', '#FFD49A', '#E0782A'),
        art: (
          <>
            <G transform="rotate(-14 32 32)">
              <Ellipse cx={32} cy={33} rx={29} ry={8} fill="none" stroke="#C99A3A" strokeWidth={6.5} />
              <Ellipse cx={32} cy={33} rx={29} ry={8} fill="none" stroke="#FFE3A6" strokeWidth={4} />
            </G>
            <Circle cx={32} cy={32} r={17} fill={g('p')} stroke="#A8521A" strokeWidth={2} />
            <Ellipse cx={32} cy={26} rx={16} ry={2.4} fill="#FFFFFF" opacity={0.25} />
            <Ellipse cx={32} cy={37} rx={16} ry={2.6} fill="#A8521A" opacity={0.18} />
            <Ellipse cx={25} cy={22} rx={4.5} ry={2.4} fill="#FFFFFF" opacity={0.55} transform="rotate(-30 25 22)" />
            {/* The front of the ring, over the planet, so the planet sits INSIDE it. */}
            <G transform="rotate(-14 32 32)">
              <Path d="M3 33 A29 8 0 0 0 61 33" fill="none" stroke="#C99A3A" strokeWidth={6.5} />
              <Path d="M3 33 A29 8 0 0 0 61 33" fill="none" stroke="#FFE3A6" strokeWidth={4} />
            </G>
            {star(9, 10, 3.5)}
          </>
        ),
      };
    case 'rocket':
      return {
        defs: (
          <>
            {grad('h', '#FFFFFF', '#C9D4F0')}
            {grad('r', '#FF7A6B', '#D93A2B')}
            {grad('w', '#8BF0FF', '#1D8FE0')}
            {grad('f', '#FFE066', '#FF7A1A')}
          </>
        ),
        art: (
          <>
            <G transform="rotate(40 32 30)">
              <Path d="M26 44 Q32 66 38 44 Z" fill={g('f')} />
              <Path d="M29 44 Q32 57 35 44 Z" fill="#FFF3B0" />
              <Path d="M22 34 L13 47 L23 45 Z" fill={g('r')} stroke="#9C2216" strokeWidth={1.6} strokeLinejoin="round" />
              <Path d="M42 34 L51 47 L41 45 Z" fill={g('r')} stroke="#9C2216" strokeWidth={1.6} strokeLinejoin="round" />
              <Path d="M32 4 Q45 17 42 45 H22 Q19 17 32 4 Z" fill={g('h')} stroke="#4A5A96" strokeWidth={2} strokeLinejoin="round" />
              <Path d="M32 4 Q39.5 11 41.6 19 H22.4 Q24.5 11 32 4 Z" fill={g('r')} stroke="#9C2216" strokeWidth={1.6} strokeLinejoin="round" />
              <Circle cx={32} cy={28} r={6.5} fill={g('w')} stroke="#4A5A96" strokeWidth={2} />
              <Circle cx={30} cy={26} r={2} fill="#FFFFFF" opacity={0.85} />
            </G>
            {star(10, 12, 4.5)}
            {star(54, 50, 3.5, '#FFFFFF')}
          </>
        ),
      };

    // ------------------------------------------------------------------------------ dinosaurs
    case 'egg':
      return {
        defs: grad('e', '#FFF8E4', '#F2D08A'),
        art: (
          <>
            <Path d="M32 5 C45 5 52 26 52 38 C52 50 43 57 32 57 C21 57 12 50 12 38 C12 26 19 5 32 5 Z" fill={g('e')} stroke="#C99A3A" strokeWidth={2} />
            <Circle cx={23} cy={40} r={4} fill="#8EE3A0" />
            <Circle cx={40} cy={46} r={3.2} fill="#8EE3A0" />
            <Circle cx={41} cy={31} r={2.6} fill="#8EE3A0" />
            <Circle cx={30} cy={50} r={2.2} fill="#8EE3A0" />
            <Path d="M19 24 L24 28 L28 21 L33 28 L37 22 L43 26" stroke="#B8924A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Ellipse cx={22} cy={15} rx={3} ry={6} fill="#FFFFFF" opacity={0.65} transform="rotate(22 22 15)" />
            {star(55, 10, 4)}
          </>
        ),
      };
    case 'fossil': {
      const bone = (fill: string, stroke?: string, w = 0) => (
        <G transform="rotate(-22 32 30)">
          {[[17, 25], [17, 35], [47, 25], [47, 35]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={6.2} fill={fill} stroke={stroke} strokeWidth={w} />
          ))}
          <Rect x={17} y={25} width={30} height={10} fill={fill} stroke={stroke} strokeWidth={w} />
        </G>
      );
      return {
        defs: (
          <>
            {grad('b', '#FFFCF2', '#E6D2A6')}
            {grad('r', '#DDA46E', '#9C6534')}
          </>
        ),
        art: (
          <>
            <Path d="M4 50 Q12 38 32 38 Q52 38 60 50 Q60 57 52 57 H12 Q4 57 4 50 Z" fill={g('r')} stroke="#6E4420" strokeWidth={2} />
            <Circle cx={16} cy={50} r={2} fill="#6E4420" opacity={0.35} />
            <Circle cx={47} cy={52} r={2.5} fill="#6E4420" opacity={0.3} />
            {/* Outline layer, then fill: one clean silhouette for the bone's five shapes. */}
            {bone('#B8965A', '#B8965A', 4)}
            {bone(g('b'))}
            <Rect x={20} y={26.5} width={20} height={2.6} rx={1.3} fill="#FFFFFF" opacity={0.7} transform="rotate(-22 32 30)" />
            {star(55, 9, 4)}
          </>
        ),
      };
    }
    case 'brontosaurus': {
      const shapes = (fill: string, neckW: number) => (
        <>
          <Path d="M49 38 Q62 40 60 53 Q56 45 47 45 Z" fill={fill} />
          <Rect x={24} y={43} width={7} height={13} rx={3.5} fill={fill} />
          <Rect x={41} y={43} width={7} height={13} rx={3.5} fill={fill} />
          <Ellipse cx={36} cy={39} rx={17} ry={12} fill={fill} />
          <Path d="M25 36 Q18 24 17 14" stroke={fill} strokeWidth={neckW} strokeLinecap="round" fill="none" />
          <Ellipse cx={16} cy={12} rx={9} ry={7} fill={fill} />
        </>
      );
      return {
        defs: grad('d', '#9CEBAE', '#34A65C'),
        art: (
          <>
            <G stroke="#1F7A44" strokeWidth={4}>{shapes('#1F7A44', 13)}</G>
            {shapes(g('d'), 9)}
            <Ellipse cx={36} cy={44} rx={11} ry={5} fill="#D4F7DC" opacity={0.8} />
            <Circle cx={31} cy={33} r={2.6} fill="#1F9E55" opacity={0.6} />
            <Circle cx={39} cy={31} r={2} fill="#1F9E55" opacity={0.6} />
            <Circle cx={45} cy={35} r={2.4} fill="#1F9E55" opacity={0.6} />
            <Circle cx={14} cy={10} r={1.9} fill={INK} />
            <Circle cx={14.6} cy={9.4} r={0.6} fill="#FFFFFF" />
            <Path d="M15 15 Q19 16.8 23 14" stroke={INK} strokeWidth={1.6} strokeLinecap="round" fill="none" />
            <Ellipse cx={20} cy={13} rx={1.8} ry={1.1} fill="#FF8FA8" opacity={0.7} />
            <Ellipse cx={31} cy={31} rx={6} ry={2.2} fill="#FFFFFF" opacity={0.45} transform="rotate(-12 31 31)" />
            {star(56, 12, 4)}
          </>
        ),
      };
    }
    case 't-rex': {
      const shapes = (fill: string) => (
        <>
          <Path d="M20 38 Q8 46 3 40 Q10 50 22 46 Z" fill={fill} />
          <Rect x={19} y={46} width={8} height={11} rx={3.5} fill={fill} />
          <Rect x={31} y={46} width={8} height={11} rx={3.5} fill={fill} />
          <Ellipse cx={29} cy={39} rx={13} ry={13} fill={fill} />
          <Rect x={23} y={7} width={33} height={24} rx={12} fill={fill} />
        </>
      );
      return {
        defs: grad('t', '#FFC48A', '#EE7A2A'),
        art: (
          <>
            <G stroke="#A8521A" strokeWidth={4}>{shapes('#A8521A')}</G>
            {shapes(g('t'))}
            <Ellipse cx={31} cy={42} rx={7} ry={8.5} fill="#FFE6C4" />
            {/* Tiny arms — the friendliest thing about a T-Rex. */}
            <Path d="M38 34 Q44 35 44 40" stroke="#A8521A" strokeWidth={5} strokeLinecap="round" fill="none" />
            <Path d="M38 34 Q44 35 44 40" stroke="#FFB070" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Circle cx={44} cy={16} r={2.6} fill={INK} />
            <Circle cx={44.8} cy={15.2} r={0.9} fill="#FFFFFF" />
            <Circle cx={52} cy={14} r={0.9} fill="#A8521A" />
            <Path d="M39 24 Q46 28.5 53 23" stroke={INK} strokeWidth={2} strokeLinecap="round" fill="none" />
            <Ellipse cx={38} cy={21} rx={2.6} ry={1.6} fill="#FF8FA8" opacity={0.7} />
            <Circle cx={30} cy={13} r={1.8} fill="#D9661A" opacity={0.5} />
            <Circle cx={34} cy={10} r={1.3} fill="#D9661A" opacity={0.5} />
            <Ellipse cx={31} cy={11} rx={5} ry={2} fill="#FFFFFF" opacity={0.4} transform="rotate(-10 31 11)" />
            {star(8, 12, 4)}
          </>
        ),
      };
    }
    case 'triceratops': {
      const body = (fill: string) => (
        <>
          <Path d="M13 37 Q4 39 3 46 Q10 44 15 45 Z" fill={fill} />
          {[14, 22, 33, 41].map((x) => (
            <Rect key={x} x={x} y={44} width={7} height={12} rx={3.5} fill={fill} />
          ))}
          <Ellipse cx={28} cy={40} rx={17} ry={11} fill={fill} />
          <Ellipse cx={48} cy={37} rx={10} ry={8.5} fill={fill} />
        </>
      );
      return {
        defs: (
          <>
            {grad('c', '#C4ADFF', '#7443D8')}
            {grad('q', '#FFC2DC', '#F06FA8')}
          </>
        ),
        art: (
          <>
            {/* The frill, behind the head. */}
            <Circle cx={42} cy={28} r={13} fill={g('q')} stroke="#B22C68" strokeWidth={2} />
            <Circle cx={42} cy={28} r={8} fill="#FFFFFF" opacity={0.25} />
            <G stroke="#4A248F" strokeWidth={4}>{body('#4A248F')}</G>
            {body(g('c'))}
            <Path d="M45 30 L48 17 L51 31 Z" fill="#FFF3D6" stroke="#C9A04A" strokeWidth={1.5} strokeLinejoin="round" />
            <Path d="M39 31 L40 19 L44 31 Z" fill="#FFF3D6" stroke="#C9A04A" strokeWidth={1.5} strokeLinejoin="round" />
            <Path d="M55 34 L62 30 L57 39 Z" fill="#FFF3D6" stroke="#C9A04A" strokeWidth={1.5} strokeLinejoin="round" />
            <Circle cx={49} cy={35} r={2.2} fill={INK} />
            <Circle cx={49.7} cy={34.3} r={0.7} fill="#FFFFFF" />
            <Path d="M50 40 Q54 42.5 57.5 39.5" stroke={INK} strokeWidth={1.8} strokeLinecap="round" fill="none" />
            <Ellipse cx={45} cy={39.5} rx={2.2} ry={1.3} fill="#FF8FA8" opacity={0.7} />
            <Ellipse cx={26} cy={34} rx={7} ry={2.4} fill="#FFFFFF" opacity={0.4} transform="rotate(-8 26 34)" />
            {star(8, 12, 4)}
          </>
        ),
      };
    }

    // ------------------------------------------------------------------------------ animals
    case 'dog':
      return {
        defs: (
          <>
            {grad('f', '#FFDDAE', '#E3A462')}
            {grad('e', '#A8703E', '#6E4420')}
          </>
        ),
        art: (
          <>
            <Path d="M15 16 Q5 20 7 38 Q11 45 18 37 Q21 27 21 20 Z" fill={g('e')} stroke="#4E2E14" strokeWidth={2} />
            <Path d="M49 16 Q59 20 57 38 Q53 45 46 37 Q43 27 43 20 Z" fill={g('e')} stroke="#4E2E14" strokeWidth={2} />
            <Circle cx={32} cy={30} r={18} fill={g('f')} stroke="#8A5A2E" strokeWidth={2} />
            <Ellipse cx={39} cy={23} rx={6} ry={5} fill="#C98A4E" opacity={0.45} />
            <Ellipse cx={32} cy={38} rx={9.5} ry={7} fill="#FFF3E2" />
            <Circle cx={25} cy={27} r={2.5} fill={INK} />
            <Circle cx={39} cy={27} r={2.5} fill={INK} />
            <Circle cx={25.8} cy={26.2} r={0.8} fill="#FFFFFF" />
            <Circle cx={39.8} cy={26.2} r={0.8} fill="#FFFFFF" />
            <Ellipse cx={32} cy={34} rx={3.6} ry={2.6} fill="#3A2210" />
            <Path d="M32 36.5 V39 M28 39 Q32 42 36 39" stroke="#3A2210" strokeWidth={1.6} strokeLinecap="round" fill="none" />
            <Path d="M30 40.5 Q32 46 34 40.5 Z" fill="#FF8FA8" stroke="#D0527E" strokeWidth={1} />
            <Rect x={20} y={46} width={24} height={6} rx={3} fill="#FF6B6B" stroke="#B22C2C" strokeWidth={1.5} />
            <Circle cx={32} cy={53.5} r={3.4} fill="#FFD84D" stroke="#C99A0A" strokeWidth={1.2} />
            <Ellipse cx={24} cy={17} rx={5} ry={2.4} fill="#FFFFFF" opacity={0.5} transform="rotate(-25 24 17)" />
            {star(57, 8, 3.5)}
          </>
        ),
      };
    case 'cat':
      return {
        defs: grad('c', '#FFCB8A', '#F08A2E'),
        art: (
          <>
            <Path d="M14 24 L16 5 L29 14 Z" fill={g('c')} stroke="#B8520E" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M50 24 L48 5 L35 14 Z" fill={g('c')} stroke="#B8520E" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M18 18 L19 10 L25 14.5 Z" fill="#FF9EB8" />
            <Path d="M46 18 L45 10 L39 14.5 Z" fill="#FF9EB8" />
            <Ellipse cx={32} cy={33} rx={20} ry={18} fill={g('c')} stroke="#B8520E" strokeWidth={2} />
            <Path d="M32 16 V22 M26.5 17 L27.8 22 M37.5 17 L36.2 22" stroke="#D9661A" strokeWidth={2.2} strokeLinecap="round" />
            <Ellipse cx={27.5} cy={40} rx={5.5} ry={4.2} fill="#FFF3E2" />
            <Ellipse cx={36.5} cy={40} rx={5.5} ry={4.2} fill="#FFF3E2" />
            <Ellipse cx={25} cy={31} rx={2.5} ry={3.3} fill={INK} />
            <Ellipse cx={39} cy={31} rx={2.5} ry={3.3} fill={INK} />
            <Circle cx={25.8} cy={30} r={0.9} fill="#FFFFFF" />
            <Circle cx={39.8} cy={30} r={0.9} fill="#FFFFFF" />
            <Path d="M29.5 36.5 L34.5 36.5 L32 39 Z" fill="#FF8FA8" stroke="#D0527E" strokeWidth={0.8} strokeLinejoin="round" />
            <Path d="M32 39 Q30 42 27.5 40.5 M32 39 Q34 42 36.5 40.5" stroke="#8A4A10" strokeWidth={1.5} strokeLinecap="round" fill="none" />
            <Path d="M20 38 H8 M20 41 L9 44 M44 38 H56 M44 41 L55 44" stroke="#8A4A10" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
            <Ellipse cx={22} cy={23} rx={4.5} ry={2.2} fill="#FFFFFF" opacity={0.5} transform="rotate(-25 22 23)" />
            {star(57, 52, 3.5, '#FFFFFF')}
          </>
        ),
      };
    case 'monkey':
      return {
        defs: grad('m', '#C99468', '#7A4A28'),
        art: (
          <>
            <Circle cx={12} cy={31} r={7.5} fill={g('m')} stroke="#4E2E14" strokeWidth={2} />
            <Circle cx={52} cy={31} r={7.5} fill={g('m')} stroke="#4E2E14" strokeWidth={2} />
            <Circle cx={12} cy={31} r={4} fill="#FFD1A8" />
            <Circle cx={52} cy={31} r={4} fill="#FFD1A8" />
            <Circle cx={32} cy={30} r={20} fill={g('m')} stroke="#4E2E14" strokeWidth={2} />
            <Circle cx={26} cy={27} r={8} fill="#FFE3C4" />
            <Circle cx={38} cy={27} r={8} fill="#FFE3C4" />
            <Ellipse cx={32} cy={38} rx={12.5} ry={9.5} fill="#FFE3C4" />
            <Circle cx={26} cy={27} r={2.5} fill={INK} />
            <Circle cx={38} cy={27} r={2.5} fill={INK} />
            <Circle cx={26.8} cy={26.2} r={0.8} fill="#FFFFFF" />
            <Circle cx={38.8} cy={26.2} r={0.8} fill="#FFFFFF" />
            <Circle cx={30.5} cy={34} r={1.1} fill="#7A4A28" />
            <Circle cx={33.5} cy={34} r={1.1} fill="#7A4A28" />
            <Path d="M25 39 Q32 46 39 39" stroke="#7A4A28" strokeWidth={2} strokeLinecap="round" fill="none" />
            <Path d="M28 10.5 Q31 4 35 10.5" stroke="#4E2E14" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Ellipse cx={22} cy={15} rx={5} ry={2.2} fill="#FFFFFF" opacity={0.4} transform="rotate(-30 22 15)" />
            {star(57, 9, 3.5)}
          </>
        ),
      };
    case 'dolphin':
      return {
        defs: (
          <>
            {grad('d', '#9EDCFF', '#3A8FE0')}
            {grad('w', '#8BE0FF', '#2F8FE0')}
          </>
        ),
        art: (
          <>
            <Path d="M36 17 L41 5 L45 18 Z" fill={g('d')} stroke="#1F5FA8" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M7 43 C13 23 33 12 50 16 L59 13 L56 20 C59 24 57 29 52 31 C44 27 32 29 23 37 L27 45 L18 41 Z" fill={g('d')} stroke="#1F5FA8" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M24 35 C32 29 42 28 51 30.5" stroke="#E6F6FF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.9} />
            <Path d="M33 30 L29 39 L39 31 Z" fill={g('d')} stroke="#1F5FA8" strokeWidth={1.6} strokeLinejoin="round" />
            <Circle cx={47.5} cy={20} r={2} fill={INK} />
            <Circle cx={48.1} cy={19.4} r={0.7} fill="#FFFFFF" />
            <Path d="M51.5 26 Q54.5 27.5 57 25.5" stroke={INK} strokeWidth={1.5} strokeLinecap="round" fill="none" />
            <Ellipse cx={30} cy={20} rx={6} ry={2.2} fill="#FFFFFF" opacity={0.5} transform="rotate(-20 30 20)" />
            <Path d="M2 52 Q9 46 16 52 T30 52 T44 52 T58 52 T64 52 V60 H2 Z" fill={g('w')} stroke="#1B6CB8" strokeWidth={1.8} strokeLinejoin="round" />
            <Circle cx={12} cy={45} r={1.8} fill="#BDEBFF" />
            <Circle cx={8} cy={40} r={1.2} fill="#BDEBFF" />
            {star(57, 6, 3.5)}
          </>
        ),
      };
    case 'lion': {
      const mane = (fill: string, grow: number) => (
        <>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <Circle key={i} cx={32 + 19 * Math.cos(a)} cy={31 + 19 * Math.sin(a)} r={7.5 + grow} fill={fill} />;
          })}
          <Circle cx={32} cy={31} r={20 + grow} fill={fill} />
        </>
      );
      return {
        defs: (
          <>
            {grad('n', '#FFB957', '#D9661A')}
            {grad('f', '#FFE89A', '#F5C542')}
          </>
        ),
        art: (
          <>
            {mane('#A8480E', 2)}
            {mane(g('n'), 0)}
            <Circle cx={21} cy={19} r={5} fill={g('f')} stroke="#C98A00" strokeWidth={1.8} />
            <Circle cx={43} cy={19} r={5} fill={g('f')} stroke="#C98A00" strokeWidth={1.8} />
            <Circle cx={32} cy={32} r={15} fill={g('f')} stroke="#C98A00" strokeWidth={2} />
            <Circle cx={26.5} cy={29} r={2.3} fill={INK} />
            <Circle cx={37.5} cy={29} r={2.3} fill={INK} />
            <Circle cx={27.2} cy={28.3} r={0.8} fill="#FFFFFF" />
            <Circle cx={38.2} cy={28.3} r={0.8} fill="#FFFFFF" />
            <Ellipse cx={29} cy={37.5} rx={4} ry={3} fill="#FFF8E4" />
            <Ellipse cx={35} cy={37.5} rx={4} ry={3} fill="#FFF8E4" />
            <Path d="M29.5 33.5 L34.5 33.5 L32 36.5 Z" fill="#8A4A2E" strokeLinejoin="round" />
            <Path d="M29 40.5 Q32 42.5 35 40.5" stroke="#8A4A2E" strokeWidth={1.6} strokeLinecap="round" fill="none" />
            <Ellipse cx={22} cy={36} rx={2.4} ry={1.4} fill="#FF8FA8" opacity={0.6} />
            <Ellipse cx={42} cy={36} rx={2.4} ry={1.4} fill="#FF8FA8" opacity={0.6} />
            <Ellipse cx={26} cy={22.5} rx={4} ry={1.8} fill="#FFFFFF" opacity={0.55} transform="rotate(-20 26 22.5)" />
          </>
        ),
      };
    }

    // ------------------------------------------------------------------------------ vehicles
    case 'car':
      return {
        defs: grad('c', '#FF9A8A', '#D9302A'),
        art: (
          <>
            <Path d="M5 40 Q5 32 13 32 L19 32 L25.5 22 Q27.5 19.5 31 19.5 H42 Q46 19.5 48 23.5 L52 32 H54 Q60 32 60 40 V44 Q60 47.5 56.5 47.5 H8.5 Q5 47.5 5 44 Z" fill={g('c')} stroke="#9C1C18" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M28 23 H36 V31 H22.5 Z" fill="#CFF0FF" stroke="#9C1C18" strokeWidth={1.4} strokeLinejoin="round" />
            <Path d="M39 23 H44 Q45.5 23 46.2 24.6 L49 31 H39 Z" fill="#CFF0FF" stroke="#9C1C18" strokeWidth={1.4} strokeLinejoin="round" />
            <Path d="M37.5 33 V44" stroke="#9C1C18" strokeWidth={1.3} opacity={0.6} />
            <Rect x={10} y={34} width={22} height={3} rx={1.5} fill="#FFFFFF" opacity={0.55} />
            <Circle cx={57} cy={37} r={2.4} fill="#FFE066" stroke="#C99A0A" strokeWidth={1} />
            {[18, 47].map((x) => (
              <G key={x}>
                <Circle cx={x} cy={47.5} r={7.5} fill="#34384F" stroke="#1C1F30" strokeWidth={1.5} />
                <Circle cx={x} cy={47.5} r={3.2} fill="#D9DEEA" />
              </G>
            ))}
            {star(9, 12, 4)}
            {star(55, 10, 3, '#FFFFFF')}
          </>
        ),
      };
    case 'fire-truck':
      return {
        defs: grad('t', '#FF8A7A', '#D42A22'),
        art: (
          <>
            <Rect x={6} y={21} width={30} height={5} rx={2} fill="#C9D2E6" stroke="#6D7896" strokeWidth={1.4} />
            <Path d="M11 21 V26 M16 21 V26 M21 21 V26 M26 21 V26 M31 21 V26" stroke="#6D7896" strokeWidth={1.3} />
            <Rect x={41} y={18} width={9} height={5} rx={2} fill="#5BAEFF" stroke="#1F5FB8" strokeWidth={1.2} />
            <Rect x={45.5} y={18} width={4.5} height={5} rx={1.5} fill="#FF6B6B" />
            <Rect x={4} y={28} width={38} height={18} rx={3} fill={g('t')} stroke="#8A1A14" strokeWidth={2} />
            <Path d="M40 24 H50 Q54 24 56 28 L60 37 V46 H40 Z" fill={g('t')} stroke="#8A1A14" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M44 27.5 H50 Q52 27.5 53 29.5 L56 36 H44 Z" fill="#CFF0FF" stroke="#8A1A14" strokeWidth={1.3} strokeLinejoin="round" />
            <Rect x={4} y={38} width={56} height={3.2} fill="#FFFFFF" opacity={0.9} />
            <Rect x={9} y={31} width={12} height={2.6} rx={1.3} fill="#FFFFFF" opacity={0.5} />
            {[15, 48].map((x) => (
              <G key={x}>
                <Circle cx={x} cy={47} r={7.5} fill="#34384F" stroke="#1C1F30" strokeWidth={1.5} />
                <Circle cx={x} cy={47} r={3.2} fill="#D9DEEA" />
              </G>
            ))}
            {star(56, 9, 3.5)}
          </>
        ),
      };
    case 'tractor':
      return {
        defs: grad('g', '#9CEBAE', '#2FA055'),
        art: (
          <>
            <Rect x={8} y={8} width={25} height={4.5} rx={2} fill="#1F7A44" />
            <Rect x={11} y={11} width={19} height={23} rx={3} fill={g('g')} stroke="#1F7A44" strokeWidth={2} />
            <Rect x={14.5} y={15} width={12} height={10} rx={2} fill="#CFF0FF" stroke="#1F7A44" strokeWidth={1.3} />
            <Rect x={46} y={16} width={3.6} height={13} rx={1.5} fill="#6D7896" />
            <Circle cx={49} cy={11} r={2.6} fill="#FFFFFF" opacity={0.75} />
            <Circle cx={53} cy={6.5} r={3.2} fill="#FFFFFF" opacity={0.6} />
            <Rect x={27} y={28} width={30} height={15} rx={4} fill={g('g')} stroke="#1F7A44" strokeWidth={2} />
            <Rect x={30} y={31} width={14} height={2.6} rx={1.3} fill="#FFFFFF" opacity={0.55} />
            <Circle cx={55} cy={34} r={2.2} fill="#FFE066" stroke="#C99A0A" strokeWidth={1} />
            <Circle cx={20} cy={42} r={14} fill="#34384F" stroke="#1C1F30" strokeWidth={2} />
            <Circle cx={20} cy={42} r={10} fill="none" stroke="#4A4F6A" strokeWidth={3} strokeDasharray="3 3" />
            <Circle cx={20} cy={42} r={5.5} fill="#FFD84D" stroke="#C99A0A" strokeWidth={1.2} />
            <Circle cx={50} cy={48} r={8} fill="#34384F" stroke="#1C1F30" strokeWidth={1.8} />
            <Circle cx={50} cy={48} r={3.4} fill="#FFD84D" stroke="#C99A0A" strokeWidth={1} />
            {star(58, 22, 3, '#FFFFFF')}
          </>
        ),
      };
    case 'train':
      return {
        defs: grad('b', '#8FC2FF', '#2F66D6'),
        art: (
          <>
            <Circle cx={47} cy={6} r={3.6} fill="#FFFFFF" opacity={0.7} />
            <Circle cx={53} cy={3.5} r={2.6} fill="#FFFFFF" opacity={0.5} />
            <Rect x={43} y={13} width={7} height={13} rx={2} fill="#3A3F5C" />
            <Rect x={41} y={10.5} width={11} height={4} rx={2} fill="#3A3F5C" />
            <Rect x={4} y={9} width={23} height={5} rx={2} fill="#FF6B6B" stroke="#B22C2C" strokeWidth={1.4} />
            <Rect x={6} y={13} width={19} height={29} rx={3} fill={g('b')} stroke="#1B3F9E" strokeWidth={2} />
            <Rect x={10} y={17} width={11} height={9} rx={2} fill="#CFF0FF" stroke="#1B3F9E" strokeWidth={1.3} />
            <Rect x={23} y={23} width={33} height={19} rx={8} fill={g('b')} stroke="#1B3F9E" strokeWidth={2} />
            <Path d="M33 23.5 V41.5 M44 23.5 V41.5" stroke="#FFD84D" strokeWidth={2.4} />
            <Rect x={27} y={26} width={22} height={2.6} rx={1.3} fill="#FFFFFF" opacity={0.5} />
            <Circle cx={56} cy={32} r={2.4} fill="#FFE066" stroke="#C99A0A" strokeWidth={1} />
            <Path d="M55 41 L62 49 H50 Z" fill="#FF6B6B" stroke="#B22C2C" strokeWidth={1.5} strokeLinejoin="round" />
            <Rect x={5} y={40} width={50} height={5} rx={2} fill="#3A3F5C" />
            {[[14, 6.5], [31, 5.5], [44, 5.5]].map(([x, r]) => (
              <G key={x}>
                <Circle cx={x} cy={49} r={r} fill="#FF6B6B" stroke="#8A1A14" strokeWidth={1.6} />
                <Circle cx={x} cy={49} r={r * 0.4} fill="#FFE3E0" />
              </G>
            ))}
            {star(8, 50, 3, '#FFFFFF')}
          </>
        ),
      };

    // ------------------------------------------------------------------------------ emblems
    default:
      return { defs: null, art: null };
  }
}

/** World emblems combine collectibles (each with its own gradient ids) into one scene. */
const EMBLEMS: Partial<Record<WorldArtName, { parts: { name: WorldArtName; transform: string }[]; backdrop?: 'volcano' }>> = {
  'world-space': {
    parts: [
      { name: 'saturn', transform: 'translate(8 10) scale(0.82)' },
      { name: 'moon', transform: 'translate(0 34) scale(0.36)' },
      { name: 'rocket', transform: 'translate(36 0) scale(0.44)' },
    ],
  },
  'world-dinosaurs': {
    backdrop: 'volcano',
    parts: [
      { name: 'brontosaurus', transform: 'translate(10 14) scale(0.78)' },
      { name: 'egg', transform: 'translate(0 36) scale(0.34)' },
    ],
  },
  'world-animals': {
    parts: [
      { name: 'cat', transform: 'translate(26 2) scale(0.6)' },
      { name: 'dog', transform: 'translate(0 16) scale(0.72)' },
    ],
  },
  'world-vehicles': {
    parts: [
      { name: 'train', transform: 'translate(20 0) scale(0.66)' },
      { name: 'car', transform: 'translate(0 20) scale(0.72)' },
    ],
  },
};

interface Props {
  name: WorldArtName;
  size: number;
  /** Not found yet: drawn faded. */
  locked?: boolean;
}

export function WorldArt({ name, size, locked }: Props) {
  // Gradient ids resolve document-wide in react-native-svg, so every instance gets its own.
  const base = `wa${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const helpers = (prefix: string) => {
    const p = `${base}${prefix}`;
    const grad: Grad = (id, top, bottom) => (
        <LinearGradient key={id} id={`${p}${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      );
    const g: Fill = (id) => `url(#${p}${id})`;
    return { grad, g };
  };

  const emblem = EMBLEMS[name];
  const layers = emblem
    ? emblem.parts.map((part, i) => ({ ...draw(part.name, helpers(`${i}${part.name.replace(/-/g, '')}`).grad, helpers(`${i}${part.name.replace(/-/g, '')}`).g), transform: part.transform }))
    : [{ ...draw(name, helpers('x').grad, helpers('x').g), transform: '' }];

  const volcano = emblem?.backdrop === 'volcano' ? (
    <>
      <Path d="M4 56 L22 20 Q32 13 42 20 L60 56 Z" fill="#9C6A48" stroke="#5E3A22" strokeWidth={2} strokeLinejoin="round" />
      <Path d="M22 20 Q32 13 42 20 L39 27 Q35 23 32 27 Q29 23 25 27 Z" fill="#FF8A3D" />
      <Circle cx={30} cy={9} r={3.5} fill="#FFFFFF" opacity={0.7} />
      <Circle cx={36} cy={5} r={2.6} fill="#FFFFFF" opacity={0.55} />
    </>
  ) : null;

  const content = (
    <>
      <Ellipse cx={32} cy={59.5} rx={18} ry={2.6} fill="#000000" opacity={locked ? 0 : 0.2} />
      {volcano}
      {layers.map((l, i) => (
        <G key={i} transform={l.transform || undefined}>
          {l.art}
        </G>
      ))}
    </>
  );

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessible={false} pointerEvents="none">
      <Defs>{layers.map((l, i) => <React.Fragment key={i}>{l.defs}</React.Fragment>)}</Defs>
      {/* A prize not found yet is a faded ghost of itself: the shape is there, the colour is not. */}
      {locked ? <G opacity={0.3}>{content}</G> : content}
    </Svg>
  );
}
