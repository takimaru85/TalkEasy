# TalkEasy Privacy Policy

**Effective Date:** September 30, 2026

## Introduction

TalkEasy ("the App") is developed and published by **IB Golden** ("we", "us", "our"), an independent developer based in the Philippines (website: [https://ibgolden.com/](https://ibgolden.com/)). TalkEasy is an offline communication, school-organisation and learning companion app, designed primarily to help a child — including children with communication difficulties — express themselves, keep track of schoolwork, follow a daily routine, and practice Grade 2 learning material, with the involvement of a parent or caregiver.

This Privacy Policy explains, in plain language and based on an actual review of the app's source code, what information TalkEasy handles, how it is handled, and what choices you have. We have written this policy to describe what the app **actually does** — not a generic template — and we do not make compliance claims (such as COPPA, GDPR, or Google Play Families certification) that our implementation does not support.

**The short version:** TalkEasy works entirely offline. Everything you and your child enter into the app — the profile, phrases, schoolwork, routines, notes, and learning results — is stored only in the app's private storage on your device. TalkEasy does not have user accounts, does not use analytics or advertising SDKs, and does not send any of this information to IB Golden or to any other company. The app can record your child's voice in one place only — the "Hear yourself" button in Sound Practice and Speech Practice — and that recording is played back and then deleted, never kept, never turned into text, and never sent anywhere.

## Information We Collect

### Information You Provide

When you (as the parent or caregiver) set up and use TalkEasy, you may choose to enter the following information directly into the app:

- **Child profile details:** name, nickname, age, grade, school name, a chosen avatar emoji or a photo, favourite colour, and favourite subjects/activities/foods/people.
- **Communication content:** custom AAC (Augmentative and Alternative Communication) phrases and categories, and optional photos attached to communication buttons (for example, a photo of a family member).
- **School and organisation content:** subjects, class schedules, materials lists, assignments (including an optional photo or file attachment), calendar events, and a daily routine.
- **Therapy/activity content:** custom activity cards, optional photos, frequency, and a completion log.
- **Caregiver notes:** free-text notes you choose to write for your own reference.
- **Learning configuration and results:** which learning activities are enabled, difficulty level, and the results of practice sessions (correct/incorrect counts).
- **Adaptive learning answers:** for each practice question, which answer method was used (tap, picture, matching, typing, speaking, writing, or caregiver-assisted), whether it was correct, how many attempts were made, and — for typed or spoken answers — the answer text itself.
- **Handwriting practice logs:** the level practiced, number of strokes, and duration (not the handwriting drawing itself).
- **Sound Practice and Speech Practice logs:** which sound, syllable, word or activity was practiced, which kind of exercise it was, how long the attempt lasted, and when. These features never score an attempt and never judge a pronunciation, so there is deliberately no "correct" or "accuracy" value recorded — and, as described under "Microphone / Audio Data" below, **no audio is kept**.
- **Rewards data:** stars earned/spent and any custom rewards you define.
- **App settings:** display preferences (text size, button size, contrast, motion), spoken-feedback preference, and a 4-digit "Parent Mode" PIN that you set to keep the parent screens separate from the child's view.

### Information Collected Automatically

TalkEasy does not automatically collect analytics events, usage statistics, advertising identifiers, or device identifiers. The only automatic processing is:

TalkEasy uses the microphone in two different ways, and they handle audio differently. Both are optional, both happen only after a deliberate tap, and neither transmits anything.

- **Microphone audio, momentarily, for speech-to-text.** When your child taps a "Say the answer" control in the Learning section, the device microphone is activated and the audio is converted to text using the device's own on-device speech recognizer. The audio itself is **not recorded, saved, or transmitted** — only the resulting text answer is kept, in the same place as any other typed answer.
- **A short temporary voice recording, so your child can hear themselves.** In Sound Practice and Speech Practice, tapping the microphone records the attempt to a temporary file in the app's cache area on the device, so that tapping "Hear yourself" can play it back. That file is **deleted as soon as it is no longer needed** — when the next attempt starts, when the child moves on, or when the screen closes — so at most one clip exists at a time. It is never transcribed, never scored, never copied into the app's permanent storage, never written to the database, and never transmitted. The app records only that an attempt happened and how long it lasted.
- **App version**, read locally from the app's own configuration to display it in Settings → About. This is not transmitted anywhere.

## App Permissions

TalkEasy requests the minimum Android permissions needed for the features described above, and only at the moment a feature is used:

| Permission | Purpose |
|---|---|
| Modify audio settings | Lets TalkEasy briefly lower other audio while it speaks a phrase aloud, and play speech reliably. |
| Microphone | Used in two places, each only after your child taps a microphone control: to turn a spoken answer into text on the device ("Say the answer" in Learning), and to record a short practice attempt in Sound Practice or Speech Practice so it can be played straight back. The practice clip is temporary and is deleted after playback. |
| Camera | Used only when a parent taps "Take photo" to attach a picture to an assignment, activity, communication button, or the child's profile. |
| Photos / media library | Used only when a parent taps "Choose photo" to pick an existing picture for the same purposes. |

TalkEasy does not request permission for contacts, location, calendar, phone, SMS, or background data access, and does not request any permission it does not immediately use for a visible, parent-initiated action.

### Microphone / Audio Data

Microphone access supports two optional features, and it is worth being precise about the difference, because one of them does briefly create an audio file on your device.

**1. "Say the answer" (Adaptive Learning) — no recording is created.** Speech recognition is performed **on the device**, using the operating system's built-in recognizer; TalkEasy does not use any cloud speech API. No audio file is created, and only the resulting text is kept. If on-device recognition is not available on a particular build (for example, when running inside Expo Go for development/testing), the feature falls back to a parent confirming the child's spoken answer themselves — again, without recording anything.

**2. "Hear yourself" (Sound Practice and Speech Practice) — a temporary recording is created, then deleted.** The whole point of this feature is that a child can say a sound and immediately hear their own voice back, so the attempt has to be captured to play it. What TalkEasy does with it:

- The recording is written to the app's **cache** directory — the scratch area the operating system is free to clear at any time — and not to the app's permanent storage.
- It is deleted as soon as it is no longer needed: when the next attempt begins, when the child taps away, and when the screen is closed. **At most one clip exists at a time**, and none survives leaving the screen.
- It is **never transcribed.** No speech recognition runs on it, so no text is derived from it.
- It is **never scored.** These features are practice aids, not assessments; the app never tells a child their pronunciation was wrong, and stores no correctness or accuracy value.
- It is **never written to the database.** The practice tables record the item, the exercise kind, a duration and a timestamp, and have no audio column by design.
- It is **never transmitted**, because the app has no network code at all.

Neither feature is required. A child who never taps a microphone control produces no audio of any kind, and the rest of the app works exactly the same: sounds and words can still be listened to and practiced out loud without recording. If the microphone is unavailable or permission is declined, the practice screens say so plainly and continue to work.

### Camera / Photos

The camera and photo library are only accessed when a parent deliberately taps "Take photo" or "Choose photo." Any picture selected this way is **copied** into the app's own private storage on the device (it is not moved or deleted from your gallery) and is used only to illustrate an assignment, activity, communication button, or the child's profile within the app. Photos are never uploaded, emailed, or shared by the app to any server or third party.

### Speech Recognition

See "Microphone / Audio Data" above. Speech recognition is on-device and optional; typing, tapping a picture, matching, writing, or asking a grown-up for help are always available as alternative ways to answer. Speech recognition is **not** used on Sound Practice or Speech Practice recordings — those are played back to the child and deleted, never turned into text.

### Text-to-Speech

TalkEasy uses the text-to-speech engine already built into your device (for example, Android's "Speech Services" or Samsung TTS, or the corresponding engine on iOS) to read phrases and questions aloud. This works entirely offline, does not require an internet connection, and does not send any text to an external server.

### Local Device Storage

All of the information described above is stored in a single private database on your device (using the standard on-device SQLite storage built into the app), plus a private folder used to store copies of photos and file attachments you choose to add. This storage is sandboxed to the TalkEasy app by the operating system: other apps cannot read it, and it is not automatically backed up to any cloud service by TalkEasy itself. **Uninstalling the app permanently deletes this storage.**

Separately from that permanent storage, the app uses the operating system's **cache** area for one short-lived thing only: the practice recording described under "Microphone / Audio Data". Cache files are not part of the app's saved data, are deleted by the app as soon as playback is no longer needed, and can be cleared at any time by the operating system or by a parent using the device's own "Clear cache" control, with no loss of anything the child has created.

## How We Use Information

Because all information stays on the device, it is used only to power the app's own features for the person using that device: showing the child's profile and personalised greetings, displaying communication phrases, tracking schoolwork and routines, generating learning practice questions and scoring them, and remembering your settings and PIN. IB Golden does not receive, view, analyze, or use any of this information, because it is never transmitted to us.

## Third-Party Services

TalkEasy does not integrate any third-party analytics, advertising, crash-reporting, cloud database, or authentication service. The app is built using the open-source Expo and React Native frameworks and a small number of associated libraries (for navigation, fonts, icons, on-device audio/speech, on-device file/photo access, and on-device SQLite storage). These libraries run entirely on your device as part of the app itself; none of them, as used in TalkEasy, transmit data to their maintainers or to any server.

## Data Sharing

We do not share, sell, rent, or otherwise disclose any information from TalkEasy to any third party, advertiser, data broker, or affiliate, because we never receive that information in the first place. There is no server-side copy of your data for us to share.

## Data Retention

Information remains on your device for as long as the app is installed, or until you delete it yourself (many records can be edited or deleted from within the app). Uninstalling TalkEasy removes its private storage — including the database and any stored photos — immediately, following your device's normal app-uninstall behaviour. IB Golden does not separately retain any copy, because none is ever transmitted to us.

The one exception to "remains for as long as the app is installed" is the practice recording described above, which is intentionally the opposite: it is retained only for the few seconds between making an attempt and hearing it back, and is then deleted. There is no history of past recordings, and no way to recover one.

## Data Security

Because TalkEasy has no server component and makes no network requests, there is no data-in-transit or server-side breach risk for the information you enter into the app. Data at rest is protected by your device's own operating-system-level app sandboxing (each app's storage is isolated from other apps) and by whatever device-level security you use (such as a screen lock). TalkEasy additionally provides an in-app 4-digit "Parent Mode" PIN to keep the parent/management screens separate from the child's screens on a shared device; this PIN is a convenience feature for a shared family device, not a strong security mechanism, and it does not encrypt the underlying data.

## Children's Privacy

TalkEasy is designed to be used by a child together with, or under the supervision of, a parent or caregiver, who is responsible for setting up the app, entering the child's information, and managing settings such as the Parent PIN. We have written this section based on what the app actually does, rather than asserting a certification we have not obtained:

- TalkEasy does not require creating an account, and does not ask a child (or anyone) to provide information over the internet, because the app does not connect to the internet at all.
- No information about a child is transmitted to IB Golden, to advertisers, or to any other third party — a central concern of children's privacy laws such as COPPA — because the app has no mechanism to transmit anything.
- TalkEasy does not show advertising to children, does not use behavioural tracking, and does not enable in-app purchases or external links intended for a child to interact with unsupervised.
- Some information entered into the app (for example, caregiver notes, or therapy/activity records) may be sensitive in nature, since TalkEasy is intended to support children with communication or developmental needs. This information is treated the same as every other on-device record described in this policy: stored locally only, never transmitted, and deletable by removing the record or uninstalling the app.
- A child's **voice** is treated more strictly than any other content in the app. The only recording TalkEasy ever makes exists so the child can hear themselves, lasts only until it has been played back, and is never transcribed, scored, stored permanently or transmitted. TalkEasy does not build a voice profile, does not keep a history of attempts, and has no feature that would let a recording be exported or shared.
- We have not sought or obtained formal certification under COPPA, GDPR-K, or Google Play's Families Policy program. If your jurisdiction requires a specific certification for apps used by children, please make your own assessment together with the practices described in this policy, since certification is a legal/business process separate from this document.

## Parental / Guardian Information

TalkEasy's "Parent Mode" is intended to be set up and controlled by an adult parent or caregiver. The Parent PIN, app settings, and all "Manage" screens (for editing the child's schedule, assignments, communication buttons, rewards, and learning content) are only reachable by entering this PIN. We recommend changing the default PIN (1234) the first time you use the app, and keeping it private from the child if you want to restrict access to the parent screens.

## User Rights and Choices

Because all data is stored locally on your own device and under your own control, you already have full, direct access to it at all times through the app's own screens — there is no separate server-side copy to request, correct, or export. In particular, you can:

- View, edit, or delete individual records (assignments, communication buttons, activities, notes, schedule entries, rewards, etc.) directly within the relevant "Manage" screen in Parent Mode.
- Change or reset app settings and the Parent PIN at any time in Parent Mode → Settings.
- Remove all data at once by uninstalling the app.

## Data Deletion

To delete all data collected by TalkEasy, uninstall the app from your device. This immediately and permanently removes the app's private database and any stored photos/attachments, following your device operating system's standard behaviour for app data. Because TalkEasy has no server and no account system, there is no remote copy of your data for us to delete on request, and no separate "delete my data" request process is needed.

## Changes to This Privacy Policy

We may update this Privacy Policy if TalkEasy's features or data practices change — for example, if a future version adds an optional backup feature. If we make a material change, we will update the "Effective Date" above and, where appropriate, note the change in the app's release notes or on this page. We encourage you to review this page periodically.

**Change on September 30, 2026.** The previous version of this policy described the microphone as being used only for on-device speech-to-text, and stated that no audio recording is ever created. That was accurate when written, but TalkEasy has since added the Sound Practice and Speech Practice "Hear yourself" feature, which briefly writes the child's attempt to the device's cache so it can be played back, then deletes it. This version describes that behaviour explicitly. Nothing about transmission changed: the app still has no network code, and no audio has ever left the device.

## Contact Us

If you have questions about this Privacy Policy or about TalkEasy's data practices, you can contact us at:

**IB Golden**
Website: [https://ibgolden.com/](https://ibgolden.com/)
Email: [info@ibgolden.com](mailto:info@ibgolden.com)
