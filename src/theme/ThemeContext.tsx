import React, { createContext, useContext, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useProfile } from '@/context/ProfileContext';
import { Colors, tileInk } from '@/constants/colors';
import { ACCENTS, Motion, Shadow, type Accent } from './tokens';

export interface Theme {
  accent: Accent;
  highContrast: boolean;
  /**
   * The child zone's space-adventure surface: dark sky, white text, and every soft tint drawn as
   * the SOLID colour it stands for. Components that put an icon on a tint check this to draw the
   * icon white (on the day theme the icon takes the tint's deep tone instead).
   */
  night: boolean;
  reducedMotion: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    border: string;
    borderSoft: string;
    primary: string;
    primaryDark: string;
    primarySoft: string;
    success: string;
    successSoft: string;
    danger: string;
    selected: string;
  };
  /** Border width for cards/tiles (thicker in high contrast). */
  borderWidth: number;
  /** Card shadow style, or none in high contrast (edges are drawn with borders instead). */
  shadow: object;
  /** Returns the animation duration honouring reduced motion. */
  duration: (ms: number) => number;
  /** Maps a soft tile tint to what should actually be drawn (white in high contrast). */
  tint: (softColor: string) => string;
}

function buildTheme(accent: Accent, highContrast: boolean, reducedMotion: boolean): Theme {
  const colors = highContrast
    ? {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        surfaceAlt: '#F2F2F2',
        text: '#000000',
        textMuted: '#2B2B2B',
        border: '#000000',
        borderSoft: '#000000',
        primary: accent.dark,
        primaryDark: '#000000',
        primarySoft: '#FFFFFF',
        success: '#0B6B2E',
        successSoft: '#FFFFFF',
        danger: '#B00020',
        selected: '#FFD84D',
      }
    : {
        background: accent.page,
        surface: Colors.surface,
        surfaceAlt: Colors.surfaceAlt,
        text: Colors.text,
        textMuted: Colors.textMuted,
        border: Colors.border,
        borderSoft: Colors.borderSoft,
        primary: accent.strong,
        primaryDark: accent.dark,
        primarySoft: accent.soft,
        success: Colors.success,
        successSoft: Colors.successSoft,
        danger: Colors.danger,
        selected: Colors.selected,
      };
  return {
    accent,
    highContrast,
    night: false,
    reducedMotion,
    colors,
    borderWidth: highContrast ? 3 : 2,
    shadow: highContrast ? {} : (Shadow.card as object),
    duration: (ms) => (reducedMotion ? 0 : ms),
    tint: (soft) => (highContrast ? '#FFFFFF' : soft),
  };
}

/**
 * The same theme, moved onto the night sky (the home screen's design, now the whole child zone).
 *
 * Every child screen reads its colours from here, so the switch is made once instead of in 25
 * screens: text turns white, the page and plain surfaces turn deep navy, and `tint(soft)` — the
 * pale tile colours used all over the child screens — returns the tint's deep, saturated tone
 * (tileInk), which is exactly the "solid colourful card" look and keeps white text readable
 * (>= 4.5:1). High contrast never gets here: it keeps its black-on-white surface.
 */
function nightTheme(day: Theme): Theme {
  return {
    ...day,
    night: true,
    colors: {
      background: '#0B1030',
      surface: '#1E2A63',
      surfaceAlt: '#27336F',
      text: '#FFFFFF',
      textMuted: '#B8C3EA',
      border: '#6F83E0',
      borderSoft: '#3A4A96',
      primary: day.accent.strong,
      primaryDark: day.accent.dark,
      primarySoft: day.accent.soft,
      success: '#3DDC84',
      successSoft: '#DDF5E3',
      danger: '#FF6B6B',
      selected: '#FFD84D',
    },
    shadow: { shadowColor: '#050818', shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
    tint: (soft) => tileInk(soft),
  };
}

const ThemeContext = createContext<Theme>(buildTheme(ACCENTS.blue, false, false));

/** Puts everything inside on the night sky (used by the adventure zone). */
export function NightTheme({ children }: { children: React.ReactNode }) {
  const day = useContext(ThemeContext);
  const night = useMemo(() => (day.highContrast ? day : nightTheme(day)), [day]);
  return <ThemeContext.Provider value={night}>{children}</ThemeContext.Provider>;
}

/** Derives the theme from the child's favourite colour + accessibility settings. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const { profile } = useProfile();
  const theme = useMemo(
    () => buildTheme(ACCENTS[profile.favoriteColor] ?? ACCENTS.blue, settings.highContrast, settings.reducedMotion),
    [profile.favoriteColor, settings.highContrast, settings.reducedMotion],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export { Motion };
