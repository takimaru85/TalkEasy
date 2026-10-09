import { SCAN_ASSIGNMENT_AVAILABLE } from '@/scan/availability';
import type { ScanLanguage } from '@/scan/language';
import type { ScanFailure } from '@/scan/types';

/**
 * Text recognition for Scan Assignment: UNAVAILABLE IN THIS RELEASE.
 *
 * The only engine this app ever had was Google ML Kit (`@react-native-ml-kit/text-recognition`). It was
 * removed from both platforms because ML Kit sends diagnostic usage data to Google by default, which a
 * Kids Category app must not do. There is no recognition engine in the build, so this file never reads a
 * photograph: it reports "unavailable" and the screens say so.
 *
 * THE SEAM IS KEPT. Everything above this file — the screens, the state machine, the parser — calls
 * `extractTextFromImage()` and knows nothing about the engine. A future engine that sends nothing off the
 * device would be wired in HERE, behind `SCAN_ASSIGNMENT_AVAILABLE` (src/scan/availability.ts), together
 * with an update to the privacy policy, the in-app privacy copy and the store declarations.
 *
 * Nothing here touches the network, and nothing here logs: a photograph of a child's schoolwork has no
 * business in a log, in any build.
 */

/** What a recognition attempt produced. */
export interface OcrResult {
  text: string;
  /** Whether the result is worth presenting as read rather than as a rough guess. */
  confident: boolean;
}

export type OcrOutcome = { ok: true; result: OcrResult } | { ok: false; reason: ScanFailure };

/** Whether this build can read text from a photo at all. False in this release, on every platform. */
export function isTextRecognitionAvailable(): boolean {
  return SCAN_ASSIGNMENT_AVAILABLE;
}

/**
 * Reads the text in a photo. Never throws; in this release it always reports that no engine is available.
 */
export async function extractTextFromImage(_imageUri: string, _language: ScanLanguage = ''): Promise<OcrOutcome> {
  return { ok: false, reason: 'engineUnavailable' };
}
