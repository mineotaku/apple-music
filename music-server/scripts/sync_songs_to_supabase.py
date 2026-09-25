import os
import re
import sys
import json
import time
import uuid
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

# Ensure music-server is in python path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__))))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from supabase import create_client
from mutagen.mp3 import MP3
from mutagen.easyid3 import EasyID3
from app.database import SessionLocal
from app.models.song import Song
from app.models.playlist import Playlist, PlaylistSong
from app.models.artist import Artist
from app.models.album import Album

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vamhtrrmfvnthdujrgpv.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "songs")

if not SUPABASE_KEY:
    print("Error: SUPABASE_KEY not found in environment!")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

GRADIENTS = [
    "#fa2d48,#8b5cf6",
    "#3b82f6,#10b981",
    "#f59e0b,#ef4444",
    "#8b5cf6,#ec4899",
    "#06b6d4,#3b82f6",
    "#f43f5e,#fb923c",
    "#10b981,#06b6d4",
    "#6366f1,#a855f7",
    "#ec4899,#f43f5e",
    "#14b8a6,#3b82f6",
    "#d946ef,#8b5cf6",
    "#f97316,#ef4444"
]

def clean_text(val: str) -> str:
    if not val:
        return ""
    val = re.sub(r'\s*-\s*MassTamilan(\.[a-zA-Z0-9]+)?', '', val, flags=re.IGNORECASE)
    val = re.sub(r'MassTamilan(\.[a-zA-Z0-9]+)?', '', val, flags=re.IGNORECASE)
    val = re.sub(r'^\d+\s*[-.]\s*', '', val)
    return val.strip()

def sanitize_filename(name: str) -> str:
    return re.sub(r'[^a-zA-Z0-9._-]', '_', name)

def get_existing_storage_files():
    print("Fetching existing files from Supabase Storage bucket...")
    existing = set()
    try:
        res = supabase.storage.from_(SUPABASE_BUCKET).list('music', {'limit': 1000})
        for item in res:
            if 'name' in item:
                existing.add(item['name'])
    except Exception as e:
        print(f"Notice listing bucket: {e}")
    print(f"Found {len(existing)} existing files in bucket storage.")
    return existing

def upload_single_file(filepath: str, filename: str, existing_files: set):
    storage_name = sanitize_filename(filename)
    storage_key = f"music/{storage_name}"
    
    if storage_name in existing_files:
        return filename, storage_key, True, "Already uploaded"
        
    try:
        with open(filepath, "rb") as f:
            file_bytes = f.read()
            
        supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=storage_key,
            file=file_bytes,
            file_options={"content-type": "audio/mpeg", "upsert": "true"}
        )
        return filename, storage_key, True, "Uploaded"
    except Exception as e:
        return filename, storage_key, False, str(e)

def extract_metadata(filepath: str, filename: str):
    clean_name = filename.replace(".mp3", "")
    try:
        audio = MP3(filepath)
        duration = int(audio.info.length)
        bitrate_val = int(audio.info.bitrate / 1000)
        bitrate = f"{bitrate_val} kbps ALAC" if bitrate_val >= 256 else f"{bitrate_val} kbps AAC"
    except Exception:
        duration = 180
        bitrate = "320 kbps ALAC"
        
    title = clean_name
    artist = "Anirudh Ravichander"
    album = "Tamil Hits & Soundtracks"
    year = 2024

    try:
        tags = EasyID3(filepath)
        raw_title = tags.get('title', [None])[0]
        raw_artist = tags.get('artist', [None])[0]
        raw_album = tags.get('album', [None])[0]
        raw_date = tags.get('date', [None])[0]

        if raw_title:
            cleaned = clean_text(raw_title)
            if cleaned:
                title = cleaned
        if raw_artist:
            cleaned = clean_text(raw_artist)
            if cleaned:
                artist = cleaned
        if raw_album:
            cleaned = clean_text(raw_album)
            if cleaned:
                album = cleaned
        if raw_date and str(raw_date)[:4].isdigit():
            year = int(str(raw_date)[:4])
    except Exception:
        pass

    file_size = os.path.getsize(filepath)
    return {
        "title": title,
        "artist": artist,
        "album": album,
        "duration": duration,
        "bitrate": bitrate,
        "release_year": year,
        "file_size": file_size,
    }

def sync_all_songs(songs_dir: str):
    if not os.path.exists(songs_dir):
        print(f"Error: Songs directory '{songs_dir}' not found!")
        return

    filenames = [f for f in os.listdir(songs_dir) if f.lower().endswith(".mp3")]
    total_count = len(filenames)
    print(f"Discovered {total_count} MP3 files in '{songs_dir}'.")

    existing_files = get_existing_storage_files()

    print(f"\n--- Starting parallel upload of {total_count} tracks to Supabase CDN (6 workers) ---")
    upload_results = {}
    
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {
            executor.submit(upload_single_file, os.path.join(songs_dir, f), f, existing_files): f
            for f in filenames
        }
        completed = 0
        for fut in as_completed(futures):
            fname, s_key, ok, msg = fut.result()
            completed += 1
            status_icon = "OK" if ok else "FAIL"
            upload_results[fname] = s_key
            if completed % 10 == 0 or completed == total_count:
                print(f"Progress: [{completed}/{total_count}] ({status_icon}) {fname[:40]} -> {msg}")

    print("\n--- Connecting to Supabase PostgreSQL Database ---")
    db = SessionLocal()
    
    try:
        # Fetch existing song storage keys or IDs from DB
        existing_songs = {s.storage_key: s for s in db.query(Song).all() if s.storage_key}
        existing_titles = {f"{s.title.lower()}::{s.artist.lower()}": s for s in db.query(Song).all()}

        inserted_count = 0
        updated_count = 0

        created_song_records = []

        for idx, fname in enumerate(filenames):
            fpath = os.path.join(songs_dir, fname)
            meta = extract_metadata(fpath, fname)
            storage_key = upload_results.get(fname, f"music/{sanitize_filename(fname)}")

            # Deterministic unique ID based on storage key
            song_id = f"song-{hashlib.md5(storage_key.encode()).hexdigest()[:12]}"
            gradient = GRADIENTS[idx % len(GRADIENTS)]

            # Check if exists by storage_key or title+artist
            key_combo = f"{meta['title'].lower()}::{meta['artist'].lower()}"
            existing = existing_songs.get(storage_key) or existing_titles.get(key_combo)

            artist_slug = f"artist-{re.sub(r'[^a-z0-9]', '-', meta['artist'].lower())[:30].strip('-')}"
            album_slug = f"album-{re.sub(r'[^a-z0-9]', '-', meta['album'].lower())[:30].strip('-')}"

            lyrics = json.dumps([
                {"time": 0, "text": f"Now streaming: {meta['title']}"},
                {"time": 8, "text": f"By {meta['artist']} • {meta['album']}"},
                {"time": 18, "text": "High-Fidelity Lossless Master Audio"}
            ])

            if existing:
                existing.storage_key = storage_key
                existing.file_path = f"songs/{fname}"
                existing.duration = meta["duration"]
                existing.file_size = meta["file_size"]
                existing.bitrate = meta["bitrate"]
                existing.codec = "Apple Lossless (Master)"
                existing.is_lossless = True
                existing.is_dolby_atmos = True
                existing.is_apple_digital_master = True
                created_song_records.append(existing)
                updated_count += 1
            else:
                new_song = Song(
                    id=song_id,
                    title=meta["title"],
                    artist=meta["artist"],
                    artist_id=artist_slug,
                    album=meta["album"],
                    album_id=album_slug,
                    storage_key=storage_key,
                    file_path=f"songs/{fname}",
                    duration=meta["duration"],
                    file_size=meta["file_size"],
                    mime_type="audio/mpeg",
                    release_year=meta["release_year"],
                    genre="Tamil Soundtracks / Pop",
                    bitrate=meta["bitrate"],
                    codec="Apple Lossless (Master)",
                    is_lossless=True,
                    is_dolby_atmos=True,
                    is_apple_digital_master=True,
                    cover_gradient=gradient,
                    plays=120000 + (idx * 3140) % 850000,
                    lyrics=lyrics
                )
                db.add(new_song)
                created_song_records.append(new_song)
                inserted_count += 1

        db.commit()
        print(f"Database sync complete! Inserted: {inserted_count}, Updated: {updated_count}")

        # Create or update Featured Curated Playlists
        print("\n--- Seeding Curated Playlists for Catalog ---")
        curated_playlists = [
            {
                "id": "playlist-anirudh-essentials",
                "name": "Anirudh Ravichander: Essentials",
                "description": "The unstoppable hits, chart-toppers, and bass-heavy anthems by Anirudh.",
                "curator": "Apple Music Tamil",
                "gradient": "#fa2d48,#8b5cf6",
                "match": lambda s: "anirudh" in s.artist.lower()
            },
            {
                "id": "playlist-high-energy-mass",
                "name": "Mass & High Energy Anthems",
                "description": "Electrifying stadium tracks and pulse-pounding themes to pump you up.",
                "curator": "Apple Music Heavy Rotation",
                "gradient": "#f59e0b,#ef4444",
                "match": lambda s: any(k in s.title.lower() for k in ["vaathi", "kutti", "pathala", "vikram", "master", "chumma", "jalabu", "dance", "danger", "peter"])
            },
            {
                "id": "playlist-soulful-melodies",
                "name": "Late Night Soulful Melodies",
                "description": "Warm acoustic ballads, nocturnal strings, and soothing romantic vocals.",
                "curator": "Apple Music Chill",
                "gradient": "#06b6d4,#3b82f6",
                "match": lambda s: any(k in s.title.lower() for k in ["love", "poonthene", "bae", "kanave", "kannazhaga", "vizhi", "soul", "neeyum", "nenjame", "kadhal", "theme"])
            },
            {
                "id": "playlist-top-100-tamil",
                "name": "Top 100: Tamil Cinema",
                "description": "The most streamed, trending soundtrack releases in high-fidelity lossless.",
                "curator": "Apple Music Charts",
                "gradient": "#8b5cf6,#ec4899",
                "match": lambda s: True
            }
        ]

        for p_def in curated_playlists:
            p = db.query(Playlist).filter(Playlist.id == p_def["id"]).first()
            if not p:
                p = Playlist(
                    id=p_def["id"],
                    name=p_def["name"],
                    description=p_def["description"],
                    curator=p_def["curator"],
                    gradient=p_def["gradient"]
                )
                db.add(p)
                db.commit()

            # Clear and repopulate songs for this playlist
            db.query(PlaylistSong).filter(PlaylistSong.playlist_id == p_def["id"]).delete()
            matched = [s for s in created_song_records if p_def["match"](s)][:40]
            for pos, s in enumerate(matched):
                db.add(PlaylistSong(playlist_id=p_def["id"], song_id=s.id, position=pos))
            db.commit()
            print(f"Playlist '{p_def['name']}' populated with {len(matched)} tracks.")

        total_songs_now = db.query(Song).count()
        print(f"\nSUCCESS! Total songs in database now: {total_songs_now}")

    except Exception as e:
        db.rollback()
        print(f"Database error during sync: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    songs_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "songs"))
    print(f"Starting sync from directory: {songs_dir}")
    t_start = time.time()
    sync_all_songs(songs_dir)
    print(f"All operations finished in {time.time() - t_start:.2f} seconds!")
