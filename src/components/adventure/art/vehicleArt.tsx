import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { CardSlot } from '@/adventure/themes';
import { Ball, Cheek, Face, Gloss, INK, OpenBook, Pencil, Sparkle, SpeechBubble, WordCards, starPath, type Drawn, type Fill, type Grad } from './kit';

/**
 * VEHICLE ADVENTURE card art — a city at night.
 *
 * Palette: road yellow, signal red, headlight white and rail steel. The vehicles have faces in
 * their windscreens, which is what makes them characters a child can talk to rather than objects.
 *
 * Same pairing rule as the other themes: a VEHICLE element plus the shared activity token from
 * `kit`, so each card keeps its job while the world changes completely.
 */

/** Two wheels with pale hubs, the mark every vehicle here shares. */
function Wheels({ y, xs, r = 6 }: { y: number; xs: number[]; r?: number }) {
  return (
    <G>
      {xs.map((x) => (
        <G key={x}>
          <Circle cx={x} cy={y} r={r} fill="#3A3F52" stroke="#20243A" strokeWidth={1.8} />
          <Circle cx={x} cy={y} r={r * 0.42} fill="#C3CEE4" />
        </G>
      ))}
    </G>
  );
}

export function drawVehicle(slot: CardSlot, grad: Grad, g: Fill): Drawn {
  switch (slot) {
    // A route sign pointing the way, with the day's star.
    case 'mission':
      return {
        defs: (
          <>
            {grad('s', '#7FD8FF', '#1F8ED6')}
            {grad('p', '#C3CEE4', '#8A93A8')}
          </>
        ),
        art: (
          <>
            {/* The road, curving away behind the sign. */}
            <Path d="M4 56 Q22 46 32 52 Q44 58 60 48" stroke="#3A3F52" strokeWidth={9} strokeLinecap="round" fill="none" />
            <Path d="M4 56 Q22 46 32 52 Q44 58 60 48" stroke="#FFD84D" strokeWidth={1.8} strokeDasharray="4 5" strokeLinecap="round" fill="none" />
            <Rect x={29} y={22} width={5} height={28} rx={2.5} fill={g('p')} stroke="#5A6278" strokeWidth={1.6} />
            <Path d="M10 10 L44 10 L52 21 L44 32 L10 32 Z" fill={g('s')} stroke="#12608F" strokeWidth={2.2} strokeLinejoin="round" />
            <Path d="M10 10 L44 10 L46 13 L10 13 Z" fill="#FFFFFF" opacity={0.3} />
            <Path d="M18 21 L34 21 M28 15 L34 21 L28 27" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d={starPath(54, 42, 7, 3)} fill="#FFD166" stroke="#D99A18" strokeWidth={1.5} strokeLinejoin="round" />
            <Sparkle cx={9} cy={42} r={3.2} />
          </>
        ),
      };

    // A little car saying a sound.
    case 'speech': {
      const body = (fill: string) => (
        <>
          <Rect x={4} y={34} width={42} height={15} rx={7} fill={fill} />
          <Path d="M12 34 Q16 22 26 22 L34 22 Q40 22 42 34 Z" fill={fill} />
        </>
      );
      return {
        defs: grad('c', '#FF9E8C', '#E04A34'),
        art: (
          <>
            <G stroke="#A82E1C" strokeWidth={4.5}>{body('#A82E1C')}</G>
            {body(g('c'))}
            {/* The windscreen is the face. */}
            <Path d="M15 33 Q18 25 26 25 L33 25 Q38 25 40 33 Z" fill="#CFE9FF" stroke="#4A7FB8" strokeWidth={1.8} strokeLinejoin="round" />
            <Face cx={27} cy={30} spread={5} r={2.2} smileWidth={9} />
            <Cheek cx={13} cy={42} rx={2.2} ry={1.4} />
            <Circle cx={44} cy={40} r={2.6} fill="#FFF3C4" stroke="#D9B84A" strokeWidth={1.2} />
            <Gloss cx={16} cy={38} rx={5} ry={2} />
            <Wheels y={50} xs={[15, 36]} />
            <SpeechBubble x={38} y={4} w={22} tail="left" barColor="#E04A34" />
            <Sparkle cx={7} cy={16} r={3} />
          </>
        ),
      };
    }

    // A road with a dashed centre line, being traced.
    case 'trace':
      return {
        defs: grad('r', '#5A6278', '#2A2F42'),
        art: (
          <>
            {/* The road itself is the stroke to follow: a wide S, centre line dashed. */}
            <Path d="M10 56 Q10 34 28 34 Q46 34 46 14" stroke="#20243A" strokeWidth={17} strokeLinecap="round" fill="none" />
            <Path d="M10 56 Q10 34 28 34 Q46 34 46 14" stroke={g('r')} strokeWidth={13} strokeLinecap="round" fill="none" />
            <Path d="M10 56 Q10 34 28 34 Q46 34 46 14" stroke="#FFD84D" strokeWidth={2.4} strokeDasharray="5 6" strokeLinecap="round" fill="none" />
            {/* A traffic cone marking the start. */}
            <Path d="M8 58 L12 46 L16 58 Z" fill="#FF8E3D" stroke="#C25410" strokeWidth={1.6} strokeLinejoin="round" />
            <Rect x={7} y={57} width={10} height={3} rx={1.5} fill="#C25410" />
            <Pencil x={50} y={20} len={22} angle={30} />
            <Sparkle cx={12} cy={16} r={3} />
          </>
        ),
      };

    // A bus, mid-chat.
    case 'talk': {
      const body = (fill: string) => <Rect x={4} y={20} width={44} height={28} rx={8} fill={fill} />;
      return {
        defs: grad('b', '#FFD166', '#E08A16'),
        art: (
          <>
            <G stroke="#B86A0E" strokeWidth={4.5}>{body('#B86A0E')}</G>
            {body(g('b'))}
            {/* Windscreen face on the left, passenger windows to the right. */}
            <Rect x={8} y={24} width={19} height={13} rx={4} fill="#CFE9FF" stroke="#4A7FB8" strokeWidth={1.8} />
            <Face cx={17} cy={30} spread={4.6} r={2.2} smileWidth={9} />
            {[30, 40].map((x) => (
              <Rect key={x} x={x} y={24} width={8} height={11} rx={3} fill="#CFE9FF" stroke="#4A7FB8" strokeWidth={1.6} />
            ))}
            <Rect x={8} y={41} width={36} height={3} rx={1.5} fill="#FFFFFF" opacity={0.45} />
            <Cheek cx={7} cy={34} rx={2} ry={1.4} />
            <Gloss cx={14} cy={23} rx={6} ry={2} />
            <Wheels y={49} xs={[15, 38]} />
            <SpeechBubble x={38} y={4} w={22} tail="left" barColor="#2A6FD6" />
            <Sparkle cx={56} cy={30} r={3} />
          </>
        ),
      };
    }

    // Word cards riding in a little train carriage.
    case 'words':
      return {
        defs: grad('t', '#B694FF', '#6B3AC8'),
        art: (
          <>
            <WordCards x={6} y={14} tint="#FFDFEE" ink="#B8306E" />
            <G>
              <Rect x={30} y={30} width={28} height={17} rx={5} fill={g('t')} stroke="#4A248F" strokeWidth={2.2} />
              <Rect x={34} y={34} width={8} height={8} rx={2.5} fill="#CFE9FF" stroke="#4A7FB8" strokeWidth={1.4} />
              <Rect x={46} y={34} width={8} height={8} rx={2.5} fill="#CFE9FF" stroke="#4A7FB8" strokeWidth={1.4} />
              <Rect x={33} y={27} width={8} height={4} rx={2} fill="#4A248F" />
              <Gloss cx={38} cy={32} rx={5} ry={1.8} />
              <Wheels y={49} xs={[38, 51]} r={4.6} />
              {/* The coupling, so it reads as one carriage of a train. */}
              <Rect x={24} y={41} width={7} height={3} rx={1.5} fill="#5A6278" />
            </G>
            <Sparkle cx={56} cy={16} r={3.2} />
          </>
        ),
      };

    // A racing car and a ball on a track.
    case 'play': {
      const body = (fill: string) => (
        <>
          <Rect x={4} y={36} width={40} height={11} rx={5} fill={fill} />
          <Path d="M14 36 Q18 27 26 27 L31 27 Q36 27 38 36 Z" fill={fill} />
          <Path d="M2 40 L10 36 L10 44 Z" fill={fill} />
        </>
      );
      return {
        defs: grad('r', '#7FE0FF', '#0E8ABF'),
        art: (
          <>
            {/* The track it is on. */}
            <Path d="M2 54 Q32 48 62 54" stroke="#3A3F52" strokeWidth={7} strokeLinecap="round" fill="none" />
            <G stroke="#07566F" strokeWidth={4}>{body('#07566F')}</G>
            {body(g('r'))}
            <Path d="M16 35 Q19 29 26 29 L30 29 Q35 29 36 35 Z" fill="#CFE9FF" stroke="#4A7FB8" strokeWidth={1.6} strokeLinejoin="round" />
            <Face cx={26} cy={32} spread={4} r={1.9} smileWidth={7.5} />
            {/* A racing number on the flank. */}
            <Circle cx={38} cy={41} r={4.4} fill="#FFFFFF" stroke="#07566F" strokeWidth={1.4} />
            <Path d="M38 38.6 L38 43.4" stroke="#07566F" strokeWidth={1.8} strokeLinecap="round" />
            <Gloss cx={18} cy={38} rx={5} ry={1.8} />
            <Wheels y={48} xs={[14, 35]} r={5.4} />
            <Ball cx={53} cy={38} r={9} from="#FFD166" ink="#D99A18" />
            <Sparkle cx={10} cy={16} r={3} />
          </>
        ),
      };
    }

// A microphone with music notes: the section is about what a voice DOES, so the art is the
    // voice itself rather than a character — which also keeps it distinct from the speech card.
    case 'voice':
      return {
        defs: grad('v', '#7FD8FF', '#1F8ED6'),
        art: (
          <>
            <Path d="M32 44 L32 54" stroke="#12608F" strokeWidth={5} strokeLinecap="round" />
            <Path d="M20 54 L44 54" stroke="#12608F" strokeWidth={5} strokeLinecap="round" />
            <Path d="M16 30 Q16 44 32 44 Q48 44 48 30" stroke="#12608F" strokeWidth={4.5} strokeLinecap="round" fill="none" />
            <Rect x={23} y={6} width={18} height={32} rx={9} fill={g('v')} stroke="#12608F" strokeWidth={2.4} />
            {[14, 20, 26].map((y) => (
              <Path key={y} d={`M26 ${y} L38 ${y}`} stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" opacity={0.55} />
            ))}
            <Gloss cx={28} cy={13} rx={2.6} ry={5} rotate={0} opacity={0.45} />
            {/* Two notes, rising away from the microphone. */}
            <G>
              <Circle cx={52} cy={26} r={4.4} fill="#7FD8FF" stroke="#12608F" strokeWidth={1.8} />
              <Path d="M56 26 L56 10" stroke="#12608F" strokeWidth={2.4} strokeLinecap="round" />
              <Path d="M56 10 Q61 11 61 15" stroke="#12608F" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            </G>
            <G opacity={0.8}>
              <Circle cx={9} cy={20} r={3.4} fill="#7FD8FF" stroke="#12608F" strokeWidth={1.6} />
              <Path d="M12 20 L12 8" stroke="#12608F" strokeWidth={2} strokeLinecap="round" />
            </G>
            {/* A dashed road marking, so the microphone still belongs to the city. */}
            <Path d="M6 50 L20 50" stroke="#FFD84D" strokeWidth={2.4} strokeDasharray="4 4" strokeLinecap="round" />
            <Sparkle cx={52} cy={46} r={3} />
          </>
        ),
      };

    // An open book with a traffic light beside it.
    case 'lessons':
      return {
        defs: grad('c', '#5BD98A', '#1F9E55'),
        art: (
          <>
            <OpenBook x={4} y={30} w={40} h={26} cover="#5BAEFF" coverInk="#1F5FB8" />
            <G>
              <Rect x={44} y={6} width={16} height={34} rx={6} fill="#3A3F52" stroke="#20243A" strokeWidth={2} />
              <Rect x={50} y={40} width={4} height={14} rx={2} fill="#5A6278" />
              {[
                { y: 14, c: '#FF6B5A', on: 0.35 },
                { y: 23, c: '#FFD166', on: 0.35 },
                { y: 32, c: '#5BD98A', on: 1 },
              ].map((l) => (
                <Circle key={l.y} cx={52} cy={l.y} r={4.4} fill={l.c} opacity={l.on} stroke="#20243A" strokeWidth={1.2} />
              ))}
              {/* The green is lit, so the card says "go". */}
              <Circle cx={52} cy={32} r={7.5} fill="#5BD98A" opacity={0.22} />
            </G>
            <Sparkle cx={10} cy={14} r={3} />
          </>
        ),
      };
  }
}

/** BIBI — the Vehicle Adventure companion. A round little bus with a face and a wave of light. */
export function drawBibi(grad: Grad, g: Fill): Drawn {
  const body = (fill: string) => <Rect x={8} y={26} width={48} height={44} rx={16} fill={fill} />;
  return {
    defs: (
      <>
        {grad('b', '#FFD166', '#E08A16')}
        {grad('w', '#CFE9FF', '#8AB8E8')}
      </>
    ),
    art: (
      <>
        {/* A roof light, so it reads as a friendly little service bus. */}
        <Rect x={26} y={18} width={12} height={8} rx={3.5} fill="#FF8E7C" stroke="#C2402C" strokeWidth={2} />
        <Circle cx={32} cy={14} r={4.4} fill="#FFF3C4" stroke="#D9B84A" strokeWidth={1.8} />
        <G stroke="#B86A0E" strokeWidth={5}>{body('#B86A0E')}</G>
        {body(g('b'))}
        {/* The windscreen is the face — the whole reason a bus can be a character. */}
        <Rect x={15} y={32} width={34} height={22} rx={9} fill={g('w')} stroke="#4A7FB8" strokeWidth={3} />
        <Face cx={32} cy={41} spread={8} r={3.6} smileWidth={17} />
        <Gloss cx={23} cy={35} rx={6} ry={2.6} opacity={0.6} />
        <Cheek cx={15} cy={50} rx={3.4} ry={2.2} />
        <Cheek cx={49} cy={50} rx={3.4} ry={2.2} />
        {/* A side stripe and headlights. */}
        <Rect x={13} y={58} width={38} height={4} rx={2} fill="#FFFFFF" opacity={0.5} />
        <Circle cx={18} cy={66} r={3.4} fill="#FFF3C4" stroke="#D9B84A" strokeWidth={1.6} />
        <Circle cx={46} cy={66} r={3.4} fill="#FFF3C4" stroke="#D9B84A" strokeWidth={1.6} />
        <G>
          {[18, 46].map((x) => (
            <Circle key={x} cx={x} cy={66} r={7.5} fill="#FFF3C4" opacity={0.2} />
          ))}
        </G>
        {[20, 44].map((x) => (
          <G key={x}>
            <Circle cx={x} cy={80} r={10} fill="#3A3F52" stroke="#20243A" strokeWidth={2.4} />
            <Circle cx={x} cy={80} r={4.2} fill="#C3CEE4" />
          </G>
        ))}
        <Sparkle cx={8} cy={22} r={4} />
        <Sparkle cx={57} cy={16} r={3} />
      </>
    ),
  };
}
