from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.song import Song
from app.models.playlist import Playlist
from app.api.songs import format_song_response

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("")
def search(q: str = Query("", alias="q"), db: Session = Depends(get_db)):
    query_str = q.strip().lower()
    if not query_str:
        return {"songs": [], "artists": [], "albums": [], "playlists": []}

    # Search songs
    matched_songs = db.query(Song).filter(
        or_(
            Song.title.ilike(f"%{query_str}%"),
            Song.artist.ilike(f"%{query_str}%"),
            Song.album.ilike(f"%{query_str}%"),
            Song.genre.ilike(f"%{query_str}%")
        )
    ).all()

    # Artists matching
    all_songs = db.query(Song).all()
    artist_map = {}
    for s in all_songs:
        if query_str in s.artist.lower():
            artist_map[s.artist] = artist_map.get(s.artist, 0) + 1

    matched_artists = [
        {"name": name, "songCount": count}
        for name, count in artist_map.items()
    ]

    # Albums matching
    album_map = {}
    for s in all_songs:
        if query_str in s.album.lower():
            if s.album not in album_map:
                album_map[s.album] = {
                    "title": s.album,
                    "artist": s.artist,
                    "releaseYear": s.release_year,
                    "coverGradient": s.cover_gradient.split(",") if s.cover_gradient else ["#fa2d48", "#8b5cf6"]
                }
    matched_albums = list(album_map.values())

    # Playlists matching
    matched_playlists = db.query(Playlist).filter(
        Playlist.name.ilike(f"%{query_str}%")
    ).all()
    playlist_results = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "curator": p.curator,
            "gradient": p.gradient.split(",") if p.gradient else ["#fa2d48", "#ec4899"]
        }
        for p in matched_playlists
    ]

    return {
        "songs": [format_song_response(s) for s in matched_songs],
        "artists": matched_artists,
        "albums": matched_albums,
        "playlists": playlist_results
    }
