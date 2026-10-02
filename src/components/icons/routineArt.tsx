import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Tone } from './tokens';

/**
 * The drawings behind the TalkEasy routine icons.
 *
 * Each export is the SVG body only — no <Svg> wrapper, no size — so the same drawing can be framed
 * at any size, and so these can later be dropped into a larger composition without being unpicked.
 * See tokens.ts for the five rules they all follow.
 *
 * Every function takes one ink colour and builds its layers from `Tone`. Read the opacities as
 * depth: `lit` is the face towards the light at the top-left, `shade` the face away from it.
 */

type Art = (c: string) => React.ReactNode;

/** WAKE UP — a sun coming up over the horizon. Rays only above, so it rises rather than just sits. */
export const wakeUpArt: Art = (c) => (
  <G>
    {/* Rays, shortest at the sides so the fan reads as light rather than as a cog. */}
    <G opacity={Tone.detail}>
      <Rect x={30.5} y={6} width={3} height={8} rx={1.5} fill={c} />
      <Rect x={30.5} y={6} width={3} height={7} rx={1.5} fill={c} transform="rotate(-38 32 34)" />
      <Rect x={30.5} y={6} width={3} height={7} rx={1.5} fill={c} transform="rotate(38 32 34)" />
      <Rect x={30.5} y={7} width={3} height={6} rx={1.5} fill={c} transform="rotate(-70 32 34)" />
      <Rect x={30.5} y={7} width={3} height={6} rx={1.5} fill={c} transform="rotate(70 32 34)" />
    </G>
    {/* The disc, cut off by the horizon — a half sun is what makes it a sunrise. */}
    <Path d="M14 40a18 18 0 0 1 36 0Z" fill={c} opacity={Tone.body} />
    {/* The lit crown, up and to the left. */}
    <Path d="M20 40a12 12 0 0 1 24 0Z" fill={c} opacity={Tone.lit} />
    {/* Horizon: a long line and a shorter one, which reads as distance. */}
    <Rect x={8} y={41.5} width={48} height={4} rx={2} fill={c} opacity={Tone.body} />
    <Rect x={17} y={50} width={30} height={3.5} rx={1.75} fill={c} opacity={Tone.shade} />
  </G>
);

/** BRUSH TEETH — a toothbrush on the diagonal, head up, with one sparkle for "clean". */
export const brushTeethArt: Art = (c) => (
  <G>
    <G transform="rotate(32 32 32)">
      {/* Handle, waisted slightly so it is a brush and not a lolly stick. */}
      <Path d="M29 26h6v24a3 3 0 0 1-6 0Z" fill={c} opacity={Tone.body} />
      {/* Head. */}
      <Rect x={25.5} y={12} width={13} height={16} rx={6.5} fill={c} opacity={Tone.lit} />
      {/* Bristles: two tufts with the card showing between them, which is the only way to divide
          a white shape. A darker stripe painted on top would come out brighter, not darker. */}
      <G opacity={Tone.detail}>
        <Rect x={27} y={8.5} width={4} height={6.5} rx={2} fill={c} />
        <Rect x={33} y={8.5} width={4} height={6.5} rx={2} fill={c} />
      </G>
    </G>
    {/* The single accent. */}
    <Path
      d="M48 14q0 4 4 4-4 0-4 4 0-4-4-4 4 0 4-4Z"
      fill={c}
      opacity={Tone.lit}
    />
  </G>
);

/** EAT BREAKFAST — a wide cereal bowl with a spoon resting in it. */
export const breakfastArt: Art = (c) => (
  <G>
    {/* Spoon, standing clear of the rim on the right. Tucked behind the bowl it simply vanished. */}
    <G transform="rotate(20 32 32)" opacity={Tone.detail}>
      <Ellipse cx={48} cy={14} rx={5} ry={6.5} fill={c} />
      <Rect x={46} y={19} width={4} height={14} rx={2} fill={c} />
    </G>
    {/* Rim, catching the light. */}
    <Rect x={9} y={26} width={46} height={6} rx={3} fill={c} opacity={Tone.lit} />
    {/* A GAP here, not a darker shape: the card showing through is what separates rim from bowl. */}
    <Path d="M12 34h40a20 20 0 0 1-40 0Z" fill={c} opacity={Tone.body} />
  </G>
);

/** GET READY — a t-shirt. The most legible "clothes" silhouette at a small size. */
export const getReadyArt: Art = (c) => (
  <G>
    {/* Body and sleeves as one silhouette: separate pieces break up at 24pt. */}
    <Path
      d="M24 12h16l12 7-4 11-6-3v22a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V27l-6 3-4-11Z"
      fill={c}
      opacity={Tone.body}
    />
    {/* The lit left shoulder and sleeve. */}
    <Path d="M24 12 12 19l4 11 6-3v-3Z" fill={c} opacity={Tone.lit} />
    {/* Collar, drawn on the body and so necessarily the brighter of the two. */}
    <Path d="M24 12h16a8 8 0 0 1-16 0Z" fill={c} opacity={Tone.lit} />
  </G>
);

/** SCHOOL — a mortarboard. Educational rather than corporate, which a building would read as. */
export const schoolArt: Art = (c) => (
  <G>
    {/* The board, in perspective. */}
    <Path d="M32 14 58 25 32 36 6 25Z" fill={c} opacity={Tone.lit} />
    {/* The cap beneath it, which is what stops the board reading as a flat diamond. */}
    <Path d="M18 30v9c0 4 6 7 14 7s14-3 14-7v-9l-14 6Z" fill={c} opacity={Tone.body} />
    {/* Tassel: cord and bead. */}
    <Path d="M54 27v11" stroke={c} strokeWidth={2.6} strokeLinecap="round" opacity={Tone.detail} />
    <Circle cx={54} cy={41} r={3.4} fill={c} opacity={Tone.detail} />
  </G>
);

/** LUNCH — a lunchbox with a carry handle. Deliberately a container, so Dinner can be a plate. */
export const lunchArt: Art = (c) => (
  <G>
    {/* Handle, drawn first so the box overlaps it. */}
    <Path d="M24 18a8 8 0 0 1 16 0" stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" opacity={Tone.detail} />
    {/* Lid. */}
    <Rect x={10} y={20} width={44} height={10} rx={5} fill={c} opacity={Tone.lit} />
    {/* Box, with 2 units of card showing between it and the lid — the gap IS the lid line. */}
    <Rect x={10} y={32} width={44} height={20} rx={6} fill={c} opacity={Tone.body} />
    {/* Clasp, bridging the gap at full brightness so it reads against both pieces. */}
    <Rect x={28} y={27} width={8} height={9} rx={2.6} fill={c} opacity={Tone.lit} />
  </G>
);

/** HOMEWORK — a worksheet with a pencil across it. Two objects, because one would be ambiguous. */
export const homeworkArt: Art = (c) => (
  <G>
    {/* Sheet. */}
    <Rect x={12} y={10} width={32} height={42} rx={5} fill={c} opacity={Tone.body} />
    {/* Written lines: three, shortening, which reads as writing rather than as stripes. */}
    <G opacity={Tone.lit}>
      <Rect x={18} y={19} width={20} height={3} rx={1.5} fill={c} />
      <Rect x={18} y={27} width={20} height={3} rx={1.5} fill={c} />
      <Rect x={18} y={35} width={12} height={3} rx={1.5} fill={c} />
    </G>
    {/* Pencil, over the lower-right corner so it never hides the "page" read. */}
    <G transform="rotate(42 40 38)">
      <Rect x={36.5} y={22} width={9} height={24} rx={2.5} fill={c} opacity={Tone.lit} />
      <Path d="M36.5 46h9l-4.5 7Z" fill={c} opacity={Tone.detail} />
      <Rect x={36.5} y={22} width={9} height={5} rx={2.5} fill={c} opacity={Tone.detail} />
    </G>
  </G>
);

/** PLAY — a soft ball. A toy a child recognises instantly, and it holds its shape at 24pt. */
export const playArt: Art = (c) => (
  <G>
    <Circle cx={30} cy={34} r={21} fill={c} opacity={Tone.body} />
    {/* The bands are BRIGHTER than the ball, not darker — on white ink, darker is not available. */}
    <Path d="M11.5 26q18.5 8 37 0" stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" opacity={Tone.lit} />
    <Path d="M11.5 42q18.5-8 37 0" stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" opacity={Tone.lit} />
    {/* The lit top-left cap, which gives the ball its roundness. */}
    <Path d="M30 13a21 21 0 0 0-18.5 11 21 21 0 0 1 18.5-4Z" fill={c} opacity={Tone.lit} />
    {/* One sparkle, so it reads as play rather than as sport. */}
    <Path d="M51 12q0 5 5 5-5 0-5 5 0-5-5-5 5 0 5-5Z" fill={c} opacity={Tone.lit} />
  </G>
);

/** DINNER — a plate with cutlery. Flat and laid out, so it never reads as the Lunch container. */
export const dinnerArt: Art = (c) => (
  <G>
    {/* Fork. */}
    <G opacity={Tone.detail}>
      <Rect x={9} y={30} width={3.4} height={22} rx={1.7} fill={c} />
      <Path d="M6 13v9a4.7 4.7 0 0 0 9.4 0v-9" stroke={c} strokeWidth={2.8} strokeLinecap="round" fill="none" />
      <Rect x={9.3} y={13} width={2.6} height={9} rx={1.3} fill={c} />
    </G>
    {/* Knife. */}
    <G opacity={Tone.detail}>
      <Rect x={51.5} y={30} width={3.4} height={22} rx={1.7} fill={c} />
      <Path d="M53.2 13a5 5 0 0 1 0 17Z" fill={c} />
    </G>
    {/* Plate: rim and well, the two circles that say "plate" and not "coin". */}
    <Circle cx={32} cy={32} r={17.5} fill={c} opacity={Tone.body} />
    <Circle cx={32} cy={32} r={11} fill={c} opacity={Tone.lit} />
    {/* Sheen on the rim, up and left with the rest of the set. */}
    <Path d="M32 14.5A17.5 17.5 0 0 0 17.6 22a17.5 17.5 0 0 1 14.4-3.5Z" fill={c} opacity={Tone.lit} />
  </G>
);

/**
 * SCAN ASSIGNMENT — a page with a camera frame over it.
 *
 * The two ideas the feature joins, in one mark: the worksheet, and the act of capturing it. Corner
 * brackets rather than a camera body, because a camera icon alone would say "take a photo" and miss
 * the point — what the feature does is turn a PAGE into words.
 */
export const scanAssignmentArt: Art = (c) => (
  <G>
    {/* The page, tilted slightly so it reads as a sheet rather than a panel. */}
    <G transform="rotate(-6 32 32)">
      <Rect x={16} y={10} width={32} height={42} rx={5} fill={c} opacity={Tone.body} />
      <G opacity={Tone.lit}>
        <Rect x={22} y={19} width={20} height={3} rx={1.5} fill={c} />
        <Rect x={22} y={27} width={20} height={3} rx={1.5} fill={c} />
        <Rect x={22} y={35} width={13} height={3} rx={1.5} fill={c} />
      </G>
    </G>
    {/* Capture brackets: four corners, which is the universal "framing" mark. */}
    <G opacity={Tone.lit}>
      <Path d="M8 20V12a4 4 0 0 1 4-4h8" stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Path d="M44 8h8a4 4 0 0 1 4 4v8" stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Path d="M56 44v8a4 4 0 0 1-4 4h-8" stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Path d="M20 56h-8a4 4 0 0 1-4-4v-8" stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" />
    </G>
  </G>
);

/** BATH — a tub with bubbles. */
export const bathArt: Art = (c) => (
  <G>
    {/* Tap. */}
    <Path d="M14 26v-8a4 4 0 0 1 4-4h6" stroke={c} strokeWidth={3} strokeLinecap="round" fill="none" opacity={Tone.detail} />
    {/* Tub. */}
    <Path d="M8 30h48v8a12 12 0 0 1-12 12H20A12 12 0 0 1 8 38Z" fill={c} opacity={Tone.body} />
    {/* Water line. */}
    <Rect x={8} y={30} width={48} height={5} rx={2.5} fill={c} opacity={Tone.lit} />
    {/* Feet. */}
    <G opacity={Tone.shade}>
      <Rect x={15} y={50} width={5} height={5} rx={2} fill={c} />
      <Rect x={44} y={50} width={5} height={5} rx={2} fill={c} />
    </G>
    {/* Bubbles, rising left to right. */}
    <G opacity={Tone.detail}>
      <Circle cx={38} cy={18} r={5} fill={c} />
      <Circle cx={48} cy={11} r={3.4} fill={c} />
    </G>
  </G>
);

/** RELAX — a sofa, seen straight on. */
export const relaxArt: Art = (c) => (
  <G>
    {/* Back. */}
    <Rect x={12} y={15} width={40} height={16} rx={6} fill={c} opacity={Tone.body} />
    {/* Seat, two cushions with the card showing between them and below the back. */}
    <G opacity={Tone.lit}>
      <Rect x={12} y={33} width={19} height={13} rx={4.5} fill={c} />
      <Rect x={33} y={33} width={19} height={13} rx={4.5} fill={c} />
    </G>
    {/* Arms, standing clear of the seat on both sides. */}
    <G opacity={Tone.body}>
      <Rect x={4} y={26} width={7} height={20} rx={3.5} fill={c} />
      <Rect x={53} y={26} width={7} height={20} rx={3.5} fill={c} />
    </G>
    <G opacity={Tone.shade}>
      <Rect x={11} y={46} width={5} height={6} rx={2} fill={c} />
      <Rect x={48} y={46} width={5} height={6} rx={2} fill={c} />
    </G>
  </G>
);

/** BEDTIME — a bed with a pillow and a turned-down blanket. */
export const bedtimeArt: Art = (c) => (
  <G>
    {/* Headboard. */}
    <Rect x={6} y={14} width={8} height={32} rx={4} fill={c} opacity={Tone.body} />
    {/* Mattress. */}
    <Rect x={10} y={28} width={48} height={14} rx={6} fill={c} opacity={Tone.body} />
    {/* Blanket, from the foot up — the fold is what makes it a made bed. */}
    <Path d="M32 28h20a6 6 0 0 1 6 6v2a6 6 0 0 1-6 6H32Z" fill={c} opacity={Tone.lit} />
    {/* Pillow, clear of the blanket with the card showing between them. */}
    <Rect x={14} y={20} width={15} height={9} rx={4.5} fill={c} opacity={Tone.lit} />
    {/* Legs. */}
    <G opacity={Tone.shade}>
      <Rect x={12} y={42} width={5} height={7} rx={2} fill={c} />
      <Rect x={51} y={42} width={5} height={7} rx={2} fill={c} />
    </G>
  </G>
);
