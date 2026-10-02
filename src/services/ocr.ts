import { NativeModules } from 'react-native';
import { scriptFor, type ScanLanguage } from '@/scan/language';
import type { ScanFailure } from '@/scan/types';

/**
 * Text recognition for Scan Assignment.
 *
 * ON DEVICE, AND ONLY ON DEVICE. This is the single place in TalkEasy that reads a photograph of a
 * child's schoolwork, and that photograph never leaves the phone: no fetch, no upload, no API key
 * and no third party, which is what keeps the app's "everything stays on device" rule intact and
 * keeps the Google Play data-safety declaration a short one (docs/google-play-data-safety.md).
 *
 * THE SEAM. Everything above this file — the screens, the state machine, the parser — calls
 * `extractTextFromImage()` and knows nothing about which engine answered. Swapping engines, or
 * adding one for a non-Latin script, is a change to THIS FILE and nothing else.
 *
 * THE ENGINE is Google ML Kit on-device text recognition, via
 * `@react-native-ml-kit/text-recognition`. Two details about how it is reached:
 *
 *  - Availability is decided from `NativeModules.TextRecognition`, which is simply absent in Expo
 *    Go and on the web. The package's own entry point substitutes a Proxy that THROWS on any
 *    property access when the native half is missing, so asking it anything would blow up the
 *    screen — asking React Native instead is safe and never throws.
 *  - It is a classic React Native module, NOT an Expo module, so `requireOptionalNativeModule`
 *    (which only looks up Expo modules) would never find it however the build was made.
 *
 * TO USE IT: `npx expo run:android` once, to make a development build that includes the native
 * half. It cannot work in Expo Go. Nothing else changes — no env var, no key, no backend — and the
 * feature still works without it, because every failure path offers manual entry.
 */

/** What a recognition attempt produced. */
export interface OcrResult {
  text: string;
  /**
   * Whether the result is worth presenting as read rather than as a rough guess.
   *
   * Deliberately conservative: showing a bad read as confident is how a parent saves a worksheet
   * full of nonsense without checking it.
   */
  confident: boolean;
}

export type OcrOutcome = { ok: true; result: OcrResult } | { ok: false; reason: ScanFailure };

/** The slice of the package's result this app uses. */
interface RecognitionResult {
  text?: string;
  blocks?: { text?: string }[];
}

/**
 * Whether this build can read text from a photo at all.
 *
 * Checked through React Native's own registry rather than the package, because the package throws
 * when the native side is missing. Never throws, so the UI can ask it during render.
 */
export function isTextRecognitionAvailable(): boolean {
  try {
    return NativeModules?.TextRecognition != null;
  } catch {
    return false;
  }
}

/**
 * Reads the text in a photo.
 *
 * Never throws: every failure comes back as an outcome the UI can explain, because what a parent
 * needs at that moment is a sentence and a way forward, not a crash.
 */
export async function extractTextFromImage(imageUri: string, language: ScanLanguage = ''): Promise<OcrOutcome> {
  if (!isTextRecognitionAvailable()) return { ok: false, reason: 'engineUnavailable' };
  if (!imageUri) return { ok: false, reason: 'engineError' };

  try {
    // Required lazily so that a build WITHOUT the native half never evaluates the package's
    // throwing Proxy at import time, which would take the whole screen down rather than degrade.
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const engine = require('@react-native-ml-kit/text-recognition').default as {
      recognize: (uri: string, script?: string) => Promise<RecognitionResult>;
    };
    const raw = await engine.recognize(imageUri, scriptFor(language));
    const text = normalise(raw?.text ?? (raw?.blocks ?? []).map((b) => b?.text ?? '').join('\n'));
    if (text.trim().length === 0) return { ok: false, reason: 'noText' };
    return { ok: true, result: { text, confident: looksConfident(text, raw?.blocks?.length ?? 0) } };
  } catch {
    // DELIBERATELY CARRIES NO DETAIL. This is a photograph of a child's schoolwork; neither the
    // text nor anything derived from it has any business in a log, in any build.
    return { ok: false, reason: 'engineError' };
  }
}

/**
 * Tidies line endings and runs of blank lines, and nothing else.
 *
 * It does NOT correct spelling, expand abbreviations or rewrite anything. The words a child's
 * teacher wrote are shown as they were read; an app that quietly "improves" a worksheet hides what
 * the page actually said.
 */
function normalise(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * A rough read on whether the result is trustworthy enough to present as read.
 *
 * ML Kit does not return a usable per-block confidence on every platform, so this uses what is
 * always there: how much came back, and how much of it is actual words. A page that produced three
 * characters, or that is mostly punctuation, is reported as partial — which on screen means "check
 * this carefully" rather than "here is your assignment".
 */
function looksConfident(text: string, blocks: number): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 12) return false;
  const letters = (trimmed.match(/[\p{L}\p{N}]/gu) ?? []).length;
  if (letters / trimmed.length < 0.55) return false;
  const words = trimmed.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  if (words.length < 3) return false;
  // A single block of a few words is usually a stray caption rather than a worksheet.
  return blocks !== 1 || words.length >= 5;
}
