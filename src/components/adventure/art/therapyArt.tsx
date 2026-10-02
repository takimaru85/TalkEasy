import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Gloss, Sparkle, starPath, type Drawn, type Fill, type Grad } from './kit';
import { Bead, HEART_PATH, PencilArt } from './colorKit';
import { Hand, SKIN_DEEP, SKIN_LIGHT } from './categoryArt';

/**
 * The colourful illustrations for the Therapy library, one per activity id.
 *
 * Therapy's drawing rules still apply, and they shape what is drawn here:
 *  - OBJECTS AND SHAPES, not bodies: a chair, a table, a seesaw, footprints, a ball. A drawn child
 *    standing up or walking unaided would quietly exclude a family using a walker or a wheelchair,
 *    and a figure in a pose reads as a pose to copy;
 *  - hands appear only where the activity is about hands, in two skin tones, and never as a
 *    demonstration of a technique;
 *  - nothing medical: no clinical symbols, no stretching diagrams, no measurements.
 */
export type TherapyArtName =
  | 'sit-to-stand' | 'supported-standing' | 'reaching-sitting' | 'walking-practice' | 'balance-practice' | 'active-play'
  | 'reach-grasp' | 'two-hand' | 'object-transfer' | 'drawing-colouring' | 'writing-practice'
  | 'active-range' | 'therapist-stretching' | 'gentle-movement' | 'relaxation'
  | 'dressing' | 'containers' | 'school-tasks' | 'self-care';

/** A footprint: a sole and five toes, drawn upright and then turned. */
function Foot({ cx, cy, rot, fill, ink }: { cx: number; cy: number; rot: number; fill: string; ink: string }) {
  return (
    <G transform={`rotate(${rot} ${cx} ${cy})`}>
      <Ellipse cx={cx} cy={cy + 3} rx={5.6} ry={8.4} fill={fill} stroke={ink} strokeWidth={1.6} />
      {[
        [cx - 5, cy - 9, 2.1], [cx - 2.2, cy - 11.4, 2.3], [cx + 1, cy - 11.8, 2.3], [cx + 4, cy - 10, 2.1], [cx + 6.2, cy - 6.6, 1.8],
      ].map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill={fill} stroke={ink} strokeWidth={1.2} />
      ))}
    </G>
  );
}

export function drawTherapy(name: TherapyArtName, grad: Grad, g: Fill): Drawn {
  switch (name) {
    // ---- Sit to Stand: a chair and an upward arrow ---------------------------------------------------
    case 'sit-to-stand':
      return {
        defs: (
          <>
            {grad('chair', '#8CC8FF', '#2A6FD6')}
            {grad('arrow', '#9CF2B5', '#2FB863')}
          </>
        ),
        art: (
          <>
            <Rect x={9} y={12} width={6} height={30} rx={2.4} fill={g('chair')} stroke="#1B4AA0" strokeWidth={1.8} />
            <Rect x={9} y={34} width={32} height={7} rx={2.6} fill={g('chair')} stroke="#1B4AA0" strokeWidth={1.8} />
            <Rect x={12} y={40} width={5} height={17} rx={2} fill={g('chair')} stroke="#1B4AA0" strokeWidth={1.8} />
            <Rect x={33} y={40} width={5} height={17} rx={2} fill={g('chair')} stroke="#1B4AA0" strokeWidth={1.8} />
            <Gloss cx={22} cy={36.4} rx={7} ry={1.2} rotate={0} opacity={0.6} />
            <Path d="M52 55 V24 M43 33 L52 21 L61 33" stroke="#136237" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M52 55 V24 M43 33 L52 21 L61 33" stroke={g('arrow')} strokeWidth={4.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Sparkle cx={26} cy={12} r={4.4} />
          </>
        ),
      };

    // ---- Supported Standing: a sturdy table with things to join in with ------------------------------
    case 'supported-standing':
      return {
        defs: (
          <>
            {grad('wood', '#F2C48A', '#C98A3E')}
            {grad('cup', '#8CC8FF', '#2A6FD6')}
            {grad('block', '#FFE680', '#F4A51C')}
          </>
        ),
        art: (
          <>
            <Rect x={9} y={32} width={5.4} height={25} rx={2} fill={g('wood')} stroke="#7A4A1E" strokeWidth={1.8} />
            <Rect x={49.6} y={32} width={5.4} height={25} rx={2} fill={g('wood')} stroke="#7A4A1E" strokeWidth={1.8} />
            <Rect x={5} y={26} width={54} height={8} rx={3.4} fill={g('wood')} stroke="#7A4A1E" strokeWidth={2} />
            <Gloss cx={20} cy={29} rx={11} ry={1.3} rotate={0} opacity={0.6} />
            <Rect x={14} y={14} width={12} height={12} rx={2.4} fill={g('block')} stroke="#B97809" strokeWidth={1.8} transform="rotate(-8 20 20)" />
            <Path d="M38 14 H50 V24 Q50 26 48 26 H40 Q38 26 38 24 Z" fill={g('cup')} stroke="#1B4AA0" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M50 17 Q55 17 55 21 Q55 24 50 24" stroke="#1B4AA0" strokeWidth={1.8} fill="none" />
            <Sparkle cx={55} cy={8} r={4} />
          </>
        ),
      };

    // ---- Reaching While Sitting: a hand reaching for a ball ------------------------------------------
    case 'reaching-sitting':
      return {
        defs: <>{grad('skin', SKIN_LIGHT[0], SKIN_LIGHT[1])}{grad('ball', '#FF9A88', '#E4452E')}</>,
        art: (
          <>
            <G transform="translate(1 14) scale(0.7) rotate(72 28 31)">
              <Hand id="skin" g={g} skin={SKIN_LIGHT} />
            </G>
            <Bead cx={51} cy={29} r={8} fill={g('ball')} ink="#9E2616" />
            <Path d="M40 10 Q50 6 57 14" stroke="#FFD84D" strokeWidth={2.6} strokeLinecap="round" strokeDasharray="0.1 4.6" fill="none" />
            <Sparkle cx={12} cy={12} r={4} />
          </>
        ),
      };

    // ---- Walking Practice: footprints on a path ------------------------------------------------------------
    case 'walking-practice':
      return {
        defs: <>{grad('a', '#8DF0E0', '#14A99A')}{grad('b', '#FFC58A', '#F08A2C')}</>,
        art: (
          <>
            <Path d="M14 56 Q8 44 20 34 T36 12" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeDasharray="0.1 5" fill="none" opacity={0.8} />
            <Foot cx={22} cy={44} rot={-12} fill={g('a')} ink="#0B6F66" />
            <Foot cx={42} cy={26} rot={10} fill={g('b')} ink="#B25A12" />
            <Sparkle cx={54} cy={10} r={4.4} />
            <Sparkle cx={8} cy={22} r={3.2} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Balance Practice: a seesaw with a ball -----------------------------------------------------------
    case 'balance-practice':
      return {
        defs: <>{grad('plank', '#FFA3D0', '#E0457F')}{grad('stand', '#FFE680', '#F4A51C')}{grad('ball', '#9CC8FF', '#2A6FD6')}</>,
        art: (
          <>
            <Path d="M32 38 L22 57 H42 Z" fill={g('stand')} stroke="#B97809" strokeWidth={2} strokeLinejoin="round" />
            <G transform="rotate(-9 32 38)">
              <Rect x={4} y={34} width={56} height={7} rx={3.5} fill={g('plank')} stroke="#A82A5E" strokeWidth={2} />
              <Gloss cx={20} cy={36.4} rx={10} ry={1.1} rotate={0} opacity={0.6} />
            </G>
            <Bead cx={20} cy={24} r={7.5} fill={g('ball')} ink="#1B4AA0" />
            <Sparkle cx={50} cy={14} r={4.4} />
          </>
        ),
      };

    // ---- Active Play: a bright beach ball -----------------------------------------------------------------
    case 'active-play':
      return {
        defs: null,
        art: (
          <>
            <Path d="M2 26 H9 M0 34 H7 M3 42 H9" stroke="#FFD84D" strokeWidth={2.8} strokeLinecap="round" />
            <Circle cx={35} cy={33} r={20} fill="#FFFFFF" />
            <Path d="M35 33 L35 13 A20 20 0 0 1 52.3 23 Z" fill="#FF6B6B" />
            <Path d="M35 33 L52.3 43 A20 20 0 0 1 35 53 Z" fill="#FFD84D" />
            <Path d="M35 33 L17.7 43 A20 20 0 0 1 17.7 23 Z" fill="#4C9BEF" />
            <Circle cx={35} cy={33} r={20} fill="none" stroke="#27325F" strokeWidth={2.2} />
            <Circle cx={35} cy={33} r={3.4} fill="#FFFFFF" stroke="#27325F" strokeWidth={1.6} />
            <Gloss cx={27} cy={22} rx={5} ry={2.4} opacity={0.55} />
            <Sparkle cx={57} cy={10} r={4.4} />
          </>
        ),
      };

    // ---- Reach & Grasp: a hand and a block ---------------------------------------------------------------
    case 'reach-grasp':
      return {
        defs: <>{grad('skin', SKIN_LIGHT[0], SKIN_LIGHT[1])}{grad('block', '#FFE680', '#F4A51C')}</>,
        art: (
          <>
            <G transform="translate(-2 12) scale(0.74) rotate(14 28 31)">
              <Hand id="skin" g={g} skin={SKIN_LIGHT} />
            </G>
            <Rect x={36} y={22} width={20} height={20} rx={4} fill={g('block')} stroke="#B97809" strokeWidth={2} transform="rotate(10 46 32)" />
            <Gloss cx={42} cy={26.5} rx={5} ry={2} rotate={0} opacity={0.6} />
            <Path d="M46 30 L47 36 M43 34 H49" stroke="#C9961A" strokeWidth={1.2} strokeLinecap="round" opacity={0} />
            <Sparkle cx={54} cy={10} r={4.4} />
          </>
        ),
      };

    // ---- Two-Hand Activities: a bowl held by two hands -----------------------------------------------------
    case 'two-hand':
      return {
        defs: <>{grad('bowl', '#9CF2B5', '#2FB863')}{grad('a', SKIN_LIGHT[0], SKIN_LIGHT[1])}{grad('b', SKIN_DEEP[0], SKIN_DEEP[1])}</>,
        art: (
          <>
            <Path d="M10 30 H54 Q52 54 32 54 Q12 54 10 30 Z" fill={g('bowl')} stroke="#136237" strokeWidth={2} strokeLinejoin="round" />
            <Ellipse cx={32} cy={30} rx={22} ry={4.6} fill="#BFF7CF" stroke="#136237" strokeWidth={2} />
            <Gloss cx={20} cy={40} rx={5} ry={2} rotate={-30} opacity={0.5} />
            <G transform="translate(14 28) rotate(90) scale(0.5) translate(-28 -31)">
              <Hand id="a" g={g} skin={SKIN_LIGHT} />
            </G>
            <G transform="translate(50 28) scale(-1 1) rotate(90) scale(0.5) translate(-28 -31)">
              <Hand id="b" g={g} skin={SKIN_DEEP} />
            </G>
            <Sparkle cx={32} cy={12} r={4.6} />
          </>
        ),
      };

    // ---- Object Transfer: a ball from one box to another ---------------------------------------------------
    case 'object-transfer':
      return {
        defs: <>{grad('l', '#8CC8FF', '#2A6FD6')}{grad('r', '#FFC58A', '#F08A2C')}{grad('ball', '#FF9A88', '#E4452E')}</>,
        art: (
          <>
            <Path d="M14 34 Q32 -2 50 34" stroke="#FFD84D" strokeWidth={2.8} strokeLinecap="round" strokeDasharray="0.1 5" fill="none" />
            <Path d="M45 27 L50 34.5 L56 28" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M3 38 H25 L23 56 Q22.6 58 20.6 58 H7.4 Q5.4 58 5 56 Z" fill={g('l')} stroke="#1B4AA0" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M39 38 H61 L59 56 Q58.6 58 56.6 58 H43.4 Q41.4 58 41 56 Z" fill={g('r')} stroke="#B25A12" strokeWidth={2} strokeLinejoin="round" />
            <Bead cx={32} cy={13} r={6.4} fill={g('ball')} ink="#9E2616" />
            <Bead cx={14} cy={44} r={4.2} fill="#FFE680" ink="#B97809" />
            <Sparkle cx={32} cy={52} r={3.4} />
          </>
        ),
      };

    // ---- Drawing & Colouring: a fat crayon and a scribble ---------------------------------------------------
    case 'drawing-colouring':
      return {
        defs: <>{grad('cr', '#FF9A88', '#E4452E')}</>,
        art: (
          <>
            <Path d="M4 52 Q10 40 16 52 T28 52 T40 52" stroke="#2A6FD6" strokeWidth={3.6} strokeLinecap="round" fill="none" />
            <Path d="M6 58 Q12 49 18 58 T30 58" stroke="#3EC878" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.9} />
            <G transform="translate(38 40) rotate(38)">
              <Rect x={-6} y={-30} width={12} height={36} rx={3} fill={g('cr')} stroke="#9E2616" strokeWidth={1.8} />
              <Rect x={-6} y={-22} width={12} height={9} fill="#FFFFFF" opacity={0.9} />
              <Path d="M-6 -22 H6 M-6 -13 H6" stroke="#9E2616" strokeWidth={1} />
              <Path d="M-6 6 L0 17 L6 6 Z" fill="#FF6B5A" stroke="#9E2616" strokeWidth={1.8} strokeLinejoin="round" />
              <Rect x={-4} y={-28} width={2.6} height={30} rx={1.3} fill="#FFFFFF" opacity={0.45} />
            </G>
            <Sparkle cx={10} cy={14} r={4.4} />
          </>
        ),
      };

    // ---- Writing Practice: lined paper and a pencil ---------------------------------------------------------
    case 'writing-practice':
      return {
        defs: <>{grad('paper', '#FFFFFF', '#E7EEFF')}</>,
        art: (
          <>
            <Rect x={5} y={8} width={42} height={50} rx={6} fill={g('paper')} stroke="#7F9BE0" strokeWidth={2} />
            <Path d="M11 22 H41 M11 32 H41 M11 42 H33" stroke="#9DB6E8" strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M11 26 Q15 17 19 26 M15 22.6 H17" stroke="#E0457F" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <PencilArt transform="translate(46 53) rotate(34)" tip={0} len={25} />
            <Sparkle cx={54} cy={10} r={4.4} />
          </>
        ),
      };

    // ---- Active Range of Motion: a rainbow arc and a ball -----------------------------------------------------
    case 'active-range':
      return {
        defs: null,
        art: (
          <>
            {([
              [26, '#FF6B6B', '#B5273A'],
              [19, '#FFD84D', '#B97809'],
              [12, '#4C9BEF', '#1B4AA0'],
            ] as const).map(([r, c, ink]) => (
              <G key={r}>
                <Path d={`M${32 - r} 50 A${r} ${r} 0 0 1 ${32 + r} 50`} stroke={ink} strokeWidth={8} strokeLinecap="round" fill="none" />
              </G>
            ))}
            {([
              [26, '#FF6B6B'],
              [19, '#FFD84D'],
              [12, '#4C9BEF'],
            ] as const).map(([r, c]) => (
              <Path key={`f${r}`} d={`M${32 - r} 50 A${r} ${r} 0 0 1 ${32 + r} 50`} stroke={c} strokeWidth={5} strokeLinecap="round" fill="none" />
            ))}
            <Path d="M32 24 Q44 24 52 36" stroke="#FFFFFF" strokeWidth={0} fill="none" />
            <Bead cx={32} cy={50} r={5} fill="#FFFFFF" ink="#8A97B8" />
            <Sparkle cx={55} cy={10} r={4.4} />
            <Sparkle cx={9} cy={14} r={3.2} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Stretching: a heart in a speech bubble (the therapist's words, not ours) -----------------------------------
    case 'therapist-stretching':
      return {
        defs: <>{grad('bubble', '#C9B0FF', '#7343D8')}{grad('heart', '#FFA3D0', '#E0457F')}</>,
        art: (
          <>
            <Path d="M10 8 H48 Q58 8 58 18 V36 Q58 46 48 46 H34 L22 57 V46 H10 Q4 46 4 36 V18 Q4 8 10 8 Z" fill={g('bubble')} stroke="#4A248F" strokeWidth={2} strokeLinejoin="round" />
            <Gloss cx={18} cy={14} rx={9} ry={2.2} rotate={0} opacity={0.4} />
            <Path d={HEART_PATH} fill={g('heart')} stroke="#A82A5E" strokeWidth={4.8} transform="translate(17 13) scale(0.48)" strokeLinejoin="round" />
            <Sparkle cx={53} cy={53} r={4} />
          </>
        ),
      };

    // ---- Gentle Movement: calm waves and a little boat -----------------------------------------------------------
    case 'gentle-movement':
      return {
        defs: <>{grad('hull', '#FF9A88', '#E4452E')}</>,
        art: (
          <>
            <Path d="M34 12 V34 L50 34 Z" fill="#FFFFFF" stroke="#8A97B8" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M32 12 V36" stroke="#8A97B8" strokeWidth={2} strokeLinecap="round" />
            <Path d="M14 36 H54 L48 45 H20 Z" fill={g('hull')} stroke="#9E2616" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M2 46 Q9 40 16 46 T30 46 T44 46 T58 46 T64 46" stroke="#1B7FA8" strokeWidth={6.4} strokeLinecap="round" fill="none" />
            <Path d="M2 46 Q9 40 16 46 T30 46 T44 46 T58 46 T64 46" stroke="#6FD3F2" strokeWidth={3.8} strokeLinecap="round" fill="none" />
            <Path d="M0 55 Q7 49 14 55 T28 55 T42 55 T56 55 T64 55" stroke="#1B7FA8" strokeWidth={6.4} strokeLinecap="round" fill="none" />
            <Path d="M0 55 Q7 49 14 55 T28 55 T42 55 T56 55 T64 55" stroke="#9AE4F8" strokeWidth={3.8} strokeLinecap="round" fill="none" />
            <Sparkle cx={52} cy={14} r={4.4} />
          </>
        ),
      };

    // ---- Relaxation: a crescent moon, a cloud and stars ------------------------------------------------------------
    case 'relaxation':
      return {
        defs: <>{grad('moon', '#FFF59A', '#FFB52E')}</>,
        art: (
          <>
            <Path d="M34 6 A24 24 0 1 0 58 36 A19 19 0 1 1 34 6 Z" fill={g('moon')} stroke="#C9831A" strokeWidth={2} strokeLinejoin="round" />
            <Gloss cx={21} cy={20} rx={4.4} ry={2} opacity={0.55} />
            <Path d="M30 54 Q24 54 24 49 Q24 44 30 44 Q32 38 39 40 Q42 36 47 40 Q54 40 54 47 Q54 54 47 54 Z" fill="#FFFFFF" stroke="#8A97B8" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d={starPath(50, 14, 5, 2.2)} fill="#FFE066" stroke="#C9961A" strokeWidth={1.2} strokeLinejoin="round" />
            <Sparkle cx={42} cy={26} r={3.2} />
            <Sparkle cx={57} cy={28} r={2.6} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Dressing Practice: a t-shirt ------------------------------------------------------------------------
    case 'dressing':
      return {
        defs: <>{grad('shirt', '#8CC8FF', '#2A6FD6')}</>,
        art: (
          <>
            <Path d="M21 8 L7 16 L13 29 L20 25 V57 H44 V25 L51 29 L57 16 L43 8 Q32 17 21 8 Z" fill={g('shirt')} stroke="#1B4AA0" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M21 8 Q32 17 43 8" stroke="#1B4AA0" strokeWidth={2} fill="none" strokeLinecap="round" />
            <Path d="M24 9.6 Q32 16 40 9.6" stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.85} />
            <Path d={starPath(32, 38, 8.2, 3.6)} fill="#FFE066" stroke="#C9961A" strokeWidth={1.6} strokeLinejoin="round" />
            <Gloss cx={25} cy={26} rx={3.4} ry={7} rotate={6} opacity={0.4} />
            <Sparkle cx={56} cy={46} r={4} />
          </>
        ),
      };

    // ---- Opening Containers: a lunchbox ---------------------------------------------------------------------------
    case 'containers':
      return {
        defs: <>{grad('body', '#8CC8FF', '#2A6FD6')}{grad('lid', '#B8DCFF', '#5CA8F2')}</>,
        art: (
          <>
            <Path d="M22 21 V15 Q22 10 27 10 H37 Q42 10 42 15 V21" stroke="#1B4AA0" strokeWidth={3.6} fill="none" strokeLinecap="round" />
            <Rect x={5} y={20} width={54} height={36} rx={8} fill={g('body')} stroke="#1B4AA0" strokeWidth={2} />
            <Rect x={5} y={20} width={54} height={14} rx={7} fill={g('lid')} stroke="#1B4AA0" strokeWidth={2} />
            <Rect x={26.5} y={29} width={11} height={10} rx={2.6} fill="#FFD84D" stroke="#B97809" strokeWidth={1.6} />
            <Circle cx={32} cy={34} r={1.6} fill="#B97809" />
            <Gloss cx={17} cy={26} rx={8} ry={1.8} rotate={0} opacity={0.6} />
            <Path d={starPath(16, 47, 4.4, 2)} fill="#FFE066" stroke="#C9961A" strokeWidth={1} strokeLinejoin="round" />
            <Sparkle cx={55} cy={9} r={4} />
          </>
        ),
      };

    // ---- School Tasks: a backpack with a pencil ------------------------------------------------------------------------
    case 'school-tasks':
      return {
        defs: <>{grad('pack', '#FFC58A', '#F08A2C')}{grad('pocket', '#FFE0B8', '#F6A851')}</>,
        art: (
          <>
            <Path d="M24 15 V11 Q24 7 28 7 H36 Q40 7 40 11 V15" stroke="#B25A12" strokeWidth={3.4} fill="none" strokeLinecap="round" />
            <Rect x={10} y={14} width={44} height={44} rx={14} fill={g('pack')} stroke="#B25A12" strokeWidth={2} />
            <Rect x={17} y={35} width={30} height={19} rx={6} fill={g('pocket')} stroke="#B25A12" strokeWidth={1.8} />
            <Path d="M23 40 H41" stroke="#B25A12" strokeWidth={2} strokeLinecap="round" strokeDasharray="3 2.6" />
            <Rect x={28} y={39} width={8} height={5} rx={2} fill="#FFD84D" stroke="#B97809" strokeWidth={1.2} />
            <PencilArt transform="translate(52 24) rotate(18)" tip={0} len={24} />
            <Gloss cx={21} cy={22} rx={5.4} ry={2.4} rotate={-30} opacity={0.5} />
            <Sparkle cx={9} cy={10} r={4} />
          </>
        ),
      };

    // ---- Self-Care Activities: a toothbrush and bubbles ---------------------------------------------------------------
    case 'self-care':
      return {
        defs: <>{grad('handle', '#8CC8FF', '#2A6FD6')}</>,
        art: (
          <>
            <G transform="translate(30 32) rotate(-38)">
              <Rect x={-4} y={-4} width={8} height={30} rx={4} fill={g('handle')} stroke="#1B4AA0" strokeWidth={1.8} />
              <Rect x={-5.4} y={-15} width={10.8} height={12} rx={3.2} fill="#FFFFFF" stroke="#1B4AA0" strokeWidth={1.6} />
              <Rect x={-4.4} y={-23} width={2.6} height={8.4} rx={1.3} fill="#FF9CCB" stroke="#A82A5E" strokeWidth={1} />
              <Rect x={-1.3} y={-24} width={2.6} height={9.4} rx={1.3} fill="#FFE27A" stroke="#B97809" strokeWidth={1} />
              <Rect x={1.8} y={-23} width={2.6} height={8.4} rx={1.3} fill="#6FD3F2" stroke="#1B7FA8" strokeWidth={1} />
              <Rect x={-1.8} y={4} width={3.6} height={16} rx={1.8} fill="#FFFFFF" opacity={0.5} />
            </G>
            <Bead cx={51} cy={16} r={6} fill="#EAFBFF" ink="#2A86A8" />
            <Bead cx={50} cy={42} r={7} fill="#EAFBFF" ink="#2A86A8" />
            <Bead cx={52} cy={20} r={3.8} fill="#EAFBFF" ink="#2A86A8" />
            <Bead cx={22} cy={52} r={3.2} fill="#EAFBFF" ink="#2A86A8" />
            <Sparkle cx={8} cy={40} r={3.6} />
          </>
        ),
      };
  }
}
