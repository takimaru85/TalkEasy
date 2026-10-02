import React from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import { Gloss, Sparkle, starPath, type Drawn, type Fill, type Grad } from './kit';
import { Hand, SKIN_LIGHT } from './categoryArt';

/**
 * Illustrations drawn for My Progress. Only four are new; the other statistics reuse drawings the app
 * already has (the microphone and the tracing page from GameIcon, the open book from the Reading
 * category), so there is one microphone and one book in the app, not two.
 */
export type StatArtName = 'stars' | 'streak' | 'sounds' | 'medal' | 'hand' | 'bubbles' | 'bulb';

export function drawStat(name: StatArtName, grad: Grad, g: Fill): Drawn {
  switch (name) {
    // ---- Stars earned: one big, glossy star -------------------------------------------------------------
    case 'stars':
      return {
        defs: <>{grad('star', '#FFE45C', '#FF9A12')}</>,
        art: (
          <>
            <Path d={starPath(32, 33, 27, 12.5)} fill={g('star')} stroke="#7A3E06" strokeWidth={3} strokeLinejoin="round" />
            <Path d="M32 14 L36 27 M18 26 L29 32" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
            <Gloss cx={26} cy={24} rx={6} ry={2.6} rotate={-40} opacity={0.65} />
            <Sparkle cx={10} cy={12} r={5} />
            <Sparkle cx={55} cy={11} r={4.4} color="#FFF59A" />
            <Sparkle cx={54} cy={54} r={3.8} />
          </>
        ),
      };

    // ---- Days in a row: a calendar with a flame -----------------------------------------------------------
    case 'streak':
      return {
        defs: (
          <>
            {grad('page', '#FFFFFF', '#E6ECFF')}
            {grad('flame', '#FFE27A', '#FF6A2A')}
          </>
        ),
        art: (
          <>
            <Rect x={7} y={11} width={50} height={46} rx={9} fill={g('page')} stroke="#B5273A" strokeWidth={2.2} />
            <Path d="M7 20 Q7 11 16 11 H48 Q57 11 57 20 V26 H7 Z" fill="#FF6B5A" stroke="#B5273A" strokeWidth={2.2} strokeLinejoin="round" />
            <Rect x={18} y={5} width={5.4} height={13} rx={2.7} fill="#FFFFFF" stroke="#B5273A" strokeWidth={1.8} />
            <Rect x={40.6} y={5} width={5.4} height={13} rx={2.7} fill="#FFFFFF" stroke="#B5273A" strokeWidth={1.8} />
            <Path
              d="M32 27 C34 34 42 37 42 45 C42 51.5 37.5 56 32 56 C26.5 56 22 51.5 22 45 C22 40 25.5 37.5 26.5 33 C28.6 35 30 36 32 27 Z"
              fill={g('flame')}
              stroke="#C2402C"
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <Path d="M32 40 C33.4 44 37 45 37 49 C37 52 34.8 54 32 54 C29.2 54 27 52 27 49 C27 46.5 30.6 44.5 32 40 Z" fill="#FFF3B0" />
            <Gloss cx={17} cy={16} rx={5} ry={1.8} rotate={0} opacity={0.5} />
            <Sparkle cx={58} cy={30} r={3.8} />
          </>
        ),
      };

    // ---- Sounds practised: a megaphone with sound waves ---------------------------------------------------
    case 'sounds':
      return {
        defs: <>{grad('horn', '#8CC8FF', '#2A6FD6')}{grad('grip', '#7A8FE0', '#3A4FB0')}</>,
        art: (
          <>
            <Rect x={13} y={37} width={9} height={15} rx={3.6} fill={g('grip')} stroke="#27327A" strokeWidth={1.8} transform="rotate(-12 17.5 44.5)" />
            <Path d="M7 24 H19 L42 10 V54 L19 40 H7 Q3 40 3 36 V28 Q3 24 7 24 Z" fill={g('horn')} stroke="#1B4AA0" strokeWidth={2.2} strokeLinejoin="round" />
            <Rect x={41} y={8} width={6} height={48} rx={3} fill="#5CA8F2" stroke="#1B4AA0" strokeWidth={2} />
            <Path d="M9 29 H18" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" opacity={0.7} />
            <Path d="M52 24 Q58 32 52 40" stroke="#5BD98A" strokeWidth={3.6} strokeLinecap="round" fill="none" />
            <Path d="M56 16 Q67 32 56 48" stroke="#3EC8B8" strokeWidth={3.6} strokeLinecap="round" fill="none" />
            <Sparkle cx={12} cy={12} r={4.4} />
          </>
        ),
      };

    // ---- Steady Hand: a friendly open hand with a star ---------------------------------------------------
    case 'hand':
      return {
        defs: <>{grad('skin', SKIN_LIGHT[0], SKIN_LIGHT[1])}</>,
        art: (
          <>
            <G transform="translate(6 4)">
              <Hand id="skin" g={g} skin={SKIN_LIGHT} />
            </G>
            <Path d={starPath(53, 14, 7, 3)} fill="#FFE066" stroke="#C9961A" strokeWidth={1.4} strokeLinejoin="round" />
            <Sparkle cx={9} cy={12} r={4.4} />
            <Sparkle cx={56} cy={46} r={3.6} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Phrases: two speech bubbles ------------------------------------------------------------------------
    case 'bubbles':
      return {
        defs: <>{grad('a', '#8CC8FF', '#2A6FD6')}{grad('b', '#FFB3D6', '#E0457F')}</>,
        art: (
          <>
            <Path d="M10 10 H36 Q46 10 46 20 V32 Q46 42 36 42 H24 L14 52 V42 H10 Q2 42 2 32 V20 Q2 10 10 10 Z" fill={g('a')} stroke="#1B4AA0" strokeWidth={2} strokeLinejoin="round" />
            <Circle cx={13} cy={26} r={2.8} fill="#FFFFFF" />
            <Circle cx={24} cy={26} r={2.8} fill="#FFFFFF" />
            <Circle cx={35} cy={26} r={2.8} fill="#FFFFFF" />
            <Path d="M34 26 H54 Q62 26 62 34 V44 Q62 52 54 52 H52 V60 L44 52 H42 Q34 52 34 44 V34 Q34 26 34 26 Z" fill={g('b')} stroke="#A82A5E" strokeWidth={2} strokeLinejoin="round" />
            <Circle cx={44} cy={39} r={2.4} fill="#FFFFFF" />
            <Circle cx={52} cy={39} r={2.4} fill="#FFFFFF" />
            <Gloss cx={15} cy={15} rx={6} ry={2} rotate={0} opacity={0.55} />
            <Sparkle cx={55} cy={12} r={4.4} />
          </>
        ),
      };

    // ---- Grown-ups: a bright idea -----------------------------------------------------------------------------
    case 'bulb':
      return {
        defs: <>{grad('glass', '#FFF59A', '#FFC531')}</>,
        art: (
          <>
            <Path d="M32 5 C19 5 11 14 11 25 C11 33 16 38 19 43 C20 45.5 20.5 47 20.5 49 H43.5 C43.5 47 44 45.5 45 43 C48 38 53 33 53 25 C53 14 45 5 32 5 Z" fill={g('glass')} stroke="#B97809" strokeWidth={2.4} strokeLinejoin="round" />
            <Rect x={21} y={49} width={22} height={6} rx={2.4} fill="#C9D4E8" stroke="#7D8FB0" strokeWidth={1.8} />
            <Rect x={25} y={55} width={14} height={5} rx={2.4} fill="#9AA8C8" stroke="#7D8FB0" strokeWidth={1.6} />
            <Path d="M26 32 Q32 24 38 32 M32 28 V45" stroke="#C9831A" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.7} />
            <Gloss cx={23} cy={16} rx={5} ry={2.4} rotate={-35} opacity={0.7} />
          </>
        ),
      };

    // ---- Achievements: a gold medal on a ribbon -----------------------------------------------------------
    case 'medal':
      return {
        defs: <>{grad('gold', '#FFF59A', '#FFAE1F')}{grad('ribbon', '#FF8A8A', '#E0364B')}</>,
        art: (
          <>
            <Path d="M20 38 L13 58 L23 53 L28 61 L31 40 Z" fill={g('ribbon')} stroke="#9E1A2C" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M44 38 L51 58 L41 53 L36 61 L33 40 Z" fill={g('ribbon')} stroke="#9E1A2C" strokeWidth={1.8} strokeLinejoin="round" />
            <Circle cx={32} cy={26} r={21} fill={g('gold')} stroke="#A8680E" strokeWidth={2.4} />
            <Circle cx={32} cy={26} r={15} fill="none" stroke="#C9831A" strokeWidth={1.8} />
            <G>
              <Path d={starPath(32, 26.5, 10.5, 4.6)} fill="#FFFFFF" stroke="#C9831A" strokeWidth={1.4} strokeLinejoin="round" />
            </G>
            <Gloss cx={22} cy={14} rx={7} ry={2.6} rotate={-35} opacity={0.6} />
            <Sparkle cx={56} cy={10} r={4.2} />
          </>
        ),
      };
  }
}
