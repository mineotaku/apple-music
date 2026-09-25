from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from datetime import datetime
import uuid
from app.database import Base

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    song_id = Column(String, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "song_id", name="uq_user_song_favorite"),
    )

class PlayHistory(Base):
    __tablename__ = "play_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    song_id = Column(String, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False, index=True)
    played_at = Column(DateTime, default=datetime.utcnow, index=True)
