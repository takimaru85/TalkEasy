import type { ColorArtName } from '@/components/adventure/ColorArt';
import { PREMIUM_THEMES, type ThemeId } from './themes';
import { SPACE_AVATARS, type AvatarId } from './avatars';
import { CASH_PURCHASES_ENABLED } from '@/subscription/release';

/**
 * The Rewards Shop catalogue. Code, not database rows: a price list is content, and what a child
 * OWNS (and has equipped) is the only thing stored (`shop_purchases`, `shop_equipped`).
 *
 * TWO WAYS TO GET AN ITEM, ONE INVENTORY. An item may be redeemed with STARS (`stars`), bought with
 * REAL MONEY through the platform store (`cash`), or both. Either way it lands in the same
 * `shop_purchases` row, so what is owned cannot differ by how it was obtained, and an item bought
 * once is never charged for again.
 *
 * COLLECTIBLES ONLY: stickers, trophies and badges, which change nothing about how TalkEasy works.
 * Themes, worlds and avatars are deliberately NOT sold. The four adventure worlds are never gated
 * (see AGENTS.md), and a price on a feature is a different decision from a price on a keepsake.
 */
export type ShopCategory = 'avatars' | 'themes' | 'stickers' | 'trophies' | 'premium';
export type Rarity = 'common' | 'rare' | 'epic';

/** A real-money offer. The product id must be created, identically, in Play Console and App Store Connect. */
export interface CashOffer {
  productId: string;
  /** Placeholder, shown ONLY until the store reports the real localised price (and marked as not final). */
  fallbackPrice: string;
}

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  description: string;
  rarity: Rarity;
  /** The drawing for a sticker/trophy/badge. A theme has none: its preview is the scene itself (`ThemeScene`). */
  art?: ColorArtName;
  /** Set on a theme: which scene it switches on. */
  themeId?: ThemeId;
  /** Set on an avatar: which companion it is. */
  avatarId?: AvatarId;
  /** The free starter: owned from the first launch, never sold, never in `shop_purchases`. */
  free?: boolean;
  /** Star price. Absent = cannot be redeemed with stars. */
  stars?: number;
  /** Cash offer. Absent = cannot be bought with money. */
  cash?: CashOffer;
}

export type AcquireMethod = 'stars' | 'cash';

const ALL_SHOP_CATEGORIES: { id: ShopCategory; label: string }[] = [
  { id: 'avatars', label: 'Space Avatars' },
  { id: 'themes', label: 'Background Themes' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'trophies', label: 'Trophies' },
  { id: 'premium', label: 'Premium' },
];

/** The FULL catalogue, cash offers included. A release shows SHOP_ITEMS, which leaves out what cannot be sold yet. */
export const ALL_SHOP_ITEMS: ShopItem[] = [
  // Avatars come from `shop/avatars.ts`, where their prices and offers are configured. The first is the free starter.
  ...SPACE_AVATARS.map<ShopItem>((a) => ({ id: a.itemId ?? `avatar-${a.id}`, category: 'avatars', rarity: a.free ? 'common' : 'epic', name: a.name, description: a.description, stars: a.stars, cash: a.cash, avatarId: a.id, free: a.free })),
  { id: 'sticker-paw', category: 'stickers', rarity: 'common', name: 'Paw Print', description: 'A friendly paw print.', stars: 5, art: 'learn:science_animals' },
  { id: 'sticker-smile', category: 'stickers', rarity: 'common', name: 'Happy Face', description: 'A big happy smile.', stars: 5, art: 'learn:esp_emotions' },
  { id: 'sticker-plant', category: 'stickers', rarity: 'common', name: 'Little Sprout', description: 'A seedling just starting to grow.', stars: 8, art: 'learn:science_plants' },
  { id: 'sticker-weather', category: 'stickers', rarity: 'common', name: 'Sunny Day', description: 'Sunshine and a little rain.', stars: 8, art: 'learn:science_weather' },
  { id: 'sticker-music', category: 'stickers', rarity: 'common', name: 'Music Note', description: 'For a child who loves to sing.', stars: 10, art: 'category:music' },
  { id: 'sticker-paint', category: 'stickers', rarity: 'common', name: 'Paint Splash', description: 'Bright colours everywhere.', stars: 10, art: 'category:art' },
  { id: 'sticker-earth', category: 'stickers', rarity: 'rare', name: 'Our Planet', description: 'The Earth, with a little love.', stars: 15, art: 'learn:science_environment' },
  { id: 'sticker-heart', category: 'stickers', rarity: 'rare', name: 'Kind Heart', description: 'For being kind.', stars: 15, art: 'learn:esp_helping' },
  { id: 'trophy-star', category: 'trophies', rarity: 'rare', name: 'Star Medal', description: 'A shiny star medal.', stars: 20, art: 'learn:esp_respect' },
  { id: 'trophy-reader', category: 'trophies', rarity: 'rare', name: 'Reading Book', description: 'For loving books.', stars: 25, art: 'category:reading' },
  { id: 'trophy-shield', category: 'trophies', rarity: 'rare', name: 'Helper Badge', description: 'A badge for community helpers.', stars: 30, art: 'learn:ap_community' },
  { id: 'trophy-gold', category: 'trophies', rarity: 'epic', name: 'Golden Medal', description: 'The golden medal.', stars: 40, art: 'stat:medal' },
  // Premium keepsakes. The product ids below are PLACEHOLDERS until they exist in the stores; until
  // then the cash path reports itself unavailable and nothing is charged or granted.
  { id: 'premium-streak', category: 'premium', rarity: 'epic', name: 'Super Streak', description: 'A blazing streak flame.', stars: 60, cash: { productId: 'talkeasy.shop.streak', fallbackPrice: '₱49' }, art: 'stat:streak' },
  { id: 'premium-stars', category: 'premium', rarity: 'epic', name: 'Star Cluster', description: 'A sparkling cluster of stars.', cash: { productId: 'talkeasy.shop.starcluster', fallbackPrice: '₱79' }, art: 'stat:stars' },
  // Themes come from `shop/themes.ts`, where their prices and offers are configured.
  ...PREMIUM_THEMES.map<ShopItem>((t) => ({ id: t.itemId, category: 'themes', rarity: 'epic', name: t.name, description: t.description, stars: t.stars, cash: t.cash, themeId: t.id })),
];

/** What this release shows: no Premium category (its keepsakes are cash-only or placeholders) until billing exists. */
export const SHOP_CATEGORIES = ALL_SHOP_CATEGORIES.filter((c) => CASH_PURCHASES_ENABLED || c.id !== 'premium');
export const SHOP_ITEMS: ShopItem[] = ALL_SHOP_ITEMS.filter((i) => CASH_PURCHASES_ENABLED || i.category !== 'premium');

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

/** How an item can be had, in the order they are shown. */
export function methodsFor(item: ShopItem): AcquireMethod[] {
  const out: AcquireMethod[] = [];
  if (item.stars !== undefined) out.push('stars');
  if (item.cash && CASH_PURCHASES_ENABLED) out.push('cash');
  return out;
}
