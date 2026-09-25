import os
import re
import sys
import json
import time
import hashlib
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__))))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from supabase import create_client
from mutagen.mp3 import MP3
from mutagen.easyid3 import EasyID3
from app.database import SessionLocal
from app.models.song import Song
from app.models.playlist import Playlist, PlaylistSong

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vamhtrrmfvnthdujrgpv.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "songs")

if not SUPABASE_KEY:
    print("Error: SUPABASE_KEY not found in environment!", flush=True)
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
MAX_STORAGE_MB = 950  # Stay safely below Supabase 1GB free tier limit

def sanitize_filename(name: str) -> str:
    return re.sub(r'[^a-zA-Z0-9._-]', '_', name)

def get_existing_bucket_files():
    print("Checking existing files in Supabase Storage...", flush=True)
    existing = {}
    try:
        # Fetch up to 1000 items from 'music' subfolder
        items = supabase.storage.from_(SUPABASE_BUCKET).list('music', {'limit': 1000})
        for it in items:
            if 'name' in it:
                size = it.get('metadata', {}).get('size', 0) if isinstance(it.get('metadata'), dict) else 0
                existing[it['name']] = size
    except Exception as e:
        print(f"Notice querying storage bucket: {e}", flush=True)
    print(f"Bucket currently holds {len(existing)} files.", flush=True)
    return existing

def upload_with_retry(filepath: str, storage_key: str, max_retries: int = 3) -> bool:
    for attempt in range(1, max_retries + 1):
        try:
            with open(filepath, "rb") as f:
                data = f.read()

            supabase.storage.from_(SUPABASE_BUCKET).upload(
                path=storage_key,
                file=data,
                file_options={"content-type": "audio/mpeg", "upsert": "true"}
            )
            return True
        except Exception as e:
            if attempt == max_retries:
                print(f"  [ERROR] {os.path.basename(filepath)} failed after {max_retries} attempts: {e}", flush=True)
                return False
            time.sleep(2 * attempt)
    return False

def sync():
    songs_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "songs"))
    filenames = sorted([f for f in os.listdir(songs_dir) if f.lower().endswith(".mp3")])
    total = len(filenames)
    print(f"Found {total} MP3 songs in {songs_dir}", flush=True)

    existing = get_existing_bucket_files()
    total_bytes = sum(existing.values())
    print(f"Initial cloud storage usage: {total_bytes / (1024*1024):.1f} MB", flush=True)

    uploaded_count = len(existing)
    success = 0
    skipped = 0
    failed = 0

    for idx, fname in enumerate(filenames, 1):
        safe_name = sanitize_filename(fname)
        storage_key = f"music/{safe_name}"
        fpath = os.path.join(songs_dir, fname)
        fsize = os.path.getsize(fpath)

        if safe_name in existing or fname in existing:
            skipped += 1
            continue

        # Check quota limit
        if (total_bytes + fsize) / (1024 * 1024) > MAX_STORAGE_MB:
            print(f"Storage safety threshold ({MAX_STORAGE_MB} MB) reached. Skipping remaining tracks to preserve free quota.", flush=True)
            break

        print(f"[{idx}/{total}] Uploading: {fname[:35]} ({fsize/(1024*1024):.1f} MB)...", flush=True)
        ok = upload_with_retry(fpath, storage_key)
        if ok:
            success += 1
            total_bytes += fsize
            existing[safe_name] = fsize
            # Polite throttle delay between uploads
            time.sleep(1.0)
        else:
            failed += 1
            time.sleep(2.0)

    print(f"\n--- Sync Complete ---", flush=True)
    print(f"Successfully uploaded: {success}", flush=True)
    print(f"Already in cloud: {skipped}", flush=True)
    print(f"Failed: {failed}", flush=True)
    print(f"Total cloud files: {len(existing)} ({total_bytes / (1024*1024):.1f} MB)", flush=True)

if __name__ == "__main__":
    sync()
