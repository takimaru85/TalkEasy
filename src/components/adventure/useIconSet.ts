import { effectiveWorld } from '@/adventure/worlds';
import { useSettings } from '@/context/SettingsContext';
import { useActiveShopTheme } from '@/context/ShopThemeContext';
import { getPremiumTheme } from '@/shop/themes';

/**
 * Which icon set the app is drawing with.
 *
 *  'space'    Space Explorer, the free default: robots, rockets, satellites, planets (`art/spaceArt.tsx`).
 *  'classic'  the original icons, used when the child chose another adventure world or switched on a premium
 *             theme, so a Dinosaurs or Ocean screen is never dotted with rockets.
 *
 * This is the seam for FUTURE THEMES: a premium theme that ships its own icons adds its id here and its art
 * module next to `spaceArt`; `GameIcon` and `ColorArt` ask this hook and no screen changes. Outside a
 * provider (a check script) the contexts default to the free Space world.
 */
export type IconSet = 'space' | 'classic';

export function useIconSet(): IconSet {
  const { settings } = useSettings();
  const premium = useActiveShopTheme();
  // The space themes (Moon Base, Nebula Dreams...) are still the Space Explorer universe: rockets stay.
  if (premium) return getPremiumTheme(premium)?.family === 'space' ? 'space' : 'classic';
  return effectiveWorld(settings.adventureTheme, settings.adventureWorld) === 'space' ? 'space' : 'classic';
}

/**
 * Is the backdrop one of the supplied PICTURES (Space Explorer, or a premium theme that has one)?
 * When it is, the small decorative extras that older screens draw over the sky (the moon and clouds footer)
 * stand down: the artwork is already a finished scene and they only compete with it and sit under the text.
 */
export function useBackgroundIsPicture(): boolean {
  const { settings } = useSettings();
  const premium = useActiveShopTheme();
  if (premium) return !!getPremiumTheme(premium)?.background;
  return effectiveWorld(settings.adventureTheme, settings.adventureWorld) === 'space';
}
