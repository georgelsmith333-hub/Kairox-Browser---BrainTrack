---
name: Browser runtime boundary
description: Why Kairox uses an embedded Android page surface and a separate Expo web preview fallback.
---

Kairox treats the Android build and Expo web preview as different runtime surfaces: Android can host the native page surface, while web preview must hand off to the device/browser.

**Why:** Expo web cannot provide a trustworthy native browser engine, and presenting it as a verified standalone APK would be misleading.

**How to apply:** Keep local profile, tab, bookmark, history, and privacy controls shared across both surfaces, but label native-only capabilities clearly and never fabricate inspector, network, or page output in preview.