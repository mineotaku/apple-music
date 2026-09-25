import json
import base64
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.song import Song
from app.models.artist import Artist
from app.models.album import Album
from app.services.streaming import stream_audio_file
from app.services.storage import StorageService
from app.services.metadata import extract_audio_metadata, generate_procedural_wav

router = APIRouter(prefix="/api/songs", tags=["songs"])

# Cache in-memory procedural buffers for initial mock audio tracks
audio_buffer_cache = {}

def format_song_response(song: Song) -> dict:
    lyrics_parsed = []
    if song.lyrics:
        try:
            lyrics_parsed = json.loads(song.lyrics)
        except Exception:
            lyrics_parsed = []

    gradients = ["#fa2d48", "#8b5cf6"]
    if song.cover_gradient:
        gradients = song.cover_gradient.split(",")

    return {
        "id": song.id,
        "title": song.title,
        "artist": song.artist,
        "artistId": song.artist_id or f"artist-{song.artist.lower().replace(' ', '-')}",
        "album": song.album,
        "albumId": song.album_id or f"album-{song.album.lower().replace(' ', '-')}",
        "duration": song.duration,
        "releaseYear": song.release_year,
        "genre": song.genre,
        "bitrate": song.bitrate,
        "codec": song.codec,
        "isLossless": song.is_lossless,
        "isDolbyAtmos": song.is_dolby_atmos,
        "isAppleDigitalMaster": song.is_apple_digital_master,
        "coverGradient": gradients,
        "plays": song.plays,
        "lyrics": lyrics_parsed,
        "streamUrl": f"{os.getenv('SUPABASE_URL', 'https://vamhtrrmfvnthdujrgpv.supabase.co').rstrip('/')}/storage/v1/object/public/songs/{song.storage_key}" if song.storage_key else f"/api/songs/{song.id}/stream"
    }

@router.get("")
def list_songs(db: Session = Depends(get_db)):
    songs = db.query(Song).order_by(Song.created_at.desc()).all()
    return [format_song_response(s) for s in songs]

@router.get("/{song_id}")
def get_song(song_id: str, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return format_song_response(song)

@router.api_route("/{song_id}/stream", methods=["GET", "HEAD"])
def stream_song(song_id: str, request: Request, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    content_type = song.mime_type or "audio/mpeg"

    # If song has physical file on disk:
    if song.file_path and os.path.exists(song.file_path):
        if request.method == "HEAD":
            size = os.path.getsize(song.file_path)
            return Response(status_code=200, headers={"Accept-Ranges": "bytes", "Content-Length": str(size), "Content-Type": content_type})
        return stream_audio_file(request, song.file_path, content_type)

    # If song is stored in Supabase CDN:
    if song.storage_key:
        supabase_url = os.getenv("SUPABASE_URL", "https://vamhtrrmfvnthdujrgpv.supabase.co").rstrip("/")
        public_url = f"{supabase_url}/storage/v1/object/public/songs/{song.storage_key}"
        return RedirectResponse(url=public_url, status_code=307)

    # If cached procedural buffer exists:
    if song.id in audio_buffer_cache:
        buf = audio_buffer_cache[song.id]
        if request.method == "HEAD":
            return Response(status_code=200, headers={"Accept-Ranges": "bytes", "Content-Length": str(len(buf)), "Content-Type": "audio/wav"})
        return stream_audio_file(request, buf, "audio/wav")

    # Generate procedural audio on demand if file is missing
    buf = generate_procedural_wav(bpm=120, root_freq=220.0, pattern="synthwave", duration_seconds=30)
    audio_buffer_cache[song.id] = buf
    if request.method == "HEAD":
        return Response(status_code=200, headers={"Accept-Ranges": "bytes", "Content-Length": str(len(buf)), "Content-Type": "audio/wav"})
    return stream_audio_file(request, buf, "audio/wav")

@router.post("")
async def upload_song_json(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Accepts JSON payload with title, artist, audioBase64 or procedural config
    """
    body = await request.json()
    title = body.get("title")
    artist = body.get("artist")
    album = body.get("album", "Singles")
    genre = body.get("genre", "Electronic")
    duration = int(body.get("duration", 180))
    audio_base64 = body.get("audioBase64")
    is_lossless = body.get("isLossless", True)
    is_dolby_atmos = body.get("isDolbyAtmos", True)
    lyrics = body.get("lyrics", [])

    if not title or not artist:
        raise HTTPException(status_code=400, detail="Title and artist are required")

    import uuid
    new_id = f"song-{int(uuid.uuid4().int % 100000000)}"

    # If audioBase64 provided, save it as file or cache
    file_path = None
    file_size = 0
    if audio_base64:
        try:
            clean_b64 = audio_base64.split(",")[-1]
            raw_bytes = base64.b64decode(clean_b64)
            audio_buffer_cache[new_id] = raw_bytes
            file_size = len(raw_bytes)
        except Exception:
            raw_bytes = generate_procedural_wav(120, 220, "synthwave", 30)
            audio_buffer_cache[new_id] = raw_bytes
            file_size = len(raw_bytes)
    else:
        raw_bytes = generate_procedural_wav(120, 220, "synthwave", 30)
        audio_buffer_cache[new_id] = raw_bytes
        file_size = len(raw_bytes)

    new_song = Song(
        id=new_id,
        title=title,
        artist=artist,
        artist_id=f"artist-{artist.lower().replace(' ', '-')}",
        album=album,
        album_id=f"album-{album.lower().replace(' ', '-')}",
        duration=duration,
        file_size=file_size,
        mime_type="audio/wav",
        release_year=2026,
        genre=genre,
        bitrate="24-bit / 96kHz ALAC",
        codec="Apple Lossless" if is_lossless else "AAC 256kbps",
        is_lossless=is_lossless,
        is_dolby_atmos=is_dolby_atmos,
        is_apple_digital_master=True,
        cover_gradient="#fa2d48,#8b5cf6",
        plays=1,
        lyrics=json.dumps(lyrics) if lyrics else json.dumps([
            {"time": 0, "text": f"Now streaming {title}"},
            {"time": 8, "text": f"By {artist} in Spatial Audio Lossless"}
        ])
    )

    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return format_song_response(new_song)

@router.post("/upload-file")
async def upload_audio_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    artist: Optional[str] = Form(None),
    album: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Direct file upload pipeline with automatic metadata extraction via Mutagen (Section 5 of plan).
    """
    file_path, storage_key, file_size, public_url = await StorageService.save_uploaded_file(file, "songs")
    extracted = extract_audio_metadata(file_path)

    final_title = title or extracted.get("title") or file.filename
    final_artist = artist or extracted.get("artist") or "Independent Artist"
    final_album = album or extracted.get("album") or "Singles"

    import uuid
    new_id = f"song-{int(uuid.uuid4().int % 100000000)}"

    new_song = Song(
        id=new_id,
        title=final_title,
        artist=final_artist,
        artist_id=f"artist-{final_artist.lower().replace(' ', '-')}",
        album=final_album,
        album_id=f"album-{final_album.lower().replace(' ', '-')}",
        storage_key=storage_key,
        file_path=file_path,
        duration=extracted.get("duration", 180),
        file_size=file_size,
        mime_type=file.content_type or "audio/mpeg",
        release_year=extracted.get("release_year", 2026),
        genre=extracted.get("genre", "Soundtrack"),
        bitrate=extracted.get("bitrate", "24-bit / 96kHz ALAC"),
        codec=extracted.get("codec", "Apple Lossless"),
        is_lossless=True,
        is_dolby_atmos=True,
        is_apple_digital_master=True,
        cover_gradient="#fa2d48,#3b82f6",
        plays=1,
        lyrics=json.dumps([
            {"time": 0, "text": f"Now playing {final_title}"},
            {"time": 8, "text": f"Uploaded via Admin Studio Pipeline"}
        ])
    )

    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return format_song_response(new_song)

@router.delete("/{song_id}")
def delete_song(song_id: str, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    if song.file_path and os.path.exists(song.file_path):
        try:
            os.remove(song.file_path)
        except OSError:
            pass

    if song_id in audio_buffer_cache:
        del audio_buffer_cache[song_id]

    db.delete(song)
    db.commit()
    return {"success": True, "message": "Song deleted from catalog and storage"}
