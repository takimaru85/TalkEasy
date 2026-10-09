# TalkEasy — privacy verification status

Internal checklist (not a public policy). It separates what has been **verified** from what **still
needs a physical device or a built app**. Update it as items are completed. The public wording lives
in [privacy-policy.md](privacy-policy.md); the store answers in [google-play-data-safety.md](google-play-data-safety.md).

_Last reviewed: 2026-10-09, against the working tree before the next builds._

## Verified (source and tooling)

| Claim | How it was verified |
|---|---|
| Google ML Kit is not a dependency | Absent from `package.json` and `package-lock.json`; the package is not installed; `check:scan` fails if it returns |
| No ML Kit import, require or native-module probe in `src/` | `check:scan` scans every source file |
| No ML Kit autolinking on either platform | `expo-modules-autolinking react-native-config --platform ios` and `--platform android` list no ML Kit package; `react-native.config.js` no longer exists |
| Scan Assignment is unavailable on every platform | `SCAN_ASSIGNMENT_AVAILABLE = false` (`src/scan/availability.ts`); the School Mode card and `services/ocr.ts` read it; asserted by `check:scan` |
| TalkEasy's own code makes no network requests | Source search for `fetch`, `axios`, `XMLHttpRequest`, `WebSocket`, `http(s)://`; only hit is a link to Apple's billing page on a screen hidden while billing is off |
| No analytics, ads, crash-reporting or billing package | `package-lock.json` review; `expo-in-app-purchases` is not installed |
| Remaining native Android libraries | Gradle files of the installed packages declare only `com.google.android.material` (UI) and test-only libraries |
| Speech recognition always requests on-device processing | `requiresOnDeviceRecognition: true` in `services/speechRecognition.ts`; `onDeviceGuaranteed` refuses to start otherwise; asserted by `check:scan` |
| The library can go online on its own | Read from `expo-speech-recognition` source: iOS sets the on-device flag only when the requested language's recogniser supports it; its `supportsOnDeviceRecognition()` checks the phone's region language; Android ignores the flag below API 33. The guard exists because of this |
| In-app privacy wording | `src/constants/privacyCopy.ts`, asserted by `check:scan` (no "works fully offline", no "never sends any data off this device", no ML Kit claim, no "every voice is offline", no legal-compliance claim) |
| Android does not use cloud backup | `allowBackup: false` in `app.json` |
| Parent PIN: no default, salted hash, lockout after 5 wrong attempts | `services/pin.ts`, `check:pin` |
| iOS build 5 (the build made before ML Kit left Android) contains no ML Kit | IPA inspected: no ML Kit or Google SDK components; manifests declare no tracking and no collected data. **This is the OLD build; the next builds must be inspected again.** |

## NOT yet verified

| Item | What is needed |
|---|---|
| The next iOS and Android builds | Build them, then inspect the IPA and the AAB (merged manifest, permission list, bundled libraries, privacy manifests) |
| On-device speech behaviour | Physical-device tests below |
| That the phone's system services behave as stated | Not verifiable by TalkEasy: system text-to-speech and speech services belong to the phone and are governed by their providers |
| Google Play SDK Index / pre-launch report | Upload the new AAB to a testing track and read Google's reports |
| The published web policy | Still describes ML Kit; it must be replaced by hand with `privacy-policy.md` (manual) |

## Physical-device tests still required (speech recognition)

Run each on a build that contains the guard (the next release builds). Record device, OS, language setting and result.

**Android**
1. **Android 13+ with the offline speech model installed**, app language = phone language: "Say the answer" is offered and returns text. Then turn Wi-Fi and mobile data OFF and repeat: it must still work. Ideally capture traffic (for example with a proxy or `adb shell` network stats) while speaking and confirm nothing leaves the phone.
2. **Android 13+ without the offline model for the language** (remove it in system settings): the app must show an error or the "not supported" message, never silently use a networked recogniser. Confirm with data ON that no audio is sent.
3. **Android 12 or older** (API 31–32 also covers phones that report on-device support but ignore the flag): the microphone for this feature must NOT be offered; the grown-up-confirms path is shown with the message "Offline speech recognition is not supported on this device."
4. **Permission denied:** deny the microphone; confirm the friendly message and that the rest of the app works.

**iPhone / iPad**
5. **Phone language = app language** (for example both en-US) on iOS 16.4+ with offline dictation available: the feature is offered and returns text; repeat in Airplane mode.
6. **Phone language ≠ app language** (for example phone en-PH or en-GB with the app set to en-US): the feature must be switched off (message shown), not run. Check that the phone's reported locale string looks like `en-US` (Hermes `Intl`), including with a regional format set differently from the language.
7. **Phone that does not support offline recognition** for its language: switched off, no online use.
8. **Speech Recognition permission:** accept and decline; both paths behave.

**Both**
9. **"Hear yourself"** records, plays back, and the clip is deleted (leave the screen and check the cache is empty).
10. **Scan Assignment is gone:** School Mode shows no Scan Assignment card; typing an assignment in still works; assignments saved earlier still open.
11. **Settings → Privacy** shows the new text and no ML Kit sentence.
