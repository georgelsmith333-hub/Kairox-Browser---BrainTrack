---
name: Android release validation
description: Environment constraint for validating signed Android artifacts.
---

Signed Android builds and emulator installation checks are CI-only in this workspace because the local Replit environment does not provide a JDK, Android SDK, or emulator.

**Why:** The release workflow provisions Java and uses GitHub's Android emulator runner, while local attempts cannot start the Android build toolchain.

**How to apply:** Validate workflow transformations locally, then rely on the GitHub Actions release job after the owner supplies the user-owned keystore secrets.