import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Stop } from 'react-native-svg';
import { SVG_DECORATIVE } from '@/utils/svgA11y';
import type { ActivityCategory } from '@/types/models';
import { GameIcon } from './GameIcon';
import { useIconSet } from './useIconSet';
import { drawCategory, type CategoryArtName } from './art/categoryArt';
import { drawSubject, type SubjectArtName } from './art/subjectArt';
import { drawLevel, type LevelArtName } from './art/levelArt';
import { drawTherapy, type TherapyArtName } from './art/therapyArt';
import { drawLearn, type LearnArtName } from './art/learnArt';
import { drawStat, type StatArtName } from './art/statArt';
import { drawPractice, type PracticeArtName } from './art/practiceArt';
import type { Drawn, Fill, Grad } from './art/kit';

/**
 * Every colourful icon in the app's lists, by name. A name is `<set>:<key>`:
 *
 *   category:art        an Activities category (and `category:therapy`, the Therapy entry above them)
 *   subject:science     a school subject TalkEasy ships
 *   level:3             a Learn & Trace level
 *   therapy:dressing    a Therapy library activity, by its id
 *   practice:soundSay   a Speech Practice activity, by its id (a few reuse drawings the app already has)
 *   stat:streak         a My Progress statistic or heading (stars, streak, sounds, speech, words,
 *                       tracing, medal, trophy) — most reuse drawings the app already has
 *
 * One component for all four sets, like `ThemeArt`, so a screen asks for a name and never learns
 * which module drew it. `check:themes` fails when a category, subject, level or activity has no
 * drawing, so a new one cannot be added without its art.
 *
 * Vector, not bitmaps, for the same reasons as the rest of TalkEasy's art: crisp from a 320pt phone
 * to a tablet, no decode cost, about a kilobyte of path data each.
 */
export type ColorArtName =
  | `category:${ActivityCategory | 'therapy'}`
  | `subject:${SubjectArtName}`
  | `level:${LevelArtName}`
  | `therapy:${TherapyArtName}`
  | `learn:${LearnArtName}`
  | `stat:${StatArtName | 'speech' | 'words' | 'tracing' | 'trophy'}`
  | `practice:${PracticeArtName | 'rhythm' | 'phrases' | 'voice' | 'stories'}`;

export function ColorArt({ name, size }: { name: ColorArtName; size: number }) {
  // Gradient ids resolve document-wide in react-native-svg, so every instance needs its own.
  const base = `ca${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  // Space Explorer puts every list illustration in orbit: a faint ring and a tiny moon behind the drawing, so
  // the whole set shares one motif without redrawing a hundred pictures. Other themes draw the plain art.
  const space = useIconSet() === 'space';
  // The same last line of defence as Artwork: an SVG handed a negative size draws nothing, silently.
  const safe = Number.isFinite(size) && size > 0 ? size : 1;

  // Games reuses the controller drawing GameIcon already has, so there is one controller in the app.
  if (name === 'category:games') return <GameIcon name="controller" size={safe} />;
  // My Progress reuses what the app already draws: one microphone, one tracing page, one trophy.
  if (name === 'stat:speech') return <GameIcon name="speech" size={safe} />;
  if (name === 'stat:tracing') return <GameIcon name="trace" size={safe} />;
  if (name === 'stat:trophy') return <GameIcon name="progress" size={safe} />;

  const grad: Grad = (id, top, bottom) => (
    <LinearGradient key={id} id={`${base}${id}`} x1="0" y1="0" x2="0.35" y2="1">
      <Stop offset="0" stopColor={top} />
      <Stop offset="1" stopColor={bottom} />
    </LinearGradient>
  );
  const g: Fill = (id) => `url(#${base}${id})`;

  // 'stat:words' is the Reading book, under a name that says what it counts.
  // Four Speech Practice activities wear a drawing the app already has, under a name that says what they are.
  const alias: Partial<Record<ColorArtName, ColorArtName>> = {
    'stat:words': 'category:reading',
    'practice:rhythm': 'category:music',
    'practice:phrases': 'stat:bubbles',
    'practice:voice': 'stat:sounds',
    'practice:stories': 'category:reading',
  };
  const drawn = resolve(alias[name] ?? name, grad, g);
  return (
    <Svg width={safe} height={safe} viewBox="0 0 64 64" {...SVG_DECORATIVE} pointerEvents="none">
      <Defs>{drawn.defs}</Defs>
      {space ? (
        <>
          <Ellipse cx={32} cy={33} rx={30} ry={11} fill="none" stroke="#8BF0FF" strokeWidth={1.4} strokeDasharray="3 3" opacity={0.4} transform="rotate(-22 32 33)" />
          <Circle cx={57.5} cy={21.5} r={2.4} fill="#FFE066" opacity={0.95} />
        </>
      ) : null}
      <Ellipse cx={32} cy={59.5} rx={18} ry={2.6} fill="#000000" opacity={0.2} />
      {drawn.art}
    </Svg>
  );
}

function resolve(name: ColorArtName, grad: Grad, g: Fill): Drawn {
  const at = name.indexOf(':');
  const set = name.slice(0, at);
  const key = name.slice(at + 1);
  switch (set) {
    case 'subject':
      return drawSubject(key as SubjectArtName, grad, g);
    case 'level':
      return drawLevel(key as LevelArtName, grad, g);
    case 'therapy':
      return drawTherapy(key as TherapyArtName, grad, g);
    case 'learn':
      return drawLearn(key as LearnArtName, grad, g);
    case 'stat':
      return drawStat(key as StatArtName, grad, g);
    case 'practice':
      return drawPractice(key as PracticeArtName, grad, g);
    default:
      return drawCategory(key as CategoryArtName, grad, g);
  }
}
