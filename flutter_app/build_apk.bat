@echo off
echo ========================================================
echo   Apple Music - Android APK Build Pipeline
echo ========================================================
echo.

where flutter >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Flutter SDK was not found in your PATH.
    echo Please install Flutter from https://docs.flutter.dev/get-started/install
    echo Or open this folder in Android Studio with the Flutter plugin installed.
    pause
    exit /b 1
)

echo [1/3] Getting Flutter dependencies...
call flutter pub get

echo [2/3] Building Release Android APK (ARM64 & x86_64)...
call flutter build apk --release --split-per-abi

echo.
echo ========================================================
echo [3/3] Build Complete! Your APKs are located at:
echo build\app\outputs\flutter-apk\
echo.
echo You can install it on any connected phone using:
echo   flutter install
echo   or: adb install build\app\outputs\flutter-apk\app-arm64-v8a-release.apk
echo ========================================================
pause
