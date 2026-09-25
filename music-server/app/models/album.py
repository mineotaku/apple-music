from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from datetime import datetime
import uuid
from app.database import Base

class Album(Base):
    __tablename__ = "albums"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, index=True, nullable=False)
    artist_id = Column(String, ForeignKey("artists.id"), nullable=False)
    artist_name = Column(String, nullable=False)
    cover_url = Column(String, nullable=True)
    cover_gradient = Column(String, default="#fa2d48,#8b5cf6") # Comma-separated hex for Apple Music gradients
    release_year = Column(Integer, default=2026)
    genre = Column(String, default="Pop")
    created_at = Column(DateTime, default=datetime.utcnow)
