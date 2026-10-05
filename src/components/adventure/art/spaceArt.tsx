import React from 'react';
import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Gloss, Pencil, Sparkle, type Drawn, type Fill, type Grad } from './kit';

/**
 * The SPACE EXPLORER icon set: the same destinations as the classic icons, drawn as friendly space
 * objects (a robot, a rocket, a satellite, an academy planet) so the whole app reads as one adventure.
 *
 * Same rules as every TalkEasy drawing: 64-unit grid, light from the top-left, outlines in a darker shade
 * of the object's own hue, one gloss per main shape, a sparkle as the accent. Each keeps the PURPOSE
 * recognisable: speech has sound waves, tracing has a pencil, lessons have a mortarboard.
 *
 * Keyed by `GameIconName`. A name with no entry here keeps its classic drawing (the Talk vocabulary
 * cards, for instance, stay as they are: a child must recognise "water" at a glance).
 * A future theme supplies its own set the same way and `GameIcon` picks it by `useIconSet`.
 */
export const SPACE_ICON_NAMES = [
  'speech', 'practice', 'trace', 'talk', 'words', 'play', 'controller', 'activities', 'lessons', 'mission',
  'myday', 'school', 'feelings', 'home',
] as const;
export type SpaceIconName = (typeof SPACE_ICON_NAMES)[number];

const FONT = 'Nunito_900Black';

function Star({ cx, cy, r, color = '#FFE066' }: { cx: number; cy: number; r: number; color?: string }) {
  return <Sparkle cx={cx} cy={cy} r={r} color={color} />;
}

/** A small ringed planet, reused as an accent. */
function Planet({ cx, cy, r, fill, ink, ring }: { cx: number; cy: number; r: number; fill: string; ink: string; ring: string }) {
  return (
    <G>
      <Ellipse cx={cx} cy={cy} rx={r * 1.7} ry={r * 0.5} fill="none" stroke={ring} strokeWidth={2.2} transform={`rotate(-20 ${cx} ${cy})`} />
      <Circle cx={cx} cy={cy} r={r} fill={fill} stroke={ink} strokeWidth={1.8} />
      <Path d={`M${cx - r * 0.8} ${cy + r * 0.2} Q${cx} ${cy + r * 0.7} ${cx + r * 0.8} ${cy + r * 0.2}`} stroke={ring} strokeWidth={1.6} fill="none" transform={`rotate(-20 ${cx} ${cy})`} />
    </G>
  );
}

export function drawSpace(name: SpaceIconName, grad: Grad, g: Fill): Drawn {
  switch (name) {
    // ---- Speech: a friendly robot with sound waves ----------------------------------------------------
    case 'speech':
      return {
        defs: (
          <>
            {grad('head', '#BFEBFF', '#4FA8F0')}
            {grad('body', '#8FB4FF', '#3D63D6')}
            {grad('visor', '#27325F', '#12183F')}
          </>
        ),
        art: (
          <>
            <Path d="M9 22 Q3 30 9 38" stroke="#FFD84D" strokeWidth={3.4} strokeLinecap="round" fill="none" />
            <Path d="M4 17 Q-3 30 4 43" stroke="#FF8FC0" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} />
            <Path d="M55 22 Q61 30 55 38" stroke="#FFD84D" strokeWidth={3.4} strokeLinecap="round" fill="none" />
            <Path d="M60 17 Q67 30 60 43" stroke="#FF8FC0" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} />
            <Path d="M32 11 V5" stroke="#3D63D6" strokeWidth={2.6} strokeLinecap="round" />
            <Circle cx={32} cy={4.5} r={3.2} fill="#FFE066" stroke="#B97809" strokeWidth={1.4} />
            <Path d="M14 56 Q14 45 24 45 H40 Q50 45 50 56 Z" fill={g('body')} stroke="#1F3A9E" strokeWidth={2} strokeLinejoin="round" />
            <Circle cx={32} cy={51} r={2.6} fill="#FFE066" />
            <Rect x={14} y={11} width={36} height={32} rx={12} fill={g('head')} stroke="#1F6FB8" strokeWidth={2} />
            <Rect x={8} y={21} width={6} height={12} rx={3} fill="#4FA8F0" stroke="#1F6FB8" strokeWidth={1.6} />
            <Rect x={50} y={21} width={6} height={12} rx={3} fill="#4FA8F0" stroke="#1F6FB8" strokeWidth={1.6} />
            <Rect x={19} y={18} width={26} height={19} rx={8} fill={g('visor')} />
            <Ellipse cx={26} cy={26} rx={2.6} ry={3.4} fill="#7CF0FF" />
            <Ellipse cx={38} cy={26} rx={2.6} ry={3.4} fill="#7CF0FF" />
            <Path d="M27 32 Q32 36 37 32" stroke="#7CF0FF" strokeWidth={2} strokeLinecap="round" fill="none" />
            <Gloss cx={22} cy={14.5} rx={5} ry={1.8} rotate={-20} opacity={0.85} />
          </>
        ),
      };

    // ---- Listen & Talk: a satellite broadcasting sound ------------------------------------------------
    case 'practice':
      return {
        defs: (
          <>
            {grad('body', '#E4ECFF', '#8AA2E6')}
            {grad('panel', '#58C4FF', '#1B6FD0')}
            {grad('dish', '#FFE680', '#F4A51C')}
          </>
        ),
        art: (
          <>
            <Path d="M46 10 Q56 18 54 30" stroke="#FFD84D" strokeWidth={3.2} strokeLinecap="round" fill="none" />
            <Path d="M50 4 Q64 14 62 34" stroke="#FF8FC0" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} />
            <G transform="rotate(-30 32 32)">
              <Rect x={2} y={25} width={17} height={14} rx={2} fill={g('panel')} stroke="#12409A" strokeWidth={1.8} />
              <Path d="M8 25 V39 M13 25 V39" stroke="#BFE6FF" strokeWidth={1.2} />
              <Rect x={45} y={25} width={17} height={14} rx={2} fill={g('panel')} stroke="#12409A" strokeWidth={1.8} />
              <Path d="M51 25 V39 M56 25 V39" stroke="#BFE6FF" strokeWidth={1.2} />
              <Rect x={19} y={30} width={26} height={4} fill="#8AA2E6" />
              <Rect x={22} y={21} width={20} height={22} rx={6} fill={g('body')} stroke="#4A63B8" strokeWidth={2} />
              <Circle cx={32} cy={32} r={5} fill="#27325F" />
              <Circle cx={32} cy={32} r={2.4} fill="#7CF0FF" />
            </G>
            <Path d="M26 44 Q22 56 36 54" stroke="#8AA2E6" strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Ellipse cx={38} cy={52} rx={9} ry={4} fill={g('dish')} stroke="#B97809" strokeWidth={1.8} transform="rotate(-25 38 52)" />
            <Star cx={8} cy={12} r={4} />
            <Star cx={14} cy={52} r={3} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Learn & Trace: a rocket with a pencil ------------------------------------------------------------
    case 'trace':
      return {
        defs: (
          <>
            {grad('hull', '#FFFFFF', '#C8D4F5')}
            {grad('fin', '#FF9A88', '#E4452E')}
            {grad('win', '#8BF0FF', '#1D8FE0')}
          </>
        ),
        art: (
          <>
            <Path d="M10 52 Q26 50 20 36" stroke="#FFD84D" strokeWidth={2.6} strokeLinecap="round" strokeDasharray="0.1 5" fill="none" />
            <G transform="rotate(32 36 30)">
              <Path d="M36 4 Q50 16 48 36 H24 Q22 16 36 4 Z" fill={g('hull')} stroke="#6F86CF" strokeWidth={2} strokeLinejoin="round" />
              <Path d="M24 36 L16 48 L26 44 Z M48 36 L56 48 L46 44 Z" fill={g('fin')} stroke="#9E2616" strokeWidth={1.8} strokeLinejoin="round" />
              <Path d="M36 4 Q42 9 44 15 H28 Q30 9 36 4 Z" fill={g('fin')} />
              <Circle cx={36} cy={24} r={5.2} fill={g('win')} stroke="#12409A" strokeWidth={1.8} />
              <Path d="M28 36 Q36 54 44 36 Z" fill="#FFB347" stroke="#C0561C" strokeWidth={1.6} strokeLinejoin="round" />
            </G>
            <Pencil x={10} y={14} len={22} angle={-52} />
            <Star cx={55} cy={9} r={4.5} />
            <Star cx={8} cy={40} r={3} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Talk: an astronaut speaking into a communicator -------------------------------------------------
    case 'talk':
      return {
        defs: (
          <>
            {grad('suit', '#FFFFFF', '#CBD6F5')}
            {grad('glass', '#1F2C6B', '#0E1445')}
            {grad('comm', '#FF9DBB', '#E23A6E')}
          </>
        ),
        art: (
          <>
            <Path d="M52 8 Q58 14 52 20" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Path d="M57 4 Q65 14 57 24" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75} />
            <Path d="M10 57 Q10 42 32 42 Q54 42 54 57 Z" fill={g('suit')} stroke="#6F86CF" strokeWidth={2} strokeLinejoin="round" />
            <Rect x={26} y={47} width={12} height={7} rx={2} fill="#4D9BE8" stroke="#1B4AA0" strokeWidth={1.4} />
            <Circle cx={32} cy={24} r={19} fill={g('suit')} stroke="#6F86CF" strokeWidth={2} />
            <Rect x={17} y={14} width={30} height={22} rx={11} fill={g('glass')} stroke="#4A63B8" strokeWidth={2} />
            <Ellipse cx={27} cy={25} rx={2.4} ry={3.2} fill="#7CF0FF" />
            <Ellipse cx={37} cy={25} rx={2.4} ry={3.2} fill="#7CF0FF" />
            <Path d="M28 30 Q32 33 36 30" stroke="#7CF0FF" strokeWidth={1.8} strokeLinecap="round" fill="none" />
            <Path d="M22 17 Q28 14 33 16" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.65} />
            <Rect x={46} y={20} width={10} height={20} rx={4} fill={g('comm')} stroke="#9E1F4F" strokeWidth={1.8} transform="rotate(14 51 30)" />
            <Circle cx={51} cy={25} r={1.8} fill="#FFFFFF" transform="rotate(14 51 30)" />
            <Star cx={8} cy={10} r={4} />
          </>
        ),
      };

    // ---- My Words: a cosmic journal with floating letters ----------------------------------------------------
    case 'words':
      return {
        defs: (
          <>
            {grad('cover', '#C7A8FF', '#6A3FD0')}
            {grad('page', '#FFFFFF', '#DCE4FF')}
          </>
        ),
        art: (
          <>
            <Rect x={10} y={16} width={36} height={42} rx={5} fill="#4A248F" />
            <Rect x={13} y={12} width={36} height={42} rx={5} fill={g('page')} stroke="#7F9BE0" strokeWidth={1.8} />
            <Rect x={9} y={12} width={8} height={42} rx={3} fill={g('cover')} stroke="#4A248F" strokeWidth={1.8} />
            <Path d="M23 40 H42 M23 46 H36" stroke="#9FB2EA" strokeWidth={2.4} strokeLinecap="round" />
            <Circle cx={36} cy={27} r={7.5} fill="#FFE680" stroke="#B97809" strokeWidth={1.6} />
            <Ellipse cx={36} cy={27} rx={12} ry={3.2} fill="none" stroke="#FF8FC0" strokeWidth={1.8} transform="rotate(-18 36 27)" />
            <SvgText x={52} y={14} fontSize={13} fontFamily={FONT} fontWeight="900" fill="#FF6B8A" textAnchor="middle">A</SvgText>
            <SvgText x={57} y={34} fontSize={11} fontFamily={FONT} fontWeight="900" fill="#7BE3A0" textAnchor="middle">b</SvgText>
            <SvgText x={7} y={8} fontSize={11} fontFamily={FONT} fontWeight="900" fill="#FFD84D" textAnchor="middle">c</SvgText>
            <Star cx={55} cy={50} r={4} />
          </>
        ),
      };

    // ---- Play & Learn / Games: a game controller from the stars ---------------------------------------------------
    case 'play':
    case 'controller':
      return {
        defs: (
          <>
            {grad('pad', '#FF9A88', '#D8452E')}
            {grad('orb', '#FFE680', '#F4A51C')}
          </>
        ),
        art: (
          <>
            <Path d="M14 22 Q6 22 4 36 Q2 52 12 52 Q18 52 22 44 H42 Q46 52 52 52 Q62 52 60 36 Q58 22 50 22 Z" fill={g('pad')} stroke="#8A1F12" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M17 29 V41 M11 35 H23" stroke="#FFFFFF" strokeWidth={4.2} strokeLinecap="round" />
            <Circle cx={47} cy={30} r={3.6} fill="#7CF0FF" stroke="#12409A" strokeWidth={1.4} />
            <Circle cx={40} cy={36} r={3.6} fill="#7BE3A0" stroke="#136237" strokeWidth={1.4} />
            <Circle cx={51} cy={39} r={3.6} fill="#FFE066" stroke="#B97809" strokeWidth={1.4} />
            <Planet cx={32} cy={12} r={5.4} fill="#C7A8FF" ink="#4A248F" ring="#FFE066" />
            <Gloss cx={16} cy={27} rx={6} ry={2} rotate={-20} opacity={0.6} />
            <Star cx={57} cy={14} r={4.2} />
            <Star cx={7} cy={14} r={3} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Activities: a ringed planet with a moon at play -----------------------------------------------------------
    case 'activities':
      return {
        defs: (
          <>
            {grad('p', '#FFC27A', '#E8672B')}
            {grad('m', '#FFFFFF', '#C8D4F5')}
          </>
        ),
        art: (
          <>
            <Circle cx={30} cy={34} r={19} fill={g('p')} stroke="#8A3A0E" strokeWidth={2} />
            <Path d="M14 28 Q30 22 46 30 M13 38 Q30 32 47 40" stroke="#FFD9A8" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.7} />
            <Ellipse cx={30} cy={36} rx={30} ry={8} fill="none" stroke="#FFE066" strokeWidth={3} transform="rotate(-18 30 36)" />
            <Circle cx={52} cy={14} r={6.5} fill={g('m')} stroke="#6F86CF" strokeWidth={1.8} />
            <Circle cx={50} cy={13} r={1.4} fill="#B7C3EA" />
            <Gloss cx={21} cy={26} rx={6} ry={2.2} rotate={-35} opacity={0.7} />
            <Star cx={9} cy={12} r={4.2} />
          </>
        ),
      };

    // ---- Lessons: a space academy — a planet in a mortarboard -------------------------------------------------------
    case 'lessons':
      return {
        defs: (
          <>
            {grad('p', '#8CF0A8', '#1F9E55')}
            {grad('cap', '#4A5A98', '#27325F')}
          </>
        ),
        art: (
          <>
            <Circle cx={32} cy={38} r={19} fill={g('p')} stroke="#136237" strokeWidth={2} />
            <Path d="M17 34 Q26 28 32 36 Q40 42 47 34" stroke="#C8FFD8" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.75} />
            <Ellipse cx={32} cy={42} rx={24} ry={5} fill="none" stroke="#FFE066" strokeWidth={2.4} transform="rotate(14 32 42)" />
            <Path d="M32 10 L56 20 L32 30 L8 20 Z" fill={g('cap')} stroke="#12183F" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M18 25 V32 Q32 40 46 32 V25 L32 31 Z" fill="#27325F" stroke="#12183F" strokeWidth={1.6} strokeLinejoin="round" />
            <Path d="M56 20 V32" stroke="#FFD84D" strokeWidth={2} strokeLinecap="round" />
            <Circle cx={56} cy={34} r={2.4} fill="#FFD84D" />
            <Gloss cx={22} cy={30} rx={5} ry={2} rotate={-30} opacity={0.6} />
            <Star cx={8} cy={8} r={4} />
          </>
        ),
      };

    // ---- Mission (Start Adventure): a flag planted on the moon -----------------------------------------------------
    case 'mission':
      return {
        defs: (
          <>
            {grad('moon', '#F2F5FF', '#AEB9E0')}
            {grad('flag', '#FF9A88', '#E4452E')}
          </>
        ),
        art: (
          <>
            <Ellipse cx={32} cy={54} rx={27} ry={9} fill={g('moon')} stroke="#6F86CF" strokeWidth={2} />
            <Ellipse cx={20} cy={54} rx={4.5} ry={1.8} fill="#9FB0DA" />
            <Ellipse cx={42} cy={56} rx={3.4} ry={1.4} fill="#9FB0DA" />
            <Path d="M30 50 V8" stroke="#8AA2E6" strokeWidth={3} strokeLinecap="round" />
            <Path d="M30 9 H52 L46 17 L52 25 H30 Z" fill={g('flag')} stroke="#9E2616" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d={`M38 12 l1.4 3 3.2 .4 -2.4 2.2 .7 3.2 -2.9 -1.7 -2.9 1.7 .7 -3.2 -2.4 -2.2 3.2 -.4 Z`} fill="#FFE066" transform="translate(-1 0) scale(0.95)" />
            <Circle cx={30} cy={7} r={2.6} fill="#FFE066" stroke="#B97809" strokeWidth={1.2} />
            <Star cx={55} cy={36} r={3.4} color="#8BF0FF" />
            <Star cx={9} cy={24} r={3.4} />
          </>
        ),
      };

    // ---- My Day: a clock among the stars ----------------------------------------------------------------------------
    case 'myday':
      return {
        defs: (
          <>
            {grad('rim', '#8FB4FF', '#3D63D6')}
            {grad('face', '#FFFFFF', '#DCE4FF')}
          </>
        ),
        art: (
          <>
            <Circle cx={32} cy={33} r={24} fill={g('rim')} stroke="#1F3A9E" strokeWidth={2} />
            <Circle cx={32} cy={33} r={18.5} fill={g('face')} stroke="#6F86CF" strokeWidth={1.6} />
            <Path d="M32 18 V21 M47 33 H44 M32 48 V45 M17 33 H20" stroke="#3D63D6" strokeWidth={2.4} strokeLinecap="round" />
            <Path d="M32 33 V23" stroke="#27325F" strokeWidth={3.2} strokeLinecap="round" />
            <Path d="M32 33 L40 38" stroke="#E4452E" strokeWidth={3.2} strokeLinecap="round" />
            <Circle cx={32} cy={33} r={2.4} fill="#27325F" />
            <Circle cx={52} cy={12} r={6} fill="#FFE680" stroke="#B97809" strokeWidth={1.6} />
            <Path d="M52 4 V2 M60 12 H62 M44 12 H42" stroke="#FFD84D" strokeWidth={2} strokeLinecap="round" />
            <Gloss cx={22} cy={22} rx={5} ry={2} rotate={-40} opacity={0.7} />
            <Star cx={8} cy={10} r={4} />
          </>
        ),
      };

    // ---- School: an observatory with a telescope -----------------------------------------------------------------------
    case 'school':
      return {
        defs: (
          <>
            {grad('wall', '#FFB27A', '#E8672B')}
            {grad('dome', '#BFD0FF', '#5B7FE0')}
          </>
        ),
        art: (
          <>
            <Rect x={9} y={32} width={46} height={24} rx={3} fill={g('wall')} stroke="#8A3A0E" strokeWidth={2} />
            <Path d="M14 32 Q14 14 32 14 Q50 14 50 32 Z" fill={g('dome')} stroke="#1F3A9E" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M30 14 L32 32 M32 14 L44 32" stroke="#27325F" strokeWidth={1.6} opacity={0.35} />
            <Rect x={37} y={5} width={7} height={17} rx={2.5} fill="#E4ECFF" stroke="#6F86CF" strokeWidth={1.6} transform="rotate(35 40 14)" />
            <Rect x={27} y={42} width={10} height={14} rx={3} fill="#FFE066" stroke="#B97809" strokeWidth={1.6} />
            <Rect x={13} y={38} width={8} height={8} rx={2} fill="#FFFFFF" stroke="#8A3A0E" strokeWidth={1.4} />
            <Rect x={43} y={38} width={8} height={8} rx={2} fill="#FFFFFF" stroke="#8A3A0E" strokeWidth={1.4} />
            <Gloss cx={23} cy={22} rx={5} ry={2} rotate={-45} opacity={0.7} />
            <Star cx={55} cy={9} r={4} />
          </>
        ),
      };

    // ---- Feelings: a friendly planet with a face ---------------------------------------------------------------------------
    case 'feelings':
      return {
        defs: <>{grad('p', '#FFC2E0', '#E2439A')}</>,
        art: (
          <>
            <Ellipse cx={32} cy={34} rx={29} ry={7} fill="none" stroke="#FFE066" strokeWidth={2.6} transform="rotate(-16 32 34)" />
            <Circle cx={32} cy={32} r={21} fill={g('p')} stroke="#8A1A4A" strokeWidth={2} />
            <Ellipse cx={25} cy={29} rx={2.6} ry={3.4} fill="#27325F" />
            <Ellipse cx={39} cy={29} rx={2.6} ry={3.4} fill="#27325F" />
            <Path d="M24 38 Q32 46 40 38" stroke="#27325F" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Ellipse cx={20} cy={36} rx={3.2} ry={2} fill="#FF7BB8" opacity={0.8} />
            <Ellipse cx={44} cy={36} rx={3.2} ry={2} fill="#FF7BB8" opacity={0.8} />
            <Path d="M10 40 Q32 54 54 40" stroke="#FFE066" strokeWidth={2.6} strokeLinecap="round" fill="none" transform="rotate(-16 32 34)" />
            <Gloss cx={21} cy={20} rx={6} ry={2.2} rotate={-35} opacity={0.7} />
            <Star cx={55} cy={10} r={4} />
          </>
        ),
      };

    // ---- Home: a space-station pod ------------------------------------------------------------------------------------------------
    case 'home':
      return {
        defs: (
          <>
            {grad('pod', '#FFFFFF', '#C8D4F5')}
            {grad('roof', '#8FB4FF', '#3D63D6')}
          </>
        ),
        art: (
          <>
            <Path d="M32 6 V13" stroke="#8AA2E6" strokeWidth={2.4} strokeLinecap="round" />
            <Circle cx={32} cy={5} r={2.8} fill="#FFE066" stroke="#B97809" strokeWidth={1.2} />
            <Path d="M8 56 V30 Q8 14 32 14 Q56 14 56 30 V56 Z" fill={g('pod')} stroke="#6F86CF" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M8 30 Q8 14 32 14 Q56 14 56 30 Z" fill={g('roof')} stroke="#1F3A9E" strokeWidth={2} strokeLinejoin="round" />
            <Rect x={25} y={38} width={14} height={18} rx={7} fill="#27325F" />
            <Circle cx={32} cy={34} r={5} fill="#7CF0FF" stroke="#12409A" strokeWidth={1.6} />
            <Rect x={13} y={40} width={8} height={8} rx={4} fill="#7CF0FF" stroke="#12409A" strokeWidth={1.4} />
            <Rect x={43} y={40} width={8} height={8} rx={4} fill="#7CF0FF" stroke="#12409A" strokeWidth={1.4} />
            <Gloss cx={20} cy={22} rx={6} ry={2.2} rotate={-30} opacity={0.7} />
          </>
        ),
      };
  }
}
