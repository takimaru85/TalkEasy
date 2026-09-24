import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { AvatarId } from '@/constants/avatars';

/**
 * TalkEasy's illustrated avatars. One style for all of them — flat shapes, no outlines, the same
 * eyes, cheeks and smile — so they read as a family and as the app's own, not as emoji.
 * Pure vector: sharp at any size and fully offline.
 */

const INK = '#263042';
const CHEEK = '#FF8FA3';

function Eyes({ y = 52, gap = 12, r = 5.2 }: { y?: number; gap?: number; r?: number }) {
  return (
    <G>
      <Circle cx={50 - gap} cy={y} r={r} fill={INK} />
      <Circle cx={50 + gap} cy={y} r={r} fill={INK} />
      <Circle cx={50 - gap + r * 0.35} cy={y - r * 0.35} r={r * 0.33} fill="#FFFFFF" />
      <Circle cx={50 + gap + r * 0.35} cy={y - r * 0.35} r={r * 0.33} fill="#FFFFFF" />
    </G>
  );
}

function Cheeks({ y = 62, gap = 20 }: { y?: number; gap?: number }) {
  return (
    <G opacity={0.5}>
      <Ellipse cx={50 - gap} cy={y} rx={5} ry={3.2} fill={CHEEK} />
      <Ellipse cx={50 + gap} cy={y} rx={5} ry={3.2} fill={CHEEK} />
    </G>
  );
}

function Smile({ y = 65, w = 6, color = INK }: { y?: number; w?: number; color?: string }) {
  return <Path d={`M${50 - w} ${y} Q50 ${y + 5} ${50 + w} ${y}`} stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" />;
}

const ART: Record<AvatarId, { bg: string; draw: () => React.ReactNode }> = {
  dino: {
    bg: '#DDF3E4',
    draw: () => (
      <>
        <Path d="M33 36 L39 22 L45 34 Z M44 33 L50 19 L56 33 Z M55 34 L61 22 L67 36 Z" fill="#3E9E5E" />
        <Ellipse cx={50} cy={58} rx={30} ry={27} fill="#5BBF7A" />
        <Ellipse cx={50} cy={69} rx={17} ry={11} fill="#A8E0B6" />
        <Circle cx={45} cy={66} r={1.6} fill={INK} />
        <Circle cx={55} cy={66} r={1.6} fill={INK} />
        <Eyes y={50} gap={13} />
        <Smile y={72} w={5} />
      </>
    ),
  },
  lion: {
    bg: '#FFF1C9',
    draw: () => (
      <>
        <Circle cx={50} cy={54} r={36} fill="#E0892B" />
        <Circle cx={31} cy={36} r={7} fill="#F7C04A" />
        <Circle cx={69} cy={36} r={7} fill="#F7C04A" />
        <Circle cx={31} cy={36} r={3.5} fill="#E8A93A" />
        <Circle cx={69} cy={36} r={3.5} fill="#E8A93A" />
        <Circle cx={50} cy={56} r={25} fill="#F7C04A" />
        <Ellipse cx={50} cy={66} rx={12} ry={8.5} fill="#FDE3A0" />
        <Path d="M45.5 61 L54.5 61 L50 66 Z" fill="#7A4A2A" strokeLinejoin="round" stroke="#7A4A2A" strokeWidth={1.5} />
        <Eyes y={51} gap={11} r={4.8} />
        <Cheeks y={62} gap={18} />
        <Smile y={69} w={5} />
      </>
    ),
  },
  tiger: {
    bg: '#FFE4CC',
    draw: () => (
      <>
        <Circle cx={28} cy={34} r={9} fill="#F39A3C" />
        <Circle cx={72} cy={34} r={9} fill="#F39A3C" />
        <Circle cx={28} cy={34} r={4.5} fill="#FFD9B3" />
        <Circle cx={72} cy={34} r={4.5} fill="#FFD9B3" />
        <Ellipse cx={50} cy={57} rx={30} ry={27} fill="#F39A3C" />
        <Path d="M50 31 L50 40 M41 32 L43 39 M59 32 L57 39 M21 52 L29 54 M79 52 L71 54 M22 60 L29 60 M78 60 L71 60" stroke="#3B2A20" strokeWidth={3.2} strokeLinecap="round" />
        <Ellipse cx={50} cy={68} rx={14} ry={9.5} fill="#FFF6EC" />
        <Path d="M46 63 L54 63 L50 67 Z" fill="#E8707D" stroke="#E8707D" strokeWidth={1.5} strokeLinejoin="round" />
        <Eyes y={52} gap={12} />
        <Smile y={70} w={5} />
      </>
    ),
  },
  panda: {
    bg: '#E6ECF5',
    draw: () => (
      <>
        <Circle cx={27} cy={33} r={10} fill={INK} />
        <Circle cx={73} cy={33} r={10} fill={INK} />
        <Ellipse cx={50} cy={57} rx={31} ry={28} fill="#FFFFFF" />
        <Ellipse cx={38} cy={53} rx={7.5} ry={9.5} fill={INK} transform="rotate(-22 38 53)" />
        <Ellipse cx={62} cy={53} rx={7.5} ry={9.5} fill={INK} transform="rotate(22 62 53)" />
        <Circle cx={38.5} cy={52} r={3.2} fill="#FFFFFF" />
        <Circle cx={61.5} cy={52} r={3.2} fill="#FFFFFF" />
        <Circle cx={39} cy={52.5} r={1.8} fill={INK} />
        <Circle cx={61} cy={52.5} r={1.8} fill={INK} />
        <Ellipse cx={50} cy={64} rx={4.2} ry={3} fill={INK} />
        <Cheeks y={65} gap={21} />
        <Smile y={69} w={5} />
      </>
    ),
  },
  koala: {
    bg: '#E3EEF0',
    draw: () => (
      <>
        <Circle cx={24} cy={40} r={15} fill="#9AA7B4" />
        <Circle cx={76} cy={40} r={15} fill="#9AA7B4" />
        <Circle cx={24} cy={40} r={8.5} fill="#F1D6DF" />
        <Circle cx={76} cy={40} r={8.5} fill="#F1D6DF" />
        <Ellipse cx={50} cy={59} rx={28} ry={26} fill="#B5C0CC" />
        <Ellipse cx={50} cy={63} rx={7} ry={9} fill="#3B3F4A" />
        <Eyes y={51} gap={13} r={4.8} />
        <Cheeks y={64} gap={19} />
        <Smile y={75} w={4.5} />
      </>
    ),
  },
  fox: {
    bg: '#FFE6D9',
    draw: () => (
      <>
        <Path d="M22 20 L42 38 L20 50 Z" fill="#E86A33" />
        <Path d="M78 20 L58 38 L80 50 Z" fill="#E86A33" />
        <Path d="M25 27 L36 37 L24 44 Z" fill="#7A3A1F" />
        <Path d="M75 27 L64 37 L76 44 Z" fill="#7A3A1F" />
        <Path d="M18 46 Q50 28 82 46 Q78 72 50 86 Q22 72 18 46 Z" fill="#F07B3F" />
        <Path d="M20 52 Q38 58 50 86 Q26 76 20 52 Z M80 52 Q62 58 50 86 Q74 76 80 52 Z" fill="#FFF4EA" />
        <Circle cx={50} cy={80} r={3.8} fill={INK} />
        <Eyes y={55} gap={12} r={4.8} />
      </>
    ),
  },
  frog: {
    bg: '#E2F5D8',
    draw: () => (
      <>
        <Circle cx={34} cy={36} r={13} fill="#74C15A" />
        <Circle cx={66} cy={36} r={13} fill="#74C15A" />
        <Ellipse cx={50} cy={61} rx={34} ry={24} fill="#74C15A" />
        <Circle cx={34} cy={36} r={8} fill="#FFFFFF" />
        <Circle cx={66} cy={36} r={8} fill="#FFFFFF" />
        <Circle cx={35} cy={37} r={4.5} fill={INK} />
        <Circle cx={65} cy={37} r={4.5} fill={INK} />
        <Circle cx={36.5} cy={35.5} r={1.5} fill="#FFFFFF" />
        <Circle cx={66.5} cy={35.5} r={1.5} fill="#FFFFFF" />
        <Cheeks y={63} gap={22} />
        <Path d="M34 62 Q50 76 66 62" stroke="#2E6B2A" strokeWidth={3} strokeLinecap="round" fill="none" />
      </>
    ),
  },
  penguin: {
    bg: '#DDEEFF',
    draw: () => (
      <>
        <Circle cx={50} cy={56} r={31} fill="#2E3A4F" />
        <Circle cx={41} cy={56} r={13} fill="#FFFFFF" />
        <Circle cx={59} cy={56} r={13} fill="#FFFFFF" />
        <Ellipse cx={50} cy={67} rx={17} ry={13} fill="#FFFFFF" />
        <Eyes y={54} gap={9} r={4.3} />
        <Path d="M45 62 L55 62 L50 69 Z" fill="#F5A623" stroke="#F5A623" strokeWidth={2} strokeLinejoin="round" />
        <Cheeks y={63} gap={15} />
      </>
    ),
  },
  owl: {
    bg: '#EFE6FA',
    draw: () => (
      <>
        <Path d="M22 28 L36 40 L22 46 Z M78 28 L64 40 L78 46 Z" fill="#6E4FA8" />
        <Ellipse cx={50} cy={59} rx={30} ry={29} fill="#8C6BC2" />
        <Path d="M38 78 Q42 82 46 78 M54 78 Q58 82 62 78 M46 84 Q50 88 54 84" stroke="#B9A0E0" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <Circle cx={38} cy={52} r={11} fill="#FFFFFF" />
        <Circle cx={62} cy={52} r={11} fill="#FFFFFF" />
        <Eyes y={52} gap={12} r={5.6} />
        <Path d="M50 58 L55 64 L50 70 L45 64 Z" fill="#F5A623" />
      </>
    ),
  },
  whale: {
    bg: '#DCF1FB',
    draw: () => (
      <>
        <Path d="M47 32 Q45 24 39 21 M47 32 Q49 22 56 19" stroke="#4A90D9" strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M76 56 Q88 40 92 48 Q90 57 80 60 Z" fill="#3B7CC4" />
        <Path d="M14 62 Q14 36 47 36 Q78 36 80 58 Q82 78 55 79 L30 79 Q14 77 14 62 Z" fill="#4A90D9" />
        <Path d="M20 66 Q42 78 76 68 Q70 79 52 79 L32 79 Q22 77 20 66 Z" fill="#BFE0F7" />
        <Circle cx={38} cy={56} r={4.8} fill={INK} />
        <Circle cx={39.6} cy={54.4} r={1.6} fill="#FFFFFF" />
        <Ellipse cx={30} cy={64} rx={4.5} ry={2.8} fill={CHEEK} opacity={0.5} />
        <Path d="M45 63 Q51 68 57 63" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      </>
    ),
  },
  robot: {
    bg: '#E4E8F0',
    draw: () => (
      <>
        <Path d="M50 18 L50 27" stroke="#6B7A90" strokeWidth={3} strokeLinecap="round" />
        <Circle cx={50} cy={16} r={4.5} fill="#F25C54" />
        <Rect x={15} y={44} width={8} height={18} rx={3} fill="#7F90A8" />
        <Rect x={77} y={44} width={8} height={18} rx={3} fill="#7F90A8" />
        <Rect x={21} y={27} width={58} height={50} rx={15} fill="#9FB0C7" />
        <Rect x={29} y={37} width={42} height={30} rx={9} fill="#2B3A52" />
        <Circle cx={41} cy={50} r={5} fill="#6EE7F9" />
        <Circle cx={59} cy={50} r={5} fill="#6EE7F9" />
        <Path d="M43 59 Q50 63 57 59" stroke="#6EE7F9" strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={29} cy={72} r={2} fill="#F25C54" opacity={0.8} />
        <Circle cx={71} cy={72} r={2} fill="#F7C04A" opacity={0.9} />
      </>
    ),
  },
  rocket: {
    bg: '#E8E2FB',
    draw: () => (
      <>
        <Circle cx={22} cy={28} r={1.8} fill="#FFFFFF" />
        <Circle cx={78} cy={22} r={1.4} fill="#FFFFFF" />
        <Circle cx={82} cy={70} r={1.8} fill="#FFFFFF" />
        <Path d="M43 66 Q50 92 57 66 Z" fill="#F5A623" />
        <Path d="M46.5 66 Q50 81 53.5 66 Z" fill="#F25C54" />
        <Path d="M37 48 L25 66 L37 64 Z M63 48 L75 66 L63 64 Z" fill="#F25C54" />
        <Path d="M50 12 Q67 28 64 66 L36 66 Q33 28 50 12 Z" fill="#F4F6FA" />
        <Path d="M50 12 Q59 20 62 30 L38 30 Q41 20 50 12 Z" fill="#F25C54" />
        <Circle cx={50} cy={45} r={9} fill="#9AA7B4" />
        <Circle cx={50} cy={45} r={6.5} fill="#4A90D9" />
        <Circle cx={52.5} cy={42.5} r={2} fill="#FFFFFF" opacity={0.8} />
      </>
    ),
  },
};

export function AvatarArt({ id, size, round = true }: { id: AvatarId; size: number; round?: boolean }) {
  const art = ART[id];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      {round ? <Circle cx={50} cy={50} r={50} fill={art.bg} /> : <Rect width={100} height={100} rx={22} fill={art.bg} />}
      {art.draw()}
    </Svg>
  );
}
