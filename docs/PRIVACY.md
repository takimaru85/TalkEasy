# TalkEasy — Privacy Policy (summary)

_Last updated: [DATE — fill in when published]. The full policy is [privacy-policy.md](privacy-policy.md); the published copy is https://ibgolden.com/talkeasy-privacy-policy/ (this summary and the full policy describe the release that removes Google ML Kit; the website must be updated to match when that release ships)._

TalkEasy is a communication, school and learning companion app for a child. What a parent or child
enters is kept on the device it is installed on.

## What TalkEasy's own code does

TalkEasy has no user accounts, no advertising, and no analytics, tracking or crash-reporting code,
and its own code makes no network requests that send anything a parent or child enters to anyone —
including IB Golden. This is a statement about TalkEasy's own code. It does not cover the phone's
operating system or the voice and speech services that come with the phone.

Google ML Kit was used by an earlier optional Scan Assignment feature on Android. **It is removed
from both the Android and the iPhone/iPad app, and Scan Assignment text recognition is not
available in this release.** Assignments can still be typed in, and assignments saved earlier stay
on the device.

## What stays on the device

The child's profile (name, photo, favourites), communication phrases, school subjects, assignments,
calendar events, routines, activities, learning results, stars and rewards, and caregiver notes are
stored in a private database in the app's own storage. Nothing is uploaded.

- **Android:** the app does not take part in Android's automatic cloud backup.
- **iPhone and iPad:** an iCloud or computer backup made by the operating system may include the
  app's data; TalkEasy does not control that.
- Uninstalling the app deletes what it stored.

## Permissions

* **Camera / Photos** — only when a parent chooses *Take photo* or *Choose photo* to attach a
  picture to an assignment, activity, communication card or the child's profile. The picture is
  copied into the app's private storage. It is not uploaded.
* **Text-to-speech** uses the voice engine installed on the phone or tablet. TalkEasy prefers an
  installed offline voice but does not choose or control the engine, and some voices on a phone can
  work online, so it does not promise that every voice is offline. TalkEasy itself sends no text
  anywhere.
* **Microphone** — used in two places, each only after the child taps a microphone button:
  * *Say the answer* (Learning) turns speech into text using the phone's own recognizer, **only
    when on-device recognition can be used** (Android 13 or newer with on-device recognition
    available; on iPhone and iPad, only when the language in use is the phone's own language and
    the phone supports it offline). TalkEasy always asks for on-device recognition and never falls
    back to an online speech service. Otherwise the feature is switched off, the screen says
    offline speech recognition is not supported on this device, and a grown-up confirms the answer.
    No audio is saved or sent; only the text answer is kept. Not every device has been tested.
  * *Hear yourself* (Sound Practice, Speech Practice) records the attempt to a temporary cache
    file so it can be played straight back, then deletes it — when the next attempt starts, when
    the child moves on, or when the screen closes. At most one clip exists at a time. It is never
    transcribed, scored, stored permanently, or sent anywhere.

## Parent PIN

Created by the grown-up the first time Parent Mode is opened (there is no default PIN), stored only
as a salted hash, with a short lockout after five wrong attempts. It separates the parent and child
screens on a shared device; it is not strong security and does not encrypt the data.

## Children

TalkEasy is intended to be set up and supervised by a parent or caregiver. We have not obtained
COPPA, GDPR-K or Google Play Families certification. There are no in-app purchases in this version.

## Contact

TalkEasy is created by **IB Golden** (Ian Olden). Questions: info@ibgolden.com — https://ibgolden.com/
