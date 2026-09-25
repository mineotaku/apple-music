import json
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base, SessionLocal
from app.models.song import Song
from app.models.playlist import Playlist, PlaylistSong
from app.models.favorite import Favorite, PlayHistory
from app.models.user import User
from app.api import auth, songs, albums, artists, playlists, search, favorites, history, admin
from app.services.metadata import generate_procedural_wav
from app.api.songs import audio_buffer_cache

# Create all tables in SQLite / PostgreSQL
Base.metadata.create_all(bind=engine)

def seed_initial_catalog():
    db = SessionLocal()
    try:
        count = db.query(Song).count()
        if count == 0:
            initial_tracks = [
                {
                    "id": "song-1",
                    "title": "Starfall Over Shibuya",
                    "artist": "Kaito Takahashi",
                    "album": "Neon Horizon",
                    "duration": 194,
                    "release_year": 2026,
                    "genre": "Electronic",
                    "bitrate": "24-bit / 96kHz ALAC",
                    "codec": "Apple Lossless",
                    "is_lossless": True,
                    "is_dolby_atmos": True,
                    "is_apple_digital_master": True,
                    "cover_gradient": "#3b82f6,#8b5cf6",
                    "plays": 142890,
                    "lyrics": [
                        {"time": 0, "text": "Neon lights reflecting in the midnight rain"},
                        {"time": 6, "text": "Walking through Shibuya crossing once again"},
                        {"time": 14, "text": "The city breathes in frequencies of electric sound"},
                        {"time": 22, "text": "Lost within the reverie, feet above the ground"},
                        {"time": 31, "text": "Catch the starfall as the morning breaks through glass"},
                        {"time": 42, "text": "Every second glowing like it was made to last"},
                        {"time": 54, "text": "Endless pulses through the quiet night"},
                        {"time": 66, "text": "We are floating in the atmosphere of light"}
                    ],
                    "wav_params": (124, 261.63, "synthwave")
                },
                {
                    "id": "song-2",
                    "title": "Golden Hour Reverie",
                    "artist": "Elena Rostova",
                    "album": "Sunlight & Cedar",
                    "duration": 218,
                    "release_year": 2026,
                    "genre": "Acoustic / Indie",
                    "bitrate": "24-bit / 192kHz ALAC",
                    "codec": "Hi-Res Lossless",
                    "is_lossless": True,
                    "is_dolby_atmos": True,
                    "is_apple_digital_master": True,
                    "cover_gradient": "#f59e0b,#ef4444",
                    "plays": 98450,
                    "lyrics": [
                        {"time": 0, "text": "Sunlight filtering through the cedar trees"},
                        {"time": 8, "text": "Carrying the warmth upon an ocean breeze"},
                        {"time": 16, "text": "Strings vibrate with memories of home"},
                        {"time": 25, "text": "Through the mountain passes where we used to roam"},
                        {"time": 35, "text": "Golden hour painting amber in your eyes"},
                        {"time": 46, "text": "No words needed under open skies"},
                        {"time": 58, "text": "Let the quiet linger till the stars awaken"}
                    ],
                    "wav_params": (92, 220.00, "piano")
                },
                {
                    "id": "song-3",
                    "title": "Midnight Velvet",
                    "artist": "Marcus Vance & The Low-Fi Society",
                    "album": "City Lights After Dark",
                    "duration": 184,
                    "release_year": 2026,
                    "genre": "R&B / Soul",
                    "bitrate": "24-bit / 48kHz ALAC",
                    "codec": "Spatial Audio with Dolby Atmos",
                    "is_lossless": True,
                    "is_dolby_atmos": True,
                    "is_apple_digital_master": True,
                    "cover_gradient": "#8b5cf6,#ec4899",
                    "plays": 231100,
                    "lyrics": [
                        {"time": 0, "text": "Smooth Rhodes chords fading into the fog"},
                        {"time": 7, "text": "Late night conversation on a rooftop balcony"},
                        {"time": 15, "text": "Sipping coffee while the bassline slides along"},
                        {"time": 24, "text": "Everything feels easier when you hear this song"},
                        {"time": 34, "text": "Velvet shadows moving in slow motion"},
                        {"time": 44, "text": "Deeper than the calmest midnight ocean"}
                    ],
                    "wav_params": (84, 174.61, "lofi")
                },
                {
                    "id": "song-4",
                    "title": "Clair de Lune (Spatial Piano Rework)",
                    "artist": "Julian C. Mercier",
                    "album": "Modern Impressions",
                    "duration": 260,
                    "release_year": 2025,
                    "genre": "Classical",
                    "bitrate": "24-bit / 192kHz ALAC",
                    "codec": "Hi-Res Lossless",
                    "is_lossless": True,
                    "is_dolby_atmos": True,
                    "is_apple_digital_master": True,
                    "cover_gradient": "#06b6d4,#3b82f6",
                    "plays": 76540,
                    "lyrics": [
                        {"time": 0, "text": "[Instrumental intro - Gentle arpeggios]"},
                        {"time": 20, "text": "[Theme enters with delicate rubato]"},
                        {"time": 45, "text": "[Harmonic shift into warm D-flat major]"},
                        {"time": 75, "text": "[Crescendo with cascading spatial resonance]"}
                    ],
                    "wav_params": (72, 138.59, "piano")
                },
                {
                    "id": "song-5",
                    "title": "Aura Borealis",
                    "artist": "Kaito Takahashi",
                    "album": "Neon Horizon",
                    "duration": 205,
                    "release_year": 2026,
                    "genre": "Ambient / Synthwave",
                    "bitrate": "24-bit / 96kHz ALAC",
                    "codec": "Apple Lossless",
                    "is_lossless": True,
                    "is_dolby_atmos": True,
                    "is_apple_digital_master": True,
                    "cover_gradient": "#10b981,#06b6d4",
                    "plays": 87120,
                    "lyrics": [
                        {"time": 0, "text": "Green shimmer dancing on arctic snow"},
                        {"time": 9, "text": "Sub-bass rumbling gentle and slow"},
                        {"time": 18, "text": "Magnetic field in harmonic flow"},
                        {"time": 28, "text": "Higher than the satellite signals go"}
                    ],
                    "wav_params": (110, 196.00, "synthwave")
                },
                {
                    "id": "song-6",
                    "title": "Solstice Drive",
                    "artist": "Marcus Vance & The Low-Fi Society",
                    "album": "City Lights After Dark",
                    "duration": 172,
                    "release_year": 2026,
                    "genre": "R&B / Soul",
                    "bitrate": "24-bit / 48kHz ALAC",
                    "codec": "Lossless",
                    "is_lossless": True,
                    "is_dolby_atmos": False,
                    "is_apple_digital_master": True,
                    "cover_gradient": "#f43f5e,#fb923c",
                    "plays": 112400,
                    "lyrics": [
                        {"time": 0, "text": "Windows down along the coastal highway"},
                        {"time": 8, "text": "Sunset orange fading to indigo blue"},
                        {"time": 18, "text": "Cruising through the longest day of summer"},
                        {"time": 30, "text": "Nothing on my mind except the view of you"}
                    ],
                    "wav_params": (96, 246.94, "lofi")
                }
            ]

            for item in initial_tracks:
                bpm, freq, pat = item["wav_params"]
                wav_data = generate_procedural_wav(bpm, freq, pat, 30)
                audio_buffer_cache[item["id"]] = wav_data

                song = Song(
                    id=item["id"],
                    title=item["title"],
                    artist=item["artist"],
                    artist_id=f"artist-{item['artist'].lower().replace(' ', '-')}",
                    album=item["album"],
                    album_id=f"album-{item['album'].lower().replace(' ', '-')}",
                    duration=item["duration"],
                    file_size=len(wav_data),
                    mime_type="audio/wav",
                    release_year=item["release_year"],
                    genre=item["genre"],
                    bitrate=item["bitrate"],
                    codec=item["codec"],
                    is_lossless=item["is_lossless"],
                    is_dolby_atmos=item["is_dolby_atmos"],
                    is_apple_digital_master=item["is_apple_digital_master"],
                    cover_gradient=item["cover_gradient"],
                    plays=item["plays"],
                    lyrics=json.dumps(item["lyrics"])
                )
                db.add(song)

            # Seed Editorial Playlists
            p1 = Playlist(
                id="playlist-1",
                name="Heavy Rotation",
                description="The tracks you have on constant replay right now.",
                curator="Apple Music Editorial",
                gradient="#fa2d48,#ff7a00"
            )
            p2 = Playlist(
                id="playlist-2",
                name="Spatial Audio: Pure Focus",
                description="Immersive soundscapes engineered for deep concentration and flow state.",
                curator="Apple Music Spatial Audio",
                gradient="#3b82f6,#10b981"
            )
            p3 = Playlist(
                id="playlist-3",
                name="Late Night Chill",
                description="Downtempo soul, mellow beats, and warm nocturnal analog warmth.",
                curator="Curated by You",
                gradient="#8b5cf6,#ec4899"
            )
            db.add_all([p1, p2, p3])
            db.commit()

            # Playlist Songs
            p1_songs = ["song-1", "song-3", "song-2", "song-5"]
            for idx, sid in enumerate(p1_songs):
                db.add(PlaylistSong(playlist_id="playlist-1", song_id=sid, position=idx))

            p2_songs = ["song-4", "song-5", "song-1"]
            for idx, sid in enumerate(p2_songs):
                db.add(PlaylistSong(playlist_id="playlist-2", song_id=sid, position=idx))

            p3_songs = ["song-3", "song-6", "song-2"]
            for idx, sid in enumerate(p3_songs):
                db.add(PlaylistSong(playlist_id="playlist-3", song_id=sid, position=idx))

            # Initial Favorites
            db.add(Favorite(user_id="usr_apple_id_882", song_id="song-1"))
            db.add(Favorite(user_id="usr_apple_id_882", song_id="song-3"))

            db.commit()
            print("Successfully seeded Apple Music catalog and playlists.")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_initial_catalog()
    yield

app = FastAPI(
    title="Apple Music Streaming & Studio Platform",
    description="Lossless Spatial Audio Streaming Platform with Range 206 Partial Content, Studio Upload Pipeline, and Editorial Playlists",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(songs.router)
app.include_router(albums.router)
app.include_router(artists.router)
app.include_router(playlists.router)
app.include_router(search.router)
app.include_router(favorites.router)
app.include_router(history.router)
app.include_router(admin.router)

from fastapi.responses import FileResponse
from fastapi import HTTPException

# Locate dist directory
dist_dir = None
for candidate in [
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dist"),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist"),
    os.path.join(os.getcwd(), "dist"),
    "dist"
]:
    if os.path.exists(candidate) and os.path.exists(os.path.join(candidate, "index.html")):
        dist_dir = os.path.abspath(candidate)
        break

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ["docs", "openapi.json", "redoc"]:
            raise HTTPException(status_code=404, detail="Not found")
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "platform": "Apple Music Stream & Studio",
            "status": "online",
            "engine": "FastAPI + HTTP 206 Partial Content Range Streaming",
            "docs": "/docs",
            "endpoints": {
                "songs": "/api/songs",
                "playlists": "/api/playlists",
                "search": "/api/search?q=starfall",
                "admin": "/api/admin/stats"
            }
        }
