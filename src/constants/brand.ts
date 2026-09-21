import Constants from 'expo-constants';

/**
 * Publisher branding. One place to change if the app is ever published under another name.
 */
export const BRAND = {
  appName: 'TalkEasy',
  publisher: 'IB Golden',
  website: 'ibgolden.com',
  /** Shown in Settings → About and on the PIN screen. */
  tagline: 'Created by IB Golden',
  copyright: `© ${new Date().getFullYear()} IB Golden`,
  version: Constants.expoConfig?.version ?? '1.0.0',
} as const;
