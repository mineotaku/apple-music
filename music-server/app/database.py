import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Default to SQLite for zero-config local run, supports PostgreSQL via DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./music_platform.db")

# Fix for postgres:// prefix if provided by older PaaS platforms
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    # Test connection immediately
    with engine.connect() as conn:
        pass
    print("Database connected successfully.")
except Exception as e:
    print(f"Notice: PostgreSQL connection error ({e}). Falling back to local SQLite database.")
    DATABASE_URL = "sqlite:///./music_platform.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
