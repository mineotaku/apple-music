from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Table
from datetime import datetime
import uuid
from app.database import Base

class PlaylistSong(Base):
    __tablename__ = "playlist_songs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    playlist_id = Column(String, ForeignKey("playlists.id", ondelete="CASCADE"), nullable=False, index=True)
    song_id = Column(String, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False, index=True)
    position = Column(Integer, default=0)
    added_at = Column(DateTime, default=datetime.utcnow)

class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    curator = Column(String, default="You")
    gradient = Column(String, default="#fa2d48,#ec4899")
    created_at = Column(DateTime, default=datetime.utcnow)
