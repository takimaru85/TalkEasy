/**
 * Parent-facing privacy wording shown in the app (Parent Mode -> Settings -> Privacy, the Parent Mode
 * header badge and the Scan Assignment note). It lives here, as plain strings with no React Native
 * imports, so `npm run check:scan` can assert it never drifts from what is actually built.
 *
 * It must stay consistent with the published policy at https://ibgolden.com/talkeasy-privacy-policy/
 * and with docs/google-play-data-safety.md. The facts it rests on:
 *  - TalkEasy's own code makes no network requests, has no accounts, analytics, advertising or crash
 *    reporting, and sends nothing a parent or child enters to anyone.
 *  - Speech-to-text requires on-device recognition and is switched off where that is not guaranteed
 *    (services/speechRecognition.ts, onDeviceGuaranteed).
 *  - Google ML Kit was removed from BOTH the iOS and the Android build, and Scan Assignment text
 *    recognition is unavailable in this release (src/scan/availability.ts).
 *  - The text-to-speech and speech-recognition engines belong to the phone's operating system, not to
 *    TalkEasy, so this copy never promises that every system voice works offline.
 * Do not make broader claims than that: this copy says what TalkEasy's own code does, not that no
 * component of the phone ever touches the network. Never reintroduce "works fully offline", "no
 * internet features" or "never sends any data off this device".
 */

export const PRIVACY_STORAGE =
  'What you and your child enter, such as the profile, photos, schoolwork, routines and learning progress, is stored on this device. TalkEasy has no accounts, and no analytics or advertising of its own. It does not send that information to IB Golden or to anyone else. Uninstalling the app deletes it.';

export const PRIVACY_MICROPHONE =
  'Microphone: in Sound Practice and Speech Practice, "Hear yourself" records the attempt so it can be played straight back, then deletes it. It is never scored, turned into text or saved. "Say the answer" in Learning turns speech into text using only your phone\'s on-device speech recognition. If your phone can\'t do that, the feature is switched off and a grown-up taps the answer instead. TalkEasy never saves or sends the audio.';

/** Scan Assignment: the same sentence on every platform, because the feature is off everywhere. */
export const PRIVACY_SCAN =
  'Scan Assignment (reading a photographed worksheet) is not available in this release, so no worksheet photo is read. Assignments can still be typed in by hand.';

export const PRIVACY_VOICES =
  'Spoken phrases use the voice engine that comes with your phone. TalkEasy does not choose that engine, and some voices installed on a phone can work online; TalkEasy itself sends no text anywhere.';

export const PRIVACY_POLICY_NOTE = 'Full details: ibgolden.com/talkeasy-privacy-policy';

/** Shown in the Parent Mode header. Describes what a parent enters, not every component of the phone. */
export const PRIVACY_BADGE = 'Your content stays on this device';

/** The privacy note under Scan Assignment. The screen is unreachable in this release; the text stays true if it is ever shown. */
export const SCAN_PRIVACY_NOTE = 'Scan Assignment is not available in this release. TalkEasy does not read or upload worksheet photos.';
