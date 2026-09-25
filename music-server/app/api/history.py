from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.favorite import PlayHistory
from app.models.song import Song

router = APIRouter(prefix="/api/history", tags=["history"])

class HistoryLog(BaseModel):
    songId: str

@router.get("")
def get_play_history(db: Session = Depends(get_db)):
    records = db.query(PlayHistory).order_by(PlayHistory.played_at.desc()).limit(50).all()
    return [{"songId": r.song_id, "playedAt": r.played_at.isoformat()} for r in records]

@router.post("")
def record_play(payload: HistoryLog, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == payload.songId).first()
    if song:
        song.plays += 1
        entry = PlayHistory(user_id="usr_apple_id_882", song_id=payload.songId, played_at=datetime.utcnow())
        db.add(entry)
        db.commit()
    return {"success": True}
