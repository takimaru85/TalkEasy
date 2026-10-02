import React from 'react';
import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Gloss, Sparkle, starPath, type Drawn, type Fill, type Grad } from './kit';
import { Bead, HEART_PATH } from './colorKit';

/** The seven school subjects TalkEasy ships. A grown-up's own subjects keep the icon they chose. */
export type SubjectArtName = 'english' | 'filipino' | 'math' | 'science' | 'social' | 'values' | 'mapeh';

const FONT = 'Nunito_900Black';

function Letter({ x, y, size, ch }: { x: number; y: number; size: number; ch: string }) {
  return (
    <SvgText x={x} y={y} fontSize={size} fontFamily={FONT} fontWeight="900" fill="#FFFFFF" textAnchor="middle">
      {ch}
    </SvgText>
  );
}

function House({ x, y, w, h, wall, wallInk, roof, roofInk, door }: { x: number; y: number; w: number; h: number; wall: string; wallInk: string; roof: string; roofInk: string; door: string }) {
  const rh = h * 0.5;
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} rx={1.5} fill={wall} stroke={wallInk} strokeWidth={1.8} />
      <Path d={`M${x - 2.5} ${y + 0.5} L${x + w / 2} ${y - rh} L${x + w + 2.5} ${y + 0.5} Z`} fill={roof} stroke={roofInk} strokeWidth={1.8} strokeLinejoin="round" />
      <Rect x={x + w / 2 - 2.6} y={y + h - h * 0.45} width={5.2} height={h * 0.45} rx={1.4} fill={door} />
      <Rect x={x + 2.2} y={y + 3.2} width={3.6} height={3.6} rx={0.8} fill="#FFFFFF" opacity={0.85} />
    </G>
  );
}

export function drawSubject(name: SubjectArtName, grad: Grad, g: Fill): Drawn {
  switch (name) {
    // ---- English: three lettered blocks ------------------------------------------------------------
    case 'english':
      return {
        defs: (
          <>
            {grad('r', '#FF9A88', '#E4452E')}
            {grad('y', '#FFE680', '#F4A51C')}
            {grad('b', '#86C3FF', '#2A6FD6')}
          </>
        ),
        art: (
          <>
            <Rect x={4} y={34} width={26} height={24} rx={4} fill={g('r')} stroke="#9E2616" strokeWidth={2} />
            <Rect x={34} y={34} width={26} height={24} rx={4} fill={g('y')} stroke="#B97809" strokeWidth={2} />
            <Rect x={18} y={7} width={26} height={25} rx={4} fill={g('b')} stroke="#1B4AA0" strokeWidth={2} transform="rotate(-6 31 20)" />
            <Letter x={17} y={52} size={19} ch="A" />
            <Letter x={47} y={52} size={19} ch="B" />
            <Letter x={30.5} y={26} size={19} ch="C" />
            <Gloss cx={11} cy={38.5} rx={4.2} ry={1.5} rotate={0} opacity={0.6} />
            <Gloss cx={41} cy={38.5} rx={4.2} ry={1.5} rotate={0} opacity={0.6} />
            <Sparkle cx={55} cy={14} r={4.5} />
          </>
        ),
      };

    // ---- Filipino: a flag on a pole ------------------------------------------------------------------
    case 'filipino':
      return {
        defs: (
          <>
            {grad('pole', '#F4F7FF', '#AEB9D4')}
          </>
        ),
        art: (
          <>
            <Path d="M14 10 Q26 5 36 10 T59 10 V37 Q47 42 36 37 T14 37 Z" fill="#1F4FB8" stroke="#16337A" strokeWidth={3.6} strokeLinejoin="round" />
            <Path d="M14 10 Q26 5 36 10 T59 10 V37 Q47 42 36 37 T14 37 Z" fill="#2F6FE0" />
            <Path d="M14 23.5 Q26 18.5 36 23.5 T59 23.5 V37 Q47 42 36 37 T14 37 Z" fill="#E4453A" />
            <Path d="M14 10 L14 37 L35 23.5 Z" fill="#FFFFFF" />
            <Path d={starPath(21, 23.5, 3.6, 1.5)} fill="#FFD84D" stroke="#C9961A" strokeWidth={0.8} strokeLinejoin="round" />
            <Rect x={9.6} y={5} width={4.4} height={52} rx={2.2} fill={g('pole')} stroke="#7D8FB0" strokeWidth={1.6} />
            <Circle cx={11.8} cy={5.4} r={3} fill="#FFD84D" stroke="#C9961A" strokeWidth={1.4} />
            <Gloss cx={42} cy={14} rx={7} ry={1.8} rotate={-4} opacity={0.3} />
            <Sparkle cx={53} cy={50} r={4} />
          </>
        ),
      };

    // ---- Mathematics: an abacus --------------------------------------------------------------------
    case 'math':
      return {
        defs: <>{grad('wood', '#E8B87E', '#B97A3A')}</>,
        art: (
          <>
            <Rect x={5} y={8} width={54} height={46} rx={6} fill={g('wood')} stroke="#7A4A1E" strokeWidth={2} />
            <Rect x={10} y={13} width={44} height={36} rx={3} fill="#FFF3D6" stroke="#B9772E" strokeWidth={1.4} />
            {[22, 31, 40].map((y) => (
              <Path key={y} d={`M10 ${y} H54`} stroke="#8A5622" strokeWidth={1.6} />
            ))}
            {[
              [16, 22, '#FF7B8A', '#B5273A'], [23.5, 22, '#FF7B8A', '#B5273A'], [31, 22, '#FF7B8A', '#B5273A'], [47, 22, '#5BAEFF', '#1F5FB8'],
              [16, 31, '#FFD84D', '#C9961A'], [23.5, 31, '#FFD84D', '#C9961A'], [41, 31, '#5BD98A', '#1F8A4B'], [48.5, 31, '#5BD98A', '#1F8A4B'],
              [16, 40, '#B694FF', '#5B3BC0'], [38, 40, '#FF9C5B', '#C25A1A'], [45.5, 40, '#FF9C5B', '#C25A1A'], [53, 40, '#FF9C5B', '#C25A1A'],
            ].map(([cx, cy, f, ink], i) => (
              <Bead key={i} cx={cx as number} cy={cy as number} r={3.6} fill={f as string} ink={ink as string} />
            ))}
            <Sparkle cx={58} cy={6} r={4} />
          </>
        ),
      };

    // ---- Science: a bubbling flask -------------------------------------------------------------------
    case 'science':
      return {
        defs: (
          <>
            {grad('glass', '#EAFBFF', '#9CDDF0')}
            {grad('liquid', '#8DF08F', '#22A858')}
          </>
        ),
        art: (
          <>
            <Path d="M25 8 H39 V21 L54 50 Q57.5 57.5 50 57.5 H14 Q6.5 57.5 10 50 L25 21 Z" fill={g('glass')} stroke="#2A86A8" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M15.4 40 Q32 33.5 48.6 40 L54 50 Q57.5 57.5 50 57.5 H14 Q6.5 57.5 10 50 Z" fill={g('liquid')} stroke="#1B7A3C" strokeWidth={1.6} strokeLinejoin="round" />
            <Rect x={22} y={5} width={20} height={5.5} rx={2.7} fill="#D5DEEE" stroke="#7D8FB0" strokeWidth={1.6} />
            <Path d="M28 14 V24" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" opacity={0.85} />
            <Circle cx={27} cy={48} r={3.2} fill="#FFFFFF" opacity={0.75} stroke="#1B7A3C" strokeWidth={1} />
            <Circle cx={37.5} cy={51} r={2.3} fill="#FFFFFF" opacity={0.75} stroke="#1B7A3C" strokeWidth={1} />
            <Circle cx={44} cy={45} r={1.8} fill="#FFFFFF" opacity={0.75} />
            <Circle cx={34} cy={30} r={2.3} fill="#9CDDF0" stroke="#2A86A8" strokeWidth={1} />
            <Circle cx={31} cy={22} r={1.6} fill="#9CDDF0" stroke="#2A86A8" strokeWidth={0.8} opacity={0.8} />
            <Sparkle cx={55} cy={14} r={4.5} />
            <Sparkle cx={8} cy={20} r={3.2} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Araling Panlipunan: a little community ----------------------------------------------------
    case 'social':
      return {
        defs: (
          <>
            {grad('hill', '#86E89A', '#2FA85C')}
          </>
        ),
        art: (
          <>
            <Path d="M2 57 Q32 46 62 57 Z" fill={g('hill')} stroke="#1B7A3C" strokeWidth={2} strokeLinejoin="round" />
            <House x={4} y={34} w={17} h={18} wall="#FFE680" wallInk="#B97809" roof="#FF7B6B" roofInk="#B5273A" door="#B97A3A" />
            <House x={39} y={32} w={19} h={20} wall="#A5D4FF" wallInk="#1F5FB8" roof="#FF9C5B" roofInk="#C25A1A" door="#2A6FD6" />
            <House x={19} y={26} w={22} h={26} wall="#FFB8D8" wallInk="#B8306E" roof="#7A5CD6" roofInk="#4A248F" door="#E0457F" />
            <Ellipse cx={30} cy={55} rx={4} ry={1.4} fill="#FFE680" opacity={0.9} />
            <Sparkle cx={56} cy={14} r={4.5} />
            <Sparkle cx={8} cy={16} r={3.2} color="#8BF0FF" />
          </>
        ),
      };

    // ---- ESP / Values: a big kind heart --------------------------------------------------------------
    case 'values':
      return {
        defs: <>{grad('heart', '#FFA3D0', '#E0457F')}</>,
        art: (
          <>
            <Path d={HEART_PATH} fill={g('heart')} stroke="#A82A5E" strokeWidth={2.2} strokeLinejoin="round" />
            <Gloss cx={20} cy={18} rx={7.5} ry={3.6} rotate={-28} opacity={0.55} />
            <Path d="M14 26 Q12 22 15 20" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
            <Sparkle cx={56} cy={8} r={4.6} />
            <Sparkle cx={7} cy={50} r={3.6} color="#8BF0FF" />
            <Path d={starPath(54, 46, 4.2, 1.8)} fill="#FFE066" stroke="#C9961A" strokeWidth={1} strokeLinejoin="round" />
          </>
        ),
      };

    // ---- MAPEH: music, arts, play and health in one tile ----------------------------------------------
    case 'mapeh':
      return {
        defs: (
          <>
            {grad('tile', '#C9B0FF', '#7343D8')}
            {grad('heart', '#FFA3D0', '#E0457F')}
            {grad('brush', '#FFD84D', '#F4A51C')}
          </>
        ),
        art: (
          <>
            <Rect x={4} y={5} width={56} height={52} rx={11} fill={g('tile')} stroke="#4A248F" strokeWidth={2} />
            <Gloss cx={20} cy={11} rx={14} ry={2.4} rotate={0} opacity={0.35} />
            {/* music: a note */}
            <Ellipse cx={17} cy={26} rx={5.2} ry={3.9} fill="#FFFFFF" stroke="#C7B8F2" strokeWidth={1.2} transform="rotate(-20 17 26)" />
            <Rect x={20.6} y={11} width={2.8} height={15} rx={1.4} fill="#FFFFFF" />
            <Path d="M23.4 11 Q29 12 28.5 18" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            {/* arts: a brush */}
            <G transform="translate(44 22) rotate(35)">
              <Rect x={-2.2} y={-11} width={4.4} height={14} rx={2.2} fill={g('brush')} stroke="#B97809" strokeWidth={1.2} />
              <Path d="M-2.6 3.5 Q-3 9 0 11.5 Q3 9 2.6 3.5 Z" fill="#FF7B8A" stroke="#B5273A" strokeWidth={1.1} />
            </G>
            {/* physical education: a ball */}
            <Bead cx={18} cy={44} r={7.6} fill="#FFA08E" ink="#9E2616" />
            <Path d="M10.6 44 Q18 40 25.4 44 M18 36.4 Q21.6 44 18 51.6" stroke="#9E2616" strokeWidth={1.2} fill="none" opacity={0.7} />
            {/* health: a heart */}
            <Path d={HEART_PATH} fill={g('heart')} stroke="#A82A5E" strokeWidth={4.4} transform="translate(35 34) scale(0.38)" strokeLinejoin="round" />
            <Sparkle cx={55} cy={8} r={4} />
          </>
        ),
      };
  }
}
