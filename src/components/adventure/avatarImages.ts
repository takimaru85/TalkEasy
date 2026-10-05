import type { ImageSourcePropType } from 'react-native';

/**
 * The official avatar pictures, by file name. Static `require`s, because Metro bundles only what it can see
 * at build time. The names are the ones in `shop/avatars.ts`; `check:themes` fails if an avatar names a file
 * that is not registered here or not on disk, or one that is not the square 512 x 512 WebP the display was
 * designed for, or two avatars that share a picture.
 */
export const AVATAR_SOURCES: Record<string, ImageSourcePropType> = {
  'astro-explorer.webp': require('../../../assets/avatars/astro-explorer.webp'),
  'cosmo-robot.webp': require('../../../assets/avatars/cosmo-robot.webp'),
  'luna-alien.webp': require('../../../assets/avatars/luna-alien.webp'),
  'rocket-buddy.webp': require('../../../assets/avatars/rocket-buddy.webp'),
  'galaxy-cat.webp': require('../../../assets/avatars/galaxy-cat.webp'),
};
