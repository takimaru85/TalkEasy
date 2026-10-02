/**
 * Which seeded activity gets which bundled step-by-step picture. Pure data — no `require()` — so
 * `check:db` can import it under Node and compare it with the seeded activities and the real files.
 *
 * ACTIVITIES ARE DATABASE ROWS, NOT CODE, so there is no stable id to hang a picture on: a grown-up
 * can rename or delete any of them in Parent Mode, and add their own. The picture is therefore found
 * by NAME (lower-cased), which has two consequences worth knowing:
 *  - an activity a grown-up writes themselves with the same name as a seeded one shows the same
 *    picture, which is what they would want; and
 *  - renaming a seeded activity drops its picture and it falls back to its icon. Nothing breaks.
 *
 * A picture is shown on the activity's DETAIL screen only, never in the list: a 3:2 picture does not
 * survive a 64pt thumbnail. A photo a grown-up attached themselves (`imageUri`) always wins.
 */
export const ACTIVITY_PICTURES: Record<string, string> = {
  'drawing time': 'drawing-time',
  'building blocks': 'building-blocks',
  'music and clapping': 'music-clapping',
  'story time': 'story-time',
  'walk outside': 'walk-outside',
  'sensory bin': 'sensory-bin',
  'tidy toys': 'tidy-toys',
  'treadmill steps': 'treadmill-steps',
  'supported walking': 'supported-walking',
  'pedal bike': 'pedal-bike',
  'warm bath': 'warm-bath',
  'water play': 'water-play',
  'blow bubbles': 'blow-bubbles',
  'ball play': 'ball-play',
  'dance party': 'dance-party',
  'puzzle time': 'puzzle-time',
  'pet time': 'pet-time',
  'sunshine time': 'sunshine-time',
  'water the plants': 'water-plants',
};

/** Every one of these pictures is landscape, 1536 x 1024. `check:db` compares this with the files. */
export const ACTIVITY_PICTURE_RATIO = 1536 / 1024;

/** The picture key for an activity name, or undefined. */
export function activityPictureKey(name: string): string | undefined {
  return ACTIVITY_PICTURES[name.trim().toLowerCase()];
}
