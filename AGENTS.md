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
