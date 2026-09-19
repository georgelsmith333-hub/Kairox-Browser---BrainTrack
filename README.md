# Kairox Browser

Kairox is a privacy-first browsing workspace for Android and web preview. It keeps profiles, tabs, bookmarks, history, and browser controls local by default, while giving Android users a native embedded page surface and web users a live page preview with an external fallback.

## What works

- Profile-scoped tabs, bookmarks, history, and session restore
- Native Android WebView browsing with user-agent presets, tracker filtering, popup blocking, JavaScript and cookie controls
- Local page scripts that run only on matching pages
- Developer lab with a real direct connectivity check and honest native capability boundaries
- Live web preview in an embedded frame, with a secure external-browser handoff for sites that block embedding
- GitHub Actions workflows for debug APK builds, clean-emulator validation, signed release APKs, and checksums

## Run locally

```sh
pnpm install
pnpm --filter @workspace/kairox-browser run dev
```

Run the typecheck from the workspace root:

```sh
pnpm run typecheck
```

## Android builds

See [`docs/android-build.md`](docs/android-build.md) for the debug and signed release workflows. The Android toolchain runs in GitHub Actions so the exact APK can be validated on a clean emulator.

## Runtime boundary

The Android build can expose native WebView capabilities. The web preview cannot safely claim native WebView inspector, storage inspection, request interception, or proxy routing, so those capabilities are clearly labeled and the page remains available through the live frame or external browser fallback.