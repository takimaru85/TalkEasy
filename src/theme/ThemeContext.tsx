import React, { createContext, useContext, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useProfile } from '@/context/ProfileContext';
import { Colors } from '@/constants/colors';
import { ACCENTS, Motion, Shadow, type Accent } from './tokens';

export interface Theme {
  accent: Accent;
  highContrast: boolean;
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
    reducedMotion,
    colors,
    borderWidth: highContrast ? 3 : 2,
    shadow: highContrast ? {} : (Shadow.card as object),
    duration: (ms) => (reducedMotion ? 0 : ms),
    tint: (soft) => (highContrast ? '#FFFFFF' : soft),
  };
}

const ThemeContext = createContext<Theme>(buildTheme(ACCENTS.blue, false, false));

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
