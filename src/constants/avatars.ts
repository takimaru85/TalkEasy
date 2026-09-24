/**
 * The child's avatar set — TalkEasy's own illustrated characters (drawn as SVG in
 * `components/common/AvatarArt.tsx`), not emoji. Stored in `child_profile.avatar` as `av:<id>`.
 *
 * Plain data, no React, so the repository layer can normalise old values without importing UI.
 */
export const AVATARS = [
  { id: 'dino', name: 'Dino' },
  { id: 'lion', name: 'Lion' },
  { id: 'tiger', name: 'Tiger' },
  { id: 'panda', name: 'Panda' },
  { id: 'koala', name: 'Koala' },
  { id: 'fox', name: 'Fox' },
  { id: 'frog', name: 'Frog' },
  { id: 'penguin', name: 'Penguin' },
  { id: 'owl', name: 'Owl' },
  { id: 'whale', name: 'Whale' },
  { id: 'robot', name: 'Robot' },
  { id: 'rocket', name: 'Rocket' },
] as const;

export type AvatarId = (typeof AVATARS)[number]['id'];

export const AVATAR_PREFIX = 'av:';
export const DEFAULT_AVATAR = `${AVATAR_PREFIX}dino`;

/** Profiles saved before the illustrated set used emoji; each maps to its closest character. */
const LEGACY_EMOJI: Record<string, AvatarId> = {
  '🦖': 'dino', '🐯': 'tiger', '🦁': 'lion', '🐼': 'panda', '🐨': 'koala', '🦊': 'fox',
  '🐸': 'frog', '🐧': 'penguin', '🦄': 'owl', '🐬': 'whale', '🚀': 'rocket', '⚽': 'robot',
  '🎨': 'owl', '🎸': 'robot', '🌟': 'rocket', '🙂': 'panda',
};

export function avatarId(value: string | null | undefined): AvatarId | null {
  if (!value?.startsWith(AVATAR_PREFIX)) return null;
  const id = value.slice(AVATAR_PREFIX.length);
  return AVATARS.some((a) => a.id === id) ? (id as AvatarId) : null;
}

/** Any stored value → a valid `av:<id>`. Old emoji avatars are carried over, never lost. */
export function normalizeAvatar(value: string | null | undefined): string {
  if (avatarId(value)) return value as string;
  const legacy = value ? LEGACY_EMOJI[value] : undefined;
  return legacy ? `${AVATAR_PREFIX}${legacy}` : DEFAULT_AVATAR;
}

export function avatarName(value: string): string {
  const id = avatarId(value);
  return AVATARS.find((a) => a.id === id)?.name ?? 'Avatar';
}
