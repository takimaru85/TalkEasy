import React, { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { SVG_DECORATIVE } from "@/utils/svgA11y";

import { AdventureNight } from "@/theme/adventure";

/**
 * Fixed positions, never Math.random(): the sky must be identical on every render, or the stars
 * would jump each time the screen re-renders — which it does every time a star is earned.
 * x/y are fractions of the surface, r is in pixels, o is opacity.
 */
const STARS = [
  { x: 0.08, y: 0.05, r: 1.7, o: 0.9 },
  { x: 0.22, y: 0.11, r: 1.0, o: 0.5 },
  { x: 0.37, y: 0.03, r: 1.3, o: 0.75 },
  { x: 0.53, y: 0.09, r: 0.9, o: 0.45 },
  { x: 0.69, y: 0.04, r: 1.6, o: 0.9 },
  { x: 0.84, y: 0.1, r: 1.1, o: 0.6 },
  { x: 0.95, y: 0.06, r: 1.4, o: 0.8 },
  { x: 0.13, y: 0.2, r: 1.2, o: 0.6 },
  { x: 0.31, y: 0.25, r: 0.9, o: 0.4 },
  { x: 0.47, y: 0.19, r: 1.5, o: 0.85 },
  { x: 0.62, y: 0.23, r: 1.0, o: 0.5 },
  { x: 0.79, y: 0.18, r: 1.3, o: 0.7 },
  { x: 0.92, y: 0.24, r: 0.9, o: 0.4 },
  { x: 0.05, y: 0.34, r: 1.4, o: 0.7 },
  { x: 0.27, y: 0.38, r: 1.0, o: 0.45 },
  { x: 0.58, y: 0.35, r: 1.2, o: 0.6 },
  { x: 0.73, y: 0.4, r: 0.9, o: 0.4 },
  { x: 0.89, y: 0.37, r: 1.5, o: 0.8 },
  { x: 0.17, y: 0.5, r: 1.1, o: 0.5 },
  { x: 0.42, y: 0.54, r: 0.9, o: 0.4 },
  { x: 0.67, y: 0.49, r: 1.3, o: 0.6 },
  { x: 0.96, y: 0.53, r: 1.0, o: 0.45 },
  { x: 0.09, y: 0.65, r: 1.2, o: 0.5 },
  { x: 0.36, y: 0.69, r: 0.9, o: 0.35 },
  { x: 0.61, y: 0.64, r: 1.4, o: 0.65 },
  { x: 0.85, y: 0.7, r: 1.0, o: 0.4 },
  { x: 0.2, y: 0.8, r: 1.1, o: 0.45 },
  { x: 0.51, y: 0.84, r: 0.9, o: 0.32 },
  { x: 0.77, y: 0.79, r: 1.2, o: 0.5 },
  { x: 0.3, y: 0.92, r: 1.0, o: 0.36 },
  { x: 0.66, y: 0.95, r: 1.3, o: 0.45 },
  { x: 0.9, y: 0.89, r: 0.9, o: 0.32 },
];

/**
 * Foreground motes: larger, softer and closer than the stars, drawn LAST so they read as dust
 * drifting in front of the world. A handful only — depth comes from having three distances, not
 * from filling the screen.
 */
const MOTES = [
  { x: 0.12, y: 0.42, r: 3.2, o: 0.16 },
  { x: 0.88, y: 0.58, r: 4.0, o: 0.13 },
  { x: 0.34, y: 0.72, r: 2.6, o: 0.15 },
  { x: 0.72, y: 0.86, r: 3.4, o: 0.12 },
  { x: 0.56, y: 0.3, r: 2.2, o: 0.14 },
];

/** Distant worlds: small, dim and high up, so the sky has a middle distance. */
const FAR_PLANETS = [
  { x: 0.63, y: 0.08, r: 0.032, colour: "#9AA7E8", o: 0.5 },
  { x: 0.28, y: 0.16, r: 0.022, colour: "#7FD8C6", o: 0.45 },
  { x: 0.44, y: 0.47, r: 0.026, colour: "#C79BE8", o: 0.35 },
];

/** Planets: fraction of width/height, radius as a fraction of width, and a two-stop colour. */
type Surface = "craters" | "bands" | "spots";

const PLANETS: {
  x: number;
  y: number;
  r: number;
  from: string;
  to: string;
  ring: boolean;
  surface: Surface;
  glow: string;
}[] = [
  {
    x: 0.13,
    y: 0.1,
    r: 0.1,
    from: "#7FD8FF",
    to: "#2B6BC4",
    ring: false,
    surface: "craters",
    glow: "#6FD0FF",
  },
  {
    x: 0.9,
    y: 0.19,
    r: 0.13,
    from: "#EE9BFF",
    to: "#7B2FB5",
    ring: false,
    surface: "bands",
    glow: "#E07BFF",
  },
  {
    x: 0.05,
    y: 0.29,
    r: 0.085,
    from: "#FFD48A",
    to: "#D2691E",
    ring: true,
    surface: "bands",
    glow: "#FFC46B",
  },
  {
    x: 0.82,
    y: 0.46,
    r: 0.06,
    from: "#A6FCE4",
    to: "#1C9C86",
    ring: false,
    surface: "spots",
    glow: "#8CF5D8",
  },
];

/**
 * Cartoon surface detail, clipped to the planet so nothing spills over the edge. Craters and
 * bands are what stop a planet reading as a flat dot — kept low-contrast so the sky never
 * competes with the cards in front of it.
 */
function surfaceOf(kind: Surface, cx: number, cy: number, r: number) {
  if (kind === "craters") {
    return (
      <>
        <Circle
          cx={cx - r * 0.3}
          cy={cy - r * 0.25}
          r={r * 0.22}
          fill="#FFFFFF"
          opacity={0.16}
        />
        <Circle
          cx={cx + r * 0.35}
          cy={cy + r * 0.1}
          r={r * 0.15}
          fill="#FFFFFF"
          opacity={0.13}
        />
        <Circle
          cx={cx - r * 0.05}
          cy={cy + r * 0.45}
          r={r * 0.12}
          fill="#FFFFFF"
          opacity={0.1}
        />
      </>
    );
  }
  if (kind === "bands") {
    return (
      <>
        <Ellipse
          cx={cx}
          cy={cy - r * 0.42}
          rx={r * 1.1}
          ry={r * 0.16}
          fill="#FFFFFF"
          opacity={0.15}
        />
        <Ellipse
          cx={cx}
          cy={cy + r * 0.08}
          rx={r * 1.1}
          ry={r * 0.2}
          fill="#FFFFFF"
          opacity={0.11}
        />
        <Ellipse
          cx={cx}
          cy={cy + r * 0.55}
          rx={r * 1.1}
          ry={r * 0.13}
          fill="#000000"
          opacity={0.1}
        />
      </>
    );
  }
  return (
    <>
      <Ellipse
        cx={cx - r * 0.25}
        cy={cy - r * 0.2}
        rx={r * 0.3}
        ry={r * 0.2}
        fill="#FFFFFF"
        opacity={0.17}
      />
      <Ellipse
        cx={cx + r * 0.3}
        cy={cy + r * 0.3}
        rx={r * 0.22}
        ry={r * 0.15}
        fill="#FFFFFF"
        opacity={0.12}
      />
    </>
  );
}

interface Props {
  width: number;
  height: number;
}

/**
 * The TalkEasy universe: a deep navy-to-violet sky, nebula blooms, planets and scattered stars.
 *
 * Everything is vector — no background image to ship, no memory spent on a large bitmap, and it
 * scales to any aspect ratio without cropping or stretching. Planets sit in the upper half and
 * near the edges, where the cards do not land, so nothing ever competes with text for legibility.
 *
 * Deliberately STATIC. Twinkling or drifting would run a timer for as long as the screen is open,
 * and this app must stay smooth on cheap Android hardware while a child is speaking or tracing.
 * Depth comes from layering — nebula, planets, stars — not from motion.
 */
export function SpaceBackground({ width, height }: Props) {
  const id = useId().replace(/:/g, "");

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      {...SVG_DECORATIVE}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={`sky${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor={AdventureNight.top} />
          <Stop offset="1" stopColor={AdventureNight.bottom} />
        </LinearGradient>
        <RadialGradient id={`neb1${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={AdventureNight.glowA} stopOpacity="0.6" />
          <Stop offset="1" stopColor={AdventureNight.glowA} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`neb2${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={AdventureNight.glowB} stopOpacity="0.5" />
          <Stop offset="1" stopColor={AdventureNight.glowB} stopOpacity="0" />
        </RadialGradient>
        {PLANETS.map((p, i) => (
          <React.Fragment key={i}>
            <LinearGradient id={`p${i}${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
              <Stop offset="0" stopColor={p.from} />
              <Stop offset="1" stopColor={p.to} />
            </LinearGradient>
            {/* Atmosphere: a soft shell of the planet's own light, fading outwards. */}
            <RadialGradient id={`atm${i}${id}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0.62" stopColor={p.glow} stopOpacity="0.34" />
              <Stop offset="1" stopColor={p.glow} stopOpacity="0" />
            </RadialGradient>
            <ClipPath id={`clip${i}${id}`}>
              <Circle cx={p.x * width} cy={p.y * height} r={p.r * width} />
            </ClipPath>
          </React.Fragment>
        ))}
      </Defs>

      {/* Back: the sky itself. */}
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#sky${id})`} />

      {/* Middle: nebula blooms. */}
      <Circle
        cx={width * 0.2}
        cy={height * 0.1}
        r={width * 0.62}
        fill={`url(#neb1${id})`}
      />
      <Circle
        cx={width * 0.95}
        cy={height * 0.3}
        r={width * 0.55}
        fill={`url(#neb2${id})`}
      />
      <Circle
        cx={width * 0.1}
        cy={height * 0.72}
        r={width * 0.45}
        fill={`url(#neb2${id})`}
      />

      {/* Middle: planets, kept to the edges so they never sit behind a card's text. */}
      {PLANETS.map((p, i) => {
        const cx = p.x * width;
        const cy = p.y * height;
        const r = p.r * width;
        return (
          <G key={i} opacity={0.92}>
            {/* Atmosphere first, so it reads as light around the body. */}
            <Circle cx={cx} cy={cy} r={r * 1.55} fill={`url(#atm${i}${id})`} />
            {/* Ring behind the planet, then again in front, so the planet sits INSIDE it. */}
            {p.ring ? (
              <Ellipse
                cx={cx}
                cy={cy}
                rx={r * 1.9}
                ry={r * 0.54}
                fill="none"
                stroke="#FFE3B4"
                strokeWidth={r * 0.17}
                opacity={0.5}
              />
            ) : null}
            <Circle cx={cx} cy={cy} r={r} fill={`url(#p${i}${id})`} />

            <G clipPath={`url(#clip${i}${id})`}>
              {surfaceOf(p.surface, cx, cy, r)}
              {/* Terminator: the shaded limb that makes a circle read as a sphere. */}
              <Path
                d={`M ${cx - r} ${cy} a ${r} ${r} 0 0 0 ${r * 2} 0 a ${r * 1.3} ${r * 1.3} 0 0 1 ${-r * 2} 0 Z`}
                fill="#0A0E2C"
                opacity={0.22}
              />
              {/* Specular highlight, upper-left, matching the light in the rest of the UI. */}
              <Ellipse
                cx={cx - r * 0.38}
                cy={cy - r * 0.42}
                rx={r * 0.34}
                ry={r * 0.24}
                fill="#FFFFFF"
                opacity={0.3}
              />
            </G>

            {p.ring ? (
              <Path
                d={`M ${cx - r * 1.9} ${cy} a ${r * 1.9} ${r * 0.54} 0 0 0 ${r * 3.8} 0`}
                fill="none"
                stroke="#FFE3B4"
                strokeWidth={r * 0.17}
                opacity={0.85}
              />
            ) : null}
          </G>
        );
      })}

      {/* Middle distance: far-off worlds, dim enough to sit behind everything. */}
      {FAR_PLANETS.map((p, i) => (
        <Circle
          key={`f${i}`}
          cx={p.x * width}
          cy={p.y * height}
          r={p.r * width}
          fill={p.colour}
          opacity={p.o}
        />
      ))}

      {/* A moon, cratered, riding beside the second planet. */}
      <G opacity={0.9}>
        <Circle
          cx={width * 0.74}
          cy={height * 0.255}
          r={width * 0.042}
          fill="#D7DCF0"
        />
        <Circle
          cx={width * 0.726}
          cy={height * 0.248}
          r={width * 0.012}
          fill="#B6BEDC"
          opacity={0.85}
        />
        <Circle
          cx={width * 0.752}
          cy={height * 0.263}
          r={width * 0.008}
          fill="#B6BEDC"
          opacity={0.7}
        />
        <Circle
          cx={width * 0.736}
          cy={height * 0.268}
          r={width * 0.005}
          fill="#B6BEDC"
          opacity={0.6}
        />
      </G>

      {/* Front of the sky: stars. */}
      {STARS.map((s, i) => (
        <G key={i}>
          {/* The brightest few get a halo, so the sky has stars of more than one weight. */}
          {s.r > 1.35 ? (
            <Circle
              cx={s.x * width}
              cy={s.y * height}
              r={s.r * 3.2}
              fill="#FFFFFF"
              opacity={s.o * 0.16}
            />
          ) : null}
          <Circle
            cx={s.x * width}
            cy={s.y * height}
            r={s.r}
            fill="#FFFFFF"
            opacity={s.o}
          />
        </G>
      ))}

      {/* Closest layer: drifting motes. */}
      {MOTES.map((m, i) => (
        <Circle
          key={`m${i}`}
          cx={m.x * width}
          cy={m.y * height}
          r={m.r}
          fill="#BFD4FF"
          opacity={m.o}
        />
      ))}
    </Svg>
  );
}
