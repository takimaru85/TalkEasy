import React, { createContext, useContext, useMemo } from 'react';
import { useShopEquipped, useShopOwned } from '@/hooks/useRewards';
import { effectiveWorld, type WorldId } from '@/adventure/worlds';
import { useSettings } from '@/context/SettingsContext';
import { DEFAULT_AVATAR, activeAvatarFrom, type AvatarId } from '@/shop/avatars';
import { activeThemeFrom, type ThemeId } from '@/shop/themes';

/**
 * What the child has switched on, read from the SAME inventory as everything the shop sells:
 *  - `theme`  the premium background theme, or null for the free Space Explorer (their own world);
 *  - `avatar` the companion in the mascot spots (the free Astro Explorer unless they equipped another).
 * An equipped row only counts while the item is still owned and known to this build, so nothing can be on
 * without having been unlocked, and an unknown id falls back instead of blanking a screen.
 *
 * The default (outside a provider, in a check script, before the first read) is the free starter state.
 */
interface Active {
  theme: ThemeId | null;
  avatar: AvatarId;
  /** Every shop item id the child owns (worlds other than Space unlock from these). */
  owned: readonly string[];
}

const NONE_OWNED: readonly string[] = [];
const Ctx = createContext<Active>({ theme: null, avatar: DEFAULT_AVATAR, owned: NONE_OWNED });

export function ShopThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: equipped } = useShopEquipped();
  const { data: owned } = useShopOwned();
  const value = useMemo<Active>(() => ({ theme: activeThemeFrom(equipped, owned), avatar: activeAvatarFrom(equipped, owned), owned }), [equipped, owned]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveShopTheme(): ThemeId | null {
  return useContext(Ctx).theme;
}

export function useOwnedItems(): readonly string[] {
  return useContext(Ctx).owned;
}

/** The world in effect: the chosen one only if it is unlocked, else free Space. */
export function useEffectiveWorld(): WorldId {
  const { settings } = useSettings();
  return effectiveWorld(settings.adventureTheme, settings.adventureWorld, useContext(Ctx).owned);
}

export function useActiveAvatar(): AvatarId {
  return useContext(Ctx).avatar;
}
