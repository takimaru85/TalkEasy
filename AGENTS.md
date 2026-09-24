# TalkEasy — notes for AI agents / contributors

- Expo SDK 57. Read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before changing native modules.
- Architecture, schema, navigation and accessibility rules: docs/ARCHITECTURE.md. Follow them.
- Hard rules: no network code, no analytics, no accounts, no cloud SDKs. Everything stays on device.
- Child-facing controls: tap only, >= 64pt, sized via `useSizes()`. Parent controls >= 56pt.
- Screens never write SQL: screen -> hook -> repository -> SQLite. Emit `notify(topic)` after writes.
- Schema changes are a NEW entry in `src/database/schema.ts` MIGRATIONS; never edit old ones.
- Verify with `npm run typecheck`, `npm run check:db` and `npm run check:learning`.
- Learning content lives in `src/learning/content`; it is code, not DB data. Emoji are the pictures (offline-safe).
- Child screens use `ChildScreen` (Home button on the left). Parent screens use `ScreenContainer` + `ScreenHeader`.
- Personalisation: never hard-code the child. Read `useProfile()` (name/displayName, avatar, favourites, preferences). Child UI colours come from `useTheme()`; text uses `Fonts` from `@/theme`.
- Rewards: grant stars only through `useAwardStars(kind)`; the amounts live in the profile.
- Adaptive Learning: answer methods are data (`allowed_methods_json`); never make handwriting the only method. Learning progress and handwriting practice are separate numbers - keep them separate. Speech-to-text is optional and on-device (`services/speechRecognition.ts`); never store audio.
- Handwriting letterforms: tracing surfaces use `Fonts.school` / `Fonts.schoolBlack` (TalkEasySchool = Nunito with a single-storey lowercase "a", the school-print form). Regenerate with the script noted in assets/fonts/README.md; keep the family name off "Nunito" (OFL reserved name).
