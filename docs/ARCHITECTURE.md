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
├─ services/           speech.ts, files.ts
├─ types/              models.ts
└─ utils/              date.ts, confirm.ts
```

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
├─ ParentPin (modal)
└─ Parent (ParentStack)
   ├─ Dashboard (today summary, assignment counts, today's schedule, quick links)
   ├─ ManageButtons -> EditButton        ManageFavorites
   ├─ ManageSubjects -> EditSubject      ManageAssignments -> EditAssignment
   ├─ ManageEvents -> EditEvent          ManageLearning
   ├─ ManageRoutine                      ManageTherapy -> EditTherapy
   ├─ CareNotes -> EditNote              Progress
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
