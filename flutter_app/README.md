# Apple Music — Flutter Mobile & Web Client

A native Flutter client targeting **Android**, **iOS**, and **Web**, designed with the visual aesthetic and features of Apple Music.

---

## Features
- **Apple Music Design Vibe**: True OLED dark mode (`#000000`), frosted glass blur (`#161618`), and Apple Crimson (`#FA2D48`).
- **High-Fidelity Audio Streaming**: Powered by `just_audio` supporting HTTP Range Requests (206 Partial Content) for immediate seeking and minimal bandwidth.
- **Synchronized Karaoke Lyrics**: Real-time line highlighting with glow and interactive tap-to-seek.
- **Audio Quality Badges**: Lossless (24-bit / 96kHz ALAC), Dolby Atmos Spatial Audio, and Apple Digital Master tags.
- **Docked Floating Mini-Player**: Floats above the iOS frosted bottom navigation bar with swipe-up / tap to expand.
- **Full Apple Music Navigation**:
  - **Listen Now**: Featured Editorial Spotlight, Heavy Rotation, Recently Added
  - **Browse**: Spatial Audio categories, Apple Digital Masters, Electronic, Indie, Soul
  - **Library**: Playlists, Favorites, Artists, Albums, Songs
  - **Search**: Instant live search across catalog
  - **Studio**: Mobile Admin upload pipeline and server metrics

---

## Getting Started

### 1. Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (version 3.0.0 or higher)
- Android Studio with Android SDK 34 installed (or VS Code with Flutter extension)

### 2. Configure Backend URL
Open `lib/services/api_service.dart`:
```dart
// For Android Emulator (default):
static String baseUrl = 'http://10.0.2.2:8000';

// For physical Android phone connected via WiFi:
static String baseUrl = 'http://192.168.1.XXX:8000';

// For deployed cloud backend (e.g. Render / Railway / Supabase):
static String baseUrl = 'https://your-music-api.onrender.com';
```

### 3. Run on Mobile or Emulator
```bash
# Get dependencies
flutter pub get

# Run on connected Android device or emulator
flutter run

# Run on Web (Chrome)
flutter run -d chrome
```

### 4. Build Android Release APK
Run the included build script:
```cmd
# On Windows:
build_apk.bat

# On Linux/macOS:
chmod +x build_apk.sh
./build_apk.sh
```

Or run via Flutter CLI:
```bash
flutter build apk --release --split-per-abi
```
The output APKs will be generated at:
`build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`
