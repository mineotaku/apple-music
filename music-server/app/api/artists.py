from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.song import Song
from app.api.songs import format_song_response

router = APIRouter(prefix="/api/artists", tags=["artists"])

@router.get("")
def list_artists(db: Session = Depends(get_db)):
    songs = db.query(Song).all()
    artists_dict = {}
    for s in songs:
        if s.artist not in artists_dict:
            artists_dict[s.artist] = {
                "id": s.artist_id or f"artist-{s.artist.lower().replace(' ', '-')}",
                "name": s.artist,
                "songCount": 0,
                "monthlyListeners": 125000 + (len(s.artist) * 12430),
                "genre": s.genre
            }
        artists_dict[s.artist]["songCount"] += 1

    return list(artists_dict.values())

@router.get("/{artist_id}")
def get_artist(artist_id: str, db: Session = Depends(get_db)):
    songs = db.query(Song).all()
    matching_songs = [s for s in songs if (s.artist_id == artist_id or s.artist.lower().replace(' ', '-') == artist_id.lower().replace('artist-', ''))]
    if not matching_songs:
        raise HTTPException(status_code=404, detail="Artist not found")

    sample = matching_songs[0]
    return {
        "id": artist_id,
        "name": sample.artist,
        "genre": sample.genre,
        "songCount": len(matching_songs),
        "songs": [format_song_response(s) for s in matching_songs]
    }
