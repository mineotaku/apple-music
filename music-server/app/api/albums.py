from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.song import Song
from app.api.songs import format_song_response

router = APIRouter(prefix="/api/albums", tags=["albums"])

@router.get("")
def list_albums(db: Session = Depends(get_db)):
    songs = db.query(Song).all()
    albums_dict = {}
    for s in songs:
        if s.album not in albums_dict:
            albums_dict[s.album] = {
                "id": s.album_id or f"album-{s.album.lower().replace(' ', '-')}",
                "title": s.album,
                "artist": s.artist,
                "releaseYear": s.release_year,
                "genre": s.genre,
                "coverGradient": s.cover_gradient.split(",") if s.cover_gradient else ["#fa2d48", "#8b5cf6"],
                "trackCount": 0
            }
        albums_dict[s.album]["trackCount"] += 1

    return list(albums_dict.values())

@router.get("/{album_id}")
def get_album(album_id: str, db: Session = Depends(get_db)):
    songs = db.query(Song).all()
    matching_songs = [s for s in songs if (s.album_id == album_id or s.album.lower().replace(' ', '-') == album_id.lower().replace('album-', ''))]
    if not matching_songs:
        raise HTTPException(status_code=404, detail="Album not found")

    sample = matching_songs[0]
    return {
        "id": album_id,
        "title": sample.album,
        "artist": sample.artist,
        "releaseYear": sample.release_year,
        "genre": sample.genre,
        "coverGradient": sample.cover_gradient.split(",") if sample.cover_gradient else ["#fa2d48", "#8b5cf6"],
        "songs": [format_song_response(s) for s in matching_songs]
    }
