import { en } from './locales/en';
import { enAU, enGB, enNZ } from './locales/englishVariants';
import type { Locale, LocaleCode } from './types';

/**
 * The locale registry — plain data, no React. Modules that run outside the component tree
 * (the settings repository, the speech service) import from here so they never pull the
 * provider in and create a cycle back through SettingsContext.
 *
 * TalkEasy is English-only: US English (the default) plus UK, Australian and New Zealand English,
 * which differ in spelling, "Mum" and the voice accent (locales/englishVariants.ts). A saved
 * language that is no longer offered (e.g. the former Filipino) falls back to US English.
 *
 * To add a language later: add the code to LocaleCode in types.ts, copy locales/en.ts, translate
 * it, and add it to LOCALES. TypeScript will flag any string the new locale is missing.
 */
export const LOCALES: readonly Locale[] = [en, enGB, enAU, enNZ];

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
