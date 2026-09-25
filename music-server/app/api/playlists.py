from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.playlist import Playlist, PlaylistSong
from app.models.song import Song

router = APIRouter(prefix="/api/playlists", tags=["playlists"])

class CreatePlaylist(BaseModel):
    name: str
    description: Optional[str] = "Curated user collection"

class AddSongToPlaylist(BaseModel):
    songId: str

def format_playlist(p: Playlist, db: Session) -> dict:
    ps = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == p.id).order_by(PlaylistSong.position).all()
    song_ids = [item.song_id for item in ps]
    gradients = p.gradient.split(",") if p.gradient else ["#fa2d48", "#ec4899"]
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "curator": p.curator or "You",
        "gradient": gradients,
        "songIds": song_ids
    }

@router.get("")
def list_playlists(db: Session = Depends(get_db)):
    playlists = db.query(Playlist).order_by(Playlist.created_at.desc()).all()
    return [format_playlist(p, db) for p in playlists]

@router.get("/{playlist_id}")
def get_playlist(playlist_id: str, db: Session = Depends(get_db)):
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return format_playlist(p, db)

@router.post("")
def create_playlist(payload: CreatePlaylist, db: Session = Depends(get_db)):
    import uuid
    new_p = Playlist(
        id=f"playlist-{int(uuid.uuid4().int % 100000000)}",
        name=payload.name,
        description=payload.description,
        curator="You",
        gradient="#fa2d48,#ec4899"
    )
    db.add(new_p)
    db.commit()
    db.refresh(new_p)
    return format_playlist(new_p, db)

@router.post("/{playlist_id}/songs")
def add_song(playlist_id: str, payload: AddSongToPlaylist, db: Session = Depends(get_db)):
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Playlist not found")

    song = db.query(Song).filter(Song.id == payload.songId).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    exists = db.query(PlaylistSong).filter(
        PlaylistSong.playlist_id == playlist_id,
        PlaylistSong.song_id == payload.songId
    ).first()
    if not exists:
        count = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).count()
        ps = PlaylistSong(playlist_id=playlist_id, song_id=payload.songId, position=count)
        db.add(ps)
        db.commit()

    return format_playlist(p, db)

@router.delete("/{playlist_id}/songs/{song_id}")
def remove_song(playlist_id: str, song_id: str, db: Session = Depends(get_db)):
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Playlist not found")

    db.query(PlaylistSong).filter(
        PlaylistSong.playlist_id == playlist_id,
        PlaylistSong.song_id == song_id
    ).delete()
    db.commit()
    return format_playlist(p, db)
