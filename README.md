# TalkEasy

A **private, offline-first companion app** for a Grade 2 child with cerebral palsy. One React
Native + Expo + TypeScript codebase for Android and iPhone.

It combines:

| section | what it does |
|---|---|
| 🗣️ **Talk** (AAC) | Huge speaking buttons: basic needs, people, school phrases, feelings, custom phrases |
| 🎒 **School** | Today's classes, every subject (teacher, schedule, things to bring, reminders, assignments), calendar |
| 📝 **Assignments** | Child view: *📝 Math · 📅 Due Monday · ⬜ Not finished* → *✅ Completed* |
| 📚 **Learn** | Grade 2 practice: English, Filipino, Math, Science, Araling Panlipunan, ESP — 32 activities, 3 difficulty levels |
| 📅 **My Day** | Visual routine with NOW / NEXT, times, tick-off |
| 🧩 **Activities** | Therapy/activity cards with instructions, duration, frequency, picture, done log |
| ⭐ **Favorites** | Starred phrases + most-used |
| 🏫 **School Mode** | One simplified classroom screen: 8 quick phrases, today's subjects, today's assignments |
| 👨‍👩‍👧 **Parent** | PIN-protected dashboard + managers for everything above, care notes, progress, settings |

**Privacy:** no server, no account, no analytics, no ads, no location, no network code. Everything
is in one SQLite file (`talkeasy.db`) plus a private folder for photos, inside the app sandbox.
Uninstalling removes all of it.

Design docs: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (architecture, folders, navigation,
schema, offline strategy, accessibility, state management).

---

## 1. Requirements

| tool | version |
|------|---------|
| Node.js | 20 or newer (tested on 24) |
| npm | 10+ |
| Expo Go (quick testing) | latest from Play Store / App Store |
| Android Studio (optional) | emulator / local native build |
| Xcode on a Mac (optional) | iOS simulator / local native build |

## 2. Installation

```bash
cd TalkEasy
```

```bash
npm install
```

Checks that need no device:

```bash
npm run typecheck
```

```bash
npm run check:db
```

```bash
npm run check:learning
```

`check:db` runs the real migrations + seed against an in-memory SQLite for both a fresh install
and a v1 → v2 upgrade. `check:learning` generates every learning activity at every difficulty
(14,400 questions) and validates them.

## 3. Running the app

```bash
npx expo start
```

* **Android phone** – Expo Go → *Scan QR code*.
* **iPhone** – Camera app → point at the QR → tap the banner (opens Expo Go).
* **Android emulator** – press `a` in the terminal (needs Android Studio + a running AVD).
* **iOS simulator** (Mac) – press `i`.

Same Wi-Fi is needed **only** for Expo Go to fetch the JavaScript from your computer. A built
app (section 7) contains everything and never needs a network.

> Expo Go note: Expo Go supports every module TalkEasy uses (SQLite, speech, audio, image
> picker, document picker, file system, haptics). After changing plugins in `app.json`, restart
> with `npx expo start -c`.

## 4. Testing on Android

| method | command / steps |
|---|---|
| Expo Go | `npx expo start`, scan QR |
| Development build (own device or emulator) | `npx expo run:android` (needs Android Studio, JDK 17, USB debugging or a running AVD) |
| Development build via EAS | `eas build --profile development --platform android`, install the APK, then `npx expo start --dev-client` |
| Emulator | Android Studio → Device Manager → start an AVD → `npx expo start` → press `a` |

Speech on Android uses the phone's TTS engine (Google "Speech Services" or Samsung TTS).
If silent: Settings → Accessibility → Text-to-speech output → choose an engine → gear →
*Install voice data* → English, then *Listen to an example*. If that example is silent,
TalkEasy will be too. Media volume (not ringtone) must be up.

## 5. Testing on iPhone

| method | command / steps |
|---|---|
| Expo Go | `npx expo start`, scan QR with Camera |
| iOS simulator (Mac only) | Xcode installed → `npx expo start` → press `i` |
| Development build on a real iPhone | `npx expo run:ios --device` (Mac + Apple developer account) or `eas build --profile development --platform ios` |

Apple voices work offline. For a nicer voice: Settings → Accessibility → Spoken Content →
Voices → download an *Enhanced* English voice → choose it in TalkEasy → Parent → Settings.
TalkEasy asks iOS to play through the ring/silent switch; if still silent, raise the volume with the
side buttons *while the app is open* and disconnect Bluetooth audio.

## 6. Test checklist (what to verify on a real device)

Do these on the **built app** (or the development build), not only in Expo Go:

| test | how | expected |
|---|---|---|
| Airplane mode | Turn airplane mode on, open the app | Everything works: speaking, school, learn, assignments |
| Wi-Fi off / mobile data off | Disable both, use every section | No errors, no "no connection" messages anywhere |
| App restart | Add a custom phrase + an assignment, force-close, reopen | Both are still there |
| Device restart | Restart the phone, reopen | Data still there, PIN still the one you set |
| Database persistence | Parent → add subject schedule + tick a routine step; reopen | Schedule shows, tick preserved (until "Start a new day") |
| Text-to-speech | Tap any tile; Parent → Settings → *Test the voice* | Phrase is spoken; *Speech check* shows "Spoken N of N" |
| Large buttons | Parent → Settings → Button size *Extra large*, Text size *Extra large* | Tiles/labels scale on every child screen |
| Assignment creation | Parent → Assignments → Add: Mathematics, "Answer pages 25-26", due Monday | Appears in child Assignments as *📝 … 📅 Due Mon … ⬜ Not finished*, on Calendar, in School Mode when due |
| Assignment completion | Child taps the tick (or parent marks completed) | Card becomes *✅ Completed*; dashboard counts update |
| School schedule | Parent → Subjects → Mathematics → add Mon 10:00–11:00 | Shows under School → Today on Mondays and in School Mode |
| Parent PIN | Tap 👨‍👩‍👧 → wrong PIN → correct PIN (default 1234) → Settings → change PIN | Wrong PIN rejected; new PIN required next time |
| Photo attachment | Parent → Edit assignment → *Take photo* / *Choose photo* | Photo shown in child detail; survives restart |
| Learning | Learn → Mathematics → Counting → answer 6 questions | Stars appear; Parent → Progress shows the session |
| School Mode at start | Parent → Settings → *Open the app in School Mode: Yes*; force-close, reopen | App opens on School Mode |

## 7. Building an installable app

EAS Build needs a free Expo account **for the build step only** — the app never contacts Expo
(`updates.enabled: false`).

```bash
npm install -g eas-cli
```

```bash
eas login
```

```bash
eas build:configure
```

### Android APK (install directly)

```bash
eas build --platform android --profile preview
```

Open the link EAS prints on the phone, allow *Install unknown apps*, install. For Google Play:
`eas build --platform android --profile production` (AAB).

Local build (Android Studio + JDK 17): `npx expo prebuild --platform android` then
`cd android && ./gradlew assembleRelease` → `android/app/build/outputs/apk/release/app-release.apk`.

### iOS

Needs an Apple Developer account. Register the iPhone once with `eas device:create`, then:

```bash
eas build --platform ios --profile preview
```

For TestFlight / App Store: `eas build --platform ios --profile production` then
`eas submit --platform ios`. Local (Mac): `npx expo run:ios --configuration Release --device`.

## 8. Project structure

```
TalkEasy/
├─ App.tsx                    entry: opens DB, prepares audio, waits for settings, shows navigator
├─ app.json                   Expo config: updates off, plugin permissions limited to photos/camera
├─ eas.json                   build profiles (development / preview APK / production)
├─ docs/ARCHITECTURE.md       design document
├─ scripts/check-db.ts        migrations + seed + upgrade test (Node)
├─ scripts/check-learning.ts  learning content validator (Node)
└─ src/
   ├─ types/models.ts         every domain type (buttons, subjects, assignments, events, …)
   ├─ theme/                  tokens (7 accents, Nunito, radius, shadow, motion), ThemeContext, fonts
   ├─ constants/              colors, sizes (touch targets, fonts), icons, defaults (seed + Brayden demo profile), school (labels)
   ├─ database/               db.ts (open/migrate/seed), schema.ts (migrations 1–3), seed.ts,
   │                          reorder.ts, events.ts, repositories/ (one per table — the only SQL)
   ├─ learning/               types, engine (question builders, RNG), content/{english,filipino,math,
   │                          science,ap,esp}.ts, index.ts (registry)
   ├─ services/               speech.ts (TTS + audio session), files.ts (photo/attachment import)
   ├─ context/                SettingsContext, ProfileContext (the child profile + personalize())
   ├─ hooks/                  useDbQuery + one hook per data type, useSizes, useSpeak, useToday, useRewards
   ├─ components/
   │  ├─ common/              BigButton, Icon (glyph or emoji), ChildScreen, ScreenHeader, PinPad,
   │  │                       FormField, ChoiceRow, DateField, TimeField, IconPicker, ColorPicker,
   │  │                       ListRow, EmptyState, SectionTitle, StatTile
   │  ├─ communication/       CommunicationTile, TileGrid, PhraseBanner, CategoryBar
   │  └─ school/              AssignmentCard, SubjectCard, EventRow, MonthGrid
   ├─ navigation/             RootNavigator (child stack + PIN + parent), ParentStack, types
   ├─ screens/child/          ChildHome, Communicate, SchoolMode, School, SubjectDetail, Assignments,
   │                          AssignmentDetail, Calendar, Learn, LearnSubject, LearnActivity, MyDay,
   │                          Activities, Favorites
   ├─ screens/parent/         ParentPin, Dashboard, Manage*/Edit* for buttons, favorites, subjects,
   │                          assignments, events, learning, routine, therapy, notes; Progress; Settings
   └─ utils/                  date helpers, confirm dialogs
```

## 8b. Personalisation (v3)

The app is built around a **child profile** (Parent → *My child*): name and nickname, avatar or
photo, age / grade / school, favourite colour (becomes the app's accent), favourite subjects /
activities / foods / people, communication preferences (Recent strip, sentence builder, full
sentence vs. single word), learning difficulty and goals, and reward settings. The demo profile
is **Brayden** so the personalisation is visible immediately; change it and every greeting, title
and celebration follows.

* **Home**: "Good morning, Brayden! ☀️ · Today is Monday · You're ready for school!", today's plan
  with progress (✓ → ○), the 8 sections, Brayden's favourite phrases, Continue learning,
  Brayden's stars.
* **Talk**: 11 categories (Basic, People, School, Feelings, Food, Drinks, Bathroom, Activities,
  Home, Emergency, My phrases) behind a "More" pill, a Recent strip, the "I want..." sentence
  starter, and optional photos on cards (a real picture of Mom instead of an icon).
* **Feelings**: big faces plus a calming follow-up phrase for hard feelings.
* **Rewards**: stars for routine steps, activities, assignments and learning; parent-defined
  rewards ("10 stars → Choose a game"); Parent → *Stars & rewards* to give a reward or add bonus stars.
* **Accessibility**: Settings → High contrast, Reduce animation, Spoken feedback on/off, plus
  button / text size and "ask before marking done". No state is shown by colour alone.

## 8c. Adaptive Learning & Accessible Schoolwork (v4)

Home → **🎓 Lessons**. The child sees *Hi, Brayden!*, **Today's schoolwork** (Start / Continue /
Done per lesson), Writing practice, Speak your answer, and a learning progress bar.

Every question lets the child choose **how** to answer from the methods the parent/teacher
allowed: 👆 tap a big card · 🖼️ pick a picture · 🔗 tap-to-match · ⌨️ big on-screen keyboard ·
🎤 say it (on-device speech-to-text in the installed app; a grown-up confirms in Expo Go) ·
✍️ write with a finger (never mandatory) · 🙋 tell a grown-up. A wrong answer gets one gentle
retry with the hint; the objective never changes.

**Assistance level** (Parent → My child): 🟢 Guided (2 choices, hint shown) · 🟡 Assisted
(3 choices, hint on request) · 🔵 Independent (all choices, typing/speaking first).

**Writing practice**: 7 levels — lines, shapes, letters, numbers, words, copy words, short
answers — on a large canvas with undo, clear and pen size. Not graded.

**Parent → Lessons**: paste the school lesson, add visual vocabulary and questions, tick the
allowed answer methods. **Parent → Learning progress**: learning % and handwriting % are shown
separately, with strengths and "areas to practise" in supportive language.

Check the engine with `npm run check:adaptive`. Speech-to-text needs a development/EAS build
(`expo-speech-recognition` is a native module); everything else works in Expo Go.

## 9. How to extend

* **New default phrase**: add a row to `DEFAULT_BUTTONS` in `src/constants/defaults.ts` and bump
  `SEED_VERSION`; existing installs get it on next launch, parent deletions are respected.
* **New learning activity**: add it to the subject's file in `src/learning/content/` (a bank + a
  `LearningActivity`), append to that subject's `activities`. Run `npm run check:learning`.
  Grade 3 later = new content files + a new subject entry; nothing else changes.
* **New table**: append a migration to `MIGRATIONS` in `src/database/schema.ts`, add a repository,
  a hook, a screen. Never edit an old migration.
* **Backup/restore (future)**: copy `talkeasy.db` and the `talkeasy/` files folder — nothing else
  holds data.

## 10. Privacy statement

TalkEasy stores everything in the app's private storage. It makes no network requests, embeds no
analytics or crash-reporting SDK, shows no ads, has no account system and does not use location.
The only permissions it can ask for are camera / photo library, and only when the parent taps
*Take photo* / *Choose photo*. Care notes, progress and activity logs are private records for
caregivers; the app never interprets them and gives no medical advice.
