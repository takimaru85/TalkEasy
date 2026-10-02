import React from 'react';
import Svg from 'react-native-svg';
import {
  bathArt,
  bedtimeArt,
  breakfastArt,
  brushTeethArt,
  dinnerArt,
  getReadyArt,
  homeworkArt,
  lunchArt,
  playArt,
  relaxArt,
  scanAssignmentArt,
  schoolArt,
  wakeUpArt,
} from './routineArt';
import {
  balanceArt,
  gentleArt,
  graspArt,
  moveArt,
  reachArt,
  sitToStandArt,
  standingArt,
  stretchArt,
  transferArt,
  twoHandsArt,
  walkArt,
} from './therapyArt';
import { DEFAULT_ICON_SIZE, type TalkEasyIconProps } from './tokens';

/**
 * The TalkEasy icon set: custom-drawn icons for the things a child's day is made of.
 *
 * WHY THESE EXIST. The app was using the stock Material glyph for each routine step. Those glyphs
 * are fine individually and wrong together: they come from different eras of that set, so one is a
 * thin outline, the next a solid shape, the next almost a pictogram, and a column of them makes a
 * carefully-built screen look assembled rather than designed. These share a grid, a light source
 * and a tonal scale, so a column of them reads as one thing.
 *
 * Each icon takes a size and ONE colour and derives its own depth (see tokens.ts). That is what
 * lets the same icon sit on a blue card, a green card and a purple one without a palette per
 * surface, and it is why none of them can clash with the app's colours — they have none of their
 * own.
 *
 * These are drawn in `react-native-svg`, in code, like every other TalkEasy illustration: crisp
 * from 320pt to a tablet, no bitmap to decode, nothing to lazy-load (AGENTS.md).
 */

function Frame({ size = DEFAULT_ICON_SIZE, children }: { size?: number; children: React.ReactNode }) {
  // One viewBox for the whole set, so every icon has the same optical weight at the same size.
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {children}
    </Svg>
  );
}

const WHITE = '#FFFFFF';

export const TalkEasyIconWakeUp = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{wakeUpArt(color)}</Frame>;
export const TalkEasyIconBrushTeeth = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{brushTeethArt(color)}</Frame>;
export const TalkEasyIconBreakfast = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{breakfastArt(color)}</Frame>;
export const TalkEasyIconGetReady = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{getReadyArt(color)}</Frame>;
export const TalkEasyIconSchool = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{schoolArt(color)}</Frame>;
export const TalkEasyIconLunch = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{lunchArt(color)}</Frame>;
export const TalkEasyIconHomework = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{homeworkArt(color)}</Frame>;
export const TalkEasyIconPlay = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{playArt(color)}</Frame>;
export const TalkEasyIconDinner = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{dinnerArt(color)}</Frame>;
export const TalkEasyIconBath = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{bathArt(color)}</Frame>;
export const TalkEasyIconRelax = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{relaxArt(color)}</Frame>;
export const TalkEasyIconBedtime = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{bedtimeArt(color)}</Frame>;

/**
 * Which custom drawing stands in for which stored icon name.
 *
 * THE KEY IS THE NAME ALREADY IN THE DATABASE. A routine step stores a Material icon name, chosen
 * when the day was seeded or when a grown-up picked one in Parent Mode. Keying off that name means
 * the new icons appear with no migration, no rewriting of anyone's saved day, and no risk to a
 * schedule a family has already arranged.
 *
 * A name with no entry here keeps the Material glyph, which is the point of doing it this way: a
 * parent can still pick from the whole icon library, and the set grows by adding a line here when
 * a drawing is worth making. Nothing breaks in the meantime.
 */
export const TalkEasyIconSitToStand = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{sitToStandArt(color)}</Frame>;
export const TalkEasyIconStanding = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{standingArt(color)}</Frame>;
export const TalkEasyIconReach = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{reachArt(color)}</Frame>;
export const TalkEasyIconWalk = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{walkArt(color)}</Frame>;
export const TalkEasyIconBalance = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{balanceArt(color)}</Frame>;
export const TalkEasyIconGrasp = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{graspArt(color)}</Frame>;
export const TalkEasyIconTwoHands = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{twoHandsArt(color)}</Frame>;
export const TalkEasyIconTransfer = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{transferArt(color)}</Frame>;
export const TalkEasyIconActiveMove = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{moveArt(color)}</Frame>;
export const TalkEasyIconStretch = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{stretchArt(color)}</Frame>;
export const TalkEasyIconGentle = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{gentleArt(color)}</Frame>;

export const TalkEasyIconScanAssignment = ({ size, color = WHITE }: TalkEasyIconProps) => <Frame size={size}>{scanAssignmentArt(color)}</Frame>;

export const TALKEASY_ICON_ART: Record<string, (color: string) => React.ReactNode> = {
  'scan-assignment': scanAssignmentArt,
  // Therapy practice. Several reuse a routine drawing on purpose — dressing really is the t-shirt,
  // self-care really is the toothbrush — because inventing a second drawing for the same idea is
  // how an icon set stops being one.
  'therapy-sit-to-stand': sitToStandArt,
  'therapy-standing': standingArt,
  'therapy-reach': reachArt,
  'therapy-walk': walkArt,
  'therapy-balance': balanceArt,
  'therapy-grasp': graspArt,
  'therapy-two-hands': twoHandsArt,
  'therapy-transfer': transferArt,
  'therapy-move': moveArt,
  'therapy-stretch': stretchArt,
  'therapy-gentle': gentleArt,
  'therapy-draw': homeworkArt,
  'therapy-write': homeworkArt,
  'therapy-dressing': getReadyArt,
  'therapy-container': lunchArt,
  'therapy-school-task': schoolArt,
  'therapy-self-care': brushTeethArt,
  'weather-sunset-up': wakeUpArt,
  toothbrush: brushTeethArt,
  'egg-fried': breakfastArt,
  'tshirt-crew': getReadyArt,
  school: schoolArt,
  'school-outline': schoolArt,
  food: lunchArt,
  'food-apple': lunchArt,
  pencil: homeworkArt,
  'pencil-outline': homeworkArt,
  'teddy-bear': playArt,
  'pot-steam': dinnerArt,
  'silverware-fork-knife': dinnerArt,
  bathtub: bathArt,
  shower: bathArt,
  sofa: relaxArt,
  bed: bedtimeArt,
};

/** Whether the set has a drawing for a stored icon name. */
export function hasTalkEasyIcon(name: string): boolean {
  return name in TALKEASY_ICON_ART;
}

/**
 * Draws the custom icon for a stored name, or null when there is none.
 *
 * Returning null rather than a fallback keeps the decision with the caller: `IconTile` wants the
 * Material glyph as its fallback, and something else may want nothing at all.
 */
export function TalkEasyIcon({ name, size = DEFAULT_ICON_SIZE, color = WHITE }: TalkEasyIconProps & { name: string }) {
  const art = TALKEASY_ICON_ART[name];
  if (!art) return null;
  return <Frame size={size}>{art(color)}</Frame>;
}
