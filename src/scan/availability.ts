import { Platform } from 'react-native';

/**
 * Whether Scan Assignment is offered in this build.
 *
 * It is OFF on iOS: the text-recognition engine (Google ML Kit) is not linked into the iOS app,
 * because ML Kit sends diagnostic usage data to Google by default and the iOS release is a Kids
 * Category app (react-native.config.js). Android still has it. Every entry point asks this, so no
 * button on iOS leads to a screen that cannot work.
 */
export const SCAN_ASSIGNMENT_AVAILABLE = Platform.OS !== 'ios';
