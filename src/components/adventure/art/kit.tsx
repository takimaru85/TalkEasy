import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * Shared drawing kit for the themed card illustrations.
 *
 * Every themed drawing follows the same rules as WorldArt and GameIcon, so the three sets sit
 * together on one screen without looking like three different apps:
 *  - a 64-unit grid, the object filling roughly 4..60, with a soft ground shadow;
 *  - light from the top-left: two-stop gradients, the light stop on top;
 *  - outlines in a DARKER SHADE OF THE OBJECT'S OWN HUE, never black;
 *  - a white highlight, and small sparkles as the accent;
 *  - creatures are round, smiling and soft-edged — friendly, never fierce; no teeth, no claws.
 *
 * The outline trick used throughout: draw the silhouette once in the dark hue with a fat stroke,
 * then draw the same shapes again filled on top. That gives a consistent outline around a group of
 * overlapping shapes, which stroking each shape individually does not.
 */

export const INK = '#27325F';

export type Grad = (id: string, top: string, bottom: string) => React.ReactNode;
export type Fill = (id: string) => string;

export interface Drawn {
  defs: React.ReactNode;
  art: React.ReactNode;
}

/** A four-point sparkle, the accent mark shared by every set. */
export function sparklePath(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z`;
}

export function Sparkle({ cx, cy, r, color = '#FFE066' }: { cx: number; cy: number; r: number; color?: string }) {
  return <Path d={sparklePath(cx, cy, r)} fill={color} />;
}

/** A five-point star. */
export function starPath(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
}

/** Two friendly eyes with a highlight each, and a smile below. */
export function Face({
  cx, cy, spread, r = 2.6, smile = true, smileWidth,
}: { cx: number; cy: number; spread: number; r?: number; smile?: boolean; smileWidth?: number }) {
  const sw = smileWidth ?? spread * 1.1;
  return (
    <G>
      <Circle cx={cx - spread} cy={cy} r={r} fill={INK} />
      <Circle cx={cx - spread + r * 0.3} cy={cy - r * 0.3} r={r * 0.34} fill="#FFFFFF" />
      <Circle cx={cx + spread} cy={cy} r={r} fill={INK} />
      <Circle cx={cx + spread + r * 0.3} cy={cy - r * 0.3} r={r * 0.34} fill="#FFFFFF" />
      {smile ? (
        <Path
          d={`M${cx - sw / 2} ${cy + r * 1.9} Q${cx} ${cy + r * 3.4} ${cx + sw / 2} ${cy + r * 1.9}`}
          stroke={INK}
          strokeWidth={1.9}
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
    </G>
  );
}

/** A rosy cheek. */
export function Cheek({ cx, cy, rx = 2.4, ry = 1.5 }: { cx: number; cy: number; rx?: number; ry?: number }) {
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FF8FA8" opacity={0.65} />;
}

/** A glossy white highlight, the "lit from the top-left" mark. */
export function Gloss({
  cx, cy, rx, ry, rotate = -12, opacity = 0.4,
}: { cx: number; cy: number; rx: number; ry: number; rotate?: number; opacity?: number }) {
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" opacity={opacity} transform={`rotate(${rotate} ${cx} ${cy})`} />;
}

/**
 * A speech bubble with three sound bars — the shared "this is about talking" token, so Speech
 * Practice and Talk read as the same KIND of thing in every theme.
 */
export function SpeechBubble({
  x, y, w = 24, h = 17, tail = 'left', barColor = '#2A6FD6',
}: { x: number; y: number; w?: number; h?: number; tail?: 'left' | 'right'; barColor?: string }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const tx = tail === 'left' ? x + w * 0.24 : x + w * 0.76;
  return (
    <G>
      <Path
        d={`M${tx - 3.5} ${y + h - 1} L${tail === 'left' ? tx - 7 : tx + 7} ${y + h + 6} L${tx + 3.5} ${y + h - 1} Z`}
        fill="#FFFFFF"
        stroke="#C3CEE4"
        strokeWidth={1.4}
      />
      <Rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#FFFFFF" stroke="#C3CEE4" strokeWidth={1.6} />
      {[-1, 0, 1].map((i) => {
        const bh = i === 0 ? h * 0.52 : h * 0.32;
        return <Rect key={i} x={cx + i * (w * 0.2) - 1.4} y={cy - bh / 2} width={2.8} height={bh} rx={1.4} fill={barColor} />;
      })}
    </G>
  );
}

/** A pencil, tilted, nib at the bottom-left — the shared "trace this" token. */
export function Pencil({ x, y, len = 30, angle = 38 }: { x: number; y: number; len?: number; angle?: number }) {
  return (
    <G transform={`rotate(${angle} ${x} ${y})`}>
      <Rect x={x - 4} y={y} width={8} height={len} rx={2} fill="#FFC94D" stroke="#C98A12" strokeWidth={1.8} />
      <Rect x={x - 4} y={y} width={3} height={len} rx={1.5} fill="#FFFFFF" opacity={0.3} />
      <Path d={`M${x - 4} ${y + len} L${x} ${y + len + 7} L${x + 4} ${y + len} Z`} fill="#F0D2A8" stroke="#C98A12" strokeWidth={1.4} strokeLinejoin="round" />
      <Path d={`M${x - 1.6} ${y + len + 4.2} L${x} ${y + len + 7} L${x + 1.6} ${y + len + 4.2} Z`} fill={INK} />
      <Rect x={x - 4.4} y={y - 5} width={8.8} height={6} rx={2} fill="#FF8FA8" stroke="#C25070" strokeWidth={1.5} />
    </G>
  );
}

/** An open book, spine centred — the shared "lessons" token. */
export function OpenBook({
  x, y, w = 40, h = 26, cover = '#5BAEFF', coverInk = '#1F5FB8',
}: { x: number; y: number; w?: number; h?: number; cover?: string; coverInk?: string }) {
  const cx = x + w / 2;
  return (
    <G>
      <Path
        d={`M${x} ${y + 3} Q${cx} ${y - 3} ${x + w} ${y + 3} L${x + w} ${y + h} Q${cx} ${y + h - 6} ${x} ${y + h} Z`}
        fill={cover}
        stroke={coverInk}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d={`M${cx} ${y} L${cx} ${y + h - 3}`} stroke={coverInk} strokeWidth={2} strokeLinecap="round" />
      {[0.32, 0.52, 0.72].map((f, i) => (
        <G key={i}>
          <Path d={`M${x + w * 0.1} ${y + h * f} L${cx - w * 0.08} ${y + h * f}`} stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" opacity={0.85} />
          <Path d={`M${cx + w * 0.08} ${y + h * f} L${x + w * 0.9} ${y + h * f}`} stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" opacity={0.85} />
        </G>
      ))}
    </G>
  );
}

/** A bouncing ball with a highlight — the shared "play" token. */
export function Ball({
  cx, cy, r = 13, from = '#FF8E7C', ink = '#C2402C',
}: { cx: number; cy: number; r?: number; from?: string; ink?: string }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={from} stroke={ink} strokeWidth={2.2} />
      <Path d={`M${cx - r} ${cy} Q${cx} ${cy - r * 0.7} ${cx + r} ${cy}`} stroke={ink} strokeWidth={1.8} fill="none" />
      <Path d={`M${cx - r} ${cy} Q${cx} ${cy + r * 0.7} ${cx + r} ${cy}`} stroke={ink} strokeWidth={1.8} fill="none" />
      <Gloss cx={cx - r * 0.35} cy={cy - r * 0.45} rx={r * 0.34} ry={r * 0.2} />
    </G>
  );
}

/** A stack of word cards — the shared "my words" token. */
export function WordCards({ x, y, tint = '#FFDFEE', ink = '#B8306E' }: { x: number; y: number; tint?: string; ink?: string }) {
  return (
    <G>
      <Rect x={x + 5} y={y + 4} width={28} height={22} rx={5} fill={ink} opacity={0.35} transform={`rotate(-12 ${x + 19} ${y + 15})`} />
      <Rect x={x + 2} y={y + 2} width={28} height={22} rx={5} fill="#FFFFFF" stroke={ink} strokeWidth={2} transform={`rotate(-6 ${x + 16} ${y + 13})`} />
      <Rect x={x} y={y} width={28} height={22} rx={5} fill={tint} stroke={ink} strokeWidth={2} />
      <Rect x={x + 5} y={y + 5} width={13} height={4} rx={2} fill={ink} opacity={0.75} />
      <Rect x={x + 5} y={y + 12} width={18} height={3} rx={1.5} fill={ink} opacity={0.45} />
      <Rect x={x + 5} y={y + 17} width={10} height={3} rx={1.5} fill={ink} opacity={0.45} />
    </G>
  );
}
