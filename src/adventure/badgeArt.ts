import type { ColorArtName } from '@/components/adventure/ColorArt';

/**
 * The illustration each badge wears, by badge id. Badges are code (`adventure/badges.ts`), not
 * something a grown-up edits, so every one gets a drawing and `check:themes` fails if a new badge
 * is added without one. Most reuse drawings the app already has: one star, one microphone, one
 * megaphone, one book, one calendar.
 *
 * Pure (a type-only import above) so the check can compare it with the badge list.
 */
export const BADGE_ART: Record<string, ColorArtName> = {
  'first-word': 'stat:medal',
  'sound-explorer': 'category:music',
  'speech-star': 'stat:speech',
  'word-collector': 'stat:words',
  'super-speaker': 'stat:sounds',
  'steady-hand': 'stat:hand',
  'star-collector': 'stat:stars',
  'day-after-day': 'stat:streak',
};
