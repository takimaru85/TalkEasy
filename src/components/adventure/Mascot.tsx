import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Adventure } from '@/theme/adventure';

export type MascotMood = 'happy' | 'cheer' | 'listening';

interface Props {
  size: number;
  mood?: MascotMood;
  /** Explorer kit: helmet dome, headset and the TalkEasy badge. */
  space?: boolean;
}

/**
 * Pip — TalkEasy's mascot.
 *
 * An original character drawn entirely in SVG: a friendly speech bubble with a sprouting star,
 * which says what the app is (talking) and what it gives (stars) without a word of text. Being
 * vector rather than a PNG, it is a few hundred bytes, stays crisp on every screen density, and
 * re-colours itself from the design system.
 *
 * Deliberately gender-neutral and species-neutral — a shape, not a boy, a girl or an animal —
 * so every child can read it as "mine". No teeth, no eyebrows, no sharp angles: nothing that can
 * look cross to a child who is sensitive to faces.
 *
 * `mood` is the only expression control: 'happy' at rest, 'cheer' when celebrating (arms up,
 * wider smile), 'listening' while the child speaks (open mouth, attentive eyes).
 */
export function Mascot({ size, mood = 'happy', space }: Props) {
  // Unique per instance: react-native-svg resolves gradients by id document-wide, so two mascots
  // on one screen sharing an id would make the second one take the first one's fill.
  const id = useId().replace(/:/g, '');
  const body = `body-${id}`;
  const cheer = mood === 'cheer';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Defs>
        <LinearGradient id={body} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={Adventure.reef.from} />
          <Stop offset="1" stopColor={Adventure.reef.to} />
        </LinearGradient>
      </Defs>

      {space ? (
        <>
          {/* Antenna beacon: how Pip hears the child from orbit. */}
          <Path d="M50 20 Q49 10 56 6" stroke={Adventure.reef.to} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Circle cx="57" cy="5" r="4" fill={Adventure.sun.from} />
          <Circle cx="57" cy="5" r="7" fill={Adventure.sun.from} opacity={0.28} />
        </>
      ) : null}
      {/* Sprout: a stem and a star. The explorer wears an antenna beacon instead. */}
      {space ? null : (
        <>
          <Path d="M50 20 Q49 11 55 7" stroke={Adventure.grass.to} strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <Path
            d="M57 1.5 L59.1 5.8 L63.8 6.5 L60.4 9.8 L61.2 14.5 L57 12.3 L52.8 14.5 L53.6 9.8 L50.2 6.5 L54.9 5.8 Z"
            fill={Adventure.sun.from}
          />
        </>
      )}

      {/* Arms — raised when cheering. */}
      <Path
        d={cheer ? 'M16 46 Q6 38 9 28' : 'M16 52 Q7 54 5 62'}
        stroke={Adventure.reef.to}
        strokeWidth={5.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={cheer ? 'M84 46 Q94 38 91 28' : 'M84 52 Q93 54 95 62'}
        stroke={Adventure.reef.to}
        strokeWidth={5.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* Body: a speech bubble with a soft tail. */}
      <G>
        <Path d="M34 76 L27 93 L49 79 Z" fill={`url(#${body})`} />
        <Rect x="12" y="20" width="76" height="60" rx="26" fill={`url(#${body})`} />
      </G>

      {/* Face */}
      <Circle cx="38" cy="45" r="8.5" fill="#FFFFFF" />
      <Circle cx="62" cy="45" r="8.5" fill="#FFFFFF" />
      <Circle cx={mood === 'listening' ? 39.5 : 38} cy="46.5" r="4.4" fill="#13233F" />
      <Circle cx={mood === 'listening' ? 63.5 : 62} cy="46.5" r="4.4" fill="#13233F" />
      <Circle cx="40" cy="44" r="1.6" fill="#FFFFFF" />
      <Circle cx="64" cy="44" r="1.6" fill="#FFFFFF" />

      <Ellipse cx="25" cy="57" rx="5.5" ry="3.8" fill={Adventure.coral.from} opacity={0.55} />
      <Ellipse cx="75" cy="57" rx="5.5" ry="3.8" fill={Adventure.coral.from} opacity={0.55} />

      {mood === 'listening' ? (
        // An open mouth: Pip is waiting for the child to speak.
        <Ellipse cx="50" cy="61" rx="7" ry="8.5" fill="#13233F" opacity={0.85} />
      ) : (
        <Path
          d={cheer ? 'M38 58 Q50 72 62 58 Q50 66 38 58 Z' : 'M40 60 Q50 69 60 60'}
          stroke="#13233F"
          strokeWidth={3.6}
          strokeLinecap="round"
          fill={cheer ? '#13233F' : 'none'}
        />
      )}
      {space ? (
        <>
          {/* Headset: earcups and band. */}
          <Rect x="4" y="40" width="11" height="20" rx="5" fill={Adventure.sky.to} />
          <Rect x="85" y="40" width="11" height="20" rx="5" fill={Adventure.sky.to} />
          <Path d="M9 42 Q50 12 91 42" stroke={Adventure.sky.to} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          {/* Mic boom, because talking is the point. */}
          <Path d="M15 55 Q26 66 38 63" stroke={Adventure.sky.to} strokeWidth={3.2} fill="none" strokeLinecap="round" />
          <Circle cx="39" cy="63" r="3.2" fill={Adventure.sun.from} />
          {/* Helmet dome — glass, so the face still reads through it. */}
          <Rect x="9" y="17" width="82" height="66" rx="30" fill="#BFE6FF" opacity={0.2} />
          <Rect x="9" y="17" width="82" height="66" rx="30" fill="none" stroke="#BFE6FF" strokeWidth={2.4} opacity={0.75} />
          <Path d="M22 34 Q30 24 43 22" stroke="#FFFFFF" strokeWidth={3.4} strokeLinecap="round" fill="none" opacity={0.65} />
        </>
      ) : null}
    </Svg>
  );
}
