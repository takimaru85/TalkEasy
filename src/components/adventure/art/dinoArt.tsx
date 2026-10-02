import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { CardSlot } from '@/adventure/themes';
import { Ball, Cheek, Face, Gloss, INK, OpenBook, Pencil, Sparkle, SpeechBubble, WordCards, starPath, type Drawn, type Fill, type Grad } from './kit';

/**
 * DINOSAUR ADVENTURE card art — a prehistoric valley.
 *
 * Palette: volcanic orange, fern green, egg shell and fossil bone. Every creature here is a
 * hatchling or a round-cheeked grown-up: big eyes, no teeth, no claws. A T-Rex a child is meant to
 * want to talk to, not run from.
 *
 * Each drawing pairs a DINOSAUR element with the shared activity token from `kit` (a speech
 * bubble, a pencil, an open book), so a card is recognisable as "the talking one" or "the tracing
 * one" across every theme while the character changes completely.
 */
export function drawDino(slot: CardSlot, grad: Grad, g: Fill): Drawn {
  switch (slot) {
    // A hatching egg in a nest, with the first star of the day.
    case 'mission':
      return {
        defs: (
          <>
            {grad('e', '#FFF4D4', '#F4D98E')}
            {grad('n', '#C89A5A', '#8A5F2A')}
          </>
        ),
        art: (
          <>
            <Path d="M14 48 Q32 40 50 48 Q50 56 32 57 Q14 56 14 48 Z" fill={g('n')} stroke="#6B4418" strokeWidth={2} strokeLinejoin="round" />
            {/* The egg, cracked open across the middle — the crack is the story. */}
            <Path
              d="M32 10 Q45 10 46 30 Q47 46 32 46 Q17 46 18 30 Q19 10 32 10 Z"
              fill={g('e')}
              stroke="#C9A24A"
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            <Path d="M18 29 L24 25 L27 31 L33 25 L37 32 L42 26 L46 30" stroke="#C9A24A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Spots, and a hatchling peeking over the rim. */}
            <Circle cx={26} cy={38} r={2.6} fill="#D8A93E" opacity={0.5} />
            <Circle cx={37} cy={40} r={2} fill="#D8A93E" opacity={0.45} />
            <Ellipse cx={32} cy={22} rx={8} ry={7} fill="#7ED86A" stroke="#2F8A3E" strokeWidth={2} />
            <Face cx={32} cy={21} spread={3} r={2.2} smileWidth={6} />
            <Gloss cx={27} cy={16} rx={4} ry={2} />
            <Path d={starPath(51, 14, 6, 2.6)} fill="#FFD166" stroke="#D99A18" strokeWidth={1.4} strokeLinejoin="round" />
            <Sparkle cx={12} cy={22} r={3.4} />
          </>
        ),
      };

    // A friendly T-Rex saying a sound. Drawn in PROFILE: a long muzzle and a jaw line are what
    // make a head read as a dinosaur rather than as any round animal.
    case 'speech': {
      const head = (fill: string) => (
        <>
          {/* Neck, skull, then the muzzle jutting forward — three masses, one silhouette. */}
          <Ellipse cx={13} cy={44} rx={11} ry={11} fill={fill} />
          <Rect x={6} y={24} width={26} height={22} rx={10} fill={fill} />
          <Rect x={26} y={28} width={26} height={15} rx={6} fill={fill} />
        </>
      );
      return {
        defs: grad('t', '#FFC48A', '#EE7A2A'),
        art: (
          <>
            {/* Soft back ridges, behind the head. */}
            {[8, 14, 20].map((x, i) => (
              <Circle key={x} cx={x} cy={23 - i * 1.5} r={3.4 - i * 0.4} fill="#FFC94D" stroke="#C98A12" strokeWidth={1.5} />
            ))}
            <G stroke="#A8521A" strokeWidth={4.5}>{head('#A8521A')}</G>
            {head(g('t'))}
            {/* The jaw: a lighter lower block plus the mouth line that separates it. */}
            <Path d="M27 37 L50 37" stroke="#A8521A" strokeWidth={2.4} strokeLinecap="round" />
            <Path d="M28 38 Q38 43 49 40 Q50 37 48 37 L29 37 Z" fill="#FFE6C4" />
            <Circle cx={48} cy={31} r={1.7} fill="#A8521A" />
            {/* A brow ridge over the eye — the other half of "this is a dinosaur". */}
            <Path d="M16 26 Q22 23 28 27" stroke="#A8521A" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <Circle cx={23} cy={31} r={2.9} fill={INK} />
            <Circle cx={24} cy={30} r={1} fill="#FFFFFF" />
            <Cheek cx={13} cy={37} />
            <Gloss cx={16} cy={28} rx={5} ry={2.2} />
            {/* The tiny arm, the friendliest thing about a T-Rex. */}
            <Path d="M20 48 Q27 47 27 42" stroke="#A8521A" strokeWidth={5} strokeLinecap="round" fill="none" />
            <Path d="M20 48 Q27 47 27 42" stroke="#FFB070" strokeWidth={2.8} strokeLinecap="round" fill="none" />
            <SpeechBubble x={36} y={4} w={22} tail="left" barColor="#E9513C" />
            <Sparkle cx={6} cy={14} r={3} />
          </>
        ),
      };
    }

    // A three-toed footprint, being traced.
    case 'trace': {
      const print = (fill: string, dx = 0, dy = 0, s = 1) => (
        <G transform={`translate(${dx} ${dy}) scale(${s})`}>
          <Ellipse cx={24} cy={40} rx={11} ry={9} fill={fill} />
          <Ellipse cx={14} cy={28} rx={4.6} ry={7} fill={fill} transform="rotate(-22 14 28)" />
          <Ellipse cx={24} cy={25} rx={4.6} ry={7.5} fill={fill} />
          <Ellipse cx={34} cy={28} rx={4.6} ry={7} fill={fill} transform="rotate(22 34 28)" />
        </G>
      );
      return {
        defs: grad('p', '#9BE38C', '#3FA65A'),
        art: (
          <>
            {/* A fainter print behind, so it reads as a trail to follow. */}
            <G opacity={0.28}>{print('#2F8A3E', 26, -14, 0.5)}</G>
            <G stroke="#1F6B33" strokeWidth={4}>{print('#1F6B33')}</G>
            {print(g('p'))}
            <Gloss cx={20} cy={37} rx={5} ry={2.4} />
            <Pencil x={44} y={8} len={26} angle={34} />
            <Sparkle cx={10} cy={16} r={3} />
          </>
        ),
      };
    }

    // A triceratops, mid-chat. Drawn FACE ON: the frill, two brow horns and a beak all read at
    // once from the front, where in profile they collapse into a blob.
    case 'talk': {
      return {
        defs: (
          <>
            {grad('c', '#C4ADFF', '#7443D8')}
            {grad('f', '#FFC2DC', '#F06FA8')}
          </>
        ),
        art: (
          <>
            {/* The frill: a fan behind the head, with scalloped bumps around its rim. */}
            {Array.from({ length: 9 }, (_, i) => {
              const a = Math.PI + (i * Math.PI) / 8;
              return <Circle key={i} cx={34 + Math.cos(a) * 17} cy={36 + Math.sin(a) * 17} r={4.6} fill={g('f')} stroke="#B22C68" strokeWidth={1.6} />;
            })}
            <Circle cx={34} cy={36} r={17} fill={g('f')} stroke="#B22C68" strokeWidth={2.2} />
            <Circle cx={34} cy={36} r={11} fill="#FFFFFF" opacity={0.2} />
            {/* Two long brow horns, bone coloured and blunt on purpose. */}
            {[
              { x1: 26, x2: 20, tip: 9 },
              { x1: 42, x2: 48, tip: 9 },
            ].map((h) => (
              <Path
                key={h.x1}
                d={`M${h.x1 - 3} 30 Q${h.x1 - 2} 18 ${h.x2} ${h.tip} Q${h.x1 + 4} 19 ${h.x1 + 3} 31 Z`}
                fill="#FFF3D6"
                stroke="#C9A04A"
                strokeWidth={1.8}
                strokeLinejoin="round"
              />
            ))}
            {/* The face, in front of the frill. */}
            <Ellipse cx={34} cy={40} rx={13} ry={14} fill="#4A248F" />
            <Ellipse cx={34} cy={40} rx={11} ry={12} fill={g('c')} />
            {/* The beak, which is the third unmistakable triceratops mark. */}
            <Path d="M28 50 Q34 57 40 50 Q34 53 28 50 Z" fill="#FFF3D6" stroke="#C9A04A" strokeWidth={1.6} strokeLinejoin="round" />
            <Path d="M31 35 L34 29 L37 35 Z" fill="#FFF3D6" stroke="#C9A04A" strokeWidth={1.4} strokeLinejoin="round" />
            <Face cx={34} cy={41} spread={5.4} r={2.6} smileWidth={10} />
            <Cheek cx={25} cy={46} />
            <Cheek cx={43} cy={46} />
            <Gloss cx={28} cy={33} rx={5} ry={2.2} />
            <SpeechBubble x={2} y={4} w={21} tail="right" barColor="#7343D8" />
            <Sparkle cx={58} cy={18} r={3} />
          </>
        ),
      };
    }

    // Word cards, weighted down by a fossil bone.
    case 'words':
      return {
        defs: grad('b', '#FFFBEC', '#E8D9A8'),
        art: (
          <>
            <WordCards x={10} y={16} tint="#FFE9C9" ink="#B06A1A" />
            <G transform="rotate(-24 44 40)">
              <Rect x={34} y={36} width={22} height={7} rx={3.5} fill={g('b')} stroke="#B8994C" strokeWidth={1.8} />
              <Circle cx={34} cy={36.5} r={4.4} fill={g('b')} stroke="#B8994C" strokeWidth={1.8} />
              <Circle cx={34} cy={43} r={4.4} fill={g('b')} stroke="#B8994C" strokeWidth={1.8} />
              <Circle cx={56} cy={36.5} r={4.4} fill={g('b')} stroke="#B8994C" strokeWidth={1.8} />
              <Circle cx={56} cy={43} r={4.4} fill={g('b')} stroke="#B8994C" strokeWidth={1.8} />
            </G>
            <Sparkle cx={53} cy={14} r={3.2} />
          </>
        ),
      };

    // A stegosaurus playing with a ball.
    case 'play': {
      const body = (fill: string) => (
        <>
          <Ellipse cx={24} cy={40} rx={17} ry={11} fill={fill} />
          <Ellipse cx={11} cy={33} rx={7} ry={6} fill={fill} />
          {[16, 24, 32].map((x) => (
            <Rect key={x} x={x} y={47} width={6} height={9} rx={3} fill={fill} />
          ))}
        </>
      );
      return {
        defs: grad('s', '#7FE0C4', '#189B86'),
        art: (
          <>
            {/* Back plates: soft leaves, not spikes. */}
            {[
              { x: 18, y: 27, r: 5 },
              { x: 26, y: 24, r: 6 },
              { x: 34, y: 27, r: 5 },
            ].map((p) => (
              <Circle key={p.x} cx={p.x} cy={p.y} r={p.r} fill="#FFC94D" stroke="#C98A12" strokeWidth={1.8} />
            ))}
            <G stroke="#0C6A5C" strokeWidth={4.5}>{body('#0C6A5C')}</G>
            {body(g('s'))}
            <Face cx={9} cy={32} spread={3} r={2.1} smileWidth={6} />
            <Cheek cx={5} cy={36} rx={1.8} ry={1.2} />
            <Gloss cx={22} cy={36} rx={6} ry={2.4} />
            <Ball cx={48} cy={44} r={11} from="#FF8E7C" ink="#C2402C" />
            <Sparkle cx={52} cy={16} r={3.4} />
          </>
        ),
      };
    }

// A microphone with music notes: the section is about what a voice DOES, so the art is the
    // voice itself rather than a character — which also keeps it distinct from the speech card.
    case 'voice':
      return {
        defs: grad('v', '#7FE0C4', '#189B86'),
        art: (
          <>
            <Path d="M32 44 L32 54" stroke="#1F6B33" strokeWidth={5} strokeLinecap="round" />
            <Path d="M20 54 L44 54" stroke="#1F6B33" strokeWidth={5} strokeLinecap="round" />
            <Path d="M16 30 Q16 44 32 44 Q48 44 48 30" stroke="#1F6B33" strokeWidth={4.5} strokeLinecap="round" fill="none" />
            <Rect x={23} y={6} width={18} height={32} rx={9} fill={g('v')} stroke="#1F6B33" strokeWidth={2.4} />
            {[14, 20, 26].map((y) => (
              <Path key={y} d={`M26 ${y} L38 ${y}`} stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" opacity={0.55} />
            ))}
            <Gloss cx={28} cy={13} rx={2.6} ry={5} rotate={0} opacity={0.45} />
            {/* Two notes, rising away from the microphone. */}
            <G>
              <Circle cx={52} cy={26} r={4.4} fill="#9BE38C" stroke="#1F6B33" strokeWidth={1.8} />
              <Path d="M56 26 L56 10" stroke="#1F6B33" strokeWidth={2.4} strokeLinecap="round" />
              <Path d="M56 10 Q61 11 61 15" stroke="#1F6B33" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            </G>
            <G opacity={0.8}>
              <Circle cx={9} cy={20} r={3.4} fill="#9BE38C" stroke="#1F6B33" strokeWidth={1.6} />
              <Path d="M12 20 L12 8" stroke="#1F6B33" strokeWidth={2} strokeLinecap="round" />
            </G>
            {/* A fern leaf, so the microphone still belongs to the valley. */}
            <Ellipse cx={13} cy={48} rx={6} ry={3} fill="#3FA65A" stroke="#1F6B33" strokeWidth={1.4} transform="rotate(-24 13 48)" />
            <Sparkle cx={52} cy={46} r={3} />
          </>
        ),
      };

    // An open book with a fern frond across it.
    case 'lessons':
      return {
        defs: grad('l', '#9BE38C', '#3FA65A'),
        art: (
          <>
            <OpenBook x={10} y={24} w={44} h={28} cover="#5BAEFF" coverInk="#1F5FB8" />
            {/* A fern: one stem, leaflets both sides, drawn once and mirrored. */}
            <Path d="M20 34 Q30 18 44 12" stroke="#2F8A3E" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            {[0, 1, 2, 3, 4].map((i) => {
              const t = 0.15 + i * 0.18;
              const x = 20 + (44 - 20) * t + 4 * Math.sin(t * 3);
              const y = 34 - 22 * t * (1.1 - t * 0.3);
              return (
                <G key={i}>
                  <Ellipse cx={x - 4} cy={y - 1} rx={4.2} ry={2.4} fill={g('l')} transform={`rotate(${-30 - i * 4} ${x - 4} ${y - 1})`} />
                  <Ellipse cx={x + 4} cy={y + 2} rx={4.2} ry={2.4} fill={g('l')} transform={`rotate(${-30 - i * 4} ${x + 4} ${y + 2})`} />
                </G>
              );
            })}
            <Circle cx={45} cy={11} r={3} fill="#7ED86A" stroke="#2F8A3E" strokeWidth={1.6} />
            <Sparkle cx={12} cy={14} r={3} />
          </>
        ),
      };
  }
}

/**
 * REXY — the Dinosaur Adventure companion. A round T-Rex hatchling, waving.
 *
 * The two marks that stop a round orange character reading as a teddy bear: a MUZZLE that sticks
 * out below the eyes with nostrils on it, and a thick TAIL clear of the body on the left. Without
 * those, friendly-and-round is just a bear.
 */
export function drawRexy(grad: Grad, g: Fill): Drawn {
  const body = (fill: string) => (
    <>
      {/* Tail first, so it reads as behind the body. */}
      <Path d="M18 72 Q4 74 2 60 Q0 50 6 46 Q6 56 12 60 Q16 64 22 64 Z" fill={fill} />
      <Ellipse cx={34} cy={68} rx={20} ry={18} fill={fill} />
      <Rect x={20} y={80} width={12} height={13} rx={6} fill={fill} />
      <Rect x={36} y={80} width={12} height={13} rx={6} fill={fill} />
      <Rect x={14} y={18} width={38} height={30} rx={14} fill={fill} />
      {/* The muzzle, jutting down and forward from the face. */}
      <Rect x={21} y={32} width={26} height={16} rx={7} fill={fill} />
    </>
  );
  return {
    defs: (
      <>
        {grad('t', '#FFC48A', '#EE7A2A')}
        {grad('b', '#FFE9C9', '#F6C68A')}
      </>
    ),
    art: (
      <>
        {/* Soft ridges along the top of the head. */}
        {[20, 28, 36, 44].map((x, i) => (
          <Circle key={x} cx={x} cy={17 + (i === 0 || i === 3 ? 3 : 0)} r={4.4} fill="#FFC94D" stroke="#C98A12" strokeWidth={1.8} />
        ))}
        <G stroke="#A8521A" strokeWidth={5}>{body('#A8521A')}</G>
        {body(g('t'))}
        <Ellipse cx={34} cy={74} rx={12} ry={10} fill={g('b')} />
        {/* The muzzle again in the pale tone, so it sits in FRONT of the face. */}
        <Rect x={21} y={32} width={26} height={16} rx={7} fill={g('b')} />
        <Circle cx={28} cy={38} r={1.7} fill="#A8521A" />
        <Circle cx={40} cy={38} r={1.7} fill="#A8521A" />
        <Path d="M27 43 Q34 48 41 43" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Face cx={33} cy={27} spread={8} r={3.6} smile={false} />
        <Cheek cx={19} cy={34} rx={3.2} ry={2.2} />
        <Cheek cx={49} cy={34} rx={3.2} ry={2.2} />
        <Gloss cx={24} cy={24} rx={7} ry={3} />
        {/* The little arm, raised in a wave — the friendliest thing about a T-Rex. */}
        <Path d="M52 58 Q60 56 60 48" stroke="#A8521A" strokeWidth={6} strokeLinecap="round" fill="none" />
        <Path d="M52 58 Q60 56 60 48" stroke="#FFB070" strokeWidth={3.6} strokeLinecap="round" fill="none" />
        <Circle cx={60} cy={46} r={4} fill={g('t')} stroke="#A8521A" strokeWidth={2} />
        <Sparkle cx={8} cy={34} r={4} />
        <Sparkle cx={57} cy={20} r={3} />
      </>
    ),
  };
}
