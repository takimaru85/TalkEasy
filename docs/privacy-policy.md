# TalkEasy Privacy Policy

**Effective Date:** [DATE OF PUBLICATION - fill in when this version is published]

**Applies to:** the TalkEasy release that removes Google ML Kit from the Android and iPhone/iPad apps [VERSION AND BUILD NUMBERS - fill in after the release builds exist].

## Introduction

TalkEasy ("the App") is developed and published by **IB Golden** (Ian Olden), an independent developer based in the Philippines (website: [https://ibgolden.com/](https://ibgolden.com/)). TalkEasy is a communication, school-organisation and learning companion app for a child, including children with speech or communication difficulties, set up and managed by a parent or caregiver.

This policy describes what the app actually does, based on a review of its source code. It does not make compliance claims (such as COPPA, GDPR, or Google Play Families certification) that we have not obtained.

**The short version:** What you and your child enter into TalkEasy - the profile, phrases, photos, schoolwork, routines, notes and learning progress - is stored on the device. TalkEasy has no accounts, no advertising, and no analytics, tracking or crash-reporting code, and TalkEasy's own code makes no network requests that send this information anywhere. It is not sent to IB Golden or to anyone else. This statement is about TalkEasy's own code; it does not cover the phone's operating system or the voice and speech services that come with the phone (see "Text-to-speech" and "Microphone and speech" below).

## Children and parents

TalkEasy is meant to be used by a child together with, or under the supervision of, a parent or caregiver. The parent or caregiver sets the app up, enters the child's information and manages settings behind a Parent PIN. The app has no accounts, never asks a child for an email address, phone number or password, and has no way for a child to contact, or be contacted by, anyone. Sensitive entries (for example caregiver notes) are treated like everything else: kept on the device and not sent to IB Golden.

## What is kept on the device

All of this is optional, and the app works with a default profile:

- **Child profile:** name or nickname, age, grade, school, an avatar or photo, favourite colour and favourites.
- **Communication content:** custom phrases and categories, and optional photos on communication buttons.
- **School and routine content:** subjects, schedules, materials, assignments (with an optional photo or file), calendar events and a daily routine.
- **Activity and therapy practice records**, and caregiver notes.
- **Learning results:** which activities are enabled, difficulty, the answer method used (tap, picture, matching, typing, speaking, writing, or with a grown-up), whether an answer was right, the number of attempts, and the text of typed or spoken answers.
- **Handwriting practice:** the level, the number of strokes and the duration. The drawing itself is not kept.
- **Sound, speech and voice practice:** the item, the kind of exercise, the duration and the time. No accuracy score and no audio is stored.
- **Rewards and settings:** stars, display and spoken-feedback preferences, and a Parent PIN stored only as a salted hash.

## Storage and backups

The information above is kept in a private database and a private folder in the app's own storage, which the operating system separates from other apps. TalkEasy has no server, cloud account, or export, backup or upload feature, and its own code makes no network requests that send this information anywhere.

- **Android:** the app is set not to take part in Android's automatic cloud backup.
- **iPhone and iPad:** a whole-device iCloud or computer backup made by the operating system may include the app's data. TalkEasy does not control that.

## Microphone and speech

**"Say the answer" (speech to text).** When your child taps the microphone, the phone's own speech recognizer turns the spoken answer into text. TalkEasy only turns this on when **on-device recognition** can be used, and it always asks for on-device recognition; it never falls back to an online speech service.

- On **Android**, this needs Android 13 or newer with on-device speech recognition available.
- On **iPhone and iPad**, this is offered only when the language being used is the phone's own language and the phone supports offline recognition for it.
- On any other phone the microphone for this feature is not offered. The screen says that offline speech recognition is not supported on this device, and a grown-up confirms the answer instead (typing, tapping a picture, matching, writing and asking a grown-up are always available).
- Not every device and language setting has been tested, so the feature may be unavailable on some phones that could in principle support it.
- TalkEasy does not record, save or send the audio. Only the resulting text is kept, like a typed answer.

**"Hear yourself" (Sound Practice and Speech Practice).** The attempt is recorded to a temporary file in the app's cache so it can be played straight back. It is deleted when the next attempt starts, when the child moves on, or when the screen closes; at most one clip exists at a time. It is never transcribed, scored, stored permanently or sent anywhere.

Microphone use is optional. If permission is declined, the practice screens say so and keep working.

## Camera and photos

The camera and photo picker are used only when a parent chooses "Take photo" or "Choose photo" to attach a picture to an assignment, activity, communication button or the child's profile. A chosen picture is copied into the app's private storage; the original stays where it was. Pictures are not uploaded. TalkEasy does not ask for broad access to the photo library or storage.

## Text-to-speech

TalkEasy reads phrases and questions aloud using the voice engine and voices installed on the phone (for example Android Speech Services or Samsung TTS, or Apple's voices), and prefers voices that work offline. **TalkEasy does not choose or control that engine.** Some voices a phone offers can work online and are governed by their provider's terms, so TalkEasy does not promise that every voice works offline. TalkEasy's own code sends no text anywhere.

## Scan Assignment

Earlier builds of TalkEasy for Android included an optional Scan Assignment feature that read a photographed worksheet using Google's ML Kit library. **Scan Assignment text recognition is not available in this release, and Google ML Kit is not included in the Android or the iPhone/iPad app.** Assignments can still be typed in by hand, and assignments saved earlier remain on the device.

## Third-party components, advertising and analytics

TalkEasy's own code contains no advertising, analytics, crash-reporting or tracking libraries and shows no advertising to children. The app is built with open-source frameworks and libraries (Expo and React Native and associated libraries for navigation, fonts, icons, audio and speech, file and photo access, and SQLite storage) that run on the device as part of the app. We reviewed the app's dependencies and found no component that is designed to send usage data anywhere, but we cannot promise what every part of the phone's operating system or its voice and speech services does; those are governed by their providers. There are no in-app purchases in this version.

## Who receives information

Nothing a parent or child enters into TalkEasy goes to IB Golden or to anyone else, and we do not sell, rent or share it. We hold no copy of it.

## Keeping and deleting information

Information stays on the device until it is removed. In Parent Mode you can edit or delete individual records and change settings and the PIN. Uninstalling the app removes its database and the copies of photos and files it kept. The temporary practice recording is cleared by the app and can also be cleared with the device's "clear cache". Because IB Golden holds no copy, there is nothing on our side to delete on request.

## Parent PIN

The first time a grown-up opens Parent Mode, they create a PIN; there is no default PIN. It is stored only as a salted hash on the device, and five wrong attempts cause a short lockout. It is a convenience that separates the parent and child screens on a shared device, not strong security, and it does not encrypt the data.

## Legal compliance

We have not sought or obtained certification under COPPA, GDPR-K or Google Play's Families Policy programme. If your country has specific requirements for apps used by children, please assess them alongside this policy.

## Changes to this policy

If the app's features or data practices change, we will update this page and its date. **Changes in this version:** Google ML Kit and Scan Assignment text recognition were removed from both the Android and the iPhone/iPad app; the text-to-speech wording no longer implies that every system voice is offline; and the backup and speech-recognition limits are described in more detail. Earlier versions of this policy said the app never connects to the internet and that speech recognition was always on-device; those statements were inaccurate and have been replaced.

## Contact

**IB Golden** (Ian Olden)
Website: [https://ibgolden.com/](https://ibgolden.com/)
Email: [info@ibgolden.com](mailto:info@ibgolden.com)
