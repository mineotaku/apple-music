# Free Hosting & Mobile Deployment Guide

This guide details how to host the **Apple Music Streaming & Studio Platform** 100% free with zero infrastructure costs, and install it on any mobile device (Android & iOS).

---

## 1. Host as a Webpage for Free

You can deploy the web client for free on global Edge CDNs (Vercel or Netlify) with unlimited free bandwidth.

### Option A: Vercel (Recommended)
1. Push this project to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Apple Music Streaming Platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/apple-music-platform.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. The included `vercel.json` automatically detects:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your webpage is live with a free `https://your-app.vercel.app` domain with HTTPS and global CDN caching!

### Option B: Netlify
1. Go to [netlify.com](https://netlify.com) and click **"Add new site"** -> **"Import an existing project"**.
2. Select your repository.
3. The included `netlify.toml` pre-configures everything automatically.
4. Click **Deploy Site**.

---

## 2. Host the Python + FastAPI Backend for Free

To host the Python backend with HTTP 206 Range Streaming:

### Option A: Render (Free Tier)
1. Go to [render.com](https://render.com) and click **"New +"** -> **"Web Service"**.
2. Connect your GitHub repository.
3. Configure the settings (or let `render.yaml` do it automatically):
   - **Root Directory**: `music-server`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Click **Create Web Service**. Render provides a free `https://your-api.onrender.com` backend URL.

### Option B: Free PostgreSQL & Storage on Supabase
1. Create a free project on [supabase.com](https://supabase.com).
2. Copy the PostgreSQL connection URI from **Project Settings > Database**.
3. Set the `DATABASE_URL` environment variable on your Render backend:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```
4. The backend automatically switches from SQLite to PostgreSQL!

---

## 3. How to Install on Mobile Devices (100% Free)

### Method 1: Progressive Web App (PWA) — Instant 1-Click Install
Both iOS and Android support installing this platform directly as an app without going through the Apple App Store or Google Play Store.

#### On Android (Chrome / Edge / Firefox):
1. Open your hosted website URL in mobile Chrome.
2. Tap the **"Install Apple Music"** banner at the bottom (or tap the 3-dot menu > **"Install App"**).
3. The app is installed onto your home screen and app drawer with the Apple Music icon.
4. It runs in full-screen standalone mode with background playback and lock-screen controls!

#### On iPhone / iPad (Safari):
1. Open your hosted website URL in Safari.
2. Tap the **Share** button (the square with an arrow pointing up at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. The Apple Music icon appears on your iOS home screen!
5. When launched, the Safari address bar disappears, giving a native iOS Apple Music experience with lock-screen media controls via the `MediaSession` API.

---

### Method 2: Native Flutter Android APK
To compile a native Android APK:
1. Open the `flutter_app/` directory.
2. Ensure [Flutter](https://docs.flutter.dev/get-started/install) is installed.
3. Run:
   ```cmd
   # On Windows:
   build_apk.bat

   # Or via CLI:
   flutter build apk --release --split-per-abi
   ```
4. Transfer the compiled APK from `flutter_app/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk` to any Android phone and install it directly!

---

## 4. Keeping Audio Streaming Free

As highlighted in Section 18 of the architecture plan:
1. **HTTP Range Requests (206 Partial Content)**: The server only sends the 512KB chunk being played. If a user skips a track after 15 seconds, only ~500KB is transferred instead of 10MB!
2. **Client Audio Caching**: The Service Worker (`public/sw.js`) and browser cache prevent re-downloading audio tracks during replay.
3. **Procedural Lossless Synthesis**: Initial catalog tracks generate compact high-fidelity PCM WAV audio with zero storage cost.
