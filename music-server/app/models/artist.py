from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
import uuid
from app.database import Base

class Artist(Base):
    __tablename__ = "artists"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True, nullable=False)
    image_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
