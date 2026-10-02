import type { ImageSourcePropType } from 'react-native';

/**
 * Step-by-step pictures for therapy activities.
 *
 * WHY THIS FILE EXISTS SEPARATELY FROM THE CONTENT. `therapy/content.ts` is imported by
 * `check:therapy`, which runs in Node — and `require()` of a `.webp` only resolves inside Metro.
 * So the content carries a KEY (`illustration: 'sit-to-stand'`) and the image lives here, in
 * React-land. That split is what keeps the content checkable.
 *
 * THESE ARE BITMAPS, which is an exception to the rule that TalkEasy draws its art in code
 * (AGENTS.md). It is a deliberate one: a photograph-style sequence showing a child sitting, standing
 * and sitting again communicates a movement to a parent in a way a flat icon cannot, and a
 * three-panel scene is not something the icon set was built to draw. The trade is real — a bitmap
 * does not rescale as crisply, costs decode memory, and ships in the bundle — so these are for
 * ACTIVITY SCREENS only, never for icons, lists or anything that appears many times on one screen.
 *
 * Adding one: drop the file in `assets/therapy/`, add a line here, and set `illustration` on the
 * activity. `check:therapy` fails if an activity names an illustration that is not registered.
 */
export const THERAPY_ILLUSTRATIONS: Record<string, ImageSourcePropType> = {
  'sit-to-stand': require('../../../assets/therapy/sit-to-stand.webp'),
  'supported-standing': require('../../../assets/therapy/supported-standing.webp'),
  'reaching-sitting': require('../../../assets/therapy/reaching-sitting.webp'),
  'walking-practice': require('../../../assets/therapy/walking-practice.webp'),
  'balance-practice': require('../../../assets/therapy/balance-practice.webp'),
  'active-play': require('../../../assets/therapy/active-play.webp'),
  'reach-grasp': require('../../../assets/therapy/reach-grasp.webp'),
  'two-hand': require('../../../assets/therapy/two-hand.webp'),
  'object-transfer': require('../../../assets/therapy/object-transfer.webp'),
  'drawing-colouring': require('../../../assets/therapy/drawing-colouring.webp'),
  'writing-practice': require('../../../assets/therapy/writing-practice.webp'),
  'active-range': require('../../../assets/therapy/active-range.webp'),
  'gentle-movement': require('../../../assets/therapy/gentle-movement.webp'),
  'relaxation': require('../../../assets/therapy/relaxation.webp'),
  'dressing': require('../../../assets/therapy/dressing.webp'),
  'containers': require('../../../assets/therapy/containers.webp'),
  'school-tasks': require('../../../assets/therapy/school-tasks.webp'),
  'self-care': require('../../../assets/therapy/self-care.webp'),
  'stretching': require('../../../assets/therapy/stretching.webp'),
};

/**
 * The picture for an activity, or null.
 *
 * Null is an ordinary answer: most activities have no illustration, and the screen falls back to
 * the drawn icon rather than leaving a hole.
 */
export function therapyIllustration(key: string | undefined): ImageSourcePropType | null {
  if (!key) return null;
  return THERAPY_ILLUSTRATIONS[key] ?? null;
}
