from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.favorite import Favorite
from app.models.song import Song

router = APIRouter(tags=["favorites"])

@router.get("/api/favorites")
def get_favorites(db: Session = Depends(get_db)):
    favs = db.query(Favorite).all()
    return [f.song_id for f in favs]

@router.post("/api/songs/{song_id}/favorite")
def toggle_favorite(song_id: str, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    user_id = "usr_apple_id_882"
    existing = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.song_id == song_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"isFavorite": False, "songId": song_id}
    else:
        new_fav = Favorite(user_id=user_id, song_id=song_id)
        db.add(new_fav)
        db.commit()
        return {"isFavorite": True, "songId": song_id}
