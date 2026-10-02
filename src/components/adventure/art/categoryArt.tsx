import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Ball, Gloss, INK, Sparkle, starPath, type Drawn, type Fill, type Grad } from './kit';

/**
 * The colourful category illustrations for the Activities list (and the Therapy entry above it).
 *
 * The same rules as every other TalkEasy drawing (see kit.tsx): a 64-unit grid with the object
 * filling about 4..60, light from the top-left, outlines in a DARKER SHADE OF THE OBJECT'S OWN HUE
 * (never black), a white gloss, a sparkle as the accent, round and friendly. They replace the stock
 * single-colour Material glyphs that made this list look like a settings screen.
 *
 * Games is not here: it reuses the existing controller drawing in GameIcon, so there is one
 * controller in the app, not two.
 */
export type CategoryArtName = 'art' | 'music' | 'exercise' | 'reading' | 'outdoor' | 'sensory' | 'chores' | 'therapy';

/** An open hand, drawn on the 64 grid with its centre near (28, 31). Skin is a [light, dark, outline] set. */
export function Hand({ id, g, skin }: { id: string; g: Fill; skin: readonly [string, string, string] }) {
  const parts = [
    { x: 18, y: 30, w: 28, h: 24, r: 11 }, // palm
    { x: 18, y: 12, w: 7, h: 26, r: 3.5 }, // index
    { x: 26, y: 8, w: 7, h: 30, r: 3.5 }, // middle
    { x: 34, y: 11, w: 7, h: 27, r: 3.5 }, // ring
    { x: 42, y: 18, w: 6, h: 20, r: 3 }, // little
  ];
  const thumb = { x: 8, y: 33, w: 7.5, h: 20, r: 3.75 };
  return (
    <G>
      {/* the outline first, as one fat silhouette, so overlapping fingers share a single edge */}
      {parts.map((p, i) => (
        <Rect key={`o${i}`} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r} fill={skin[2]} stroke={skin[2]} strokeWidth={4.6} strokeLinejoin="round" />
      ))}
      <Rect x={thumb.x} y={thumb.y} width={thumb.w} height={thumb.h} rx={thumb.r} fill={skin[2]} stroke={skin[2]} strokeWidth={4.6} transform="rotate(-32 11.75 43)" />
      {parts.map((p, i) => (
        <Rect key={`f${i}`} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r} fill={g(id)} />
      ))}
      <Rect x={thumb.x} y={thumb.y} width={thumb.w} height={thumb.h} rx={thumb.r} fill={g(id)} transform="rotate(-32 11.75 43)" />
      <Gloss cx={27} cy={38} rx={7} ry={3} rotate={-20} opacity={0.45} />
      <Path d="M27 14 V24 M34 12 V22" stroke={skin[1]} strokeWidth={1.2} strokeLinecap="round" opacity={0.35} />
    </G>
  );
}

export const SKIN_LIGHT = ['#FFE3C8', '#F5B98F', '#B97A4E'] as const;
export const SKIN_DEEP = ['#E8B48A', '#B87648', '#7A4A26'] as const;

/** One drawing per category. `grad`/`g` come from the wrapper, which owns the per-instance ids. */
export function drawCategory(name: CategoryArtName, grad: Grad, g: Fill): Drawn {
  switch (name) {
    // ---- Art: a paint palette with a brush -------------------------------------------------------
    case 'art':
      return {
        defs: (
          <>
            {grad('pal', '#FFF6E0', '#F2C27A')}
            {grad('brush', '#FF9CCB', '#E0457F')}
            {grad('bristle', '#7FB0FF', '#2F62D8')}
          </>
        ),
        art: (
          <>
            <Path
              d="M30 8 C14 8 5 19 5 31 C5 45 16 55 29 55 C34 55 36 52 35 48 C34 44 37 41 42 41 L48 41 C55 41 59 36 59 29 C59 17 47 8 30 8 Z"
              fill={g('pal')}
              stroke="#B9772E"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <Ellipse cx={21} cy={43} rx={4.4} ry={3.4} fill="#8A5622" opacity={0.55} />
            {[
              [16, 23, '#FF5D6C', '#B5273A'],
              [27, 15.5, '#FFD84D', '#C9961A'],
              [39, 16, '#5BD98A', '#1F8A4B'],
              [11.5, 36, '#5BAEFF', '#1F5FB8'],
            ].map(([cx, cy, fill, ink], i) => (
              <G key={i}>
                <Circle cx={cx as number} cy={cy as number} r={4.8} fill={fill as string} stroke={ink as string} strokeWidth={1.8} />
                <Ellipse cx={(cx as number) - 1.4} cy={(cy as number) - 1.6} rx={1.7} ry={1} fill="#FFFFFF" opacity={0.75} />
              </G>
            ))}
            <Gloss cx={18} cy={13} rx={8} ry={2.8} opacity={0.5} />
            <G transform="translate(41 42) rotate(40)">
              <Rect x={-2.4} y={-21} width={4.8} height={23} rx={2.4} fill={g('brush')} stroke="#A82A5E" strokeWidth={1.6} />
              <Rect x={-3} y={1.5} width={6} height={6.5} rx={1.2} fill="#E9EEF8" stroke="#8A97AD" strokeWidth={1.4} />
              <Path d="M-3 8 Q-3.4 15 0 18.5 Q3.4 15 3 8 Z" fill={g('bristle')} stroke="#1F4FB8" strokeWidth={1.4} strokeLinejoin="round" />
            </G>
            <Sparkle cx={55} cy={9} r={4.5} />
          </>
        ),
      };

    // ---- Music: two beamed notes -----------------------------------------------------------------
    case 'music':
      return {
        defs: (
          <>
            {grad('head', '#FF9CCB', '#E0457F')}
            {grad('stem', '#FFE27A', '#F4A51C')}
          </>
        ),
        art: (
          <>
            <Path d="M26 15 L50.5 10 V19 L26 24 Z" fill={g('stem')} stroke="#B97809" strokeWidth={1.8} strokeLinejoin="round" />
            <Rect x={25} y={15} width={4.2} height={31} rx={2} fill={g('stem')} stroke="#B97809" strokeWidth={1.6} />
            <Rect x={47} y={10} width={4.2} height={31} rx={2} fill={g('stem')} stroke="#B97809" strokeWidth={1.6} />
            <Ellipse cx={19.5} cy={46} rx={9} ry={6.6} fill={g('head')} stroke="#A82A5E" strokeWidth={2} transform="rotate(-22 19.5 46)" />
            <Ellipse cx={41.5} cy={41.5} rx={9} ry={6.6} fill={g('head')} stroke="#A82A5E" strokeWidth={2} transform="rotate(-22 41.5 41.5)" />
            <Gloss cx={16.5} cy={43.5} rx={3.8} ry={1.9} rotate={-30} opacity={0.6} />
            <Gloss cx={38.5} cy={39} rx={3.8} ry={1.9} rotate={-30} opacity={0.6} />
            <Sparkle cx={9} cy={14} r={4.5} />
            <Sparkle cx={56} cy={30} r={3.6} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Exercise: a fast, friendly sneaker --------------------------------------------------------
    case 'exercise':
      return {
        defs: (
          <>
            {grad('shoe', '#8DF5B0', '#1FA354')}
            {grad('sole', '#FFFFFF', '#D3DBEE')}
          </>
        ),
        art: (
          <>
            <Path d="M2 27 H9 M0 35 H7 M3 43 H9" stroke="#FFD84D" strokeWidth={2.8} strokeLinecap="round" />
            <Path
              d="M10 46 V24 Q10 20 14 20 H25 Q29 20 32 24 L37 29 Q41 33 48 34 L55 36 Q60 38 60 44 V46 Z"
              fill={g('shoe')}
              stroke="#136237"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <Path d="M46 34.5 Q60 37 60 45 H44 Q49 41 46 34.5 Z" fill="#FFFFFF" opacity={0.92} />
            <Path d="M13 20 Q15 13.5 23 14.5 L27 20 Z" fill="#1FA354" stroke="#136237" strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M21 25.5 L27 23 M25 29.5 L31 27 M29.5 33.5 L35 31" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" />
            <Path d="M14 40 Q26 35 40 41" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" fill="none" />
            <Path d="M8 46 H60 V49.5 Q60 54 55 54 H13 Q8 54 8 49.5 Z" fill={g('sole')} stroke="#8A97B8" strokeWidth={2} strokeLinejoin="round" />
            <Gloss cx={19} cy={27} rx={4.6} ry={2} opacity={0.5} />
            <Sparkle cx={54} cy={14} r={5} />
          </>
        ),
      };

    // ---- Reading: an open book with colourful pages ------------------------------------------------
    case 'reading':
      return {
        defs: (
          <>
            {grad('cover', '#7BBBFF', '#2A6FD6')}
            {grad('page', '#FFFFFF', '#E8EFFF')}
          </>
        ),
        art: (
          <>
            <Path d="M4 20 Q32 9 60 20 V52 Q32 44 4 52 Z" fill={g('cover')} stroke="#1B4AA0" strokeWidth={2} strokeLinejoin="round" />
            <Path d="M8 21 Q20 15 31 22 V48 Q20 42 8 47 Z" fill={g('page')} stroke="#9DB6E8" strokeWidth={1.2} />
            <Path d="M33 22 Q44 15 56 21 V47 Q44 42 33 48 Z" fill={g('page')} stroke="#9DB6E8" strokeWidth={1.2} />
            <Path d="M12 28 Q19 25 27 29" stroke="#FF7BB8" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M12 34 Q19 31 27 35" stroke="#5BD98A" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M12 40 Q19 37 24 40.5" stroke="#5BAEFF" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M37 29 Q45 25 52 29" stroke="#FFC531" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M37 35 Q45 31 52 35" stroke="#B694FF" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M37 41 Q44 38 49 41.5" stroke="#FF9C5B" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M32 22 V48" stroke="#1B4AA0" strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M44 12 V26 L47.5 22.5 L51 26 V13.5 Z" fill="#FF5D6C" stroke="#B5273A" strokeWidth={1.6} strokeLinejoin="round" />
            <Gloss cx={14} cy={17} rx={6} ry={2.2} opacity={0.4} />
            <Sparkle cx={10} cy={10} r={4.5} />
            <Sparkle cx={57} cy={7} r={3.4} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Outdoor: sun, hill and a round tree --------------------------------------------------------
    case 'outdoor':
      return {
        defs: (
          <>
            {grad('sun', '#FFF59A', '#FFB52E')}
            {grad('hill', '#86E89A', '#2FA85C')}
            {grad('crown', '#6BDD8E', '#1E9650')}
            {grad('trunk', '#D49A60', '#8A5622')}
          </>
        ),
        art: (
          <>
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              return (
                <Path
                  key={i}
                  d={`M${(21 + 12.5 * Math.cos(a)).toFixed(1)} ${(22 + 12.5 * Math.sin(a)).toFixed(1)} L${(21 + 16.5 * Math.cos(a)).toFixed(1)} ${(22 + 16.5 * Math.sin(a)).toFixed(1)}`}
                  stroke="#FFC531"
                  strokeWidth={2.8}
                  strokeLinecap="round"
                />
              );
            })}
            <Circle cx={21} cy={22} r={9.5} fill={g('sun')} stroke="#C9831A" strokeWidth={2} />
            <Gloss cx={18} cy={18.5} rx={3.6} ry={2} opacity={0.6} />
            <Path d="M2 57 Q16 36 32 43 Q48 36 62 57 Z" fill={g('hill')} stroke="#1B7A3C" strokeWidth={2} strokeLinejoin="round" />
            <Rect x={45} y={32} width={5.4} height={15} rx={2.2} fill={g('trunk')} stroke="#6B3E1A" strokeWidth={1.6} />
            <Circle cx={47.7} cy={25} r={10} fill={g('crown')} stroke="#136237" strokeWidth={2} />
            <Gloss cx={44.5} cy={21} rx={4} ry={2.2} opacity={0.5} />
            <Circle cx={14} cy={50} r={2.4} fill="#FF8FC0" stroke="#B8306E" strokeWidth={1.2} />
            <Circle cx={26} cy={52} r={2.4} fill="#FFE066" stroke="#C9961A" strokeWidth={1.2} />
            <Sparkle cx={56} cy={9} r={3.6} />
          </>
        ),
      };

    // ---- Sensory: an open hand with colourful things to touch ---------------------------------------
    case 'sensory':
      return {
        defs: (
          <>
            {grad('skin', SKIN_LIGHT[0], SKIN_LIGHT[1])}
            {grad('b1', '#FFB3D6', '#E0457F')}
            {grad('b2', '#9AD0FF', '#2F7BE0')}
            {grad('b3', '#FFF08A', '#F4A51C')}
          </>
        ),
        art: (
          <>
            <G transform="translate(5 3)">
              <Hand id="skin" g={g} skin={SKIN_LIGHT} />
            </G>
            {[
              [10, 13, 5.6, 'b1', '#A82A5E'],
              [55, 13, 5, 'b2', '#1F4FB8'],
              [57.5, 36, 4.4, 'b3', '#B97809'],
            ].map(([cx, cy, r, id, ink], i) => (
              <G key={i}>
                <Circle cx={cx as number} cy={cy as number} r={r as number} fill={g(id as string)} stroke={ink as string} strokeWidth={1.8} />
                <Ellipse cx={(cx as number) - (r as number) * 0.35} cy={(cy as number) - (r as number) * 0.4} rx={(r as number) * 0.3} ry={(r as number) * 0.18} fill="#FFFFFF" opacity={0.8} transform={`rotate(-30 ${(cx as number) - (r as number) * 0.35} ${(cy as number) - (r as number) * 0.4})`} />
              </G>
            ))}
            <Sparkle cx={8} cy={30} r={3.4} color="#8BF0FF" />
          </>
        ),
      };

    // ---- Chores: a toy box with toys peeking out ----------------------------------------------------
    case 'chores':
      return {
        defs: (
          <>
            {grad('bin', '#78BEFF', '#2A6FD6')}
            {grad('rim', '#9AD2FF', '#4C9BEF')}
            {grad('bear', '#E2AC72', '#A86B35')}
          </>
        ),
        art: (
          <>
            {/* toys first, so the box rim covers their lower halves */}
            <Circle cx={18.5} cy={14} r={3.2} fill={g('bear')} stroke="#6B3E1A" strokeWidth={1.5} />
            <Circle cx={30.5} cy={14} r={3.2} fill={g('bear')} stroke="#6B3E1A" strokeWidth={1.5} />
            <Circle cx={24.5} cy={21} r={8} fill={g('bear')} stroke="#6B3E1A" strokeWidth={1.8} />
            <Ellipse cx={24.5} cy={23.8} rx={3.8} ry={3} fill="#F7DDB6" />
            <Circle cx={21.4} cy={19.6} r={1.1} fill={INK} />
            <Circle cx={27.6} cy={19.6} r={1.1} fill={INK} />
            <Ellipse cx={24.5} cy={22.6} rx={1.3} ry={0.9} fill={INK} />
            <Ball cx={43} cy={22} r={7.4} from="#FF8E7C" ink="#C2402C" />
            <Rect x={47} y={11} width={8.5} height={8.5} rx={1.6} fill="#FFD84D" stroke="#C9961A" strokeWidth={1.6} transform="rotate(14 51 15)" />
            <Path d="M9 31 H55 L51 55 Q50.6 57.5 48 57.5 H16 Q13.4 57.5 13 55 Z" fill={g('bin')} stroke="#1B4AA0" strokeWidth={2} strokeLinejoin="round" />
            <Rect x={6} y={27} width={52} height={8.5} rx={3.8} fill={g('rim')} stroke="#1B4AA0" strokeWidth={2} />
            <Path d={starPath(32, 46.5, 7.6, 3.4)} fill="#FFE066" stroke="#C9961A" strokeWidth={1.6} strokeLinejoin="round" />
            <Gloss cx={18} cy={30.5} rx={7} ry={1.6} rotate={0} opacity={0.5} />
            <Sparkle cx={57} cy={9} r={3.6} />
          </>
        ),
      };

    // ---- Therapy: two open hands and a star (nothing that implies how a child moves) ----------------
    case 'therapy':
      return {
        defs: (
          <>
            {grad('skinA', SKIN_LIGHT[0], SKIN_LIGHT[1])}
            {grad('skinB', SKIN_DEEP[0], SKIN_DEEP[1])}
            {grad('star', '#FFF08A', '#FFB52E')}
          </>
        ),
        art: (
          <>
            <G transform="translate(1 17) rotate(-14 24 30) scale(0.62)">
              <Hand id="skinA" g={g} skin={SKIN_LIGHT} />
            </G>
            <G transform="translate(63 17) scale(-0.62 0.62) rotate(-14 24 30)">
              <Hand id="skinB" g={g} skin={SKIN_DEEP} />
            </G>
            <Path d={starPath(32, 14, 10, 4.4)} fill={g('star')} stroke="#C9831A" strokeWidth={1.8} strokeLinejoin="round" />
            <Gloss cx={29} cy={10.5} rx={3.4} ry={1.7} opacity={0.6} />
            <Sparkle cx={9} cy={10} r={3.8} />
            <Sparkle cx={56} cy={52} r={3.6} color="#8BF0FF" />
          </>
        ),
      };
  }
}
