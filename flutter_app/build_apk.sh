#!/bin/bash
set -e

echo "========================================================"
echo "  Apple Music - Android APK Build Pipeline"
echo "========================================================"
echo ""

if ! command -v flutter &> /dev/null
then
    echo "[ERROR] Flutter SDK could not be found."
    echo "Install Flutter from https://docs.flutter.dev/get-started/install"
    exit 1
fi

echo "[1/3] Getting Flutter dependencies..."
flutter pub get

echo "[2/3] Building Release Android APK..."
flutter build apk --release --split-per-abi

echo ""
echo "========================================================"
echo "[3/3] Build Complete! Your APKs are in:"
echo "build/app/outputs/flutter-apk/"
echo "========================================================"
