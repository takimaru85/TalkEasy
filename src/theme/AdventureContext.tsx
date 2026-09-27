import React, { createContext, useContext } from 'react';
import { NightTheme } from './ThemeContext';

const AdventureZoneContext = createContext(false);

/**
 * Marks everything inside as CHILD territory, so the shared components dress themselves in the
 * adventure design system — gradient buttons, deep rounding, the daylight backdrop.
 *
 * `ChildScreen` provides it, so every child screen gets the new look without being rewritten one
 * by one, and a screen added later inherits it for free. Parent Mode builds on `ScreenContainer`
 * and `ScreenHeader` directly and never enters the zone, so it stays calm and plainly
 * "for grown-ups" — which is the point: a child should be able to tell the two apart instantly.
 */
export function AdventureZone({ children }: { children: React.ReactNode }) {
  // The whole child zone is the space adventure now: the night theme comes with the zone.
  return (
    <AdventureZoneContext.Provider value>
      <NightTheme>{children}</NightTheme>
    </AdventureZoneContext.Provider>
  );
}

/** True inside a child screen. */
export function useIsAdventure(): boolean {
  return useContext(AdventureZoneContext);
}
