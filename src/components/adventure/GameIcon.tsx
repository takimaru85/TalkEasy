import React, { useId } from 'react';
import { drawSpace, SPACE_ICON_NAMES, type SpaceIconName } from './art/spaceArt';
import { useIconSet } from './useIconSet';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { SVG_DECORATIVE } from '@/utils/svgA11y';

/**
 * TalkEasy's illustrated game icons — original artwork, drawn as SVG.
 *
 * One illustrator's rules, applied to every icon so they read as a set:
 *  - a 64-unit grid, objects filling roughly 8..56, a soft ground shadow under each;
 *  - light from the top-left: every body is a two-stop gradient, light on top, deeper below;
 *  - an outline 2 units wide in a DARKER SHADE OF THE OBJECT'S OWN HUE (never black);
 *  - one white highlight per main shape, and small sparkle stars as the space-adventure accent.
 *
 * Pure react-native-svg (already a dependency): no image files, crisp at any size, a few KB.
 * The palette is deliberately bright so the art stays readable on the saturated cards.
 */
export type GameIconName =
  | 'speech' | 'trace' | 'talk' | 'words' | 'play' | 'lessons' | 'mission'
  | 'myday' | 'school' | 'activities' | 'feelings'
  | 'home' | 'practice' | 'controller' | 'progress' | 'parent'
  // Communication cards
  | 'water' | 'bathroom' | 'help' | 'hungry' | 'mom' | 'dad' | 'sister' | 'brother'
  | 'pause' | 'teddy' | 'again' | 'finished' | 'more' | 'iwant' | 'yes' | 'no'
  | 'happy' | 'sad' | 'angry' | 'hurt';

/**
 * Talk cards store a MaterialCommunityIcons name (parents pick from those). The core cards get
 * their illustrated version by that name; any other card keeps its glyph, drawn in white.
 */
export const ART_FOR_ICON: Record<string, GameIconName> = {
  'cup-water': 'water',
  toilet: 'bathroom',
  'hand-heart': 'help',
  'food-apple': 'hungry',
  'face-woman': 'mom',
  'face-man': 'dad',
  'human-female': 'sister',
  'human-male': 'brother',
  'pause-circle': 'pause',
  'teddy-bear': 'teddy',
  replay: 'again',
  'flag-checkered': 'finished',
  plus: 'more',
  'hand-pointing-right': 'iwant',
  check: 'yes',
  close: 'no',
  'emoticon-happy': 'happy',
  'emoticon-sad': 'sad',
  'emoticon-angry': 'angry',
  bandage: 'hurt',
  'emoticon-frown': 'sad',
  'check-circle': 'yes',
  water: 'water',
};

const INK = '#27325F';
const FONT = 'Nunito_900Black';
const SKIN = ['#FFE0C2', '#F2B48A', '#C47A4E'] as const;

/** A four-point sparkle star. */
function sparkle(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z`;
}

export function GameIcon({ name, size }: { name: GameIconName; size: number }) {
  // Gradient ids resolve document-wide in react-native-svg, so every instance gets its own.
  const p = `gi${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const g = (id: string) => `url(#${p}${id})`;
  const grad = (id: string, top: string, bottom: string) => (
    <LinearGradient id={`${p}${id}`} x1="0" y1="0" x2="0.35" y2="1">
      <Stop offset="0" stopColor={top} />
      <Stop offset="1" stopColor={bottom} />
    </LinearGradient>
  );
  const shadow = <Ellipse cx={32} cy={59.5} rx={17} ry={2.6} fill="#000000" opacity={0.2} />;
  const star = (cx: number, cy: number, r: number, color = '#FFE066') => <Path d={sparkle(cx, cy, r)} fill={color} />;

  let art: React.ReactNode = null;
  let defs: React.ReactNode = null;

  // Space Explorer draws its own set for the destinations; anything it does not cover (the Talk vocabulary
  // cards, the trophy) keeps the classic drawing below.
  const iconSet = useIconSet();
  const spaceDrawn = iconSet === 'space' && (SPACE_ICON_NAMES as readonly string[]).includes(name) ? drawSpace(name as SpaceIconName, grad, g) : null;
  if (spaceDrawn) {
    defs = spaceDrawn.defs;
    art = (
      <>
        {shadow}
        {spaceDrawn.art}
      </>
    );
  } else switch (name) {
    case 'speech':
    case 'practice':
      defs = (
        <>
          {grad('body', '#8BF0FF', '#1D8FE0')}
          {grad('stand', '#6D7FC9', '#34448C')}
        </>
      );
      art = (
        <>
          {shadow}
          {/* sound waves */}
          <Path d="M52 16 Q57.5 24 52 32" stroke="#FFD84D" strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <Path d="M56.5 11 Q64 24 56.5 37" stroke="#FF8FC0" strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <Path d="M12 16 Q6.5 24 12 32" stroke="#FFD84D" strokeWidth={3.4} strokeLinecap="round" fill="none" />
          {/* stand */}
          <Path d="M16 29 Q16 46 32 46 Q48 46 48 29" stroke={g('stand')} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <Rect x={29} y={45} width={6} height={9} rx={2} fill={g('stand')} />
          <Ellipse cx={32} cy={55} rx={11} ry={3.6} fill={g('stand')} stroke="#28346E" strokeWidth={1.5} />
          {/* head */}
          <Rect x={21} y={5} width={22} height={35} rx={11} fill={g('body')} stroke="#0D5E9E" strokeWidth={2} />
          <Path d="M24 17 H40 M24 23 H40 M24 29 H40" stroke="#0D5E9E" strokeWidth={2} strokeLinecap="round" opacity={0.35} />
          <Rect x={25} y={9} width={5} height={17} rx={2.5} fill="#FFFFFF" opacity={0.7} />
          {star(8, 8, 3.5)}
        </>
      );
      break;

    case 'trace':
      defs = (
        <>
          {grad('paper', '#FFFFFF', '#E3E8FF')}
          {grad('pencil', '#FFE27A', '#F4A51C')}
        </>
      );
      art = (
        <>
          {shadow}
          <G transform="rotate(-7 26 30)">
            <Rect x={6} y={8} width={38} height={44} rx={7} fill={g('paper')} stroke="#7A5CD6" strokeWidth={2} />
            <SvgText x={25} y={33} fontFamily={FONT} fontWeight="900" fontSize={20} fill="#7A43E0" textAnchor="middle">
              ABC
            </SvgText>
            <Path d="M12 43 Q19 37 25 43 T38 43" stroke="#FF6FA8" strokeWidth={2.6} strokeDasharray="3 3.5" strokeLinecap="round" fill="none" />
          </G>
          {/* pencil, lying across the corner */}
          <G transform="rotate(-45 44 40)">
            <Rect x={31} y={34} width={24} height={11} rx={1.5} fill={g('pencil')} stroke="#B86F0E" strokeWidth={1.8} />
            <Rect x={53} y={34} width={4} height={11} fill="#CBD5E6" stroke="#8793AE" strokeWidth={1.2} />
            <Rect x={56.5} y={34} width={6} height={11} rx={3} fill="#FF8FB3" stroke="#D0527E" strokeWidth={1.8} />
            <Path d="M31 34 L23 39.5 L31 45 Z" fill="#FFE1BD" stroke="#B86F0E" strokeWidth={1.6} strokeLinejoin="round" />
            <Path d="M25.8 37.6 L23 39.5 L25.8 41.4 Z" fill={INK} />
            <Rect x={33} y={35.5} width={19} height={2.6} rx={1.3} fill="#FFFFFF" opacity={0.6} />
          </G>
          {star(54, 9, 4)}
          {star(47, 4.5, 2.2, '#FFFFFF')}
        </>
      );
      break;

    case 'talk':
      defs = (
        <>
          {grad('blue', '#7CC3FF', '#2D6FE0')}
          {grad('pink', '#FFA9CF', '#EA4F92')}
        </>
      );
      art = (
        <>
          {shadow}
          <Path d="M16 8 H38 Q46 8 46 17 V26 Q46 35 38 35 H24 L13 44 L15 35 Q6 34 6 26 V17 Q6 8 16 8 Z" fill={g('blue')} stroke="#1F4FA8" strokeWidth={2} strokeLinejoin="round" />
          <Rect x={11} y={12.5} width={16} height={4} rx={2} fill="#FFFFFF" opacity={0.65} />
          <Path d="M30 24 H50 Q58 24 58 32 V41 Q58 49 50 49 H48 L50 57 L40 49 H30 Q22 49 22 41 V32 Q22 24 30 24 Z" fill={g('pink')} stroke="#B22C68" strokeWidth={2} strokeLinejoin="round" />
          <Circle cx={32} cy={37} r={3} fill="#FFFFFF" />
          <Circle cx={40} cy={37} r={3} fill="#FFFFFF" />
          <Circle cx={48} cy={37} r={3} fill="#FFFFFF" />
          <Path d="M53 8 Q57 12 53 16" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M57 4.5 Q63 12 57 19.5" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75} />
        </>
      );
      break;

    case 'words':
      defs = (
        <>
          {grad('cover', '#FF8CC4', '#D23D86')}
          {grad('page', '#FFFFFF', '#FFF0D2')}
        </>
      );
      art = (
        <>
          {shadow}
          <Path d="M4 24 L4 55 Q18 50 32 56 Q46 50 60 55 L60 24 Z" fill={g('cover')} stroke="#9C2461" strokeWidth={2} strokeLinejoin="round" />
          <Path d="M7 21 Q20 16 32 23 L32 51 Q20 45 7 50 Z" fill={g('page')} stroke="#C4568C" strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M57 21 Q44 16 32 23 L32 51 Q44 45 57 50 Z" fill={g('page')} stroke="#C4568C" strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M12 29 Q19 26 27 30 M12 35 Q19 32 27 36 M12 41 Q18 38 24 42" stroke="#F2A7C9" strokeWidth={2} strokeLinecap="round" fill="none" />
          <SvgText x={45} y={41} fontFamily={FONT} fontWeight="900" fontSize={15} fill="#7A43E0" textAnchor="middle">
            Aa
          </SvgText>
          {/* a word flying out of the book */}
          <Path d="M36 3 H52 Q57 3 57 8 V12 Q57 17 52 17 H45 L41 21 L41.5 17 H36 Q31 17 31 12 V8 Q31 3 36 3 Z" fill="#FFFFFF" stroke="#7A43E0" strokeWidth={1.8} />
          <Circle cx={39} cy={10} r={1.8} fill="#7A43E0" />
          <Circle cx={44} cy={10} r={1.8} fill="#7A43E0" />
          <Circle cx={49} cy={10} r={1.8} fill="#7A43E0" />
          {star(11, 10, 4)}
        </>
      );
      break;

    case 'play':
    case 'controller':
    case 'activities': {
      const body = name === 'activities' ? ['#C7A6FF', '#7C4BE0', '#4F2BA6'] : ['#FFA08E', '#E4452E', '#9E2616'];
      defs = grad('pad', body[0], body[1]);
      art = (
        <>
          {shadow}
          {name === 'play' ? (
            <>
              {/* a puzzle piece popping out above the controller */}
              <Path d="M37 6 H43 A4.5 4.5 0 1 1 51 6 H56 V12 A4.5 4.5 0 1 0 56 20 V25 H37 Z" fill="#5BD98A" stroke="#1F8A4B" strokeWidth={1.8} strokeLinejoin="round" />
              <Rect x={39.5} y={8.5} width={7} height={3} rx={1.5} fill="#FFFFFF" opacity={0.6} />
              {star(12, 12, 4.5)}
            </>
          ) : name === 'activities' ? (
            <>
              {star(12, 12, 4)}
              {star(52, 10, 4.5, '#FFD84D')}
            </>
          ) : null}
          <Path
            d="M16 28 H48 Q58 28 59 40 Q60 55 51 55 Q46 55 42 49 H22 Q18 55 13 55 Q4 55 5 40 Q6 28 16 28 Z"
            fill={g('pad')}
            stroke={body[2]}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Rect x={13} y={31.5} width={16} height={3.5} rx={1.75} fill="#FFFFFF" opacity={0.55} />
          {/* d-pad */}
          <Rect x={13} y={38.5} width={12} height={4.5} rx={1.5} fill="#FFFFFF" />
          <Rect x={16.75} y={34.75} width={4.5} height={12} rx={1.5} fill="#FFFFFF" />
          {/* buttons */}
          <Circle cx={46} cy={36.5} r={3.4} fill="#FFD84D" stroke="#C99A0A" strokeWidth={1.2} />
          <Circle cx={52} cy={42} r={3.4} fill="#5BD98A" stroke="#1F8A4B" strokeWidth={1.2} />
          <Circle cx={40} cy={42} r={3.4} fill="#5BAEFF" stroke="#1F5FB8" strokeWidth={1.2} />
          <Circle cx={46} cy={47.5} r={3.4} fill="#FFFFFF" stroke="#B0B8D0" strokeWidth={1.2} />
        </>
      );
      break;
    }

    case 'lessons':
      defs = (
        <>
          {grad('cap', '#7A9BFF', '#2F4FC8')}
          {grad('book', '#6BE39A', '#1F9E55')}
        </>
      );
      art = (
        <>
          {shadow}
          <Rect x={10} y={42} width={44} height={13} rx={3.5} fill={g('book')} stroke="#146B39" strokeWidth={2} />
          <Rect x={14} y={45} width={37} height={3.5} rx={1.5} fill="#FFFFFF" />
          <Rect x={14} y={50} width={37} height={2} rx={1} fill="#FFFFFF" opacity={0.7} />
          <Path d="M18 25 V33 Q32 41 46 33 V25 L32 31 Z" fill="#2A3F9E" stroke="#1B2A70" strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M32 9 L58 20 L32 31 L6 20 Z" fill={g('cap')} stroke="#1B2A70" strokeWidth={2} strokeLinejoin="round" />
          <Path d="M20 17.5 L32 12.5" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" opacity={0.6} />
          <Path d="M32 20 L51 24 V33" stroke="#FFC933" strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <Circle cx={51} cy={35} r={3.2} fill="#FFC933" stroke="#C98A00" strokeWidth={1.2} />
          <Circle cx={32} cy={20} r={2.4} fill="#FFC933" />
          {/* a tiny planet */}
          <Circle cx={54} cy={8} r={4.5} fill="#FFB36B" stroke="#C9661A" strokeWidth={1.4} />
          <Ellipse cx={54} cy={8} rx={8} ry={2.2} stroke="#FFE066" strokeWidth={1.6} fill="none" transform="rotate(-20 54 8)" />
          {star(9, 9, 3.5, '#FFFFFF')}
        </>
      );
      break;

    case 'mission':
      defs = (
        <>
          {grad('hull', '#FFFFFF', '#C9D4F0')}
          {grad('red', '#FF7A6B', '#D93A2B')}
          {grad('win', '#8BF0FF', '#1D8FE0')}
          {grad('flame', '#FFE066', '#FF7A1A')}
        </>
      );
      art = (
        <>
          {shadow}
          <G transform="rotate(40 32 30)">
            <Path d="M26 44 Q32 66 38 44 Z" fill={g('flame')} />
            <Path d="M29 44 Q32 57 35 44 Z" fill="#FFF3B0" />
            <Path d="M22 34 L13 47 L23 45 Z" fill={g('red')} stroke="#9C2216" strokeWidth={1.6} strokeLinejoin="round" />
            <Path d="M42 34 L51 47 L41 45 Z" fill={g('red')} stroke="#9C2216" strokeWidth={1.6} strokeLinejoin="round" />
            <Path d="M32 4 Q45 17 42 45 H22 Q19 17 32 4 Z" fill={g('hull')} stroke="#4A5A96" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M32 4 Q39.5 11 41.6 19 H22.4 Q24.5 11 32 4 Z" fill={g('red')} stroke="#9C2216" strokeWidth={1.6} strokeLinejoin="round" />
            <Circle cx={32} cy={28} r={6.5} fill={g('win')} stroke="#4A5A96" strokeWidth={2} />
            <Circle cx={30} cy={26} r={2} fill="#FFFFFF" opacity={0.85} />
            <Rect x={25} y={21} width={3} height={18} rx={1.5} fill="#FFFFFF" opacity={0.55} />
          </G>
          {star(10, 12, 4.5)}
          {star(54, 50, 3.5, '#FFFFFF')}
          {star(56, 8, 2.8, '#FFFFFF')}
        </>
      );
      break;

    case 'myday':
      defs = grad('head', '#FFB36B', '#F07A1A');
      art = (
        <>
          {shadow}
          <Rect x={8} y={12} width={48} height={45} rx={9} fill="#FFFFFF" stroke="#C9661A" strokeWidth={2} />
          <Path d="M17 12 H47 Q56 12 56 21 V26 H8 V21 Q8 12 17 12 Z" fill={g('head')} stroke="#C9661A" strokeWidth={2} strokeLinejoin="round" />
          <Rect x={18} y={6} width={6} height={12} rx={3} fill="#5A6C8C" />
          <Rect x={40} y={6} width={6} height={12} rx={3} fill="#5A6C8C" />
          <Path d="M21 41 L29 49 L44 34" stroke="#2FB864" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d={sparkle(49, 48, 5)} fill="#FFD84D" />
        </>
      );
      break;

    case 'school':
      defs = grad('bag', '#6BE39A', '#1F9E55');
      art = (
        <>
          {shadow}
          <Path d="M25 17 Q25 7 32 7 Q39 7 39 17" stroke="#146B39" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Rect x={13} y={15} width={38} height={43} rx={13} fill={g('bag')} stroke="#146B39" strokeWidth={2} />
          <Rect x={19} y={36} width={26} height={17} rx={6} fill="#9DF0BD" stroke="#146B39" strokeWidth={1.8} />
          <Path d="M19 43 H45" stroke="#146B39" strokeWidth={1.6} />
          <Rect x={29} y={40} width={6} height={6} rx={1.5} fill="#FFD84D" stroke="#C99A0A" strokeWidth={1.2} />
          <Rect x={18} y={19} width={5} height={13} rx={2.5} fill="#FFFFFF" opacity={0.55} />
          <Path d={sparkle(55, 12, 4)} fill="#FFD84D" />
        </>
      );
      break;

    case 'feelings':
      defs = grad('face', '#FFE27A', '#F5B41C');
      art = (
        <>
          {shadow}
          <Circle cx={32} cy={32} r={24} fill={g('face')} stroke="#C98A00" strokeWidth={2} />
          <Ellipse cx={24} cy={27} rx={3.4} ry={4.4} fill={INK} />
          <Ellipse cx={40} cy={27} rx={3.4} ry={4.4} fill={INK} />
          <Circle cx={25.2} cy={25.4} r={1.3} fill="#FFFFFF" />
          <Circle cx={41.2} cy={25.4} r={1.3} fill="#FFFFFF" />
          <Ellipse cx={17} cy={36} rx={4} ry={2.6} fill="#FF8FA8" opacity={0.7} />
          <Ellipse cx={47} cy={36} rx={4} ry={2.6} fill="#FF8FA8" opacity={0.7} />
          <Path d="M21 37 Q32 51 43 37 Z" fill="#B3263E" stroke="#8A1B2E" strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M26 43.5 Q32 49 38 43.5 Q32 41 26 43.5 Z" fill="#FF8FA8" />
          <Ellipse cx={22} cy={16} rx={7} ry={3.5} fill="#FFFFFF" opacity={0.55} transform="rotate(-25 22 16)" />
        </>
      );
      break;

    case 'home':
      defs = (
        <>
          {grad('dome', '#B8F6FF', '#3FB5F0')}
          {grad('base', '#9B7BFF', '#5A3BC8')}
        </>
      );
      art = (
        <>
          {shadow}
          <Path d="M32 8 V17" stroke="#8E9BC8" strokeWidth={2.5} strokeLinecap="round" />
          <Path d={sparkle(32, 7, 4.5)} fill="#FFD84D" />
          <Path d="M9 42 A23 23 0 0 1 55 42 Z" fill={g('dome')} stroke="#1D78B8" strokeWidth={2} />
          <Path d="M17 30 A16 16 0 0 1 29 22" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75} />
          <Rect x={5} y={41} width={54} height={13} rx={6} fill={g('base')} stroke="#3B2590" strokeWidth={2} />
          <Rect x={27} y={34} width={10} height={14} rx={5} fill="#FFD84D" stroke="#C99A0A" strokeWidth={1.5} />
          <Circle cx={14} cy={47.5} r={2.2} fill="#FFFFFF" />
          <Circle cx={50} cy={47.5} r={2.2} fill="#FFFFFF" />
        </>
      );
      break;

    case 'progress':
      defs = grad('gold', '#FFE27A', '#F0A20C');
      art = (
        <>
          {shadow}
          <Path d="M17 14 Q6 14 8 24 Q10 31 20 32" stroke="#C98A00" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Path d="M47 14 Q58 14 56 24 Q54 31 44 32" stroke="#C98A00" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Path d="M15 9 H49 V20 Q49 38 32 40 Q15 38 15 20 Z" fill={g('gold')} stroke="#C98A00" strokeWidth={2} strokeLinejoin="round" />
          <Rect x={28} y={39} width={8} height={8} fill="#F0A20C" stroke="#C98A00" strokeWidth={1.6} />
          <Rect x={19} y={47} width={26} height={9} rx={3} fill="#7C4BE0" stroke="#4F2BA6" strokeWidth={1.8} />
          <Path d="M32 15 L34.6 21 L41 21.4 L36 25.4 L37.7 31.6 L32 28 L26.3 31.6 L28 25.4 L23 21.4 L29.4 21 Z" fill="#FFFFFF" />
          <Rect x={19} y={12} width={4} height={14} rx={2} fill="#FFFFFF" opacity={0.55} />
        </>
      );
      break;

    case 'parent':
      defs = grad('shield', '#9CC2FF', '#3D6BE0');
      art = (
        <>
          {shadow}
          <Path d="M32 5 L54 13 V29 Q54 47 32 57 Q10 47 10 29 V13 Z" fill={g('shield')} stroke="#1F3F9E" strokeWidth={2} strokeLinejoin="round" />
          <Path d="M16 16 L32 10" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
          <Path d="M32 44 C16 34 20 21 28 23 Q31 24 32 27 Q33 24 36 23 C44 21 48 34 32 44 Z" fill="#FF6FA8" stroke="#B22C68" strokeWidth={1.8} strokeLinejoin="round" />
          <Ellipse cx={27} cy={28} rx={2.4} ry={1.5} fill="#FFFFFF" opacity={0.7} />
        </>
      );
      break;

    // ---------------------------------------------------------------- communication cards

    case 'water':
      defs = (
        <>
          {grad('glass', '#F4FBFF', '#C9E6FF')}
          {grad('water', '#7FD8FF', '#1F8FE8')}
        </>
      );
      art = (
        <>
          {shadow}
          <Path d="M14 12 H50 L45 55 Q44.6 57 42.5 57 H21.5 Q19.4 57 19 55 Z" fill={g('glass')} stroke="#4C8FD1" strokeWidth={2} strokeLinejoin="round" />
          <Path d="M16.3 27 Q24 23 32 27 Q40 31 47.7 27 L45 55 Q44.6 57 42.5 57 H21.5 Q19.4 57 19 55 Z" fill={g('water')} />
          <Path d="M14 12 H50 L45 55 Q44.6 57 42.5 57 H21.5 Q19.4 57 19 55 Z" fill="none" stroke="#1B6CB8" strokeWidth={2} strokeLinejoin="round" />
          <Rect x={19} y={16} width={4} height={34} rx={2} fill="#FFFFFF" opacity={0.7} />
          <Circle cx={37} cy={42} r={2.6} fill="#FFFFFF" opacity={0.75} />
          <Circle cx={31} cy={49} r={1.8} fill="#FFFFFF" opacity={0.6} />
          {/* a drop leaping out */}
          <Path d="M53 3 Q59 11 59 15 A6 6 0 0 1 47 15 Q47 11 53 3 Z" fill={g('water')} stroke="#1B6CB8" strokeWidth={1.6} />
          <Circle cx={51} cy={14} r={1.6} fill="#FFFFFF" />
          {star(8, 8, 3.5)}
        </>
      );
      break;

    case 'bathroom':
      defs = (
        <>
          {grad('bowl', '#FFFFFF', '#CFE0F5')}
          {grad('tank', '#8FD0FF', '#3A8FE0')}
        </>
      );
      art = (
        <>
          {shadow}
          <Rect x={14} y={5} width={36} height={17} rx={5} fill={g('tank')} stroke="#1F5FB8" strokeWidth={2} />
          <Rect x={18} y={8} width={12} height={3.5} rx={1.75} fill="#FFFFFF" opacity={0.65} />
          <Rect x={40} y={9} width={6} height={4} rx={2} fill="#FFD84D" stroke="#C99A0A" strokeWidth={1} />
          <Path d="M8 26 H56 Q56 42 40 45 L42 55 H22 L24 45 Q8 42 8 26 Z" fill={g('bowl')} stroke="#5A7FB0" strokeWidth={2} strokeLinejoin="round" />
          <Ellipse cx={32} cy={27} rx={24} ry={5} fill="#FFFFFF" stroke="#5A7FB0" strokeWidth={2} />
          <Ellipse cx={32} cy={27.5} rx={16} ry={2.6} fill="#7FD8FF" />
          <Path d="M13 33 Q16 39 24 41" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" fill="none" />
          {star(56, 8, 3.5)}
        </>
      );
      break;

    case 'help':
      defs = (
        <>
          {grad('hand', SKIN[0], SKIN[1])}
          {grad('heart', '#FF8FB8', '#E23D7A')}
        </>
      );
      art = (
        <>
          {shadow}
          {/* an open palm holding a heart up */}
          <Path d="M8 44 Q20 38 30 44 H44 Q49 44 49 48 Q49 52 44 52 H30 L32 56 H12 Q8 56 8 52 Z" fill={g('hand')} stroke={SKIN[2]} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M44 44 L54 38 Q58 36 59.5 39.5 Q60.5 42 57 44.5 L44 52" fill={g('hand')} stroke={SKIN[2]} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M32 38 C12 26 16 8 26 10 Q30 11 32 16 Q34 11 38 10 C48 8 52 26 32 38 Z" fill={g('heart')} stroke="#A81F55" strokeWidth={2} strokeLinejoin="round" />
          <Ellipse cx={25} cy={17} rx={3.5} ry={2.2} fill="#FFFFFF" opacity={0.75} transform="rotate(-30 25 17)" />
          {star(8, 12, 4)}
          {star(56, 10, 3, '#FFFFFF')}
        </>
      );
      break;

    case 'hungry':
      defs = (
        <>
          {grad('apple', '#FF8A7A', '#D9302A')}
          {grad('leaf', '#8EF0A8', '#26A55A')}
        </>
      );
      art = (
        <>
          {shadow}
          <Path d="M32 17 Q30 9 34 4" stroke="#7A4A22" strokeWidth={3.2} strokeLinecap="round" fill="none" />
          <Path d="M35 12 Q44 3 52 8 Q46 17 35 12 Z" fill={g('leaf')} stroke="#1B7A40" strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M32 18 Q22 11 14 17 Q6 24 9 38 Q13 55 24 56 Q28 56 32 54 Q36 56 40 56 Q51 55 55 38 Q58 24 50 17 Q42 11 32 18 Z" fill={g('apple')} stroke="#9C1C18" strokeWidth={2} strokeLinejoin="round" />
          <Ellipse cx={19} cy={27} rx={4} ry={7} fill="#FFFFFF" opacity={0.6} transform="rotate(20 19 27)" />
          {star(8, 8, 3.5)}
        </>
      );
      break;

    case 'mom':
    case 'dad':
    case 'sister':
    case 'brother': {
      const kid = name === 'sister' || name === 'brother';
      const girl = name === 'mom' || name === 'sister';
      const hair = name === 'mom' ? ['#B06A3A', '#6E3A18'] : name === 'dad' ? ['#5A4232', '#2E2018'] : name === 'sister' ? ['#F2A24A', '#B8641A'] : ['#3E3A5A', '#1F1C33'];
      const shirt = name === 'mom' ? ['#FF9ACB', '#E0468E'] : name === 'dad' ? ['#7FB6FF', '#2F66D6'] : name === 'sister' ? ['#C7A6FF', '#7C4BE0'] : ['#8EF0A8', '#26A55A'];
      const r = kid ? 13 : 14.5; // head radius: kids are a little rounder and smaller
      const cy = kid ? 27 : 25;
      defs = (
        <>
          {grad('skin', SKIN[0], SKIN[1])}
          {grad('hair', hair[0], hair[1])}
          {grad('shirt', shirt[0], shirt[1])}
        </>
      );
      art = (
        <>
          {shadow}
          {/* long hair behind the head */}
          {name === 'mom' ? <Path d={`M${32 - r - 3} ${cy} Q${32 - r - 4} ${cy + 22} ${32 - r + 2} ${cy + 24} H${32 + r - 2} Q${32 + r + 4} ${cy + 22} ${32 + r + 3} ${cy} Z`} fill={g('hair')} /> : null}
          {name === 'sister' ? (
            <>
              <Circle cx={32 - r - 2} cy={cy + 2} r={6} fill={g('hair')} stroke={hair[1]} strokeWidth={1.5} />
              <Circle cx={32 + r + 2} cy={cy + 2} r={6} fill={g('hair')} stroke={hair[1]} strokeWidth={1.5} />
            </>
          ) : null}
          {/* shoulders */}
          <Path d={`M12 58 Q12 ${cy + r + 5} 32 ${cy + r + 4} Q52 ${cy + r + 5} 52 58 Z`} fill={g('shirt')} stroke={shirt[1]} strokeWidth={2} strokeLinejoin="round" />
          <Path d={`M27 ${cy + r + 4} Q32 ${cy + r + 9} 37 ${cy + r + 4}`} fill={g('skin')} stroke={SKIN[2]} strokeWidth={1.4} />
          {/* head */}
          <Circle cx={32} cy={cy} r={r} fill={g('skin')} stroke={SKIN[2]} strokeWidth={2} />
          {/* hair cap */}
          <Path
            d={
              girl
                ? `M${32 - r - 1} ${cy + 1} Q${32 - r} ${cy - r - 3} 32 ${cy - r - 2} Q${32 + r} ${cy - r - 3} ${32 + r + 1} ${cy + 1} Q${32 + 4} ${cy - 8} ${32 - 6} ${cy - 5} Q${32 - r + 2} ${cy - 3} ${32 - r - 1} ${cy + 1} Z`
                : `M${32 - r} ${cy - 1} Q${32 - r} ${cy - r - 3} 32 ${cy - r - 2} Q${32 + r} ${cy - r - 3} ${32 + r} ${cy - 1} Q${32 + r - 3} ${cy - 7} ${32 + 2} ${cy - 7} Q${32 - r + 3} ${cy - 7} ${32 - r} ${cy - 1} Z`
            }
            fill={g('hair')}
            stroke={hair[1]}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          {name === 'sister' ? <Path d={sparkle(32 + r - 2, cy - r + 1, 4.5)} fill="#FF6FA8" /> : null}
          {name === 'brother' ? <Path d={`M${32 + 2} ${cy - r - 2} Q${32 + 5} ${cy - r - 8} ${32 + 9} ${cy - r - 5}`} stroke={hair[1]} strokeWidth={2.4} strokeLinecap="round" fill="none" /> : null}
          {/* face */}
          <Circle cx={32 - 5} cy={cy + 2} r={2} fill={INK} />
          <Circle cx={32 + 5} cy={cy + 2} r={2} fill={INK} />
          <Ellipse cx={32 - 9} cy={cy + 6} rx={2.6} ry={1.6} fill="#FF8FA8" opacity={0.7} />
          <Ellipse cx={32 + 9} cy={cy + 6} rx={2.6} ry={1.6} fill="#FF8FA8" opacity={0.7} />
          <Path d={`M${32 - 4} ${cy + 7} Q32 ${cy + 11} ${32 + 4} ${cy + 7}`} stroke="#B3263E" strokeWidth={2} strokeLinecap="round" fill="none" />
          {name === 'dad' ? <Path d={`M${32 - 8} ${cy - 2.5} L${32 - 3} ${cy - 3} M${32 + 3} ${cy - 3} L${32 + 8} ${cy - 2.5}`} stroke={hair[1]} strokeWidth={2.2} strokeLinecap="round" /> : null}
          {star(9, 10, 3.5)}
        </>
      );
      break;
    }

    case 'pause':
      defs = grad('disc', '#FFC27A', '#F07A1A');
      art = (
        <>
          {shadow}
          <Circle cx={32} cy={31} r={24} fill={g('disc')} stroke="#B8520E" strokeWidth={2} />
          <Rect x={22} y={19} width={7.5} height={24} rx={3} fill="#FFFFFF" />
          <Rect x={34.5} y={19} width={7.5} height={24} rx={3} fill="#FFFFFF" />
          <Path d="M16 22 A18 18 0 0 1 28 12" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />
          {star(56, 8, 3.5)}
        </>
      );
      break;

    case 'teddy':
      defs = (
        <>
          {grad('fur', '#E3A96A', '#A9672E')}
          {grad('snout', '#FFE6C7', '#F2C38E')}
        </>
      );
      art = (
        <>
          {shadow}
          <Circle cx={17} cy={13} r={7} fill={g('fur')} stroke="#6E3E14" strokeWidth={2} />
          <Circle cx={47} cy={13} r={7} fill={g('fur')} stroke="#6E3E14" strokeWidth={2} />
          <Circle cx={17} cy={13} r={3.4} fill="#F2C38E" />
          <Circle cx={47} cy={13} r={3.4} fill="#F2C38E" />
          <Ellipse cx={32} cy={47} rx={16} ry={11} fill={g('fur')} stroke="#6E3E14" strokeWidth={2} />
          <Ellipse cx={32} cy={48} rx={8} ry={6} fill={g('snout')} />
          <Circle cx={32} cy={27} r={17} fill={g('fur')} stroke="#6E3E14" strokeWidth={2} />
          <Ellipse cx={32} cy={33} rx={8} ry={6} fill={g('snout')} stroke="#C9884A" strokeWidth={1.2} />
          <Ellipse cx={32} cy={30.5} rx={3} ry={2.2} fill="#3A2210" />
          <Path d="M29 35 Q32 37.5 35 35" stroke="#3A2210" strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Circle cx={25} cy={24} r={2.2} fill="#3A2210" />
          <Circle cx={39} cy={24} r={2.2} fill="#3A2210" />
          {/* bow tie */}
          <Path d="M32 44 L24 40 V48 Z M32 44 L40 40 V48 Z" fill="#FF6FA8" stroke="#B22C68" strokeWidth={1.4} strokeLinejoin="round" />
          <Circle cx={32} cy={44} r={2.2} fill="#FF6FA8" stroke="#B22C68" strokeWidth={1.2} />
          <Ellipse cx={24} cy={17} rx={4} ry={2.2} fill="#FFFFFF" opacity={0.45} transform="rotate(-25 24 17)" />
          {star(56, 30, 3.5)}
        </>
      );
      break;

    case 'again':
      defs = grad('arrow', '#8EF0A8', '#1F9E55');
      art = (
        <>
          {shadow}
          <Path d="M50 30 A18 18 0 1 1 42 15" stroke="#146B39" strokeWidth={12} strokeLinecap="round" fill="none" />
          <Path d="M50 30 A18 18 0 1 1 42 15" stroke={g('arrow')} strokeWidth={8} strokeLinecap="round" fill="none" />
          <Path d="M36 5 L54 11 L42 25 Z" fill={g('arrow')} stroke="#146B39" strokeWidth={2} strokeLinejoin="round" />
          <Path d="M20 22 A14 14 0 0 1 30 15" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.7} />
          {star(8, 8, 3.5)}
        </>
      );
      break;

    case 'finished':
      defs = grad('pole', '#E6ECFA', '#8E9BC8');
      art = (
        <>
          {shadow}
          <Rect x={12} y={5} width={5} height={52} rx={2.5} fill={g('pole')} stroke="#4A5A96" strokeWidth={1.6} />
          <Circle cx={14.5} cy={5} r={3.6} fill="#FFD84D" stroke="#C99A0A" strokeWidth={1.2} />
          <Path d="M17 9 Q30 5 40 10 Q50 15 58 10 V36 Q50 41 40 36 Q30 31 17 35 Z" fill="#FFFFFF" stroke="#27325F" strokeWidth={2} strokeLinejoin="round" />
          {/* checks */}
          <Path d="M17 9 Q21.5 7.7 26 7.6 V16.2 Q21.5 16.3 17 17.6 Z M26 16.2 Q30.5 16 35 17.5 V26 Q30.5 24.6 26 24.8 Z M35 8.5 Q38 9 40 10 Q42 11 44 11.8 V20.3 Q40 18.6 35 17.5 Z M44 20.3 Q48 22 53 21.2 V29.7 Q48 30.5 44 28.8 Z M53 12.3 Q55.7 11.6 58 10 V18.5 Q55.7 20.1 53 21.2 Z M17 26 Q21.5 24.7 26 24.8 V33.2 Q21.5 33.4 17 34.6 Z M35 26 Q38 27 40 28 Q42 29 44 28.8 V37.2 Q40 36 35 34.5 Z" fill="#27325F" />
          {star(54, 48, 4.5)}
          {star(44, 54, 2.8, '#FFFFFF')}
        </>
      );
      break;

    case 'more':
    case 'yes':
    case 'no': {
      const c = name === 'more' ? ['#C7A6FF', '#7C4BE0', '#4F2BA6'] : name === 'yes' ? ['#8EF0A8', '#26A55A', '#146B39'] : ['#FF9A8A', '#E0402E', '#9C2216'];
      defs = grad('disc', c[0], c[1]);
      art = (
        <>
          {shadow}
          <Circle cx={32} cy={31} r={24} fill={g('disc')} stroke={c[2]} strokeWidth={2} />
          {name === 'more' ? (
            <Path d="M32 18 V44 M19 31 H45" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
          ) : name === 'yes' ? (
            <Path d="M20 32 L28.5 40.5 L45 23" stroke="#FFFFFF" strokeWidth={7.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : (
            <Path d="M22 21 L42 41 M42 21 L22 41" stroke="#FFFFFF" strokeWidth={7.5} strokeLinecap="round" />
          )}
          <Path d="M16 22 A18 18 0 0 1 28 12" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />
          {star(56, 8, 3.5)}
        </>
      );
      break;
    }

    case 'iwant':
      defs = grad('hand', SKIN[0], SKIN[1]);
      art = (
        <>
          {shadow}
          {/* a hand pointing at a star */}
          <Path
            d="M6 30 Q6 24 12 24 H38 Q42 24 42 28 Q42 32 38 32 H30 Q33 33 33 37 Q33 40 30 40.5 Q32 42 31 45 Q30 47.5 27 47.5 Q28 50 26.5 52 Q25 54 22 54 H14 Q6 54 6 46 Z"
            fill={g('hand')}
            stroke={SKIN[2]}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Path d="M20 32 H30 M20 40.5 H30 M18 47.5 H27" stroke={SKIN[2]} strokeWidth={1.6} strokeLinecap="round" />
          <Rect x={11} y={27} width={14} height={2.6} rx={1.3} fill="#FFFFFF" opacity={0.6} />
          <Path d="M53 16 L55.9 23 L63 23.5 L57.5 28 L59.4 35 L53 31 L46.6 35 L48.5 28 L43 23.5 L50.1 23 Z" fill="#FFD84D" stroke="#C99A0A" strokeWidth={1.6} strokeLinejoin="round" />
          {star(46, 8, 3, '#FFFFFF')}
        </>
      );
      break;

    case 'happy':
    case 'sad':
    case 'angry':
    case 'hurt': {
      const c =
        name === 'happy' ? ['#FFE27A', '#F5B41C', '#C98A00'] : name === 'sad' ? ['#9CC8FF', '#4A86E8', '#1F4FA8'] : name === 'angry' ? ['#FF9A8A', '#E0402E', '#9C2216'] : ['#FFE27A', '#F5B41C', '#C98A00'];
      defs = grad('face', c[0], c[1]);
      art = (
        <>
          {shadow}
          <Circle cx={32} cy={32} r={24} fill={g('face')} stroke={c[2]} strokeWidth={2} />
          <Ellipse cx={24} cy={28} rx={3.2} ry={4.2} fill={INK} />
          <Ellipse cx={40} cy={28} rx={3.2} ry={4.2} fill={INK} />
          <Circle cx={25.1} cy={26.5} r={1.2} fill="#FFFFFF" />
          <Circle cx={41.1} cy={26.5} r={1.2} fill="#FFFFFF" />
          {name === 'happy' ? <Path d="M21 38 Q32 50 43 38" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" /> : null}
          {name === 'sad' ? (
            <>
              <Path d="M23 45 Q32 37 41 45" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
              <Path d="M42 33 Q45 38 45 40 A3 3 0 0 1 39 40 Q39 38 42 33 Z" fill="#DFF3FF" stroke="#1F4FA8" strokeWidth={1.2} />
            </>
          ) : null}
          {name === 'angry' ? (
            <>
              <Path d="M18 20 L28 24 M46 20 L36 24" stroke={INK} strokeWidth={3} strokeLinecap="round" />
              <Path d="M23 44 Q32 38 41 44" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
            </>
          ) : null}
          {name === 'hurt' ? (
            <>
              <Path d="M24 44 Q28 41 32 44 Q36 47 40 44" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
              <G transform="rotate(-35 46 16)">
                <Rect x={36} y={12} width={20} height={9} rx={4.5} fill="#FFD6B0" stroke="#C47A4E" strokeWidth={1.4} />
                <Rect x={42} y={12} width={8} height={9} fill="#F2B48A" />
              </G>
            </>
          ) : null}
          {name === 'happy' ? (
            <>
              <Ellipse cx={17} cy={37} rx={4} ry={2.6} fill="#FF8FA8" opacity={0.7} />
              <Ellipse cx={47} cy={37} rx={4} ry={2.6} fill="#FF8FA8" opacity={0.7} />
            </>
          ) : null}
          <Ellipse cx={22} cy={16} rx={7} ry={3.5} fill="#FFFFFF" opacity={0.5} transform="rotate(-25 22 16)" />
        </>
      );
      break;
    }
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" {...SVG_DECORATIVE} pointerEvents="none">
      <Defs>{defs}</Defs>
      {art}
    </Svg>
  );
}
