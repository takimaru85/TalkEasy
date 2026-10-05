import type { ImageSourcePropType } from 'react-native';

/**
 * The supplied background pictures, by file name. Every entry is a STATIC `require`, because Metro bundles
 * only what it can see at build time — a computed path would silently find nothing. The file names are the
 * ones in `shop/themes.ts`; `check:themes` fails if a theme names a file that is not registered here or
 * not on disk, and if a picture is not the 941 x 1672 portrait the layout was designed for.
 *
 * All nine are 941 x 1672 (9:16) WebP: about 200 to 500 KB each, decoded once and cached by the image
 * component, with no network involved.
 */
export const BACKGROUND_SOURCES: Record<string, ImageSourcePropType> = {
  'space-explorer.webp': require('../../../assets/backgrounds/space-explorer.webp'),
  'moon-base.webp': require('../../../assets/backgrounds/moon-base.webp'),
  'nebula-dreams.webp': require('../../../assets/backgrounds/nebula-dreams.webp'),
  'planet-explorer.webp': require('../../../assets/backgrounds/planet-explorer.webp'),
  'cosmic-adventure.webp': require('../../../assets/backgrounds/cosmic-adventure.webp'),
  'ocean-explorer.webp': require('../../../assets/backgrounds/ocean-explorer.webp'),
  'magic-forest.webp': require('../../../assets/backgrounds/magic-forest.webp'),
  'dino-world.webp': require('../../../assets/backgrounds/dino-world.webp'),
  'dreamland.webp': require('../../../assets/backgrounds/dreamland.webp'),
};

/** The artwork's own proportions (width / height). */
export const BACKGROUND_RATIO = 941 / 1672;
