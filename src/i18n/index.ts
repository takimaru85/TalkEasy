/**
 * Localization. US English is the default and the source of truth for every string key;
 * other languages are additions (see registry.ts for how to add one).
 *
 * Screens use `useI18n()`: `t('key')` for UI text and `tContent(text)` for text that came out
 * of the database. Non-React modules import from '@/i18n/registry' instead.
 */
export * from './types';
export * from './registry';
export { I18nProvider, useI18n } from './I18nContext';
