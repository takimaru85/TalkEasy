/**
 * The Rewards Shop discovery hint on Home: a short, dismissible nudge for a child who has not found the Shop.
 *
 * The saved value is '' (never shown), a COUNT of the times it has been shown, or 'done'. It is shown on the
 * first few opens only (a hint that greets a child every single time is nagging), never again once the child
 * dismisses it, and never once they have actually visited the Shop. Pure, so `check:layout` can run the rule.
 */
export const SHOP_HINT_MAX_VIEWS = 3;
export const SHOP_HINT_DONE = 'done';

export function shopHintViews(saved: string): number {
  const n = Number(saved);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

/** Whether to show the hint on this open, given the saved value and whether it was already counted this session. */
export function shouldShowShopHint(saved: string): boolean {
  if (saved === SHOP_HINT_DONE) return false;
  return shopHintViews(saved) < SHOP_HINT_MAX_VIEWS;
}

/** The value to save after Home opens and the hint is on screen (counts the view; finishes it at the limit). */
export function afterShopHintShown(saved: string): string {
  if (saved === SHOP_HINT_DONE) return saved;
  const next = shopHintViews(saved) + 1;
  return next >= SHOP_HINT_MAX_VIEWS ? SHOP_HINT_DONE : String(next);
}
