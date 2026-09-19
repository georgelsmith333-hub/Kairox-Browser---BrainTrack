# Kairox Browser

Kairox Browser gives people a privacy-first browsing workspace with local profiles, tab restore, bookmarks, history, native Android WebView controls, and a live web preview.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/kairox-browser` — Expo Router app, browser surface, profiles, tabs, lab, privacy settings, and local persistence
- `artifacts/kairox-design-system` — shared Kairox tokens, native theme, fonts, and UI primitives
- `artifacts/api-server` — shared Express API service
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `docs/android-build.md` — GitHub Actions APK build and release instructions

## Architecture decisions

- Android uses `react-native-webview` for the real embedded page engine.
- Web preview uses a live iframe and an explicit external-browser fallback because it cannot provide Android WebView capabilities.
- Browser state is local and profile-scoped through AsyncStorage; no sign-in is required for the core experience.
- Native-only tooling is labeled as bounded instead of fabricating inspector, storage, network interception, or proxy output.

## Product

Kairox supports local browsing profiles, tab sessions, bookmarks, history, privacy controls, user-agent presets, page scripts, a route check, and a developer lab. The Android build exposes the native page surface; the web preview provides a real framed page plus handoff when a site blocks embedding.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/kairox-browser run typecheck` after Expo UI changes.
- Run the Android workflows in GitHub Actions for APK signing and emulator validation; the local workspace does not have the Android toolchain.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
