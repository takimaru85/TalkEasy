# TalkEasy

A private, offline AAC (Augmentative and Alternative Communication) app for a child with
cerebral palsy. One React Native + Expo + TypeScript codebase for Android and iPhone.

* **Works with Wi-Fi off, mobile data off and airplane mode on.** There is no server, no
  account, no login, no analytics, no crash reporting and no network code in the app.
* **All data stays on the device** in a local SQLite database (`talkeasy.db`).
* **Text-to-speech** uses the phone's built-in voice engine, which works offline.
* **Designed for motor difficulties**: huge tap targets, large text, high contrast, tap-only
  (no swipes, long-presses or drag-and-drop for the child), fixed button positions.
* **Parent Mode** (behind a PIN, default `1234`) manages buttons, favorites, routine,
  activities, care notes, speech and sizes. The child only ever sees the communication tabs.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the architecture, database schema,
navigation, component plan, accessibility strategy and offline strategy.

---

## 1. Requirements

| tool | version |
|------|---------|
| Node.js | 20 or newer (tested on 24) |
| npm | 10+ |
| Expo Go app (for quick testing) | latest, from Play Store / App Store |
| Android Studio (optional) | for an emulator / native build |
| Xcode on a Mac (optional) | for the iOS simulator / native build |

## 2. Installation

```bash
cd TalkEasy
```

```bash
npm install
```

That is all. The native modules (`expo-sqlite`, `expo-speech`, `expo-haptics`, navigation)
are already listed in `package.json` at versions matching Expo SDK 57.

Useful checks (no device needed):

```bash
npm run typecheck
```

```bash
npm run check:db
```

`check:db` runs the real migrations, seed data and reorder logic against an in-memory SQLite
database and prints the tiles the child will see.

## 3. Running the app

Start the development server:

```bash
npx expo start
```

A QR code appears in the terminal. Then:

* **Android phone** – install **Expo Go** from the Play Store, open it, tap *Scan QR code*.
* **iPhone** – install **Expo Go** from the App Store, open the **Camera** app and point it at
  the QR code, tap the banner.
* **Android emulator** – with Android Studio installed and an emulator running, press `a` in
  the terminal.
* **iOS simulator** (Mac only) – with Xcode installed, press `i` in the terminal.

The phone and computer must be on the same Wi-Fi for Expo Go **during development only** —
the QR code is how the dev server sends the JavaScript bundle to the phone. Once the app is
built and installed (section 6), it needs no network at all.

If the QR code does not connect (corporate Wi-Fi etc.), use a USB cable and:

```bash
npx expo start --tunnel
```

## 4. Testing on Android

### Quick test with Expo Go

1. `npx expo start`
2. Scan the QR code in Expo Go.
3. Turn on **airplane mode** on the phone *after* the app has loaded, then use every tab —
   everything keeps working because nothing goes over the network.

> Note: Expo Go itself needs the dev server once to load the code. The offline guarantee applies
> to the built app (section 6), which contains the code.

### Speech on Android

Text-to-speech uses the phone's Google/Samsung TTS engine. Most phones ship with an offline
English voice. If the voice is silent:

1. Settings → Accessibility → Text-to-speech output.
2. Pick an engine, tap the gear, *Install voice data*, download the language for offline use.
3. In TalkEasy → Parent Mode → Settings → *Test the voice*.

### Full native build on your own machine (optional)

Requires Android Studio with an SDK and either an emulator or a USB-debugging phone:

```bash
npx expo run:android
```

## 5. Testing on iPhone

### Quick test with Expo Go

1. `npx expo start`
2. Scan the QR code with the Camera app; it opens in Expo Go.
3. Enable airplane mode after loading and confirm every feature still works.

### Speech on iPhone

Apple's built-in voices work offline. For a nicer voice: Settings → Accessibility →
Spoken Content → Voices → download an *Enhanced* English voice, then choose it in
TalkEasy → Parent Mode → Settings → *Choose a voice*.

### Full native build (Mac only)

```bash
npx expo run:ios
```

## 5b. No sound? Checklist

Open **Parent Mode → Settings → Speech** and tap *Test the voice*. The **Speech check** box
shows how many phrases were requested vs. actually finished, and a checklist for your platform.

* **iPhone**: raise the volume with the side buttons *while the app is open*; TalkEasy asks iOS to
  play through the ring/silent switch, but check that Bluetooth audio is not capturing the sound.
* **Android**: the *Media* volume (not ringtone) must be up, and a text-to-speech engine with
  English voice data must be installed (Settings → Accessibility → Text-to-speech output →
  *Listen to an example*). If that example is silent, TalkEasy will be too.
* **Expo Go**: works, but after adding the `expo-audio` plugin restart the dev server with
  `npx expo start -c`.

## 6. Building an installable app

Builds are done with **EAS Build** (Expo's build service) or locally. EAS needs a free Expo
account **for the build step only** — the app itself never contacts Expo: `updates.enabled`
is `false` in `app.json`, so it never checks for updates.

One-time setup:

```bash
npm install -g eas-cli
```

```bash
eas login
```

```bash
eas build:configure
```

### Android build (APK you can install directly)

```bash
eas build --platform android --profile preview
```

When it finishes, EAS prints a download link for an `.apk`. Copy it to the phone (or open the
link on the phone), allow *Install unknown apps* for your browser/file manager, and install.

For Google Play (AAB):

```bash
eas build --platform android --profile production
```

Local build without EAS (needs Android Studio + JDK 17):

```bash
npx expo prebuild --platform android
```

```bash
cd android && ./gradlew assembleRelease
```

The APK is at `android/app/build/outputs/apk/release/app-release.apk`.

### iOS build

iOS requires an Apple Developer account ($99/yr) to install on a real iPhone.

For your own iPhone (ad-hoc / internal distribution):

```bash
eas device:create
```

(registers your iPhone's UDID — follow the link on the phone), then:

```bash
eas build --platform ios --profile preview
```

Install from the link EAS prints. For TestFlight / App Store:

```bash
eas build --platform ios --profile production
```

```bash
eas submit --platform ios
```

Local build (Mac with Xcode):

```bash
npx expo run:ios --configuration Release --device
```

## 7. Project structure

```
TalkEasy/
├─ App.tsx                 Entry point: opens the database, then shows the navigator.
├─ app.json                Expo config. Offline: updates disabled, no permissions requested.
├─ eas.json                Build profiles (preview = APK / ad-hoc; production = store).
├─ assets/                 App icon, splash and adaptive icon images (bundled).
├─ docs/ARCHITECTURE.md    Design document.
├─ scripts/check-db.ts     Data-layer sanity check runnable in Node.
└─ src/
   ├─ types/               models.ts — the TypeScript shapes for every table + settings.
   ├─ constants/           colors.ts (palette), sizes.ts (touch targets, font presets),
   │                       icons.ts (icon catalogue for the picker), defaults.ts (seed data).
   ├─ database/            SQLite layer.
   │   ├─ db.ts            Opens talkeasy.db, runs migrations, seeds on first launch.
   │   ├─ schema.ts        Versioned CREATE TABLE migrations.
   │   ├─ seed.ts          Default categories, buttons, favorites, routine, exercises, settings.
   │   ├─ reorder.ts       Shared Up/Down reorder helper.
   │   ├─ events.ts        Tiny pub/sub so screens refresh after writes.
   │   └─ repositories/    One file per table; the only place SQL is written.
   ├─ services/speech.ts   Wrapper over expo-speech with graceful failure handling.
   ├─ context/             SettingsContext — settings loaded once, available everywhere.
   ├─ hooks/               useDbQuery + one hook per data type; useSizes; useSpeak.
   ├─ components/
   │   ├─ common/          BigButton, ScreenHeader, PinPad, IconPicker, ColorPicker, ListRow…
   │   └─ communication/   CommunicationTile, TileGrid, PhraseBanner, CategoryBar.
   ├─ navigation/          RootNavigator (child tabs + PIN + parent stack), typed routes.
   ├─ screens/
   │   ├─ child/           Home (Talk), Feelings, Favorites, Routine, Activities.
   │   └─ parent/          PIN, menu, manage buttons/favorites/routine/exercises/notes, settings.
   └─ utils/               date formatting, confirm dialogs.
```

### How data flows

```
Screen  ->  hook (useVisibleButtons)  ->  repository (buttonsRepo)  ->  SQLite
   ^                                              |
   └────── events.notify('buttons') triggers a refetch ──┘
```

Screens never contain SQL. To add a feature: add a table (new migration in `schema.ts`),
a repository, a hook, then a screen.

## 8. Adding new communication buttons

### As a parent, in the app (recommended)

1. Tap the **Parent** lock button (top right) → enter PIN (default **1234**).
2. **Communication buttons → Add a new button**.
3. Type the name shown on the tile and the sentence to speak, choose a category, color and
   icon, optionally add it to Favorites, then **Save**.
4. Use the ▲ ▼ arrows to change the order the child sees; the eye icon hides a default tile
   without deleting it.

### As a developer, as a default for new installs

Edit `src/constants/defaults.ts` and append to `DEFAULT_BUTTONS`:

```ts
{ category: 'needs', label: 'Blanket', phrase: 'I want my blanket, please.', icon: 'bed', color: c('purple') },
```

* `category` is one of the keys in `DEFAULT_CATEGORIES` (`needs`, `people`, `choices`,
  `body`, `feelings`, `custom`).
* `icon` is any MaterialCommunityIcons name (browse at https://icons.expo.fyi, family
  *MaterialCommunityIcons*). Add it to `src/constants/icons.ts` too so it appears in the picker.
* `color` uses a key from `TileColors` in `src/constants/colors.ts`.

Seeding only runs on a fresh install. To re-seed a development phone, uninstall and reinstall
the app (or bump `SEED_FLAG` in `seed.ts`).

To add a **new category**, append to `DEFAULT_CATEGORIES`; set `showOnHome: false` if it should
have its own tab like Feelings (then add a screen + tab for it in `navigation/ChildTabs.tsx`).

## 9. Changing the schema later

Add a new object to `MIGRATIONS` in `src/database/schema.ts` with the next `version` number
and the `ALTER TABLE` / `CREATE TABLE` SQL. Existing installs apply it on next launch; never
edit an existing migration.

## 10. Privacy statement

TalkEasy stores everything in the app's private storage on the device. It requests no
permissions, makes no network requests, embeds no analytics or crash-reporting SDK, and has no
account system. Uninstalling the app deletes all of its data. Care notes are a private record
for caregivers and the app never interprets them; the app makes no medical judgements.
