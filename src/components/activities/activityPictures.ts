import type { ImageSourcePropType } from 'react-native';
import { activityPictureKey } from '@/activities/pictures';

/**
 * The bundled pictures for activities. The `require()`s live here, in React-land, because
 * `activities/pictures.ts` is imported by `check:db` under Node, where an asset import does not
 * resolve (the same split as `components/therapy/illustrations.ts`).
 *
 * These are BITMAPS, a deliberate exception to "art is drawn in code": a scene showing a child doing
 * the activity in three steps is not something the icon set can draw. Detail screens only.
 *
 * Adding one: put a WebP in `assets/activities/`, add a line here and one in `activities/pictures.ts`.
 * `check:db` fails if the two disagree or the file is missing or the wrong shape.
 */
const PICTURES: Record<string, ImageSourcePropType> = {
  'drawing-time': require('../../../assets/activities/drawing-time.webp'),
  'building-blocks': require('../../../assets/activities/building-blocks.webp'),
  'music-clapping': require('../../../assets/activities/music-clapping.webp'),
  'story-time': require('../../../assets/activities/story-time.webp'),
  'walk-outside': require('../../../assets/activities/walk-outside.webp'),
  'sensory-bin': require('../../../assets/activities/sensory-bin.webp'),
  'tidy-toys': require('../../../assets/activities/tidy-toys.webp'),
  'treadmill-steps': require('../../../assets/activities/treadmill-steps.webp'),
  'supported-walking': require('../../../assets/activities/supported-walking.webp'),
  'pedal-bike': require('../../../assets/activities/pedal-bike.webp'),
  'warm-bath': require('../../../assets/activities/warm-bath.webp'),
  'water-play': require('../../../assets/activities/water-play.webp'),
  'blow-bubbles': require('../../../assets/activities/blow-bubbles.webp'),
  'ball-play': require('../../../assets/activities/ball-play.webp'),
  'dance-party': require('../../../assets/activities/dance-party.webp'),
  'puzzle-time': require('../../../assets/activities/puzzle-time.webp'),
  'pet-time': require('../../../assets/activities/pet-time.webp'),
  'sunshine-time': require('../../../assets/activities/sunshine-time.webp'),
  'water-plants': require('../../../assets/activities/water-plants.webp'),
};

/** The picture for an activity, by name, or null — null is an ordinary answer (the icon is shown). */
export function activityPicture(name: string): ImageSourcePropType | null {
  const key = activityPictureKey(name);
  return (key && PICTURES[key]) || null;
}
