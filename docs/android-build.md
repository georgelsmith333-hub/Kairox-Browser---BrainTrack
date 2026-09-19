# Kairox Browser build and release

Kairox is an Expo browser with a native embedded page surface on Android and a live embedded page preview on web. Sites that refuse iframe embedding can always be opened in the device or system browser.

## Build an APK

The repository includes `.github/workflows/android-apk.yml`. Push the repository to GitHub, open **Actions**, choose **Build Kairox Android APK**, and run it manually. The workflow generates the native Android project, builds an installable signed release APK, and publishes a SHA-256 checksum beside it.

For an immediately installable validation package without a user-owned release key, run **Build Kairox Android Debug APK**. That workflow generates the same native project, builds `app-debug.apk`, verifies its checksum, installs that exact APK on a clean Android emulator, and uploads it as the `kairox-browser-android-debug` artifact. Debug APKs are for testing and should not be used as the signed production release.

### Find the APK after the workflow finishes

1. Open the GitHub repository.
2. Select **Actions**.
3. Choose **Build Kairox Android Debug APK** for a test build, or **Build Kairox Android APK** for a signed release.
4. Select **Run workflow** on the `main` branch and wait for both jobs to finish successfully.
5. Open the completed workflow run. In the **Artifacts** section, download:
   - `kairox-browser-android-debug` → `app-debug.apk` for testing.
   - `kairox-browser-android-release` → `app-release.apk` for the signed release.
6. On Android, open the downloaded APK and allow installation from that source when prompted. The checksum file beside it can be used to verify the download.

The APK is not generated inside the Replit preview pane. GitHub Actions is the release machine because the Android SDK, Gradle, emulator, and signing environment are not available in the local workspace.

### Signed release APK

The workflow builds a signed release APK for direct installation and tests that exact artifact on a wiped Android emulator. It also verifies the APK signature and publishes a SHA-256 checksum beside the APK. The artifact is named `kairox-browser-android-release` and contains:

- `app-release.apk`
- `app-release.apk.sha256`

The release build requires a user-owned Android keystore. Create one locally and keep the keystore file and passwords outside the repository:

```sh
keytool -genkeypair -v \
  -keystore kairox-release.keystore \
  -alias kairox \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Add these four GitHub Actions repository secrets before running the workflow:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded contents of `kairox-release.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | `kairox` (or the alias chosen during key creation) |
| `ANDROID_KEY_PASSWORD` | Key password |

To encode the keystore for the `ANDROID_KEYSTORE_BASE64` secret:

```sh
# Linux
base64 -w 0 kairox-release.keystore

# macOS
base64 < kairox-release.keystore | tr -d '\n'
```

The workflow decodes the keystore only into the temporary GitHub Actions runner, never writes it to the repository, and fails if any signing secret is missing. Keep the keystore and its passwords backed up securely: future APK updates must use the same signing key or Android will reject them as updates.

The APK package is `com.kairoxbrowserbrintrackit.app`, and the current release is version `1.1.0` / version code `2`, as configured in `artifacts/kairox-browser/app.json`.

## Privacy boundary

- Normal profile, tab, bookmark, and history state is stored locally.
- The app does not include Replit analytics, Firebase, Crashlytics, or forced remote updates.
- Android browsing uses the native WebView session and does not silently upload browser state.
- Websites, networks, and download hosts can still observe their own traffic; no browser can remove that visibility.

## Current preview behavior

Expo web preview renders the requested page inside a live web frame and keeps the same address bar, local profile controls, bookmarks, history, and external handoff. It does not claim Android-only capabilities such as WebView console capture, request interception, native proxy routing, or DOM/storage inspection. The Android build is the target for the deeper embedded page surface.