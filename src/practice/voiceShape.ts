/**
 * Voice shapes as segments — PURE LOGIC, no device, no react-native.
 *
 * Kept apart from voiceModel.ts so `check:voice` can assert that every shape in the content
 * produces something audible without loading the audio stack, and so the rules below can be
 * reasoned about on their own.
 */
export interface VoiceSegment {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Silence after this segment, in ms. How a phrase gets its rhythm. */
  gapMs?: number;
}

import type { VoiceLine } from './types';

/**
 * Turning a written voice shape into something a child can hear.
 *
 * THE CONSTRAINT: expo-speech has one pitch, one rate and one volume per utterance, and no pitch
 * contour at all. A device voice physically cannot say "you are going home" with a rising ending.
 * So a shape is built out of SEGMENTS — the sentence split at the word that carries the movement,
 * each part spoken with its own pitch — and the ear hears the join as a step up or down. It is an
 * approximation of a contour, not a contour.
 *
 * WHAT THAT MEANS FOR THE FEATURE: these are demonstrations, and they are the reason a recorded
 * model always wins when one exists (`line.audio`). It also means nothing here is precise enough
 * to compare anything against — which is consistent with the rule that the app never analyses the
 * child's voice anyway. There is no "correct" contour stored, so there is nothing to be graded on.
 *
 * Everything is relative to the grown-up's own speech settings: a family who slowed the voice down
 * gets a slower model here too, because these multipliers apply on top of theirs.
 */

/** How far a step moves, as a pitch multiplier. Big enough to hear, small enough to stay natural. */
const STEP_UP = 1.34;
const STEP_DOWN = 0.74;

/**
 * The segments for a line.
 *
 * Exported so `check:voice` can assert that every shape in the content produces something
 * audible — a shape that fell through to silence would be a card a child taps and nothing happens.
 */
export function segmentsFor(line: VoiceLine): VoiceSegment[] {
  const text = (line.speak ?? line.text).trim();
  if (!text) return [];
  const words = text.split(/\s+/);
  const last = words.length - 1;

  // A word carrying the focus is longer, higher and louder than its neighbours — the three things
  // that make a word sound stressed in English, all of which this engine can actually do.
  if (line.focusWord !== undefined && line.focusWord >= 0 && line.focusWord < words.length) {
    const f = line.focusWord;
    const before = words.slice(0, f).join(' ');
    const after = words.slice(f + 1).join(' ');
    return [
      ...(before ? [{ text: before, volume: 0.82, gapMs: 90 }] : []),
      { text: words[f], pitch: 1.24, rate: 0.78, volume: 1, gapMs: 90 },
      ...(after ? [{ text: after, volume: 0.82, rate: 0.95 }] : []),
    ];
  }

  const whole = (extra: Partial<VoiceSegment>): VoiceSegment[] => [{ text, ...extra }];
  /** Split so the movement lands on the final word, where English puts it. */
  const ending = (headPitch: number, tailPitch: number): VoiceSegment[] => {
    if (words.length < 2) return whole({ pitch: tailPitch });
    return [
      { text: words.slice(0, last).join(' '), pitch: headPitch, gapMs: 60 },
      { text: words[last], pitch: tailPitch },
    ];
  };

  switch (line.shape) {
    case 'rise':
      return ending(1, STEP_UP);
    case 'fall':
      return ending(1, STEP_DOWN);
    case 'rise-fall':
      return words.length < 2 ? whole({ pitch: 1.2, rate: 0.85 }) : ending(STEP_UP, STEP_DOWN);
    case 'fall-rise':
      return words.length < 2 ? whole({ pitch: 0.85, rate: 0.85 }) : ending(STEP_DOWN, STEP_UP);
    case 'high':
      return whole({ pitch: 1.5 });
    case 'low':
      return whole({ pitch: 0.62 });
    case 'loud':
      return whole({ volume: 1, pitch: 1.06, rate: 0.95 });
    case 'soft':
      return whole({ volume: 0.3, pitch: 0.96 });
    case 'fast':
      return whole({ rate: line.rate ?? 1.4 });
    case 'slow':
      return whole({ rate: line.rate ?? 0.65 });
    case 'flat':
    case undefined:
    default:
      return whole({ rate: line.rate, pitch: line.pitch });
  }
}
