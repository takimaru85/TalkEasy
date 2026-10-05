import React from 'react';
import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Gloss, Pencil, Sparkle, starPath, type Drawn, type Fill, type Grad } from './kit';
import { HEART_PATH } from './colorKit';

/**
 * The Play & Learn activities that have a drawing of their own, keyed by activity key with the dot
 * turned into an underscore. The rest reuse the subject, level and category drawings the app already
 * has (`learning/activityArt.ts`). 64-unit grid, light from the top-left, outlines in a darker shade of
 * the object's own hue. Objects and symbols, never a drawn child, as everywhere else in the app.
 */
export type LearnArtName =
  | 'english_vocabulary' | 'english_picture_match' | 'english_sentences'
  | 'math_counting' | 'math_addition' | 'math_subtraction' | 'math_multiplication' | 'math_comparing'
  | 'math_time' | 'math_money'
  | 'science_animals' | 'science_plants' | 'science_body' | 'science_weather' | 'science_environment'
  | 'ap_family' | 'ap_community' | 'ap_places'
  | 'esp_manners' | 'esp_sharing' | 'esp_respect' | 'esp_helping' | 'esp_emotions';

const FONT = 'Nunito_900Black';

function Sign({ x, y, ch, fill, ink, size = 40 }: { x: number; y: number; ch: string; fill: string; ink: string; size?: number }) {
  return (
    <G>
      <Rect x={x} y={y} width={size} height={size} rx={9} fill={fill} stroke={ink} strokeWidth={2.2} />
      <SvgText x={x + size / 2} y={y + size * 0.78} fontSize={size * 0.9} fontFamily={FONT} fontWeight="900" fill="#FFFFFF" textAnchor="middle">
        {ch}
      </SvgText>
      <Gloss cx={x + 9} cy={y + 7} rx={6} ry={2} rotate={-8} opacity={0.6} />
    </G>
  );
}

function Apple({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <G>
      <Path d={`M${cx} ${cy - r * 0.7} q ${r * 0.2} -${r * 0.5} ${r * 0.55} -${r * 0.7}`} stroke="#3A7D2C" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <Ellipse cx={cx + r * 0.7} cy={cy - r * 1.05} rx={r * 0.42} ry={r * 0.22} fill="#5BD98A" stroke="#1F7A44" strokeWidth={1.4} transform={`rotate(-25 ${cx + r * 0.7} ${cy - r * 1.05})`} />
      <Circle cx={cx - r * 0.38} cy={cy} r={r * 0.68} fill="#FF6B5A" stroke="#A5281B" strokeWidth={2} />
      <Circle cx={cx + r * 0.38} cy={cy} r={r * 0.68} fill="#FF6B5A" stroke="#A5281B" strokeWidth={2} />
      <Circle cx={cx} cy={cy + r * 0.05} r={r * 0.7} fill="#FF6B5A" />
      <Ellipse cx={cx - r * 0.45} cy={cy - r * 0.2} rx={r * 0.18} ry={r * 0.32} fill="#FFFFFF" opacity={0.55} transform={`rotate(25 ${cx - r * 0.45} ${cy - r * 0.2})`} />
    </G>
  );
}

function Banana() {
  return (
    <G>
      <Path d="M10 22 Q22 56 54 36 Q56 30 52 28 Q30 46 17 16 Z" fill="#FFE066" stroke="#B88A06" strokeWidth={2.2} strokeLinejoin="round" />
      <Path d="M11 21 L16 14 L20 18 Z" fill="#8A6A1F" stroke="#5E4710" strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M20 30 Q32 46 48 36" stroke="#FFF6B8" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </G>
  );
}

function Lines({ x, y, w, rows, color = '#7F9BE0' }: { x: number; y: number; w: number; rows: number; color?: string }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <Path key={i} d={`M${x} ${y + i * 8} H${x + w - (i === rows - 1 ? 10 : 0)}`} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      ))}
    </>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M8 30 Q0 30 2 22 Q4 15 12 17 Q15 6 26 9 Q34 4 40 12 Q50 10 50 20 Q56 24 50 30 Z" fill="#FFFFFF" stroke="#7F9BE0" strokeWidth={2} strokeLinejoin="round" />
      <Ellipse cx={17} cy={16} rx={4.5} ry={2} fill="#FFFFFF" opacity={0.9} />
    </G>
  );
}

export function drawLearn(name: LearnArtName, grad: Grad, g: Fill): Drawn {
  switch (name) {
    // ---- Words: a picture card with an apple ------------------------------------------------------
    case 'english_vocabulary':
      return {
        defs: <>{grad('c', '#FFFFFF', '#E3EAFF')}</>,
        art: (
          <>
            <Rect x={8} y={8} width={48} height={46} rx={7} fill={g('c')} stroke="#7F9BE0" strokeWidth={2.2} />
            <Apple cx={32} cy={30} r={11} />
            <Path d="M18 47 H46" stroke="#2A6FD6" strokeWidth={3.2} strokeLinecap="round" />
            <Sparkle cx={54} cy={12} r={4.5} />
          </>
        ),
      };

    // ---- Find the picture: a framed picture under a magnifier -------------------------------------
    case 'english_picture_match':
      return {
        defs: (
          <>
            {grad('sky', '#9AD7FF', '#4D9BE8')}
            {grad('lens', '#FFFFFF', '#CFEFFF')}
          </>
        ),
        art: (
          <>
            <Rect x={5} y={9} width={44} height={36} rx={6} fill="#FFFFFF" stroke="#7F9BE0" strokeWidth={2.2} />
            <Rect x={9} y={13} width={36} height={28} rx={3} fill={g('sky')} />
            <Path d="M9 41 L22 25 L31 35 L37 29 L45 41 Z" fill="#5BD98A" stroke="#1F7A44" strokeWidth={1.6} strokeLinejoin="round" />
            <Circle cx={37} cy={20} r={4} fill="#FFE066" />
            <Circle cx={41} cy={43} r={11} fill={g('lens')} fillOpacity={0.55} stroke="#C0561C" strokeWidth={3.4} />
            <Path d="M49 51 L58 60" stroke="#C0561C" strokeWidth={5} strokeLinecap="round" />
            <Gloss cx={37} cy={38} rx={4} ry={1.8} rotate={-35} opacity={0.8} />
          </>
        ),
      };

    // ---- Finish / build the sentence: lined paper and a pencil -------------------------------------
    case 'english_sentences':
      return {
        defs: <>{grad('p', '#FFFFFF', '#E3EAFF')}</>,
        art: (
          <>
            <Rect x={6} y={6} width={42} height={50} rx={6} fill={g('p')} stroke="#7F9BE0" strokeWidth={2.2} />
            <Lines x={13} y={19} w={28} rows={4} />
            <Pencil x={40} y={30} len={18} angle={-35} />
            <Sparkle cx={54} cy={14} r={4.2} />
          </>
        ),
      };

    case 'math_counting':
      return {
        defs: null,
        art: (
          <>
            <Apple cx={16} cy={26} r={9.5} />
            <Apple cx={46} cy={26} r={9.5} />
            <Apple cx={31} cy={46} r={9.5} />
            <Sparkle cx={55} cy={50} r={4.2} />
          </>
        ),
      };

    case 'math_addition':
      return { defs: <>{grad('a', '#7BE3A0', '#1F9E55')}</>, art: (<><Sign x={11} y={10} ch="+" fill={g('a')} ink="#136237" size={42} /><Sparkle cx={56} cy={14} r={4.5} /></>) };
    case 'math_subtraction':
      return { defs: <>{grad('a', '#FF9A88', '#E4452E')}</>, art: (<><Sign x={11} y={10} ch="−" fill={g('a')} ink="#8A1F12" size={42} /><Sparkle cx={56} cy={14} r={4.5} /></>) };
    case 'math_multiplication':
      return { defs: <>{grad('a', '#C7A8FF', '#7343D8')}</>, art: (<><Sign x={11} y={10} ch="×" fill={g('a')} ink="#4A248F" size={42} /><Sparkle cx={56} cy={14} r={4.5} /></>) };

    // ---- Bigger or smaller: a balance scale ---------------------------------------------------------
    case 'math_comparing':
      return {
        defs: <>{grad('pan', '#FFE680', '#F4A51C')}</>,
        art: (
          <>
            <Path d="M32 14 V50" stroke="#5B6BB0" strokeWidth={4} strokeLinecap="round" />
            <Path d="M21 54 H43" stroke="#5B6BB0" strokeWidth={5} strokeLinecap="round" />
            <Path d="M10 24 L32 16 L54 24" stroke="#2A6FD6" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M10 24 L4 36 M10 24 L16 36" stroke="#7F9BE0" strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M54 24 L48 36 M54 24 L60 36" stroke="#7F9BE0" strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M2 36 H18 Q16 44 10 44 Q4 44 2 36 Z" fill={g('pan')} stroke="#B97809" strokeWidth={2} />
            <Path d="M46 36 H62 Q60 44 54 44 Q48 44 46 36 Z" fill={g('pan')} stroke="#B97809" strokeWidth={2} />
            <Circle cx={32} cy={14} r={4} fill="#FF6B5A" stroke="#A5281B" strokeWidth={1.8} />
          </>
        ),
      };

    // ---- Telling time: a clock face ------------------------------------------------------------------
    case 'math_time':
      return {
        defs: (
          <>
            {grad('f', '#FFFFFF', '#DDE6FF')}
            {grad('rim', '#FFE680', '#F4A51C')}
          </>
        ),
        art: (
          <>
            <Circle cx={32} cy={32} r={25} fill={g('rim')} stroke="#B97809" strokeWidth={2.2} />
            <Circle cx={32} cy={32} r={19.5} fill={g('f')} stroke="#C99012" strokeWidth={1.6} />
            <Path d="M32 15 V19 M49 32 H45 M32 49 V45 M15 32 H19" stroke="#2A6FD6" strokeWidth={2.6} strokeLinecap="round" />
            <Path d="M32 32 V20" stroke="#27325F" strokeWidth={3.4} strokeLinecap="round" />
            <Path d="M32 32 L42 38" stroke="#E4452E" strokeWidth={3.4} strokeLinecap="round" />
            <Circle cx={32} cy={32} r={2.6} fill="#27325F" />
            <Gloss cx={21} cy={19} rx={5} ry={2} rotate={-40} opacity={0.7} />
          </>
        ),
      };

    // ---- Money (pesos): two coins ---------------------------------------------------------------------
    case 'math_money':
      return {
        defs: (
          <>
            {grad('c', '#FFE680', '#E8A012')}
            {grad('d', '#E8EEF8', '#9FB0CC')}
          </>
        ),
        art: (
          <>
            <Circle cx={22} cy={38} r={17} fill={g('d')} stroke="#5E6F8F" strokeWidth={2.2} />
            <Circle cx={22} cy={38} r={12.5} fill="none" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.8} />
            <Circle cx={40} cy={26} r={18} fill={g('c')} stroke="#9C6A05" strokeWidth={2.2} />
            <Circle cx={40} cy={26} r={13.5} fill="none" stroke="#FFF6B8" strokeWidth={1.4} />
            <SvgText x={40} y={33} fontSize={20} fontFamily={FONT} fontWeight="900" fill="#9C6A05" textAnchor="middle">₱</SvgText>
            <Gloss cx={32} cy={15} rx={5} ry={2} rotate={-30} opacity={0.7} />
            <Sparkle cx={8} cy={14} r={4.2} />
          </>
        ),
      };

    // ---- Animals: a paw print -------------------------------------------------------------------------
    case 'science_animals':
      return {
        defs: <>{grad('p', '#B58A5A', '#7A4F2A')}</>,
        art: (
          <>
            <Ellipse cx={32} cy={42} rx={15} ry={12.5} fill={g('p')} stroke="#4E2F14" strokeWidth={2.2} />
            <Ellipse cx={13} cy={29} rx={5.5} ry={7} fill={g('p')} stroke="#4E2F14" strokeWidth={2} transform="rotate(-20 13 29)" />
            <Ellipse cx={25} cy={17} rx={5.5} ry={7.5} fill={g('p')} stroke="#4E2F14" strokeWidth={2} transform="rotate(-6 25 17)" />
            <Ellipse cx={39} cy={17} rx={5.5} ry={7.5} fill={g('p')} stroke="#4E2F14" strokeWidth={2} transform="rotate(6 39 17)" />
            <Ellipse cx={51} cy={29} rx={5.5} ry={7} fill={g('p')} stroke="#4E2F14" strokeWidth={2} transform="rotate(20 51 29)" />
            <Gloss cx={26} cy={37} rx={5} ry={2} rotate={-30} opacity={0.5} />
            <Sparkle cx={55} cy={9} r={4} />
          </>
        ),
      };

    // ---- Plants: a seedling in a pot -------------------------------------------------------------------
    case 'science_plants':
      return {
        defs: (
          <>
            {grad('leaf', '#8CF0A8', '#22A55B')}
            {grad('pot', '#FF9A6B', '#D8532A')}
          </>
        ),
        art: (
          <>
            <Path d="M32 40 V22" stroke="#1F7A44" strokeWidth={3.4} strokeLinecap="round" />
            <Path d="M32 28 Q16 28 14 12 Q30 12 32 28 Z" fill={g('leaf')} stroke="#136237" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M32 24 Q48 24 50 8 Q34 8 32 24 Z" fill={g('leaf')} stroke="#136237" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M14 40 H50 L45 58 H19 Z" fill={g('pot')} stroke="#8A2D12" strokeWidth={2.2} strokeLinejoin="round" />
            <Rect x={11} y={36} width={42} height={7} rx={3} fill={g('pot')} stroke="#8A2D12" strokeWidth={2} />
            <Gloss cx={20} cy={39.5} rx={5} ry={1.4} rotate={0} opacity={0.6} />
          </>
        ),
      };

    // ---- My body: an eye (the five senses), not a figure ----------------------------------------------
    case 'science_body':
      return {
        defs: <>{grad('iris', '#7BD3FF', '#1F78D1')}</>,
        art: (
          <>
            <Path d="M3 32 Q32 6 61 32 Q32 58 3 32 Z" fill="#FFFFFF" stroke="#4A5A98" strokeWidth={2.4} strokeLinejoin="round" />
            <Circle cx={32} cy={32} r={13} fill={g('iris')} stroke="#12447F" strokeWidth={2.2} />
            <Circle cx={32} cy={32} r={6} fill="#27325F" />
            <Circle cx={27.5} cy={27.5} r={3.4} fill="#FFFFFF" />
            <Sparkle cx={55} cy={12} r={4.2} />
          </>
        ),
      };

    // ---- Weather: a sun behind a cloud ------------------------------------------------------------------
    case 'science_weather':
      return {
        defs: <>{grad('sun', '#FFE680', '#F4A51C')}</>,
        art: (
          <>
            <G stroke="#F4A51C" strokeWidth={3.2} strokeLinecap="round">
              <Path d="M40 4 V9 M54 10 L50.5 13.5 M60 24 H55 M26 10 L29.5 13.5" />
            </G>
            <Circle cx={42} cy={23} r={12} fill={g('sun')} stroke="#B97809" strokeWidth={2.2} />
            <Cloud x={4} y={26} s={1.05} />
            <Path d="M16 52 L13 58 M28 52 L25 58 M40 52 L37 58" stroke="#4D9BE8" strokeWidth={3} strokeLinecap="round" />
          </>
        ),
      };

    // ---- Our environment: the Earth -----------------------------------------------------------------------
    case 'science_environment':
      return {
        defs: <>{grad('sea', '#7BD3FF', '#1F78D1')}</>,
        art: (
          <>
            <Circle cx={32} cy={32} r={25} fill={g('sea')} stroke="#12447F" strokeWidth={2.4} />
            <Path d="M16 20 Q24 12 32 17 Q30 26 22 28 Q14 30 16 20 Z" fill="#5BD98A" stroke="#136237" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M38 34 Q50 30 52 40 Q48 52 40 50 Q34 44 38 34 Z" fill="#5BD98A" stroke="#136237" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M14 40 Q20 38 24 44 Q20 52 16 48 Z" fill="#5BD98A" stroke="#136237" strokeWidth={1.8} strokeLinejoin="round" />
            <Gloss cx={21} cy={14} rx={7} ry={2.4} rotate={-35} opacity={0.6} />
            <Path d={HEART_PATH} fill="#FF6B8A" stroke="#A5204A" strokeWidth={1.6} transform="translate(41 3) scale(0.3)" />
          </>
        ),
      };

    // ---- Family: a home with a heart ------------------------------------------------------------------------
    case 'ap_family':
      return {
        defs: (
          <>
            {grad('wall', '#FFF3C7', '#FFD86B')}
            {grad('roof', '#FF9A88', '#E4452E')}
          </>
        ),
        art: (
          <>
            <Rect x={10} y={28} width={44} height={28} rx={3} fill={g('wall')} stroke="#B97809" strokeWidth={2.2} />
            <Path d="M5 30 L32 8 L59 30 Z" fill={g('roof')} stroke="#8A1F12" strokeWidth={2.2} strokeLinejoin="round" />
            <Path d={HEART_PATH} fill="#FF4E7E" stroke="#A5204A" strokeWidth={1.6} transform="translate(16 28.5) scale(0.5)" />
            <Rect x={27} y={46} width={10} height={10} rx={2} fill="#4D9BE8" stroke="#1B4AA0" strokeWidth={1.6} />
          </>
        ),
      };

    // ---- Community helpers: a badge with a star -----------------------------------------------------------------
    case 'ap_community':
      return {
        defs: <>{grad('b', '#8FB5FF', '#2A6FD6')}</>,
        art: (
          <>
            <Path d="M32 5 L54 13 V32 Q54 48 32 59 Q10 48 10 32 V13 Z" fill={g('b')} stroke="#12379A" strokeWidth={2.4} strokeLinejoin="round" />
            <Path d={starPath(32, 31, 13, 5.6)} fill="#FFE066" stroke="#B97809" strokeWidth={1.8} strokeLinejoin="round" />
            <Gloss cx={21} cy={17} rx={7} ry={2.2} rotate={-45} opacity={0.6} />
          </>
        ),
      };

    // ---- Places & roles: a school building with a flag -----------------------------------------------------------
    case 'ap_places':
      return {
        defs: (
          <>
            {grad('w', '#FFB27A', '#E8672B')}
            {grad('r', '#8FB5FF', '#2A6FD6')}
          </>
        ),
        art: (
          <>
            <Path d="M32 4 V13" stroke="#5B6BB0" strokeWidth={2.4} strokeLinecap="round" />
            <Path d="M32 4 H44 L40 8 L44 12 H32 Z" fill="#FF6B5A" stroke="#A5281B" strokeWidth={1.4} strokeLinejoin="round" />
            <Rect x={8} y={26} width={48} height={30} rx={3} fill={g('w')} stroke="#8A3A0E" strokeWidth={2.2} />
            <Path d="M4 28 L32 12 L60 28 Z" fill={g('r')} stroke="#12379A" strokeWidth={2.2} strokeLinejoin="round" />
            <Rect x={26} y={40} width={12} height={16} rx={3} fill="#FFE066" stroke="#B97809" strokeWidth={1.8} />
            <Rect x={13} y={33} width={8} height={8} rx={2} fill="#FFFFFF" stroke="#8A3A0E" strokeWidth={1.4} />
            <Rect x={43} y={33} width={8} height={8} rx={2} fill="#FFFFFF" stroke="#8A3A0E" strokeWidth={1.4} />
          </>
        ),
      };

    // ---- Good manners: a speech bubble with a heart (please, thank you, po and opo) --------------------------------
    case 'esp_manners':
      return {
        defs: <>{grad('b', '#D7C0FF', '#8A5BE6')}</>,
        art: (
          <>
            <Path d="M10 10 H54 Q60 10 60 16 V38 Q60 44 54 44 H34 L20 56 V44 H10 Q4 44 4 38 V16 Q4 10 10 10 Z" fill={g('b')} stroke="#4A248F" strokeWidth={2.4} strokeLinejoin="round" />
            <Path d={HEART_PATH} fill="#FF6B8A" stroke="#A5204A" strokeWidth={1.6} transform="translate(16 10.5) scale(0.5)" />
            <Gloss cx={14} cy={17} rx={5} ry={1.8} rotate={0} opacity={0.6} />
          </>
        ),
      };

    // ---- Sharing: a wrapped gift --------------------------------------------------------------------------------
    case 'esp_sharing':
      return {
        defs: <>{grad('g', '#7BE3A0', '#1F9E55')}</>,
        art: (
          <>
            <Rect x={8} y={26} width={48} height={30} rx={4} fill={g('g')} stroke="#136237" strokeWidth={2.2} />
            <Rect x={5} y={18} width={54} height={12} rx={4} fill={g('g')} stroke="#136237" strokeWidth={2.2} />
            <Rect x={28} y={18} width={8} height={38} fill="#FFE066" stroke="#B97809" strokeWidth={1.8} />
            <Path d="M32 18 Q20 2 14 10 Q12 18 32 18 Z M32 18 Q44 2 50 10 Q52 18 32 18 Z" fill="#FFE066" stroke="#B97809" strokeWidth={1.8} strokeLinejoin="round" />
            <Gloss cx={15} cy={36} rx={5} ry={1.8} rotate={0} opacity={0.5} />
          </>
        ),
      };

    // ---- Respect: a star rosette ----------------------------------------------------------------------------------
    case 'esp_respect':
      return {
        defs: <>{grad('r', '#FFE680', '#F4A51C')}</>,
        art: (
          <>
            <Path d="M20 38 L12 58 L22 53 L28 60 L33 40 Z" fill="#FF6B5A" stroke="#A5281B" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M44 38 L52 58 L42 53 L36 60 L31 40 Z" fill="#4D9BE8" stroke="#1B4AA0" strokeWidth={2} strokeLinejoin="round" />
            <Circle cx={32} cy={26} r={20} fill={g('r')} stroke="#B97809" strokeWidth={2.4} />
            <Path d={starPath(32, 26, 12, 5.2)} fill="#FFFFFF" stroke="#B97809" strokeWidth={1.6} strokeLinejoin="round" />
            <Gloss cx={21} cy={14} rx={6} ry={2.2} rotate={-40} opacity={0.7} />
          </>
        ),
      };

    // ---- Helping others: a heart with a plus ------------------------------------------------------------------------
    case 'esp_helping':
      return {
        defs: <>{grad('h', '#FF9DBB', '#E23A6E')}</>,
        art: (
          <>
            <Path d={HEART_PATH} fill={g('h')} stroke="#8A1A4A" strokeWidth={2.2} transform="translate(2 3) scale(0.95)" strokeLinejoin="round" />
            <Path d="M32 22 V42 M22 32 H42" stroke="#FFFFFF" strokeWidth={5.5} strokeLinecap="round" />
            <Gloss cx={17} cy={19} rx={6} ry={2.2} rotate={-40} opacity={0.7} />
            <Sparkle cx={56} cy={12} r={4.2} />
          </>
        ),
      };

    // ---- Emotions: a smiling face ---------------------------------------------------------------------------------------
    case 'esp_emotions':
      return {
        defs: <>{grad('f', '#FFE680', '#F4A51C')}</>,
        art: (
          <>
            <Circle cx={32} cy={32} r={25} fill={g('f')} stroke="#B97809" strokeWidth={2.4} />
            <Ellipse cx={24} cy={26} rx={3} ry={4.2} fill="#27325F" />
            <Ellipse cx={40} cy={26} rx={3} ry={4.2} fill="#27325F" />
            <Path d="M20 37 Q32 50 44 37" stroke="#27325F" strokeWidth={3.2} strokeLinecap="round" fill="none" />
            <Ellipse cx={17} cy={36} rx={3.4} ry={2.2} fill="#FF8E7C" opacity={0.7} />
            <Ellipse cx={47} cy={36} rx={3.4} ry={2.2} fill="#FF8E7C" opacity={0.7} />
            <Gloss cx={21} cy={15} rx={6} ry={2.2} rotate={-40} opacity={0.7} />
          </>
        ),
      };
  }
}
