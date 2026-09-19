import { favoritesRepo } from '@/database';
import type { CommunicationButton } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NONE: CommunicationButton[] = [];

/** Favorite tiles in the parent-chosen order. */
export function useFavoriteButtons() {
  return useDbQuery(() => favoritesRepo.getButtons(), NONE, ['favorites', 'buttons']);
}
