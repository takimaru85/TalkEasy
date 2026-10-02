import type { GatedArea } from './types';

/**
 * THE one place that says what Free includes. Nothing else in the app decides.
 *
 * `freeCount` is how many items, counting from the START of the area's own order, a family on the
 * free plan can open. Counting from the start matters: these lists are ordered developmentally
 * (Speech Practice runs sounds → syllables → words → phrases → sentences; Listen & Talk puts
 * attention and early communication first), so the free allowance is the BEGINNING of the ladder.
 * A free plan that handed out a random scattering of activities would teach nothing in order.
 *
 * The numbers are meant to leave the free app genuinely usable — a child can practise every day
 * without paying — while the rest of the ladder is the reason to upgrade. If a number here ever has
 * to shrink to make the paywall work, the paywall is the thing that is wrong.
 */
export interface GatedAreaSpec {
  /** For a grown-up, on the paywall and in Parent Mode. */
  label: string;
  /** Items openable on the free plan, counting from the start of the area's order. */
  freeCount: number;
  /** What the free allowance is measured in, for the sentence a screen shows. */
  unit: 'activities' | 'stages' | 'areas' | 'levels' | 'lessons' | 'groups';
}

export const GATED_AREAS: Record<GatedArea, GatedAreaSpec> = {
  // The first two stages — sounds and syllables — are the whole beginner ladder, so a child who is
  // just starting never meets a lock. Words, phrases and sentences are Plus.
  speechPractice: { label: 'Speech Practice', freeCount: 2, unit: 'stages' },
  // Attention, early communication and understanding: everything before expressive language.
  listenTalk: { label: 'Listen & Talk', freeCount: 3, unit: 'areas' },
  // Enough letters to build the habit; the later levels are Plus.
  writing: { label: 'Writing Practice', freeCount: 3, unit: 'levels' },
  // Applies to the lessons TalkEasy ships with. A lesson a grown-up typed in themselves is always
  // theirs — see `isOwnAuthored` in access.ts.
  lessons: { label: 'Lessons', freeCount: 2, unit: 'lessons' },
  // Gross Motor and Hand & Fine Motor are free — between them they carry the everyday practice most
  // home programmes start with, so a family can use this section properly without paying. The
  // SAFETY NOTICE, the therapist deferral and every activity's own safety note are never gated:
  // those are not features, and putting a price on them would be indefensible.
  therapy: { label: 'Therapy', freeCount: 2, unit: 'groups' },
};

/**
 * What Plus actually gives, in a grown-up's words, for the paywall.
 *
 * Every line here must be TRUE of this build. A benefit list that promises things the app does not
 * gate (or does not have) is how a trustworthy app stops being one, and a parent of a child with
 * speech needs is exactly the person who will notice.
 */
export const PLUS_BENEFITS: readonly string[] = [
  'Every Speech Practice stage — sounds, syllables, words, phrases and sentences',
  'All Listen & Talk areas, including taking turns and conversation',
  'The full Writing Practice ladder',
  'All of the lessons TalkEasy comes with',
  'The full Therapy library, My Therapy Day and practice goals',
  'New activities as they are added',
];

/**
 * What stays free, always. Shown on the paywall so a parent can see what they are NOT being asked
 * to pay for — which is the part that makes the ask believable.
 */
export const ALWAYS_FREE: readonly string[] = [
  'Talk — every word and phrase your child uses to communicate',
  'Feelings and My Day',
  'All four adventure worlds',
  'Parent Mode, progress and your own lessons',
];
