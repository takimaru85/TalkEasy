import type { CashOffer } from './catalog';

/**
 * THE SPACE AVATARS: five companions that stand in the mascot spots (beside "LET'S GO!" on Home, in the
 * section banners). Pure data, so prices and offers are CONFIGURATION: change a number here and the shop,
 * the confirmation and `check:themes` follow.
 *
 * Astro Explorer is the FREE STARTER: always owned, never sold, and what shows until the child equips
 * another. The rest are shop items in the same inventory as everything else (`shop_purchases`), equipped in
 * the `avatar` slot of `shop_equipped`, so an avatar bought once is never charged for again and an
 * unowned avatar can never be worn. `cash` is the optional real-money offer for the future, handled by the
 * same unconnected `CashShopProvider` as every other item.
 *
 * Avatars are COMPANIONS, not the child's own picture: the child's photo or avatar in the Home greeting
 * (`profile.avatar`) is a different thing and is untouched.
 */
export type AvatarId = 'astro-explorer' | 'cosmo-robot' | 'luna-alien' | 'rocket-buddy' | 'galaxy-cat';

export interface SpaceAvatar {
  id: AvatarId;
  /** The shop item id (`avatar-<id>`); the free starter has none. */
  itemId: string | null;
  name: string;
  description: string;
  /** Star price. Absent on the free starter. */
  stars?: number;
  cash?: CashOffer;
  /** The free starter: owned from the first launch. */
  free?: boolean;
  /**
   * The official artwork: a file in `assets/avatars/` (the `require()` is in `components/adventure/avatarImages.ts`).
   * Every avatar has one now.
   */
  image?: string;
}

export const DEFAULT_AVATAR: AvatarId = 'astro-explorer';

export const SPACE_AVATARS: SpaceAvatar[] = [
  { id: 'astro-explorer', itemId: null, name: 'Astro Explorer', description: 'A friendly boy astronaut in a white spacesuit with blue and orange details.', free: true, image: 'astro-explorer.webp' },
  // itemId strings are kept from the first release ('avatar-cosmo' ...) so a family's existing unlocks survive.
  { id: 'cosmo-robot', itemId: 'avatar-cosmo', name: 'Cosmo Robot', description: 'A friendly white and blue robot with glowing cyan eyes and illuminated details.', stars: 1000, image: 'cosmo-robot.webp' },
  { id: 'luna-alien', itemId: 'avatar-luna', name: 'Luna Alien', description: 'A cheerful purple alien with teal accents, glowing antennae and a futuristic spacesuit.', stars: 1500, image: 'luna-alien.webp' },
  { id: 'rocket-buddy', itemId: 'avatar-rocket', name: 'Rocket Buddy', description: 'A cute smiling rocket with red, white, blue and yellow details.', stars: 2000, image: 'rocket-buddy.webp' },
  { id: 'galaxy-cat', itemId: 'avatar-cat', name: 'Galaxy Cat', description: 'An adorable cat astronaut with a cosmic visor, purple-blue accents and a starry tail.', stars: 3000, image: 'galaxy-cat.webp' },
];

export function getAvatar(id: string | null | undefined): SpaceAvatar | undefined {
  return SPACE_AVATARS.find((a) => a.id === id);
}

export function avatarForItem(itemId: string): SpaceAvatar | undefined {
  return SPACE_AVATARS.find((a) => a.itemId === itemId);
}

/** The slot in `shop_equipped` that holds the worn avatar. */
export const AVATAR_SLOT = 'avatar';

/**
 * Which avatar is SHOWING. The free starter unless the child equipped another that they still own: an
 * unowned or unknown avatar falls back to the starter, so a mascot spot is never empty or unpaid-for.
 */
export function activeAvatarFrom(equipped: Record<string, string>, owned: readonly string[]): AvatarId {
  const itemId = equipped[AVATAR_SLOT];
  if (!itemId || !owned.includes(itemId)) return DEFAULT_AVATAR;
  return avatarForItem(itemId)?.id ?? DEFAULT_AVATAR;
}
