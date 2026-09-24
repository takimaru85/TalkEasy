import { en } from './locales/en';
import { fil } from './locales/fil';
import type { Locale, LocaleCode } from './types';

/**
 * The locale registry — plain data, no React. Modules that run outside the component tree
 * (the settings repository, the speech service) import from here so they never pull the
 * provider in and create a cycle back through SettingsContext.
 *
 * To add Spanish / Japanese / Korean: add the code to LocaleCode in types.ts, copy
 * locales/en.ts, translate it, and add it to LOCALES. Nothing else needs to change —
 * TypeScript will flag any string the new locale is missing.
 */
export const LOCALES: readonly Locale[] = [en, fil];

/** US English. The app only leaves it if a parent picks another language in Settings. */
export const DEFAULT_LOCALE_CODE: LocaleCode = 'en-US';

/** The locale for `code`, falling back to US English for anything unknown. */
export function getLocale(code: string | null | undefined): Locale {
  return LOCALES.find((l) => l.code === code) ?? en;
}

/** Replaces {placeholders} with values; an unknown placeholder is left alone. */
export function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}
