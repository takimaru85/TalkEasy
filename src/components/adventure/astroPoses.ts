/** The nine Astro Explorer poses, in the order the animation plays them (same order as assets/astro-animation/astro-explorer.lottie.json). */
export const ASTRO_POSES = [
  require('../../../assets/astro-animation/stand.png'),
  require('../../../assets/astro-animation/smile.png'),
  require('../../../assets/astro-animation/wave.png'),
  require('../../../assets/astro-animation/wide.png'),
  require('../../../assets/astro-animation/jump.png'),
  require('../../../assets/astro-animation/thumbs.png'),
  require('../../../assets/astro-animation/laugh.png'),
  require('../../../assets/astro-animation/hips.png'),
  require('../../../assets/astro-animation/point.png'),
] as const;

/** Milliseconds each pose is held (20 frames at 30 fps, matching the Lottie). */
export const ASTRO_POSE_MS = 667;
