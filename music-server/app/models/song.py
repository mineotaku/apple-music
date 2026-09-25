from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from datetime import datetime
import uuid
from app.database import Base

class Song(Base):
    __tablename__ = "songs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, index=True, nullable=False)
    artist = Column(String, index=True, nullable=False)
    artist_id = Column(String, index=True, nullable=True)
    album = Column(String, index=True, default="Single")
    album_id = Column(String, index=True, nullable=True)
    storage_key = Column(String, nullable=True)
    file_path = Column(String, nullable=True) # local file or S3 object key
    duration = Column(Integer, default=180) # in seconds
    file_size = Column(Integer, default=0)
    mime_type = Column(String, default="audio/wav")
    release_year = Column(Integer, default=2026)
    genre = Column(String, default="Electronic")
    bitrate = Column(String, default="24-bit / 96kHz ALAC")
    codec = Column(String, default="Apple Lossless")
    is_lossless = Column(Boolean, default=True)
    is_dolby_atmos = Column(Boolean, default=True)
    is_apple_digital_master = Column(Boolean, default=True)
    cover_gradient = Column(String, default="#fa2d48,#8b5cf6")
    plays = Column(Integer, default=0)
    lyrics = Column(Text, nullable=True) # JSON serialized timestamped lyrics
    created_at = Column(DateTime, default=datetime.utcnow)
