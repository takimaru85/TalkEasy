import type { ColorArtName } from '@/components/adventure/ColorArt';

/**
 * Which stored subject icons get the colourful school-subject illustration.
 *
 * TalkEasy's seven subjects store an EMOJI as their icon, and Parent Mode lets a grown-up add their
 * own subjects with any icon they like. The illustration is keyed on that stored icon rather than on
 * the subject's name, for two reasons: a grown-up may rename "Mathematics" to "Maths" and should
 * still get the drawing, and a subject they made up with an icon of their own choosing keeps
 * exactly that icon. Nothing is rewritten in the database.
 *
 * Pure (type-only import above) so `check:themes` can compare it with the seeded subjects.
 */
export const SUBJECT_ART_BY_ICON: Record<string, ColorArtName> = {
  '📖': 'subject:english',
  '🇵🇭': 'subject:filipino',
  '🔢': 'subject:math',
  '🔬': 'subject:science',
  '🏘️': 'subject:social',
  '💗': 'subject:values',
  '🎨': 'subject:mapeh',
};

/** The colourful drawing for a subject's stored icon, or undefined to keep the icon as it is. */
export function subjectArtFor(icon: string | undefined | null): ColorArtName | undefined {
  return icon ? SUBJECT_ART_BY_ICON[icon] : undefined;
}
