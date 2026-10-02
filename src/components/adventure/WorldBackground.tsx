import React, { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { WorldId } from '@/adventure/worlds';
import { SpaceBackground } from './SpaceBackground';

interface Props {
  world: WorldId;
  width: number;
  height: number;
}

/**
 * The scenery behind every child screen, by adventure world.
 *
 * Space keeps the TalkEasy universe exactly as it was. The other worlds are the same kind of sky —
 * DARK, calm and static — with their own landscape along the bottom and a few details at the
 * edges: volcanoes and ferns, moonlit hills and trees, a city skyline and a road. Every world keeps
 * the same darkness and contrast, so the white text and the solid cards read identically
 * everywhere; only the scenery changes. Like SpaceBackground: fixed positions (never random), no
 * animation, pure vector.
 */
export function WorldBackground({ world, width, height }: Props) {
  if (world === 'space') return <SpaceBackground width={width} height={height} />;
  return <Scene world={world} width={width} height={height} />;
}

const PALETTE: Record<Exclude<WorldId, 'space'>, { top: string; bottom: string; glowA: string; glowB: string }> = {
  dinosaurs: { top: '#1F3358', bottom: '#0B1A24', glowA: '#1F7A6A', glowB: '#8A3A2A' },
  animals: { top: '#1C2B5E', bottom: '#0A1826', glowA: '#2A6A8E', glowB: '#3A6A3A' },
  vehicles: { top: '#2A2562', bottom: '#0C0F2E', glowA: '#5A3AA8', glowB: '#1C6FA8' },
};

/** A few stars high in the sky — fewer than in space, it is a sky over land. */
const STARS = [
  { x: 0.07, y: 0.04, r: 1.5, o: 0.8 }, { x: 0.24, y: 0.09, r: 1.0, o: 0.5 }, { x: 0.41, y: 0.03, r: 1.2, o: 0.7 },
  { x: 0.57, y: 0.11, r: 0.9, o: 0.45 }, { x: 0.71, y: 0.05, r: 1.4, o: 0.8 }, { x: 0.93, y: 0.08, r: 1.1, o: 0.6 },
  { x: 0.15, y: 0.19, r: 0.9, o: 0.4 }, { x: 0.35, y: 0.22, r: 1.2, o: 0.55 }, { x: 0.62, y: 0.2, r: 1.0, o: 0.45 },
  { x: 0.86, y: 0.24, r: 1.3, o: 0.6 }, { x: 0.05, y: 0.33, r: 1.0, o: 0.4 }, { x: 0.5, y: 0.31, r: 0.9, o: 0.35 },
  { x: 0.95, y: 0.36, r: 1.1, o: 0.45 }, { x: 0.28, y: 0.4, r: 0.8, o: 0.3 },
];

function Scene({ world, width: w, height: h }: { world: Exclude<WorldId, 'space'>; width: number; height: number }) {
  const id = useId().replace(/:/g, '');
  const p = PALETTE[world];

  return (
    <Svg style={StyleSheet.absoluteFill} width={w} height={h} accessible={false} pointerEvents="none">
      <Defs>
        <LinearGradient id={`sky${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor={p.top} />
          <Stop offset="1" stopColor={p.bottom} />
        </LinearGradient>
        <RadialGradient id={`ga${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={p.glowA} stopOpacity="0.55" />
          <Stop offset="1" stopColor={p.glowA} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`gb${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={p.glowB} stopOpacity="0.45" />
          <Stop offset="1" stopColor={p.glowB} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`moon${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0.55" stopColor="#FFF3C4" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#FFF3C4" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#sky${id})`} />
      <Circle cx={w * 0.15} cy={h * 0.12} r={w * 0.6} fill={`url(#ga${id})`} />
      <Circle cx={w * 0.95} cy={h * 0.62} r={w * 0.55} fill={`url(#gb${id})`} />

      {STARS.map((s, i) => (
        <Circle key={i} cx={s.x * w} cy={s.y * h} r={s.r} fill="#FFFFFF" opacity={s.o} />
      ))}

      {/* The moon, top right, shared by every land world. */}
      <Circle cx={w * 0.84} cy={h * 0.1} r={w * 0.13} fill={`url(#moon${id})`} />
      <Circle cx={w * 0.84} cy={h * 0.1} r={w * 0.055} fill="#FFF3C4" opacity={0.9} />
      <Circle cx={w * 0.825} cy={h * 0.095} r={w * 0.012} fill="#E8D9A0" opacity={0.8} />

      {world === 'dinosaurs' ? <Dinosaurs w={w} h={h} /> : world === 'animals' ? <Animals w={w} h={h} /> : <Vehicles w={w} h={h} />}
    </Svg>
  );
}

/** Volcanoes on the horizon with a warm glow, ferns at the corners, and a far-off long neck. */
function Dinosaurs({ w, h }: { w: number; h: number }) {
  const base = h * 0.9;
  return (
    <G>
      {/* distant volcanoes */}
      <Path d={`M ${w * 0.02} ${base} L ${w * 0.2} ${h * 0.74} Q ${w * 0.25} ${h * 0.71} ${w * 0.3} ${h * 0.74} L ${w * 0.5} ${base} Z`} fill="#2A3148" opacity={0.85} />
      <Path d={`M ${w * 0.45} ${base} L ${w * 0.68} ${h * 0.7} Q ${w * 0.73} ${h * 0.665} ${w * 0.78} ${h * 0.7} L ${w * 1.02} ${base} Z`} fill="#323A55" opacity={0.9} />
      <Ellipse cx={w * 0.73} cy={h * 0.675} rx={w * 0.09} ry={h * 0.02} fill="#FF8A3D" opacity={0.35} />
      <Circle cx={w * 0.74} cy={h * 0.64} r={w * 0.02} fill="#C9C3D9" opacity={0.25} />
      <Circle cx={w * 0.77} cy={h * 0.62} r={w * 0.028} fill="#C9C3D9" opacity={0.18} />
      {/* a friendly long-neck silhouette far away */}
      <Path
        d={`M ${w * 0.3} ${base} Q ${w * 0.31} ${h * 0.86} ${w * 0.36} ${h * 0.855} Q ${w * 0.39} ${h * 0.8} ${w * 0.4} ${h * 0.79} Q ${w * 0.415} ${h * 0.78} ${w * 0.42} ${h * 0.79} Q ${w * 0.41} ${h * 0.8} ${w * 0.405} ${h * 0.86} Q ${w * 0.44} ${h * 0.87} ${w * 0.45} ${base} Z`}
        fill="#1E2A3E"
        opacity={0.9}
      />
      {/* ground */}
      <Path d={`M 0 ${base} Q ${w * 0.5} ${h * 0.87} ${w} ${base} L ${w} ${h} L 0 ${h} Z`} fill="#13232C" />
      {/* ferns, corners only */}
      {[
        { x: w * 0.02, dir: 1 },
        { x: w * 0.98, dir: -1 },
      ].map((f, i) => (
        <G key={i} opacity={0.75}>
          {[0, 1, 2, 3].map((k) => (
            <Path
              key={k}
              d={`M ${f.x} ${h} Q ${f.x + f.dir * w * (0.05 + k * 0.03)} ${h * (0.9 - k * 0.025)} ${f.x + f.dir * w * (0.1 + k * 0.035)} ${h * (0.84 - k * 0.02)}`}
              stroke="#1F4A3A"
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </G>
      ))}
    </G>
  );
}

/** Moonlit rolling hills, round trees at the edges, and a few fireflies. */
function Animals({ w, h }: { w: number; h: number }) {
  return (
    <G>
      <Path d={`M 0 ${h * 0.82} Q ${w * 0.3} ${h * 0.74} ${w * 0.62} ${h * 0.8} T ${w} ${h * 0.76} L ${w} ${h} L 0 ${h} Z`} fill="#1B3A3A" opacity={0.85} />
      <Path d={`M 0 ${h * 0.9} Q ${w * 0.4} ${h * 0.84} ${w * 0.7} ${h * 0.9} T ${w} ${h * 0.88} L ${w} ${h} L 0 ${h} Z`} fill="#12282A" />
      {/* round trees at the edges */}
      {[
        { x: w * 0.06, y: h * 0.8, r: w * 0.07 },
        { x: w * 0.15, y: h * 0.83, r: w * 0.05 },
        { x: w * 0.92, y: h * 0.77, r: w * 0.08 },
      ].map((t, i) => (
        <G key={i} opacity={0.9}>
          <Rect x={t.x - w * 0.006} y={t.y} width={w * 0.012} height={t.r * 1.3} fill="#0F2020" />
          <Circle cx={t.x} cy={t.y} r={t.r} fill="#1E4A3E" />
          <Circle cx={t.x - t.r * 0.3} cy={t.y - t.r * 0.3} r={t.r * 0.35} fill="#2A5E4E" opacity={0.6} />
        </G>
      ))}
      {/* fireflies */}
      {[
        [0.22, 0.62], [0.78, 0.55], [0.4, 0.7], [0.66, 0.68], [0.12, 0.5], [0.9, 0.44],
      ].map(([x, y], i) => (
        <G key={i}>
          <Circle cx={x * w} cy={y * h} r={5} fill="#FFE98A" opacity={0.12} />
          <Circle cx={x * w} cy={y * h} r={1.6} fill="#FFE98A" opacity={0.75} />
        </G>
      ))}
      {/* a paw-print trail in the grass */}
      {[0.3, 0.42, 0.54].map((x, i) => (
        <G key={`p${i}`} opacity={0.18}>
          <Ellipse cx={x * w} cy={h * (0.95 - i * 0.01)} rx={4} ry={3.4} fill="#FFFFFF" />
          {[-4, 0, 4].map((dx) => (
            <Circle key={dx} cx={x * w + dx} cy={h * (0.95 - i * 0.01) - 5} r={1.5} fill="#FFFFFF" />
          ))}
        </G>
      ))}
    </G>
  );
}

/** A night-time city skyline with lit windows, and a road with a dashed centre line. */
function Vehicles({ w, h }: { w: number; h: number }) {
  const ground = h * 0.9;
  const buildings = [
    { x: 0, bw: 0.12, bh: 0.16 }, { x: 0.12, bw: 0.1, bh: 0.24 }, { x: 0.22, bw: 0.13, bh: 0.13 },
    { x: 0.35, bw: 0.09, bh: 0.2 }, { x: 0.44, bw: 0.12, bh: 0.11 }, { x: 0.56, bw: 0.1, bh: 0.22 },
    { x: 0.66, bw: 0.13, bh: 0.15 }, { x: 0.79, bw: 0.09, bh: 0.26 }, { x: 0.88, bw: 0.12, bh: 0.17 },
  ];
  return (
    <G>
      {buildings.map((b, i) => {
        const x = b.x * w;
        const bw = b.bw * w;
        const top = ground - b.bh * h;
        return (
          <G key={i}>
            <Rect x={x} y={top} width={bw - 2} height={b.bh * h} fill={i % 2 ? '#1A1F48' : '#20265A'} opacity={0.95} />
            {/* a few lit windows, fixed pattern */}
            {[0, 1, 2].map((row) =>
              [0, 1].map((col) =>
                (i + row + col) % 3 === 0 ? (
                  <Rect key={`${row}-${col}`} x={x + bw * (0.22 + col * 0.36)} y={top + h * (0.025 + row * 0.04)} width={bw * 0.18} height={h * 0.015} fill="#FFE08A" opacity={0.55} />
                ) : null,
              ),
            )}
          </G>
        );
      })}
      {/* the road */}
      <Rect x={0} y={ground} width={w} height={h - ground} fill="#151833" />
      <Rect x={0} y={ground} width={w} height={2} fill="#3A3F72" />
      {Array.from({ length: 8 }, (_, i) => (
        <Rect key={i} x={i * (w / 7) + w * 0.02} y={ground + (h - ground) * 0.48} width={w * 0.07} height={3} rx={1.5} fill="#FFD84D" opacity={0.45} />
      ))}
      {/* a streetlight glow at each side */}
      {[0.1, 0.9].map((x, i) => (
        <G key={`l${i}`} opacity={0.8}>
          <Rect x={x * w - 1.5} y={ground - h * 0.1} width={3} height={h * 0.1} fill="#2E3466" />
          <Circle cx={x * w} cy={ground - h * 0.1} r={14} fill="#FFE08A" opacity={0.12} />
          <Circle cx={x * w} cy={ground - h * 0.1} r={3} fill="#FFE08A" opacity={0.8} />
        </G>
      ))}
    </G>
  );
}
