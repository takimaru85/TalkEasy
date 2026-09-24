import React, { createContext, useContext, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { en } from './locales/en';
import { getLocale, interpolate } from './registry';
import type { LetterStyle, Locale, LocaleCode, Strings } from './types';

interface I18nContextValue {
  locale: Locale;
  language: LocaleCode;
  /** BCP-47 tag for text-to-speech and speech recognition. */
  speechTag: string;
  /** Which lowercase "a" the handwriting surfaces draw. */
  letterStyle: LetterStyle;
  /** A UI string, with optional {placeholders}. Falls back to English if a key is missing. */
  t: (key: keyof Strings, vars?: Record<string, string | number>) => string;
  /**
   * Translates text that came out of the database (tile labels, phrases, routine steps…).
   * The database stays English; anything without a translation — a parent's own tile — is
   * returned unchanged.
   */
  tContent: (text: string) => string;
}

const fallback: I18nContextValue = {
  locale: en,
  language: en.code,
  speechTag: en.speechTag,
  letterStyle: en.letterStyle,
  t: (key, vars) => interpolate(en.strings[key], vars),
  tContent: (text) => text,
};

const I18nContext = createContext<I18nContextValue>(fallback);

/**
 * Publishes the chosen language to the whole app. Must sit inside SettingsProvider — the
 * language is one more row in app_settings, so it loads and persists with everything else.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  const value = useMemo<I18nContextValue>(() => {
    const locale = getLocale(settings.language);
    return {
      locale,
      language: locale.code,
      speechTag: locale.speechTag,
      letterStyle: locale.letterStyle,
      t: (key, vars) => interpolate(locale.strings[key] ?? en.strings[key], vars),
      tContent: (text) => locale.content[text] ?? text,
    };
  }, [settings.language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
