import os
import re
import sys
import json
import hashlib
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__))))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from mutagen.mp3 import MP3
from mutagen.easyid3 import EasyID3
from app.database import SessionLocal
from app.models.song import Song
from app.models.playlist import Playlist, PlaylistSong

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

def run():
    songs_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "songs"))
    filenames = sorted([f for f in os.listdir(songs_dir) if f.lower().endswith(".mp3")])
    total_count = len(filenames)
    print(f"Scanning {total_count} MP3 files from {songs_dir}...")

    db = SessionLocal()
    try:
        existing_songs = {s.storage_key: s for s in db.query(Song).all() if s.storage_key}
        existing_ids = {s.id: s for s in db.query(Song).all()}

        inserted = 0
        updated = 0
        records = []

        for idx, fname in enumerate(filenames):
            fpath = os.path.join(songs_dir, fname)
            storage_name = sanitize_filename(fname)
            storage_key = f"music/{storage_name}"
            song_id = f"song-{hashlib.md5(storage_key.encode()).hexdigest()[:12]}"
            gradient = GRADIENTS[idx % len(GRADIENTS)]

            try:
                audio = MP3(fpath)
                duration = int(audio.info.length)
                bitrate_val = int(audio.info.bitrate / 1000)
                bitrate = f"{bitrate_val} kbps ALAC" if bitrate_val >= 256 else f"{bitrate_val} kbps AAC"
            except Exception:
                duration = 180
                bitrate = "320 kbps ALAC"

            title = fname.replace(".mp3", "")
            artist = "Anirudh Ravichander"
            album = "Tamil Hits & Soundtracks"
            year = 2024

            try:
                tags = EasyID3(fpath)
                rt = tags.get('title', [None])[0]
                ra = tags.get('artist', [None])[0]
                ral = tags.get('album', [None])[0]
                rd = tags.get('date', [None])[0]
                if rt and clean_text(rt):
                    title = clean_text(rt)
                if ra and clean_text(ra):
                    artist = clean_text(ra)
                if ral and clean_text(ral):
                    album = clean_text(ral)
                if rd and str(rd)[:4].isdigit():
                    year = int(str(rd)[:4])
            except Exception:
                pass

            file_size = os.path.getsize(fpath)
            artist_slug = f"artist-{re.sub(r'[^a-z0-9]', '-', artist.lower())[:30].strip('-')}"
            album_slug = f"album-{re.sub(r'[^a-z0-9]', '-', album.lower())[:30].strip('-')}"

            lyrics = json.dumps([
                {"time": 0, "text": f"Now streaming: {title}"},
                {"time": 8, "text": f"By {artist} • {album}"},
                {"time": 18, "text": "Apple Music Lossless Spatial Audio Engine"}
            ])

            existing = existing_songs.get(storage_key) or existing_ids.get(song_id)
            if existing:
                existing.title = title
                existing.artist = artist
                existing.artist_id = artist_slug
                existing.album = album
                existing.album_id = album_slug
                existing.storage_key = storage_key
                existing.file_path = f"songs/{fname}"
                existing.duration = duration
                existing.file_size = file_size
                existing.bitrate = bitrate
                existing.codec = "Apple Lossless (Master)"
                existing.is_lossless = True
                existing.is_dolby_atmos = True
                existing.is_apple_digital_master = True
                existing.lyrics = lyrics
                records.append(existing)
                updated += 1
            else:
                new_song = Song(
                    id=song_id,
                    title=title,
                    artist=artist,
                    artist_id=artist_slug,
                    album=album,
                    album_id=album_slug,
                    storage_key=storage_key,
                    file_path=f"songs/{fname}",
                    duration=duration,
                    file_size=file_size,
                    mime_type="audio/mpeg",
                    release_year=year,
                    genre="Tamil Cinema / Soundtracks",
                    bitrate=bitrate,
                    codec="Apple Lossless (Master)",
                    is_lossless=True,
                    is_dolby_atmos=True,
                    is_apple_digital_master=True,
                    cover_gradient=gradient,
                    plays=85000 + (idx * 4321) % 650000,
                    lyrics=lyrics
                )
                db.add(new_song)
                records.append(new_song)
                inserted += 1

        db.commit()
        print(f"Songs synchronized to Supabase PostgreSQL: {inserted} inserted, {updated} updated.")

        # Seed Playlists
        playlists_data = [
            {
                "id": "playlist-anirudh-essentials",
                "name": "Anirudh Ravichander: Essentials",
                "description": "The biggest chartbusters, infectious hooks, and viral anthems by Rockstar Anirudh.",
                "curator": "Apple Music Tamil",
                "gradient": "#fa2d48,#8b5cf6",
                "filter": lambda s: "anirudh" in s.artist.lower()
            },
            {
                "id": "playlist-mass-energy",
                "name": "High Energy & Mass Anthems",
                "description": "Heavy basslines and stadium anthems for maximum adrenaline.",
                "curator": "Apple Music Heavy Rotation",
                "gradient": "#f59e0b,#ef4444",
                "filter": lambda s: any(k in s.title.lower() for k in ["vaathi", "kutti", "pathala", "vikram", "master", "chumma", "jalabu", "dance", "danger", "peter", "adaavadi"])
            },
            {
                "id": "playlist-late-night-melodies",
                "name": "Late Night Soulful Melodies",
                "description": "Smooth acoustic guitars, strings, and nocturnal romance.",
                "curator": "Apple Music Chill",
                "gradient": "#06b6d4,#3b82f6",
                "filter": lambda s: any(k in s.title.lower() for k in ["love", "poonthene", "bae", "kanave", "kannazhaga", "vizhi", "soul", "neeyum", "nenjame", "kadhal", "theme", "amma"])
            },
            {
                "id": "playlist-top-tamil",
                "name": "Top 100: Tamil Cinema",
                "description": "The ultimate soundtrack collection from Kollywood in pristine lossless.",
                "curator": "Apple Music Charts",
                "gradient": "#8b5cf6,#ec4899",
                "filter": lambda s: True
            }
        ]

        for p_info in playlists_data:
            p = db.query(Playlist).filter(Playlist.id == p_info["id"]).first()
            if not p:
                p = Playlist(
                    id=p_info["id"],
                    name=p_info["name"],
                    description=p_info["description"],
                    curator=p_info["curator"],
                    gradient=p_info["gradient"]
                )
                db.add(p)
                db.commit()

            db.query(PlaylistSong).filter(PlaylistSong.playlist_id == p_info["id"]).delete()
            matched = [s for s in records if p_info["filter"](s)][:40]
            for pos, s in enumerate(matched):
                db.add(PlaylistSong(playlist_id=p_info["id"], song_id=s.id, position=pos))
            db.commit()
            print(f"Playlist '{p_info['name']}' populated with {len(matched)} tracks.")

        total_songs = db.query(Song).count()
        print(f"SUCCESS! Database now contains {total_songs} live songs.")

    finally:
        db.close()

if __name__ == "__main__":
    run()
