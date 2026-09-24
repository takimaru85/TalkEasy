# TalkEasy — notes for AI agents / contributors

- Expo SDK 57. Read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before changing native modules.
- Architecture, schema, navigation and accessibility rules: docs/ARCHITECTURE.md. Follow them.
- Hard rules: no network code, no analytics, no accounts, no cloud SDKs. Everything stays on device.
- Child-facing controls: tap only, >= 64pt, sized via `useSizes()`. Parent controls >= 56pt.
- Screens never write SQL: screen -> hook -> repository -> SQLite. Emit `notify(topic)` after writes.
- Schema changes are a NEW entry in `src/database/schema.ts` MIGRATIONS; never edit old ones.
- Verify with `npm run typecheck`, `npm run check:db`, `npm run check:learning`, `npm run check:adaptive` and `npm run check:i18n`.
- Learning content lives in `src/learning/content`; it is code, not DB data. Emoji are the pictures (offline-safe).
- Child screens use `ChildScreen` (Home button on the left). Parent screens use `ScreenContainer` + `ScreenHeader`.
- Personalisation: never hard-code the child. Read `useProfile()` (name/displayName, avatar, favourites, preferences). Child UI colours come from `useTheme()`; text uses `Fonts` from `@/theme`.
- Rewards: grant stars only through `useAwardStars(kind)`; the amounts live in the profile.
- Adaptive Learning: answer methods are data (`allowed_methods_json`); never make handwriting the only method. Learning progress and handwriting practice are separate numbers - keep them separate. Speech-to-text is optional and on-device (`services/speechRecognition.ts`); never store audio.
- Sound Practice (`src/soundpractice`, `screens/child/sound`): a PRACTICE aid, never an assessment. Never score an attempt, never transcribe it, never say a pronunciation is wrong - feedback is always encouraging. The child's recording is a temporary cache file that `useSoundRecorder` deletes after playback; it is never persisted and never referenced in the database (`sound_practice_attempts` deliberately has no audio and no correctness column). Model audio goes through `services/soundPracticeAudio.ts` only - add a clip to its `MODEL_AUDIO` map rather than calling TTS from a screen, because an engine says the letter NAME ("bee") and not the sound.
- Localization: US English (`en-US`) is the default and defines the string keys. Screens use `useI18n()`: `t('key')` for UI text, `tContent(text)` for text that came out of the database. Never hard-code child-facing English in a component. The DB stays English and is translated at render time, so switching language never rewrites a child's data. Adding a language = one file in `src/i18n/locales` + one line in `registry.ts`; verify with `npm run check:i18n`.
- Handwriting letterforms are a LANGUAGE setting, not a global one. `locale.letterStyle` picks them: 'standard' (Nunito's ordinary double-storey "a" — US English and the default) or 'single-storey' (the Filipino school-print "a", from `SINGLE_STOREY_A`). Only "a" ever differs; never change another glyph. The tracing guide draws outlines from `src/adaptive/schoolGlyphs.ts` via `layoutSchoolText(..., letterStyle)`; the model letter above the canvas is RN text and picks `Fonts.schoolBlack` vs `Fonts.black`. Regenerate outlines with the script noted in assets/fonts/README.md; keep the family name off "Nunito" (OFL reserved name).
