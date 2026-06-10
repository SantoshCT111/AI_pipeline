import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Load .env so DATABASE_URL is available
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Use Supabase PostgreSQL if DATABASE_URL is set, otherwise fall back to local SQLite
_FALLBACK_SQLITE = f"sqlite:///{Path(__file__).resolve().parent.parent / 'teacher_hub.db'}"
DATABASE_URL = os.getenv("DATABASE_URL", _FALLBACK_SQLITE)

_is_sqlite = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    pool_pre_ping=True,  # auto-reconnect on stale connections (important for cloud DBs)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
