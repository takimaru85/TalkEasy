/** The drawn collectibles (see `components/adventure/art/collectionArt.tsx`). Pure, so `check:db` can compare it with the registry. */
export const COLLECTION_ART_KEYS = [
  'astro-dog', 'baby-martian', 'space-bunny', 'cosmic-panda',
  'mars', 'jupiter', 'neptune', 'venus', 'mercury',
  'space-shuttle', 'lunar-rover', 'flying-saucer', 'space-capsule', 'star-cruiser', 'planet-hopper', 'cosmic-explorer-ship',
  'shooting-star', 'meteor', 'comet', 'galaxy-crystal', 'cosmic-diamond', 'nebula-orb', 'black-hole',
  'astronaut-helmet', 'jetpack', 'space-suit', 'moon-boots', 'satellite', 'space-telescope', 'robot-companion', 'space-backpack',
  'alien-egg', 'mystery-planet', 'treasure-chest', 'golden-rocket', 'rainbow-nebula', 'legendary-badge', 'trophy',
] as const;
export type CollectionArtKey = (typeof COLLECTION_ART_KEYS)[number];
