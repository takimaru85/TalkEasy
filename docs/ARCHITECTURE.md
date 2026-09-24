# TalkEasy — Architecture (v2 core, v3 personalisation below)

TalkEasy is a **private, offline-first companion app** for a Grade 2 child with cerebral palsy.
It combines AAC communication, school organisation, assignments, Grade 2 learning practice,
a visual daily routine, therapy/activity tracking and caregiver notes — in one Expo (SDK 57)
+ React Native + TypeScript codebase for Android and iPhone.

No server, no account, no analytics, no ads, no network code. Everything lives in one SQLite
file in the app's private storage.

---

## 1. Architecture

```
┌────────────────────────────────────────────────────────────────┐
│ UI            screens/child/*   screens/parent/*   components/ │
│               (child mode is tap-only, huge targets)           │
├────────────────────────────────────────────────────────────────┤
│ State         context/SettingsContext (sizes, speech, PIN,     │
│               school mode, learning difficulty)                │
│               hooks/* — one hook per data type, auto-refresh   │
├────────────────────────────────────────────────────────────────┤
│ Domain        learning/ — Grade 2 content + question generators│
│               services/speech.ts — TTS with graceful fallback  │
│               services/files.ts — copy photos/attachments into │
│                                   the app sandbox              │
├────────────────────────────────────────────────────────────────┤
│ Data          database/db.ts (open, migrate, seed)             │
│               database/schema.ts (versioned migrations)        │
│               database/repositories/* (the only SQL)           │
├────────────────────────────────────────────────────────────────┤
│ Storage       expo-sqlite -> talkeasy.db   expo-file-system    │
└────────────────────────────────────────────────────────────────┘
```

Rules:

* **Screen -> hook -> repository -> SQLite.** Screens never contain SQL.
* Repositories map `snake_case` rows to the `camelCase` models in `types/models.ts` and call
  `notify(topic)` after writes; `useDbQuery` re-runs any hook subscribed to that topic.
* **Learning content is code, not data.** `src/learning/content/*.ts` holds the Grade 2 banks
  and `src/learning/engine.ts` turns them into questions. The DB only stores per-activity
  parent settings (`learning_activities`) and results (`learning_progress`). Adding Grade 3 later
  = adding content files.
* Child and parent screens share components but never share navigation: the parent stack is
  reachable only through the PIN.

## 2. Folder structure

```
src/
├─ components/
│  ├─ common/          BigButton, Icon (vector or emoji), ScreenHeader, PinPad, FormField,
│  │                   ChoiceRow, DateField, TimeField, IconPicker, ColorPicker, ListRow,
│  │                   EmptyState, StatTile, SectionTitle
│  ├─ communication/   CommunicationTile, TileGrid, PhraseBanner, CategoryBar
│  ├─ school/          AssignmentCard, SubjectCard, EventRow, MonthGrid
│  └─ learning/        QuestionCard, AnswerButton, ResultBanner
├─ constants/          colors, sizes, icons, defaults (seed data), school (days, statuses…)
├─ context/            SettingsContext
├─ database/           db, schema, seed, events, reorder, repositories/*
├─ hooks/              useDbQuery + hooks per data type, useSizes, useSpeak, useToday
├─ i18n/               types, registry, I18nContext, locales/{en,englishVariants}
├─ soundpractice/      types, content (sounds, syllables, words, phrases)
├─ learning/           types, engine, content/{english,filipino,math,science,ap,esp}
├─ navigation/         RootNavigator (child stack), ParentStack, types
├─ screens/
│  ├─ child/           ChildHome, Communicate, SchoolMode, School, SubjectDetail, Assignments,
│  │                   AssignmentDetail, Calendar, Learn, LearnSubject, LearnActivity,
│  │                   MyDay, Activities, Favorites
│  └─ parent/          ParentPin, Dashboard, ManageButtons/EditButton, ManageFavorites,
│                      ManageSubjects/EditSubject, ManageAssignments/EditAssignment,
│                      ManageEvents/EditEvent, ManageLearning, ManageRoutine,
│                      ManageTherapy/EditTherapy, CareNotes/EditNote, Progress, Settings
├─ services/           speech.ts, speechRecognition.ts, files.ts
├─ types/              models.ts
└─ utils/              date.ts, confirm.ts
```

## 2b. Localization (`src/i18n`)

TalkEasy is English-only. US English (`en-US`) is the default and the source of truth for the
string keys; English (UK), English (Australia) and English (New Zealand) are defined in
`locales/englishVariants.ts` as US English plus Commonwealth spelling ("Favourites", "practise"),
"Mum" for the seeded "Mom" cards, and their own `speechTag`, so the voice has the right accent.
(Filipino was removed; a saved `fil-PH` falls back to US English.) A locale is one object: `{ code, name, flag, speechTag, letterStyle,
strings, content }`.

* `strings` — child-facing UI text, typed by the `Strings` interface, so TypeScript flags any
  key a new language forgets. Reached with `t('key', { name })` from `useI18n()`.
* `content` — a map from the **English text seeded into SQLite** to this language. The database
  itself is never translated or rewritten: `tContent(text)` translates at render time, so
  switching language is lossless, and a parent's own tiles and notes pass through unchanged.
* `speechTag` — the BCP-47 tag given to text-to-speech and on-device speech recognition.
* `letterStyle` — `'standard'` (Nunito's ordinary double-storey "a") or `'single-storey'` (the
  school-print "a"). Every current locale is `'standard'`; the single-storey glyph is kept for a
  future locale. It is the **only** glyph that differs between styles. See `assets/fonts/README.md`.

The chosen language is one row in `app_settings` (`language`), so it needed no migration, and an
unrecognised value falls back to US English. `registry.ts` holds the plain-data registry that
non-React modules (the settings repository, the speech service) import, keeping the provider out
of that import chain.

Adding Spanish / Japanese / Korean: add the code to `LocaleCode`, copy `locales/en.ts`,
translate it, add it to `LOCALES`. The Settings → Language selector is built from `LOCALES`, so
it picks the new language up on its own. Verify with `npm run check:i18n`.

Parent Mode is deliberately still English — it is the grown-up's screen, and translating it is a
separate pass.

## 2c. Sound Practice (`src/soundpractice`)

Listen → Try → Repeat, for one speech sound at a time. It is a practice aid and is deliberately
**not** an assessment: nothing is scored, nothing is transcribed, and no result is ever presented
as clinical. Feedback is encouragement only.

* **Content** is code, like `src/learning/content`: `SOUND_EXERCISES` carries each sound with its
  syllables, words and phrases, so levels 2–4 need data only, not a redesign. The first version
  practises the `'sound'` level.
* **Model audio** goes through `services/soundPracticeAudio.ts`, which wraps the existing speech
  service rather than starting a second audio system. Text-to-speech says the letter *name*
  ("bee") rather than the sound, so an isolated sound is spoken from a phonetic `cue` ("buh")
  anchored by an example word. Dropping a clip into that module's `MODEL_AUDIO` map makes the
  sound play a real recording instead, with no screen changes — which is the right long-term
  answer for phonemes and needs a speech-language pathologist, not a developer.
* **Recording** lives in `hooks/useSoundRecorder.ts`. The child's voice is written to the OS
  cache, played back, and deleted — on the next attempt, on leaving the screen and on unmount.
  It is never copied into app storage, never transcribed, never written to SQLite and never
  leaves the device. Missing microphone, refused permission and recording errors all degrade to
  a working screen: listening and practising aloud is most of the exercise.
* **Tracking** is `sound_practice_attempts` (migration 5): counts and minutes, never a score.
  The table has no audio column and no correctness column, and `check:db` asserts both.

## 2d. Speech Practice (`src/speechpractice`)

Twenty practice activities (Listen → Look → Try → Repeat → Encourage → Continue), grouped
Beginner / Intermediate / Advanced as a guide for grown-ups — nothing is locked. Same rules as
Sound Practice: a practice aid, never an assessment, no scores, no transcription, encouragement
only. Wrong taps are never marked wrong: the prompt replays and, after two tries, the right card
gets a 💡. Nothing is timed.

* **Content is code**: `vocabulary.ts` (one picture bank, 13 categories, shared by every
  word-based activity) and `content.ts` (phrases, sentence frames, WH questions, stories, social,
  role play, rhymes, clap words, voice, imitation, turn games). Sounds reuse `src/soundpractice`.
* **One framework, not twenty screens**: `engine.ts` turns an activity (+ the group the child
  picked + My Words) into exercises of six kinds — `say`, `choose`, `build`, `story`, `turns`,
  `clap` — and `SpeechActivityScreen` runs any of them through `components/speech/*`. The screen
  owns audio, the microphone (`useSoundRecorder`, shared with Sound Practice) and tracking, and
  hands them to views through a `PracticeKit`. "Sounds" opens the existing Sound Practice screens.
  Two-step directions are supported (`ordered` answers, `twoStepDirection`) but not yet in rounds.
* **Audio**: `soundPracticeAudio.playItem` / `playSequence` — a recorded clip (`SpeechItem.audio`)
  if present, else a sound cue, else TTS, always with an explicit locale.
* **Pronunciation** (`pronunciation.ts`, `pronunciationDictionary.ts`): the intended pronunciation of
  every syllable is data — 10 consonants × 5 vowels, IPA + guide, in one pronunciation set
  (English; `app_settings.speechPronunciationSet`), read in the app's English accent. A voice engine is never
  given the raw syllable: the dictionary maps each one to a pronunciation-safe spoken form and locale
  ("BO" → "beau", en-US; real English words where one has exactly the target sound), with tested
  alternatives. Parent Mode → Pronunciation test plays every entry on the device and lets a grown-up
  pick an alternative per device (`speechPronunciationOverrides`). A syllable without an entry is
  not spoken. Model recordings (bundled `modelAudio.ts`, or `services/modelRecordings.ts`) still take
  priority when present, keyed `syllable:ba`, `word:v-ball`, `phrase:ph-water`, `sound:b`. Words and
  phrases are spoken as written unless `SPOKEN_OVERRIDES` lists them.
* **My Words** are Talk cards with `communication_buttons.practice = 1` (migration 6): a parent's
  "Grandma" + photo is stored once and appears in Talk and in Words, Vocabulary, Picture Naming,
  Phrases and Sentence Building. Practice → Talk: Parent Mode can add a vocabulary word to the
  board, and a practice screen shows "Say it" (spoken and logged exactly like a Talk tap) when the
  board already has the word.
* **Tracking** is `speech_practice_events` (migration 6): `attempt` / `exercise` / `complete` /
  `session` rows with an item label and a duration — no audio, no correctness. Summaries add Sound
  Practice's table in. Parent Mode → Speech Practice shows Today's practice, a 7-day Practice
  History, which activities are shown (`app_settings.speechPracticeHidden`), My Words, and the
  "not a substitute for a licensed speech-language pathologist" notice.
* Verified by `npm run check:speech` (every activity and group builds valid exercises; no clinical
  or grading words in child-facing text).

## 3. Navigation

Child mode is a **single native stack** with a Home grid instead of a tab bar — eight sections
do not fit in a tab bar at child-safe sizes, and a grid of 2-column tiles is what a child
expects from an educational app. Every child screen has the same header: big **Home** button
on the left, title in the middle, nothing else.

```
RootStack
├─ ChildHome              🗣️ Communicate  🎒 School  📝 Assignments  📚 Learn
│                         📅 My Day  🧩 Activities  ⭐ Favorites  👨‍👩‍👧 Parent
│                         + wide 🏫 School Mode button at the top
├─ Communicate            phrase banner + category bar + tile grid
├─ SchoolMode             simplified: 8 quick phrases, today's subjects, today's assignments
├─ School -> SubjectDetail
├─ Assignments -> AssignmentDetail
├─ Calendar
├─ Learn -> LearnSubject -> LearnActivity (question loop)
├─ MyDay
├─ Activities
├─ Favorites
├─ SpeechPractice -> SpeechActivity (group picker -> exercises)   Sounds -> SoundPractice
├─ ParentPin (modal)
└─ Parent (ParentStack)
   ├─ Dashboard (today summary, assignment counts, today's schedule, quick links)
   ├─ ManageButtons -> EditButton        ManageFavorites
   ├─ ManageSubjects -> EditSubject      ManageAssignments -> EditAssignment
   ├─ ManageEvents -> EditEvent          ManageLearning
   ├─ ManageRoutine                      ManageTherapy -> EditTherapy
   ├─ CareNotes -> EditNote              Progress
   ├─ SpeechPracticeSettings (history, activities, My Words, Practice → Talk)
   └─ Settings
```

"Start in School Mode" (Settings) makes SchoolMode the initial route on launch.

## 4. Database schema (`talkeasy.db`)

Migration 1 (v1) created: `categories`, `communication_buttons`, `favorites`, `routines`,
`routine_items`, `exercises`, `caregiver_notes`, `app_settings`.

Migration 2 (v2) adds / changes:

| table | purpose |
|---|---|
| `routine_items.start_time` | optional `HH:MM` so My Day and the dashboard can show times |
| `therapy_activities` (renamed from `exercises`) + `frequency`, `image_uri` | activity cards |
| `activity_logs` | one row per completion (`therapy_activity_id`, `completed_at`, `note`) |
| `subjects` | name, icon, color, teacher, notes, sort order, active |
| `subject_schedule` | `subject_id`, `day_of_week` (0=Sun…6=Sat), `start_time`, `end_time` |
| `subject_materials` | things to bring per subject (notebook, crayons…) |
| `assignments` | subject, title, description, `kind` (assignment / project / exam), dates, `priority`, `status` (todo / in_progress / done), notes, `photo_uri`, `attachment_uri`, completed_at |
| `school_events` | title, `event_type` (event / holiday / meeting / reminder / exam / project), optional subject, date, optional time, notes |
| `learning_activities` | per-activity parent config: `activity_key`, `is_enabled`, `difficulty` |
| `learning_progress` | one row per practice session: `activity_key`, `subject_key`, `difficulty`, `correct`, `total`, `played_at` |
| `categories` | `choices` + `body` merged into `needs` (renamed "Basic"); new `school` category |
| `app_settings` | new keys: `schoolModeAtStart`, `learningDifficulty`, `confirmComplete` |

Projects and exams are assignments with a `kind`, so one manager, one calendar source and one
child view cover all three. The calendar is a union of `assignments` (by due date) and
`school_events`.

`seed.ts` keeps a `seed_version`; when it is behind, any missing default categories/buttons
are inserted (parent deletions are not resurrected because the check runs once per version).

## 5. Offline architecture

* No `fetch`, no remote assets. Icons are bundled vector glyphs; learning pictures are emoji
  (rendered by the OS's built-in colour emoji font — works offline on both platforms).
* Photos/attachments chosen by the parent are **copied** into `documentDirectory/talkeasy/`
  so they survive gallery clean-ups; only the local URI is stored.
* TTS uses the device engine; the audio session is configured so iOS speaks through the
  silent switch. Every speech call is guarded; the phrase is always shown as text.
* `updates.enabled: false`; no OTA checks. No analytics/crash SDKs.
* Data survives app restarts, device restarts and OS updates; only uninstalling removes it.

## 6. Accessibility strategy

* Child-facing targets >= 64pt; tiles 120–190pt (parent-adjustable). Parent controls >= 56pt.
* Text 20–42pt in child mode, bold, high contrast, OS font scaling capped at 1.3x.
* **Tap only.** No swipes, long-presses, drags or pinches anywhere in child mode. Lists that
  overflow scroll vertically only. Category bars wrap instead of scrolling sideways.
* Fixed positions: the Home grid, category chips and quick phrases never reorder themselves.
* Tremor guard: a tile ignores a second tap within 500 ms; `hitSlop` widens every target.
* Feedback: highlighted border + scale on tap, TTS, haptic. Learning answers show ✓/✗ with
  colour and speech, then advance automatically — no "next" button needed.
* Optional confirmation (Settings → "Ask before marking done") for completing assignments and
  routine steps, for children who tap accidentally.
* Every control has `accessibilityRole` / `Label` / `State` for screen readers.
* Parent mode is separate, behind a PIN, entered only via the 👨‍👩‍👧 tile.

## 7. State management strategy

No Redux/MobX: the app is CRUD over a local DB, so the DB is the source of truth.

* `SettingsContext` — one in-memory copy of `app_settings`, loaded at start, updated
  optimistically on write. Exposes `settings`, `updateSetting`, and `useSizes()` derives every
  pixel/font value from it.
* `useDbQuery(query, initial, topics)` — runs a repository query, caches the result in
  component state, and re-runs when a repository `notify`s one of the topics. Each data hook
  (`useAssignments`, `useSubjects`, …) is a one-liner over it.
* Screen-local UI state (selected category, current question, form fields) stays in `useState`.
* The learning session (question index, score) is local to `LearnActivity`; only the final
  result is persisted.
* Future backup/restore = copying `talkeasy.db` + the `talkeasy/` files folder, which is why
  nothing important lives outside them.

---

# v3 additions — personalisation & design system

## Child profile (`child_profile`, migration 3)

One active row (the table supports more, so a second child can be added later without a schema
change). `ProfileContext` loads it once; nothing in the UI hard-codes a name. Fields:

| field | used by |
|---|---|
| `name`, `nickname` | greeting ("Good morning, Brayden!"), praise, section titles ("Brayden's favorites") |
| `age`, `grade`, `school` | parent reference |
| `avatar` (emoji) / `photo_uri` | Home greeting card, profile |
| `favorite_color` | the app accent (`ThemeProvider` → `ACCENTS[key]`) |
| `favorites_json` `{subjects, activities, foods, people}` | Learn ordering, "Continue learning" suggestion |
| `communication_json` `{showRecent, sentenceBuilder, speakFullPhrase}` | Talk screen behaviour |
| `rewards_json` `{starsPer…, celebrationMessage}` | `useAwardStars()`; `{name}` is substituted |
| `learning_goals`, `difficulty` | Learn (difficulty replaces the old global setting) |

## Rewards (`rewards`, `star_events`)

`star_events` is a ledger (+earned / −spent). Stars are granted by `useAwardStars(kind)` from the
profile's per-event amounts: learning session, perfect session bonus, routine step, activity,
assignment. Parents define rewards (title, icon, stars) and "give" one, which writes a negative
event. `rewardsRepo.getSummary()` returns total, earned-today and the next reachable reward.

## Design system (`src/theme`)

* `tokens.ts` — `ACCENTS` (7 favourite-colour palettes: strong / dark / soft / page tint),
  `Fonts` (Nunito 500–900, bundled per weight), `Radius`, `Shadow`, `Motion`.
* `ThemeContext.tsx` — `useTheme()` derives colours from the accent + **high contrast** (black
  borders, white surfaces, no tints) + **reduced motion** (`duration()` returns 0; page
  transitions off; `Celebration` renders nothing).
* Components: `Card`, `PressableScale` (the single tap-animation), `Avatar`, `ProgressBar`,
  `Celebration`, restyled `BigButton` / `ScreenHeader` / `CommunicationTile` / `PhraseBanner` /
  `CategoryBar`. Every state is shown with an icon or text as well as colour.
* Communication tiles can carry a photo (`communication_buttons.image_uri`).
* Sentence builder: a phrase ending in `...` is a starter; the next tile completes it
  ("I want..." + "Water" → "I want water.").

## Routine segments & activity categories

`routine_items.segment` (morning / school / afternoon / evening) groups My Day and lets the parent
maintain morning, school, after-school and bedtime routines in one list. `therapy_activities.category`
(games, art, music, exercise, reading, outdoor, sensory, chores, therapy) groups Activities.

---

# v4 — Adaptive Learning & Accessible Schoolwork

Goal: the child demonstrates what they know through whichever answer METHOD works for their
body; the learning objective never changes.

## Data (migration 4)

| table | purpose |
|---|---|
| `lessons` | the objective: subject, title, grade, explanation (`content`), visual vocabulary, objectives, optional `assigned_date` (Today's schoolwork) |
| `lesson_activities` | questions: `type` (mcq / picture / matching / typing / speaking / writing), choices, pairs, accepted answers, hint, **allowed answer methods** |
| `adaptive_attempts` | one row per answer: child, activity, `answer_method` (tap / picture / match / type / speak / write / assisted), correct, attempts, text |
| `handwriting_sessions` | motor practice log (level 1–7, item, strokes, duration) — **kept separate** from learning progress |
| `child_profile.assistance_level` / `preferred_method` | guided / assisted / independent; the method offered first |

`adaptiveProgressRepo.getProgress()` returns learning % (correct activities / attempted) and
handwriting % (levels tried / 7) as two independent numbers.

## Code

* `src/adaptive/types.ts` — method/type/assistance metadata; `answers.ts` — normalisation
  ("ten" = 10, Filipino number words), containment matching, choice trimming per assistance
  level, method ordering; `handwriting.ts` — 7 tracing levels; `demoLessons.ts` — seed content.
* `src/services/speechRecognition.ts` — optional on-device STT (`expo-speech-recognition`,
  `requiresOnDeviceRecognition`); absent in Expo Go → parent-assisted oral answer instead.
  No audio is ever stored.
* `src/components/adaptive/` — `ChoiceCard` (big cards, state shown by icon + border, never
  colour only), `AnswerMethodPicker`, `BigKeyboard` (alphabetical, huge keys, scales in
  landscape), `SpeechAnswer` (🎤 → transcript → ✓ Use / 🔄 Try again + grown-up ✓), `TapMatch`
  (tap-to-match, no dragging), `HandwritingCanvas` (SVG + PanResponder, undo/clear/pen size).
* Child screens `screens/child/adaptive/`: `AdaptiveHome` (dashboard + today's schoolwork),
  `AdaptiveSubjects`, `AdaptiveLesson` (runner), `WritingPractice` → `WritingCanvas`, `SpeakPractice`.
* Parent screens: `ManageLessons` → `EditLesson` (lesson text, vocabulary, questions, allowed
  methods), `AdaptiveProgress` (learning vs handwriting, strengths / areas to practise in
  supportive language), assistance level + preferred method in *My child*.

## Phase 2 hooks already in place
Drag-and-drop (a `match` method exists; `TapMatch` is the fallback), offline lesson→activity
generator (pre-fills `EditLesson`), teacher mode (lessons are child-independent rows; a
`teacher` role only needs a second PIN), per-child accessibility (profile table is ready).
