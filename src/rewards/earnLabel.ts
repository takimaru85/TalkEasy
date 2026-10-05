/**
 * "Earn 1 star" / "Earn up to 2 stars" for an activity card or header, from the grown-up's own
 * reward settings (`profile.rewards.starsPer…`) — never a number written into a screen, so what a card
 * promises is exactly what `useAwardStars` will give. Empty when nothing is awarded, because a card
 * that promises zero stars is noise.
 */
export function earnLabel(base: number, bonus = 0): string {
  const b = Math.max(0, Math.round(base));
  const extra = Math.max(0, Math.round(bonus));
  const total = b + extra;
  if (total <= 0) return '';
  const word = total === 1 ? 'star' : 'stars';
  return extra > 0 && b > 0 ? `Earn up to ${total} ${word}` : `Earn ${total} ${word}`;
}
