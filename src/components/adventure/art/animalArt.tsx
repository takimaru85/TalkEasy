import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { CardSlot } from '@/adventure/themes';
import { Ball, Cheek, Face, Gloss, INK, OpenBook, Pencil, Sparkle, SpeechBubble, WordCards, starPath, type Drawn, type Fill, type Grad } from './kit';

/**
 * ANIMAL ADVENTURE card art — a moonlit safari.
 *
 * Palette: savanna gold, jungle green, warm fur and butterfly pink. The animals are cubs and
 * round-faced grown-ups; nothing bares a tooth.
 *
 * Same pairing rule as the other themes: an ANIMAL element plus the shared activity token from
 * `kit`, so the Talk card is recognisably the Talk card whichever world the child is in.
 */
export function drawAnimal(slot: CardSlot, grad: Grad, g: Fill): Drawn {
  switch (slot) {
    // An explorer's paw badge with the day's star.
    case 'mission':
      return {
        defs: (
          <>
            {grad('b', '#9BE38C', '#3FA65A')}
            {grad('p', '#FFE1B0', '#E8A44A')}
          </>
        ),
        art: (
          <>
            <Circle cx={30} cy={34} r={21} fill={g('b')} stroke="#1F6B33" strokeWidth={2.6} />
            <Circle cx={30} cy={34} r={16} fill="#FFFFFF" opacity={0.18} />
            {/* A paw print, centred in the badge. */}
            <Ellipse cx={30} cy={40} rx={9} ry={7.5} fill={g('p')} stroke="#B87A22" strokeWidth={1.8} />
            {[
              { x: 21, y: 30, r: 3.4 },
              { x: 27, y: 26, r: 3.6 },
              { x: 34, y: 26, r: 3.6 },
              { x: 40, y: 30, r: 3.4 },
            ].map((t) => (
              <Circle key={t.x} cx={t.x} cy={t.y} r={t.r} fill={g('p')} stroke="#B87A22" strokeWidth={1.6} />
            ))}
            <Gloss cx={23} cy={22} rx={6} ry={3} opacity={0.35} />
            <Path d={starPath(52, 15, 7, 3)} fill="#FFD166" stroke="#D99A18" strokeWidth={1.5} strokeLinejoin="round" />
            <Sparkle cx={10} cy={22} r={3.4} />
          </>
        ),
      };

    // A lion cub, practising a sound.
    case 'speech': {
      const head = (fill: string) => <Circle cx={24} cy={36} r={15} fill={fill} />;
      return {
        defs: (
          <>
            {grad('m', '#FFC94D', '#E08A16')}
            {grad('f', '#FFE1B0', '#F0B268')}
          </>
        ),
        art: (
          <>
            {/* The mane: a ring of soft lobes, never spikes. */}
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i * Math.PI * 2) / 10;
              return <Circle key={i} cx={24 + Math.cos(a) * 17} cy={36 + Math.sin(a) * 17} r={6.2} fill={g('m')} stroke="#B86A0E" strokeWidth={1.6} />;
            })}
            <G stroke="#C98A3A" strokeWidth={4}>{head('#C98A3A')}</G>
            {head(g('f'))}
            <Ellipse cx={24} cy={42} rx={7} ry={5} fill="#FFF3E0" />
            <Path d="M21 40 Q24 43 27 40" stroke={INK} strokeWidth={1.8} strokeLinecap="round" fill="none" />
            <Face cx={24} cy={33} spread={5.5} r={2.6} smile={false} />
            <Cheek cx={14} cy={39} />
            <Cheek cx={34} cy={39} />
            <Gloss cx={18} cy={27} rx={5} ry={2.4} />
            <SpeechBubble x={38} y={6} tail="left" barColor="#E08A16" />
            <Sparkle cx={8} cy={13} r={3} />
          </>
        ),
      };
    }

    // A butterfly tracing a looping trail.
    case 'trace':
      return {
        defs: (
          <>
            {grad('w', '#FFB0D8', '#E2569E')}
            {grad('v', '#C4ADFF', '#7443D8')}
          </>
        ),
        art: (
          <>
            {/* The trail it has flown: the line a child will trace. */}
            <Path d="M6 50 Q16 32 26 44 Q34 54 44 34" stroke="#FFFFFF" strokeWidth={2.4} strokeDasharray="4 4" strokeLinecap="round" fill="none" opacity={0.65} />
            <G transform="rotate(-14 26 34)">
              <Ellipse cx={18} cy={28} rx={9} ry={11} fill={g('w')} stroke="#B8306E" strokeWidth={1.8} />
              <Ellipse cx={18} cy={40} rx={7} ry={8} fill={g('v')} stroke="#5A2CA8" strokeWidth={1.8} />
              <Ellipse cx={34} cy={28} rx={9} ry={11} fill={g('w')} stroke="#B8306E" strokeWidth={1.8} />
              <Ellipse cx={34} cy={40} rx={7} ry={8} fill={g('v')} stroke="#5A2CA8" strokeWidth={1.8} />
              <Circle cx={18} cy={27} r={2.6} fill="#FFFFFF" opacity={0.55} />
              <Circle cx={34} cy={27} r={2.6} fill="#FFFFFF" opacity={0.55} />
              <Rect x={24} y={22} width={4} height={24} rx={2} fill="#6B4418" />
              <Circle cx={26} cy={21} r={3.4} fill="#6B4418" />
              <Path d="M24 18 Q21 13 18 13" stroke="#6B4418" strokeWidth={1.6} strokeLinecap="round" fill="none" />
              <Path d="M28 18 Q31 13 34 13" stroke="#6B4418" strokeWidth={1.6} strokeLinecap="round" fill="none" />
            </G>
            <Pencil x={48} y={12} len={24} angle={32} />
            <Sparkle cx={9} cy={16} r={3} />
          </>
        ),
      };

    // A monkey, mid-chat.
    case 'talk': {
      const head = (fill: string) => <Circle cx={26} cy={36} r={15} fill={fill} />;
      return {
        defs: (
          <>
            {grad('m', '#C99A6A', '#8A5A2A')}
            {grad('f', '#FFE1C4', '#F0C08A')}
          </>
        ),
        art: (
          <>
            <Circle cx={11} cy={33} r={6.5} fill={g('m')} stroke="#6B4418" strokeWidth={2} />
            <Circle cx={41} cy={33} r={6.5} fill={g('m')} stroke="#6B4418" strokeWidth={2} />
            <Circle cx={11} cy={33} r={3.2} fill="#FFD8B8" />
            <Circle cx={41} cy={33} r={3.2} fill="#FFD8B8" />
            <G stroke="#6B4418" strokeWidth={4}>{head('#6B4418')}</G>
            {head(g('m'))}
            {/* The pale face patch, which is what makes it read as a monkey. */}
            <Ellipse cx={26} cy={40} rx={11} ry={9.5} fill={g('f')} />
            <Ellipse cx={26} cy={30} rx={12} ry={7} fill={g('f')} opacity={0.5} />
            <Face cx={26} cy={34} spread={5} r={2.5} smileWidth={11} />
            <Circle cx={23} cy={41} r={1.1} fill="#A8724A" />
            <Circle cx={29} cy={41} r={1.1} fill="#A8724A" />
            <Gloss cx={20} cy={27} rx={5} ry={2.2} />
            <SpeechBubble x={38} y={8} w={22} tail="left" barColor="#E9513C" />
            <Sparkle cx={9} cy={14} r={2.8} />
          </>
        ),
      };
    }

    // Word cards with a little bird perched on top.
    case 'words':
      return {
        defs: grad('b', '#7FD8FF', '#1F8ED6'),
        art: (
          <>
            <WordCards x={8} y={22} tint="#FFDFEE" ink="#B8306E" />
            <G>
              <Ellipse cx={44} cy={22} rx={11} ry={9.5} fill={g('b')} stroke="#12608F" strokeWidth={2} />
              <Circle cx={51} cy={15} r={7} fill={g('b')} stroke="#12608F" strokeWidth={2} />
              <Path d="M38 20 Q32 26 36 30 Q40 27 42 24 Z" fill="#12608F" opacity={0.75} />
              <Path d="M58 15 L64 17 L58 19 Z" fill="#FFC94D" stroke="#C98A12" strokeWidth={1.2} strokeLinejoin="round" />
              <Circle cx={53} cy={13} r={2.1} fill={INK} />
              <Circle cx={53.7} cy={12.3} r={0.7} fill="#FFFFFF" />
              <Gloss cx={42} cy={18} rx={4.4} ry={2} />
              {/* Legs, standing on the cards. */}
              <Path d="M42 31 L42 35" stroke="#C98A12" strokeWidth={1.8} strokeLinecap="round" />
              <Path d="M47 31 L47 35" stroke="#C98A12" strokeWidth={1.8} strokeLinecap="round" />
            </G>
            <Sparkle cx={56} cy={38} r={3} />
          </>
        ),
      };

    // A panda with a ball.
    case 'play': {
      const head = (fill: string) => <Circle cx={24} cy={36} r={15} fill={fill} />;
      return {
        defs: grad('w', '#FFFFFF', '#D8DEEA'),
        art: (
          <>
            <Circle cx={12} cy={25} r={6.4} fill="#3A3F52" />
            <Circle cx={36} cy={25} r={6.4} fill="#3A3F52" />
            <G stroke="#8A93A8" strokeWidth={3}>{head('#8A93A8')}</G>
            {head(g('w'))}
            {/* The eye patches, which are the whole character. */}
            <Ellipse cx={18} cy={34} rx={5.4} ry={6.4} fill="#3A3F52" transform="rotate(-14 18 34)" />
            <Ellipse cx={30} cy={34} rx={5.4} ry={6.4} fill="#3A3F52" transform="rotate(14 30 34)" />
            <Circle cx={18} cy={34} r={2.4} fill="#FFFFFF" />
            <Circle cx={30} cy={34} r={2.4} fill="#FFFFFF" />
            <Circle cx={18.6} cy={33.4} r={0.9} fill="#3A3F52" />
            <Circle cx={30.6} cy={33.4} r={0.9} fill="#3A3F52" />
            <Ellipse cx={24} cy={42} rx={3.2} ry={2.4} fill="#3A3F52" />
            <Path d="M19 45 Q24 48.5 29 45" stroke="#3A3F52" strokeWidth={1.8} strokeLinecap="round" fill="none" />
            <Gloss cx={17} cy={27} rx={4.4} ry={2} opacity={0.5} />
            <Ball cx={49} cy={44} r={11} from="#5BD98A" ink="#15884A" />
            <Sparkle cx={54} cy={16} r={3.4} />
          </>
        ),
      };
    }

// A microphone with music notes: the section is about what a voice DOES, so the art is the
    // voice itself rather than a character — which also keeps it distinct from the speech card.
    case 'voice':
      return {
        defs: grad('v', '#FFC94D', '#E08A16'),
        art: (
          <>
            <Path d="M32 44 L32 54" stroke="#B86A0E" strokeWidth={5} strokeLinecap="round" />
            <Path d="M20 54 L44 54" stroke="#B86A0E" strokeWidth={5} strokeLinecap="round" />
            <Path d="M16 30 Q16 44 32 44 Q48 44 48 30" stroke="#B86A0E" strokeWidth={4.5} strokeLinecap="round" fill="none" />
            <Rect x={23} y={6} width={18} height={32} rx={9} fill={g('v')} stroke="#B86A0E" strokeWidth={2.4} />
            {[14, 20, 26].map((y) => (
              <Path key={y} d={`M26 ${y} L38 ${y}`} stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" opacity={0.55} />
            ))}
            <Gloss cx={28} cy={13} rx={2.6} ry={5} rotate={0} opacity={0.45} />
            {/* Two notes, rising away from the microphone. */}
            <G>
              <Circle cx={52} cy={26} r={4.4} fill="#FFD166" stroke="#B86A0E" strokeWidth={1.8} />
              <Path d="M56 26 L56 10" stroke="#B86A0E" strokeWidth={2.4} strokeLinecap="round" />
              <Path d="M56 10 Q61 11 61 15" stroke="#B86A0E" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            </G>
            <G opacity={0.8}>
              <Circle cx={9} cy={20} r={3.4} fill="#FFD166" stroke="#B86A0E" strokeWidth={1.6} />
              <Path d="M12 20 L12 8" stroke="#B86A0E" strokeWidth={2} strokeLinecap="round" />
            </G>
            {/* A paw print, so the microphone still belongs to the safari. */}
            <Ellipse cx={13} cy={49} rx={5} ry={4} fill="#E8A44A" stroke="#B87A22" strokeWidth={1.4} />
            {[[9, 44], [13, 42], [17, 44]].map(([px, py]) => (
              <Circle key={px} cx={px} cy={py} r={1.9} fill="#E8A44A" stroke="#B87A22" strokeWidth={1.2} />
            ))}
            <Sparkle cx={52} cy={46} r={3} />
          </>
        ),
      };

    // An open book under a round safari tree.
    case 'lessons':
      return {
        defs: (
          <>
            {grad('c', '#7FE0A8', '#2A9E62')}
            {grad('t', '#C89A5A', '#8A5F2A')}
          </>
        ),
        art: (
          <>
            {/* The tree, behind and above the book. */}
            <Rect x={28} y={14} width={7} height={20} rx={3} fill={g('t')} stroke="#6B4418" strokeWidth={1.8} />
            <Circle cx={31} cy={14} r={13} fill={g('c')} stroke="#1F6B33" strokeWidth={2.2} />
            <Circle cx={21} cy={17} r={7.5} fill={g('c')} stroke="#1F6B33" strokeWidth={2} />
            <Circle cx={42} cy={18} r={8} fill={g('c')} stroke="#1F6B33" strokeWidth={2} />
            <Circle cx={26} cy={10} r={4.4} fill="#FFFFFF" opacity={0.28} />
            <OpenBook x={10} y={34} w={44} h={24} cover="#FFC94D" coverInk="#C98A12" />
            <Sparkle cx={54} cy={10} r={3} />
          </>
        ),
      };
  }
}

/** LEO — the Animal Adventure companion. A lion cub with a soft mane, waving a paw. */
export function drawLeo(grad: Grad, g: Fill): Drawn {
  const head = (fill: string) => <Circle cx={32} cy={44} r={24} fill={fill} />;
  return {
    defs: (
      <>
        {grad('m', '#FFC94D', '#E08A16')}
        {grad('f', '#FFE1B0', '#F0B268')}
      </>
    ),
    art: (
      <>
        {/* Body first, so the head sits in front of it. */}
        <Ellipse cx={32} cy={82} rx={19} ry={16} fill={g('f')} stroke="#C98A3A" strokeWidth={4} />
        <Ellipse cx={32} cy={82} rx={15} ry={12} fill={g('f')} />
        {/* The mane: a ring of soft lobes. */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI * 2) / 12;
          return <Circle key={i} cx={32 + Math.cos(a) * 27} cy={44 + Math.sin(a) * 27} r={9.5} fill={g('m')} stroke="#B86A0E" strokeWidth={2} />;
        })}
        <G stroke="#C98A3A" strokeWidth={5}>{head('#C98A3A')}</G>
        {head(g('f'))}
        {/* Ears, tucked into the mane. */}
        <Circle cx={16} cy={28} r={6} fill={g('f')} stroke="#C98A3A" strokeWidth={2.4} />
        <Circle cx={48} cy={28} r={6} fill={g('f')} stroke="#C98A3A" strokeWidth={2.4} />
        <Ellipse cx={32} cy={54} rx={11} ry={8} fill="#FFF3E0" />
        <Ellipse cx={32} cy={50} rx={3.6} ry={2.8} fill="#E2886A" />
        <Path d="M26 54 Q32 59 38 54" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Face cx={32} cy={40} spread={9} r={4} smile={false} />
        <Cheek cx={18} cy={48} rx={4} ry={2.6} />
        <Cheek cx={46} cy={48} rx={4} ry={2.6} />
        <Gloss cx={24} cy={32} rx={8} ry={3.4} />
        {/* A raised paw. */}
        <Circle cx={54} cy={72} r={8} fill={g('f')} stroke="#C98A3A" strokeWidth={3} />
        {[-3.2, 0, 3.2].map((dx) => (
          <Circle key={dx} cx={54 + dx} cy={67.5} r={1.5} fill="#E2886A" />
        ))}
        <Sparkle cx={8} cy={70} r={4} />
        <Sparkle cx={58} cy={18} r={3} />
      </>
    ),
  };
}
