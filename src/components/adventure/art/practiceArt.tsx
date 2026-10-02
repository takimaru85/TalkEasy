import React from 'react';
import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Gloss, Sparkle, starPath, type Drawn, type Fill, type Grad } from './kit';
import { HEART_PATH } from './colorKit';

/**
 * The colourful illustrations for the Speech Practice activities, one per activity id.
 *
 * The sixteen below are drawn for this set; `rhythm`, `phrases`, `voice` and `stories` reuse a drum-and-
 * notes, speech-bubbles, megaphone and open-book drawing the app already has (see ColorArt), so there
 * is one of each in the app. Same rules as every TalkEasy drawing: a 64-unit grid, light from the
 * top-left, outlines in a darker shade of the object's own hue, a white gloss, a sparkle.
 */
export type PracticeArtName =
  | 'soundListen' | 'sounds' | 'matching' | 'soundSay' | 'imitation'
  | 'syllables' | 'soundSyllable'
  | 'words' | 'soundWord' | 'repetition' | 'pictureNaming'
  | 'soundPhrase'
  | 'sentences' | 'soundSentence' | 'questions' | 'soundChat';

const FONT = 'Nunito_900Black';
/** A puzzle piece with two knobs, drawn on a 64 grid (the same path GameIcon's Play drawing uses). */
const PIECE = 'M37 6 H43 A4.5 4.5 0 1 1 51 6 H56 V12 A4.5 4.5 0 1 0 56 20 V25 H37 Z';

function Block({ x, y, s, fill, ink, ch, rot = 0 }: { x: number; y: number; s: number; fill: string; ink: string; ch: string; rot?: number }) {
  return (
    <G transform={`rotate(${rot} ${x + s / 2} ${y + s / 2})`}>
      <Rect x={x} y={y} width={s} height={s} rx={4} fill={fill} stroke={ink} strokeWidth={2} />
      <SvgText x={x + s / 2} y={y + s * 0.72} fontSize={s * 0.66} fontFamily={FONT} fontWeight="900" fill="#FFFFFF" textAnchor="middle">
        {ch}
      </SvgText>
      <Gloss cx={x + s * 0.3} cy={y + s * 0.16} rx={s * 0.2} ry={1.4} rotate={0} opacity={0.6} />
    </G>
  );
}

export function drawPractice(name: PracticeArtName, grad: Grad, g: Fill): Drawn {
  switch (name) {
    // ---- Hear the Sound: an ear and sound waves -------------------------------------------------------------
    case 'soundListen':
      return {
        defs: <>{grad('ear', '#FFE3C8', '#F2AE82')}</>,
        art: (
          <>
            <Path
              d="M26 8 C15 8 10 18 11 29 C12 40 18 46 22 52 C26 58 35 57 37 49 C38 44 34 42 37 38 C43 33 47 28 47 21 C47 13 39 8 26 8 Z"
              fill={g('ear')}
              stroke="#B97A4E"
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            <Path d="M24 20 C17 20 17 30 23 33 C27 35 29 38 27 43" stroke="#D9895C" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <Path d="M30 24 C34 24 36 28 33 31" stroke="#D9895C" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.8} />
            <Gloss cx={21} cy={15} rx={5} ry={2} rotate={-30} opacity={0.6} />
            <Path d="M50 22 Q56 32 50 42" stroke="#FFD84D" strokeWidth={3.8} strokeLinecap="round" fill="none" />
            <Path d="M55 15 Q65 32 55 49" stroke="#5BD98A" strokeWidth={3.8} strokeLinecap="round" fill="none" />
            <Sparkle cx={9} cy={10} r={4.4} />
          </>
        ),
      };

    // ---- Sounds: a colourful waveform ------------------------------------------------------------------------
    case 'sounds':
      return {
        defs: null,
        art: (
          <>
            {[
              [8, 12, '#FF6B8A', '#B5273A'], [14.5, 24, '#FFB52E', '#B97809'], [21, 36, '#5BD98A', '#1F8A4B'], [27.5, 48, '#4C9BEF', '#1B4AA0'],
              [34, 34, '#B694FF', '#5B3BC0'], [40.5, 42, '#FF8FC0', '#A82A5E'], [47, 22, '#FFD84D', '#B97809'], [53.5, 30, '#4FDCCE', '#0A5F58'], [60, 14, '#FF9C5B', '#C25A1A'],
            ].map(([x, h, f, ink], i) => (
              <G key={i}>
                <Rect x={(x as number) - 2.6} y={32 - (h as number) / 2} width={5.2} height={h as number} rx={2.6} fill={f as string} stroke={ink as string} strokeWidth={1.4} />
                <Rect x={(x as number) - 1.2} y={34 - (h as number) / 2} width={1.6} height={Math.max(2, (h as number) * 0.4)} rx={0.8} fill="#FFFFFF" opacity={0.6} />
              </G>
            ))}
            <Sparkle cx={8} cy={8} r={4} />
          </>
        ),
      };

    // ---- Sound Matching: two puzzle pieces ---------------------------------------------------------------------
    case 'matching':
      return {
        defs: <>{grad('a', '#FF9CC4', '#E0457F')}{grad('b', '#8CC8FF', '#2A6FD6')}</>,
        art: (
          <>
            <Path d={PIECE} transform="translate(80 60) scale(-1.35 -1.35)" fill={g('a')} stroke="#A82A5E" strokeWidth={1.7} strokeLinejoin="round" />
            <Path d={PIECE} transform="translate(-16 3) scale(1.35)" fill={g('b')} stroke="#1B4AA0" strokeWidth={1.7} strokeLinejoin="round" />
            <Gloss cx={42} cy={14} rx={6} ry={2} rotate={0} opacity={0.5} />
            <Gloss cx={21} cy={50} rx={6} ry={2} rotate={0} opacity={0.5} />
            <Sparkle cx={55} cy={52} r={4} />
          </>
        ),
      };

    // ---- Say the Sound: an open mouth and sound waves ---------------------------------------------------------
    case 'soundSay':
      return {
        defs: <>{grad('lip', '#FF8FA8', '#D8365A')}</>,
        art: (
          <>
            <Path d="M7 29 Q30 5 53 29 Q50 55 30 55 Q10 55 7 29 Z" fill={g('lip')} stroke="#8A1A38" strokeWidth={2.2} strokeLinejoin="round" />
            <Path d="M14 31 Q30 17 46 31 Q43 48 30 48 Q17 48 14 31 Z" fill="#5E0F2A" />
            <Path d="M17 30 Q30 20 43 30 L41 35 Q30 28 19 35 Z" fill="#FFFFFF" />
            <Ellipse cx={30} cy={44} rx={9} ry={4.6} fill="#FF7A98" />
            <Gloss cx={20} cy={17} rx={6} ry={2.2} rotate={-20} opacity={0.55} />
            <Path d="M55 23 Q60 32 55 41" stroke="#FFD84D" strokeWidth={3.4} strokeLinecap="round" fill="none" />
            <Path d="M58.4 17 Q64.4 32 58.4 47" stroke="#FFC531" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.9} />
          </>
        ),
      };

    // ---- Imitation: a hand mirror with a smiling reflection ---------------------------------------------------
    case 'imitation':
      return {
        defs: <>{grad('glass', '#E8FAFF', '#8FD6F0')}{grad('rim', '#FF9CC4', '#E0457F')}</>,
        art: (
          <>
            <Path d="M35 40 L50 58" stroke="#A82A5E" strokeWidth={10} strokeLinecap="round" />
            <Path d="M35 40 L50 58" stroke={g('rim')} strokeWidth={6.4} strokeLinecap="round" />
            <Circle cx={27} cy={26} r={20} fill={g('rim')} stroke="#A82A5E" strokeWidth={2} />
            <Circle cx={27} cy={26} r={15.5} fill={g('glass')} stroke="#2A86A8" strokeWidth={1.6} />
            <Circle cx={21.5} cy={22} r={2} fill="#27325F" />
            <Circle cx={32.5} cy={22} r={2} fill="#27325F" />
            <Path d="M20 30 Q27 37 34 30" stroke="#27325F" strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Path d="M17 14 Q22 10 28 10" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} />
            <Sparkle cx={56} cy={14} r={4.4} />
          </>
        ),
      };

    // ---- Syllables: two letter blocks side by side -------------------------------------------------------------
    case 'syllables':
      return {
        defs: <>{grad('r', '#FF9A88', '#E4452E')}{grad('b', '#86C3FF', '#2A6FD6')}</>,
        art: (
          <>
            <Block x={4} y={22} s={26} fill={g('r')} ink="#9E2616" ch="B" rot={-6} />
            <Block x={34} y={22} s={26} fill={g('b')} ink="#1B4AA0" ch="A" rot={5} />
            <Path d="M26 54 Q32 60 38 54" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Sparkle cx={32} cy={10} r={4.8} />
            <Sparkle cx={57} cy={12} r={3.2} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Sound and Vowel: a consonant plus a vowel -------------------------------------------------------------------
    case 'soundSyllable':
      return {
        defs: <>{grad('r', '#FF9A88', '#E4452E')}{grad('b', '#86C3FF', '#2A6FD6')}{grad('y', '#FFE680', '#F4A51C')}</>,
        art: (
          <>
            <Block x={3} y={20} s={24} fill={g('r')} ink="#9E2616" ch="B" />
            <Block x={37} y={20} s={24} fill={g('b')} ink="#1B4AA0" ch="A" />
            <Circle cx={32} cy={32} r={7} fill={g('y')} stroke="#B97809" strokeWidth={1.8} />
            <Path d="M32 28 V36 M28 32 H36" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" />
            <Path d="M10 52 Q32 62 54 52" stroke="#5BD98A" strokeWidth={3.4} strokeLinecap="round" fill="none" />
            <Sparkle cx={54} cy={10} r={4.2} />
          </>
        ),
      };

    // ---- Words: picture cards -----------------------------------------------------------------------------------------
    case 'words':
      return {
        defs: <>{grad('card', '#FFFFFF', '#EAF3FF')}{grad('apple', '#FF8E7C', '#D8362A')}</>,
        art: (
          <>
            <Rect x={12} y={10} width={38} height={44} rx={6} fill="#B8DCFF" stroke="#2A6FD6" strokeWidth={2} transform="rotate(-10 31 32)" />
            <Rect x={14} y={8} width={38} height={44} rx={6} fill="#FFE0A8" stroke="#C9831A" strokeWidth={2} transform="rotate(7 33 30)" />
            <Rect x={10} y={10} width={42} height={46} rx={7} fill={g('card')} stroke="#2A6FD6" strokeWidth={2.2} />
            <Path d="M31 22 Q31 17 35 16" stroke="#7A4A1E" strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Path d="M33 18 Q40 14 41 19 Q36 21 33 18 Z" fill="#5BD98A" stroke="#1F8A4B" strokeWidth={1.2} />
            <Path d="M31 24 C25 20 17 26 19 34 C20 41 25 44 29 42 C30 41.5 32 41.5 33 42 C37 44 42 41 43 34 C45 26 37 20 31 24 Z" fill={g('apple')} stroke="#8A1A14" strokeWidth={1.8} strokeLinejoin="round" />
            <Gloss cx={25} cy={30} rx={2.6} ry={1.4} rotate={-40} opacity={0.7} />
            <Path d="M17 49 H45" stroke="#9DB6E8" strokeWidth={2.4} strokeLinecap="round" />
            <Sparkle cx={56} cy={12} r={4.2} />
          </>
        ),
      };

    // ---- Sound in a Word: a word with its first sound lit -------------------------------------------------------------
    case 'soundWord':
      return {
        defs: <>{grad('card', '#FFFFFF', '#E6F6EC')}</>,
        art: (
          <>
            <Rect x={3} y={17} width={58} height={32} rx={8} fill={g('card')} stroke="#1F8A4B" strokeWidth={2.2} />
            <SvgText x={17} y={42} fontSize={25} fontFamily={FONT} fontWeight="900" fill="#FF5D6C" stroke="#B5273A" strokeWidth={0.8} textAnchor="middle">
              b
            </SvgText>
            <SvgText x={42} y={42} fontSize={25} fontFamily={FONT} fontWeight="900" fill="#2F7BE0" textAnchor="middle">
              all
            </SvgText>
            <Path d="M10 21 H24" stroke="#FFD84D" strokeWidth={3} strokeLinecap="round" />
            <Path d="M52 8 Q57 14 52 20" stroke="#5BD98A" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Path d="M57 3 Q65 14 57 25" stroke="#3EC8B8" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <Gloss cx={14} cy={23} rx={6} ry={1.4} rotate={0} opacity={0.7} />
          </>
        ),
      };

    // ---- Word Repetition: round-and-round arrows around a speech bubble ----------------------------------------------
    case 'repetition':
      return {
        defs: <>{grad('bub', '#9AD0FF', '#2A6FD6')}</>,
        art: (
          <>
            <Path d="M10 30 A22 22 0 0 1 44 12" stroke="#1F8A4B" strokeWidth={8} strokeLinecap="round" fill="none" />
            <Path d="M10 30 A22 22 0 0 1 44 12" stroke="#5BD98A" strokeWidth={5} strokeLinecap="round" fill="none" />
            <Path d="M38 6 L47 12 L39 19" stroke="#1F8A4B" strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M54 34 A22 22 0 0 1 20 52" stroke="#B97809" strokeWidth={8} strokeLinecap="round" fill="none" />
            <Path d="M54 34 A22 22 0 0 1 20 52" stroke="#FFD84D" strokeWidth={5} strokeLinecap="round" fill="none" />
            <Path d="M26 58 L17 52 L25 45" stroke="#B97809" strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M22 22 H42 Q47 22 47 27 V36 Q47 41 42 41 H36 L30 47 V41 H22 Q17 41 17 36 V27 Q17 22 22 22 Z" fill={g('bub')} stroke="#1B4AA0" strokeWidth={1.8} strokeLinejoin="round" />
            <Circle cx={25} cy={31.5} r={1.9} fill="#FFFFFF" />
            <Circle cx={32} cy={31.5} r={1.9} fill="#FFFFFF" />
            <Circle cx={39} cy={31.5} r={1.9} fill="#FFFFFF" />
          </>
        ),
      };

    // ---- Picture Naming: a framed picture with its caption ---------------------------------------------------------------
    case 'pictureNaming':
      return {
        defs: <>{grad('sky', '#BDE6FF', '#7CC4F2')}{grad('hill', '#86E89A', '#2FA85C')}{grad('frame', '#F2C48A', '#C98A3E')}</>,
        art: (
          <>
            <Rect x={4} y={6} width={56} height={42} rx={7} fill={g('frame')} stroke="#7A4A1E" strokeWidth={2} />
            <Rect x={9} y={11} width={46} height={32} rx={3} fill={g('sky')} stroke="#2A86A8" strokeWidth={1.4} />
            <Circle cx={22} cy={22} r={5.6} fill="#FFE066" stroke="#C9831A" strokeWidth={1.4} />
            <Path d="M9 43 Q22 28 34 36 Q44 30 55 38 V43 Z" fill={g('hill')} stroke="#1B7A3C" strokeWidth={1.4} strokeLinejoin="round" />
            <Rect x={14} y={51} width={36} height={8} rx={4} fill="#FFFFFF" stroke="#9DB6E8" strokeWidth={1.6} />
            <Path d="M19 55 H31" stroke="#E0457F" strokeWidth={2.4} strokeLinecap="round" />
            <Path d="M34 55 H44" stroke="#9DB6E8" strokeWidth={2.4} strokeLinecap="round" />
            <Sparkle cx={56} cy={52} r={3.6} />
          </>
        ),
      };

    // ---- Sound in a Phrase: a bubble with two word chips, the first lit ------------------------------------------------
    case 'soundPhrase':
      return {
        defs: <>{grad('bub', '#FFCB7A', '#F08A2C')}</>,
        art: (
          <>
            <Path d="M10 10 H54 Q61 10 61 17 V35 Q61 42 54 42 H34 L22 54 V42 H10 Q3 42 3 35 V17 Q3 10 10 10 Z" fill={g('bub')} stroke="#B25A12" strokeWidth={2} strokeLinejoin="round" />
            <Rect x={9} y={19} width={20} height={14} rx={7} fill="#FFE066" stroke="#C9961A" strokeWidth={1.6} />
            <Rect x={33} y={19} width={22} height={14} rx={7} fill="#FFFFFF" />
            <Path d="M14 26 H24" stroke="#C9831A" strokeWidth={2.4} strokeLinecap="round" />
            <Path d="M38 26 H50" stroke="#F4B88A" strokeWidth={2.4} strokeLinecap="round" />
            <Gloss cx={18} cy={14} rx={8} ry={1.8} rotate={0} opacity={0.5} />
            <Sparkle cx={56} cy={52} r={4} />
          </>
        ),
      };

    // ---- Sentence Building: blocks in a row --------------------------------------------------------------------------------
    case 'sentences':
      return {
        defs: <>{grad('a', '#FF9A88', '#E4452E')}{grad('b', '#FFE680', '#F4A51C')}{grad('c', '#86C3FF', '#2A6FD6')}{grad('d', '#9CF2B5', '#2FB863')}{grad('e', '#C9B0FF', '#7343D8')}</>,
        art: (
          <>
            {[
              [3, 14, 18, 'a', '#9E2616'], [24, 14, 20, 'b', '#B97809'], [47, 14, 14, 'c', '#1B4AA0'],
              [3, 36, 26, 'd', '#136237'], [32, 36, 22, 'e', '#4A248F'],
            ].map(([x, y, w, id, ink], i) => (
              <G key={i}>
                <Rect x={x as number} y={y as number} width={w as number} height={18} rx={5} fill={g(id as string)} stroke={ink as string} strokeWidth={1.8} />
                <Path d={`M${(x as number) + 5} ${(y as number) + 9} H${(x as number) + (w as number) - 5}`} stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />
              </G>
            ))}
            <Circle cx={58} cy={52} r={3.2} fill="#FFD84D" stroke="#B97809" strokeWidth={1.4} />
            <Sparkle cx={10} cy={8} r={3.6} />
            <Sparkle cx={55} cy={8} r={3} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Sound in a Sentence: a long bubble with a word lit --------------------------------------------------------------
    case 'soundSentence':
      return {
        defs: <>{grad('bub', '#C9B0FF', '#7343D8')}</>,
        art: (
          <>
            <Path d="M10 8 H54 Q61 8 61 15 V41 Q61 48 54 48 H32 L20 59 V48 H10 Q3 48 3 41 V15 Q3 8 10 8 Z" fill={g('bub')} stroke="#4A248F" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M10 19 H38" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" />
            <Path d="M10 29 H20" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" />
            <Rect x={23} y={25} width={16} height={8} rx={4} fill="#FFE066" stroke="#C9961A" strokeWidth={1.4} />
            <Path d="M43 29 H54" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" />
            <Path d="M10 39 H34" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" />
            <Gloss cx={18} cy={12.5} rx={9} ry={1.6} rotate={0} opacity={0.45} />
            <Sparkle cx={57} cy={55} r={3.8} />
          </>
        ),
      };

    // ---- WH Questions: a question mark in a bubble ---------------------------------------------------------------------------
    case 'questions':
      return {
        defs: <>{grad('bub', '#7BE8DA', '#0E9E93')}</>,
        art: (
          <>
            <Path d="M12 6 H52 Q60 6 60 14 V38 Q60 46 52 46 H36 L24 58 V46 H12 Q4 46 4 38 V14 Q4 6 12 6 Z" fill={g('bub')} stroke="#0A5F58" strokeWidth={2} strokeLinejoin="round" />
            <SvgText x={32} y={39} fontSize={38} fontFamily={FONT} fontWeight="900" fill="#FFFFFF" stroke="#0A5F58" strokeWidth={1.2} textAnchor="middle">
              ?
            </SvgText>
            <Gloss cx={18} cy={12} rx={8} ry={1.8} rotate={0} opacity={0.5} />
            <Sparkle cx={57} cy={54} r={4} />
          </>
        ),
      };

    // ---- Sound in a Chat: two chat bubbles, one with a heart ----------------------------------------------------------------
    case 'soundChat':
      return {
        defs: <>{grad('a', '#7BE8DA', '#0E9E93')}{grad('b', '#FFB3D6', '#E0457F')}</>,
        art: (
          <>
            <Path d="M9 8 H35 Q42 8 42 15 V28 Q42 35 35 35 H22 L13 44 V35 H9 Q2 35 2 28 V15 Q2 8 9 8 Z" fill={g('a')} stroke="#0A5F58" strokeWidth={2} strokeLinejoin="round" />
            <Circle cx={12} cy={21.5} r={2.4} fill="#FFFFFF" />
            <Circle cx={21} cy={21.5} r={2.4} fill="#FFFFFF" />
            <Circle cx={30} cy={21.5} r={2.4} fill="#FFFFFF" />
            <Path d="M30 26 H56 Q62 26 62 32 V46 Q62 52 56 52 H54 V60 L46 52 H30 Q24 52 24 46 V32 Q24 26 30 26 Z" fill={g('b')} stroke="#A82A5E" strokeWidth={2} strokeLinejoin="round" />
            <Path d={HEART_PATH} fill="#FFFFFF" transform="translate(35 32) scale(0.28)" />
            <Gloss cx={12} cy={12} rx={6} ry={1.6} rotate={0} opacity={0.5} />
            <Path d={starPath(54, 12, 5, 2.2)} fill="#FFE066" stroke="#C9961A" strokeWidth={1} strokeLinejoin="round" />
          </>
        ),
      };
  }
}
