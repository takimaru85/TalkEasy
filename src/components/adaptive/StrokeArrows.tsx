import React from 'react';
import { Circle, G, Path, Polygon, Text as SvgText } from 'react-native-svg';

export type Point = readonly [number, number];

interface Props {
  /** Polylines in canvas pixel space, in the order the strokes are written. */
  strokes: readonly (readonly Point[])[];
  color: string;
  /**
   * Height of the thing being traced, in pixels — a letter's cap height, or a shape's extent.
   * Every mark scales with it, so the guidance on a three-letter word stays in proportion to
   * those letters instead of being sized for the whole canvas.
   */
  size: number;
}

/**
 * Handwriting-worksheet guidance drawn inside a tracing guide: a DASHED centre path along each
 * stroke, a small numbered circle where it starts, and arrowheads along the way.
 *
 * The dashes read as "follow this line" and leave the letter itself visible, which a single bold
 * arrow did not. A long stroke gets a second arrowhead part-way along, because one head at the
 * far end of a curve is easy to miss.
 *
 * Geometry comes in as plain pixel polylines so the caller owns it — letters map their normalised
 * stroke table through the glyph's own advance and cap height, while lines and shapes reuse the
 * very coordinates their guide was drawn with, which keeps the path on the guide.
 *
 * The number is ordinary SVG text with no fontFamily: react-native-svg resolves font families
 * against fonts linked into the native app, so anything else would silently fall back. A digit in
 * the system font is safe.
 */
export function StrokeArrows({ strokes, color, size }: Props) {
  const head = clamp(size * 0.09, 7, 16);
  const badge = clamp(size * 0.075, 8, 15);
  const line = clamp(size * 0.016, 1.8, 4);
  const dash = clamp(size * 0.05, 3.5, 10);

  return (
    <G>
      {strokes.map((points, i) => {
        if (points.length < 2) return null;
        const d = points.map(([x, y], n) => `${n === 0 ? 'M' : 'L'} ${round(x)} ${round(y)}`).join(' ');
        const total = lengthOf(points);
        // One head at the end, plus one mid-way when the stroke is long enough to need it.
        const marks = total > head * 7 ? [0.45, 1] : [1];
        // Set the badge a little INTO the stroke: two strokes often begin at the same point
        // (A and B both start top-left), and a badge on the exact start would hide the earlier
        // number completely.
        const [sx, sy] = sample(points, Math.min(badge * 1.25, total * 0.4) / total);

        return (
          <G key={i}>
            <Path
              d={d}
              stroke={color}
              strokeWidth={line}
              strokeDasharray={`${round(dash)} ${round(dash * 0.8)}`}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {marks.map((t, k) => {
              const [x, y, ux, uy] = sample(points, t);
              const wing = head * 0.5;
              const bx = x - ux * head;
              const by = y - uy * head;
              return (
                <Polygon
                  key={k}
                  points={`${round(x)},${round(y)} ${round(bx - uy * wing)},${round(by + ux * wing)} ${round(bx + uy * wing)},${round(by - ux * wing)}`}
                  fill={color}
                />
              );
            })}
            <Circle cx={round(sx)} cy={round(sy)} r={badge} fill={color} />
            <SvgText
              x={round(sx)}
              y={round(sy + badge * 0.36)}
              fontSize={badge * 1.25}
              fontWeight="bold"
              fill="#FFFFFF"
              textAnchor="middle"
            >
              {String(i + 1)}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}

/** Total length of a polyline. */
function lengthOf(points: readonly Point[]): number {
  let n = 0;
  for (let i = 1; i < points.length; i++) {
    n += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return n;
}

/** Position and unit direction at `t` (0..1) along a polyline: [x, y, ux, uy]. */
function sample(points: readonly Point[], t: number): [number, number, number, number] {
  const target = lengthOf(points) * clamp(t, 0, 1);
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const seg = Math.hypot(bx - ax, by - ay) || 1e-6;
    if (walked + seg >= target) {
      const f = (target - walked) / seg;
      return [ax + (bx - ax) * f, ay + (by - ay) * f, (bx - ax) / seg, (by - ay) / seg];
    }
    walked += seg;
  }
  const [ax, ay] = points[points.length - 2];
  const [bx, by] = points[points.length - 1];
  const seg = Math.hypot(bx - ax, by - ay) || 1e-6;
  return [bx, by, (bx - ax) / seg, (by - ay) / seg];
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
