# TalkEasy — Google Play Data Safety Recommendations

This document tells you how to fill out the Google Play Console **Data Safety** form for TalkEasy, based strictly on the source-code audit performed on 2026-09-23 and re-verified against the code on 2026-09-30. It does not fill the form out for you — Data Safety answers are a legal declaration you make to Google, and you should confirm every answer below yourself before submitting.

**Changed on 2026-09-30, before the v2.0.0 submission.** The 2026-09-23 audit recorded that the app never writes an audio file. That is no longer true: Sound Practice and Speech Practice record the child's attempt to the on-device cache so it can be played straight back, then delete it. The recommended answers have not changed — nothing is transmitted, so nothing is "collected" in Google's sense — but the Audio row and the notes below now describe the feature accurately, and the **Ephemeral processing** answer for Audio matters more than it did.

## CHANGED when billing was added — read this first

TalkEasy now contains network code in exactly one file, `src/subscription/storeProvider.ts`, which talks to Google Play Billing so that TalkEasy Plus can be sold. The audit below was written when the app had none, and its "no network code anywhere" justification is no longer literally true. **The recommended answers do not change**, for these reasons — but you should satisfy yourself of each before you submit:

- The billing transaction is between the user and **Google Play**, not between the user and you. Google Play's own handling of a purchase is not data *your app* collects.
- The app sends **no user data** of its own: the purchase flow sees a product id and the user's own store account. No name, no photo, no recording, no practice, no progress, and nothing about the child crosses that boundary — the subscription state stored on the device is a plan, a product id and two timestamps.
- There is **no backend, no analytics SDK and no third-party billing SDK** (RevenueCat and similar were deliberately not used, precisely so that nothing is shared with a third party).
- **"Purchase history"** under Financial info is worth a moment's thought: the app reads the store's purchase history to decide whether Plus is active. It is read on-device from Google Play and never transmitted anywhere by TalkEasy. **NEEDS DEVELOPER CONFIRMATION:** decide whether you would rather declare it, which some publishers do for transparency even when the data is not "collected" in Google's sense.
- The `INTERNET` permission is now genuinely used. The note at the end of this document about it being an unused template permission no longer applies.

Everything below this section still describes the rest of the app accurately.

## The key concept: "collected" vs. "stored on device"

Google's own Data Safety definitions treat data as **"collected"** only if it is **transmitted off the device** to you (the developer) or to a third party — see Play Console Help, "Data collection and security." Data that is processed or stored **only on the device**, with no export/share/upload path, is generally **not** reported as "collected," even though the app clearly uses it.

TalkEasy has **no network code anywhere** (verified by grepping the entire source tree for `fetch`, `axios`, `WebSocket`, and `http(s)://` calls — none found outside a single unrelated attribution-URL string in a comment) and **no export, backup, sharing, or upload feature of any kind**. Every data type below therefore lands on the "not collected" side of that line.

**Recommended top-level answer:** *"Does your app collect or share any of the required user data types?"* → **No.**

If you would rather be maximally conservative and declare categories individually with "Collected: No / Shared: No" per type (some publishers prefer the more granular, visibly-thorough form even when the top-level answer would be "No"), use the per-type table below.

## Per-data-type answers

| Data type | Collected? | Shared? | Ephemeral processing? | Required/Optional | Why used | Encrypted in transit? | User deletion? |
|---|---|---|---|---|---|---|---|
| **Name** (child's name/nickname) | No — stored on-device only, never transmitted | No | N/A (persisted locally, not ephemeral, but never leaves device) | Optional (app works with a default/demo profile) | Personalises greetings, labels, and profile screens | N/A — never transmitted | Yes, edit/delete in Parent Mode → My child, or uninstall |
| **Other personal info** (age, grade, school, favourites, avatar/photo) | No — on-device only | No | No | Optional | Personalisation, school-organisation features | N/A | Yes |
| **Photos** (assignment/activity/AAC/profile photos) | No — copied into app-private on-device storage only | No | No | Optional (only when parent taps "Take/Choose photo") | Illustrate assignments, activities, communication buttons, profile | N/A — never transmitted | Yes, delete the record or uninstall |
| **Audio — use 1: microphone during speech-to-text** ("Say the answer", Adaptive Learning) | No — processed on-device by the OS recognizer, transcript kept, no audio file created | No | **Yes** — audio itself is ephemeral and never written to storage | Optional (child can type, tap, write, or ask a grown-up instead) | Converts a spoken answer into text on-device | N/A — never transmitted | Yes, the resulting text answer can be deleted like any other answer; there is no audio to delete |
| **Audio — use 2: voice recording for immediate playback** ("Hear yourself", Sound Practice / Speech Practice) | No — written to the app's on-device **cache** only, played back, then deleted by the app; never transmitted and never copied to permanent storage | No | **Yes** — the clip exists only between the attempt and its playback, and at most one exists at a time | Optional (the feature is never required; the child can listen to the model and practise aloud without recording) | Lets the child hear their own attempt back, which is the point of the practice screen | N/A — never transmitted | Yes — deletion is automatic and unconditional; there is no recording history, and nothing for a user to delete afterwards |
| **App activity / in-app actions** (learning answers, adaptive-learning method used, handwriting session stats, activity logs) | No — on-device only | No | No | Required for the learning/progress features to function | Scores practice sessions, tracks progress, lets a parent see strengths/areas to practise | N/A | Yes, via Parent Mode → Progress/Manage screens, or uninstall |
| **Files and docs** (assignment attachments picked via document picker) | No — copied into app-private storage only | No | No | Optional | Attach a document to an assignment | N/A | Yes |
| **App info and performance** (crash logs, diagnostics) | No — no crash/diagnostics SDK is present in the app | No | N/A | N/A | N/A | N/A | N/A |
| **Device or other IDs** | No — the app does not read IMEI, Android ID, advertising ID, or similar identifiers anywhere in the source | No | N/A | N/A | N/A | N/A | N/A |
| **Location** | No — no location permission, no location API used anywhere | No | N/A | N/A | N/A | N/A | N/A |
| **Contacts, Calendar (device), Messages, Financial info, Health & fitness (as a declared category), Web browsing** | No — none of these are accessed | No | N/A | N/A | N/A | N/A | N/A |

## Notes on borderline categories

- **Health and fitness:** TalkEasy is designed for a child with communication/developmental needs, and caregiver notes or therapy/activity records *could* reference health-adjacent information. However, this is entered by the parent, stored on-device only, and never transmitted — it does not meet Google's "collected" definition. If you want to be extra transparent given the sensitivity, you can still declare "Health and fitness: Not collected" with an internal note to yourself as to why (this file). **NEEDS DEVELOPER CONFIRMATION:** decide whether you're comfortable with "Not collected" here, or want to consult Google's health-data policy page given the app's target use case, before submitting.
- **Voice/audio permission vs. "Audio" data type:** requesting the `RECORD_AUDIO` permission does not by itself require declaring "Audio" as collected — Google's definition turns on transmission off the device, and TalkEasy transmits nothing. **Note that the app now does briefly write an audio file**, which the earlier version of this document denied: Sound Practice and Speech Practice record the child's attempt so it can be played back. That still lands on the "not collected" side of Google's line, for two independent reasons — the file never leaves the device, and it is deleted as soon as playback is no longer needed — but it is the reason the "Ephemeral processing: Yes" answer is the right one to give for the Audio type rather than leaving it blank. **NEEDS DEVELOPER CONFIRMATION:** if you declare the Audio type granularly, tick "Ephemeral processing" and be ready to describe the playback feature; Play review sometimes queries `RECORD_AUDIO` in apps aimed at children.
- **Why "Audio" is still not "collected" even though a file exists:** Google's Data Safety definition of collection is transmission off the device, not the existence of a local file. A photo copied into app storage is treated the same way in the Photos row above, and is likewise declared "not collected". The practice recording is strictly weaker than that: it is in the cache rather than app storage, and the app deletes it itself.

## Permissions cross-check before submitting

**NEEDS DEVELOPER CONFIRMATION:** This project uses the Expo *managed* workflow with no checked-in `/android` folder, so the final `AndroidManifest.xml` could not be inspected directly. Expo/React Native's default Android template commonly includes `android.permission.INTERNET` and `android.permission.ACCESS_NETWORK_STATE` regardless of whether the JavaScript layer makes network calls. Before finalizing the Data Safety form:

1. Build once with `npx expo prebuild --platform android` (or check the permissions Play Console auto-detects from your uploaded AAB under App content → Permissions declared).
2. Confirm the permissions list matches: `MODIFY_AUDIO_SETTINGS`, `RECORD_AUDIO`, `CAMERA`, and photo-library access (`READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE` depending on target Android version) — plus possibly `INTERNET`/`ACCESS_NETWORK_STATE` from the base template.
3. If `INTERNET` is present, you do **not** need to change any Data Safety answer because of it alone — Play Console does not require declaring data collection just because a permission exists; what matters is the app's actual behaviour, which this audit confirms makes no use of network access. Google Play's review may ask you to justify the permission; "included by the Expo/React Native build toolchain, unused by app code" is an accurate answer if asked.

## Target audience / content questionnaire (separate from Data Safety)

Google Play's "Target audience and content" section is a **separate** questionnaire from Data Safety, and asks about who the app is designed for, independent of what data it collects. Since TalkEasy is explicitly built for use by/with a child (per its own architecture documentation), you will likely need to select an appropriate target age group and complete the associated content rating (IARC) questionnaire. **NEEDS DEVELOPER CONFIRMATION:** this is a policy/business decision for you to make in Play Console directly — this audit only confirms the technical data-handling side.

## Summary

Given the code as it stands today, TalkEasy is in an unusually clean position for the Data Safety form: no analytics, no ads, no accounts, no network calls, no cloud SDKs, and no export path for any locally-stored data. The main things left for you to personally confirm before submitting are the two flagged above (the default Expo network permissions, and how you want to represent the health-adjacent, still-local-only content).
