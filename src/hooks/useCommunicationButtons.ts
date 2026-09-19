import { buttonsRepo, categoriesRepo, favoritesRepo } from '@/database';
import type { Category, CommunicationButton } from '@/types/models';
import { useDbQuery } from './useDbQuery';

const NONE: CommunicationButton[] = [];
const NO_CATEGORIES: Category[] = [];

/** Visible tiles for the child, optionally filtered by category. */
export function useVisibleButtons(categoryId?: number) {
  return useDbQuery(() => buttonsRepo.getVisible(categoryId), NONE, ['buttons', 'categories'], [categoryId]);
}

/** School Mode quick phrases, looked up by [category key, label]. */
export function useQuickButtons(pairs: [string, string][]) {
  const signature = pairs.map((p) => p.join(':')).join(',');
  return useDbQuery(() => buttonsRepo.getByCategoryLabels(pairs), NONE, ['buttons', 'categories'], [signature]);
}

/** Every tile, hidden ones included — for parent management. */
export function useAllButtons() {
  return useDbQuery(() => buttonsRepo.getAll(), NONE, ['buttons']);
}

export function useButton(id: number | undefined) {
  return useDbQuery(
    () => (id === undefined ? Promise.resolve(null) : buttonsRepo.getById(id)),
    null as CommunicationButton | null,
    ['buttons'],
    [id],
  );
}

export function useCategories() {
  return useDbQuery(() => categoriesRepo.getAll(), NO_CATEGORIES, ['categories']);
}

export function useHomeCategories() {
  return useDbQuery(() => categoriesRepo.getHomeCategories(), NO_CATEGORIES, ['categories', 'buttons']);
}

export function useCategoryByKey(key: string) {
  return useDbQuery(() => categoriesRepo.getByKey(key), null as Category | null, ['categories'], [key]);
}

export function useMostUsedButtons(limit = 6) {
  return useDbQuery(() => buttonsRepo.getMostUsed(limit), NONE, ['buttons'], [limit]);
}

/** Set of button ids currently in favorites — for star toggles in parent mode. */
export function useFavoriteIds() {
  return useDbQuery(() => favoritesRepo.getButtonIds(), new Set<number>(), ['favorites', 'buttons']);
}
