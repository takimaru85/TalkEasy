import React from 'react';
import { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Gloss, Sparkle, type Drawn, type Fill, type Grad } from './kit';
import { PencilArt } from './colorKit';

/** The seven Learn & Trace levels, keyed by level number. */
export type LevelArtName = '1' | '2' | '3' | '4' | '5' | '6' | '7';

const FONT = 'Nunito_900Black';

export function drawLevel(name: LevelArtName, grad: Grad, g: Fill): Drawn {
  switch (name) {
    // ---- 1 Trace lines: a wavy stroke with a dotted guide --------------------------------------------
    case '1':
      return {
        defs: null,
        art: (
          <>
            <Path d="M5 38 Q13 14 21 38 T37 38 T52 38" stroke="#B97809" strokeWidth={9.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M5 38 Q13 14 21 38 T37 38 T52 38" stroke="#FFD84D" strokeWidth={6.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M5 38 Q13 14 21 38 T37 38 T52 38" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeDasharray="0.1 4.2" fill="none" />
            <PencilArt transform="translate(45 43) rotate(32)" tip={0} len={22} />
            <Sparkle cx={10} cy={14} r={4.5} />
            <Sparkle cx={34} cy={10} r={3.2} color="#8BF0FF" />
          </>
        ),
      };

    // ---- 2 Trace shapes: circle, square and triangle --------------------------------------------------
    case '2':
      return {
        defs: (
          <>
            {grad('c', '#FF9A88', '#E4452E')}
            {grad('s', '#86C3FF', '#2A6FD6')}
            {grad('t', '#FFE680', '#F4A51C')}
          </>
        ),
        art: (
          <>
            <Circle cx={19} cy={20} r={12.5} fill={g('c')} stroke="#9E2616" strokeWidth={2} />
            <Rect x={36} y={6} width={22} height={22} rx={4} fill={g('s')} stroke="#1B4AA0" strokeWidth={2} />
            <Path d="M32 33 L52 57 H12 Z" fill={g('t')} stroke="#B97809" strokeWidth={2} strokeLinejoin="round" />
            <Gloss cx={14.5} cy={14.5} rx={4.4} ry={2.2} opacity={0.6} />
            <Gloss cx={43} cy={11.5} rx={4.6} ry={1.8} rotate={0} opacity={0.6} />
            <Gloss cx={28} cy={45} rx={4.2} ry={1.8} rotate={-35} opacity={0.6} />
            <Sparkle cx={56} cy={46} r={4} />
          </>
        ),
      };

    // ---- 3 Trace letters: a dotted letter on paper --------------------------------------------------
    case '3':
      return {
        defs: <>{grad('paper', '#FFFFFF', '#E3EAFF')}</>,
        art: (
          <>
            <Rect x={5} y={7} width={42} height={50} rx={6} fill={g('paper')} stroke="#7F9BE0" strokeWidth={2} transform="rotate(-5 26 32)" />
            <G transform="rotate(-5 26 32)">
              <SvgText x={26} y={45} fontSize={40} fontFamily={FONT} fontWeight="900" fill="#CFE0FF" stroke="#2A6FD6" strokeWidth={1.3} strokeDasharray="2.6 2.4" textAnchor="middle">
                A
              </SvgText>
            </G>
            <PencilArt transform="translate(46 49) rotate(30)" tip={0} len={23} />
            <Sparkle cx={55} cy={10} r={4.5} />
          </>
        ),
      };

    // ---- 4 Trace numbers: bold coloured digits on a card -----------------------------------------------
    case '4':
      return {
        defs: <>{grad('card', '#FFFFFF', '#E4F7EA')}</>,
        art: (
          <>
            <Rect x={4} y={14} width={56} height={36} rx={8} fill={g('card')} stroke="#1F8A4B" strokeWidth={2} />
            <SvgText x={16} y={42} fontSize={25} fontFamily={FONT} fontWeight="900" fill="#FF6B7A" stroke="#B5273A" strokeWidth={1.1} textAnchor="middle">
              1
            </SvgText>
            <SvgText x={32} y={42} fontSize={25} fontFamily={FONT} fontWeight="900" fill="#3EC878" stroke="#1F8A4B" strokeWidth={1.1} textAnchor="middle">
              2
            </SvgText>
            <SvgText x={48} y={42} fontSize={25} fontFamily={FONT} fontWeight="900" fill="#4C9BEF" stroke="#1B4AA0" strokeWidth={1.1} textAnchor="middle">
              3
            </SvgText>
            <Gloss cx={18} cy={19} rx={10} ry={1.8} rotate={0} opacity={0.7} />
            <Sparkle cx={56} cy={9} r={4.5} />
            <Sparkle cx={8} cy={55} r={3.2} color="#FFE066" />
          </>
        ),
      };

    // ---- 5 Trace words: a dotted word, and a pencil to follow it ---------------------------------------
    case '5':
      return {
        defs: <>{grad('paper', '#FFFFFF', '#FFF0E0')}</>,
        art: (
          <>
            <Rect x={4} y={8} width={46} height={48} rx={6} fill={g('paper')} stroke="#E08A4C" strokeWidth={2} />
            <Path d="M10 24 H44 M10 44 H44" stroke="#F4B88A" strokeWidth={1.6} strokeLinecap="round" />
            <SvgText x={27} y={41} fontSize={23} fontFamily={FONT} fontWeight="900" fill="#F6D2B8" stroke="#E4452E" strokeWidth={1} strokeDasharray="2.2 2.2" textAnchor="middle">
              cat
            </SvgText>
            <PencilArt transform="translate(47 50) rotate(32)" tip={0} len={23} />
            <Sparkle cx={52} cy={10} r={4.2} />
          </>
        ),
      };

    // ---- 6 Copy words: look at one, write the other ----------------------------------------------------
    case '6':
      return {
        defs: (
          <>
            {grad('a', '#FFFFFF', '#E4F4FF')}
            {grad('b', '#FFFFFF', '#FFF6E0')}
          </>
        ),
        art: (
          <>
            <Rect x={4} y={7} width={36} height={22} rx={5} fill={g('a')} stroke="#2A86A8" strokeWidth={2} />
            <SvgText x={22} y={24} fontSize={16} fontFamily={FONT} fontWeight="900" fill="#1F7FB8" textAnchor="middle">
              cat
            </SvgText>
            <Path d="M44 14 Q54 16 52 28" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Path d="M48.2 26.5 L52.2 31.5 L56.2 26.2" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Rect x={22} y={35} width={36} height={22} rx={5} fill={g('b')} stroke="#E08A4C" strokeWidth={2} strokeDasharray="4 3" />
            <Path d="M28 50 H44" stroke="#F4B88A" strokeWidth={1.6} strokeLinecap="round" />
            <PencilArt transform="translate(24 50) rotate(-32)" tip={0} len={26} />
            <Sparkle cx={10} cy={44} r={4} />
          </>
        ),
      };

    // ---- 7 Write answers: a speech bubble with a pencil -----------------------------------------------
    case '7':
      return {
        defs: <>{grad('bubble', '#9AD0FF', '#2A6FD6')}</>,
        art: (
          <>
            <Path d="M10 9 H46 Q56 9 56 19 V34 Q56 44 46 44 H32 L20 55 V44 H10 Q4 44 4 34 V19 Q4 9 10 9 Z" fill={g('bubble')} stroke="#1B4AA0" strokeWidth={2} strokeLinejoin="round" />
            <Gloss cx={18} cy={15} rx={9} ry={2.2} rotate={0} opacity={0.5} />
            <Circle cx={18} cy={27} r={3} fill="#FFFFFF" />
            <Circle cx={29} cy={27} r={3} fill="#FFFFFF" />
            <Circle cx={40} cy={27} r={3} fill="#FFFFFF" />
            <PencilArt transform="translate(44 56) rotate(36)" tip={0} len={23} />
            <Sparkle cx={55} cy={8} r={4.2} />
          </>
        ),
      };
  }
}
