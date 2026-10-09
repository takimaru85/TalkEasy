/**
 * Whether Scan Assignment (photograph a worksheet and read its words) is offered in this release.
 *
 * OFF ON EVERY PLATFORM. The only engine the feature ever had was Google ML Kit, which sends diagnostic
 * usage data to Google by default; it was removed from both the iOS and the Android build for the Kids
 * Category, and no replacement engine is bundled. This is the ONE flag: the School Mode entry point, the
 * OCR service and the screens all read it, so no button leads to a screen that cannot work.
 *
 * It is a plain constant with no React Native import so `npm run check:scan` can read it. Do NOT flip it
 * to true unless a recognition engine that sends nothing off the device is added AND the privacy policy,
 * the in-app privacy copy and the store declarations are updated first.
 */
export const SCAN_ASSIGNMENT_AVAILABLE = false;
