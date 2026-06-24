import os
import logging
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.exc import OperationalError

logger = logging.getLogger(__name__)

# Load .env so DATABASE_URL is available
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Use Supabase PostgreSQL if DATABASE_URL is set, otherwise fall back to local SQLite
_FALLBACK_SQLITE = f"sqlite:///{Path(__file__).resolve().parent.parent / 'teacher_hub.db'}"
DATABASE_URL = os.getenv("DATABASE_URL", _FALLBACK_SQLITE)

def _init_engine_and_session(url: str):
    is_sqlite = url.startswith("sqlite")
    eng = create_engine(
        url,
        connect_args={"check_same_thread": False} if is_sqlite else {},
        pool_pre_ping=True,  # auto-reconnect on stale connections
    )
    session = sessionmaker(autocommit=False, autoflush=False, bind=eng)
    return eng, session

try:
    # Attempt to initialize database engine and test the connection
    engine, SessionLocal = _init_engine_and_session(DATABASE_URL)
    with engine.connect() as conn:
        pass
except Exception as e:
    # If connection fails (e.g. database host down, invalid credentials, pooler issue),
    # log a warning and fall back to local SQLite so the application does not crash on startup.
    logger.warning(
        f"Failed to connect to configured DATABASE_URL. Falling back to SQLite. Error: {e}"
    )
    DATABASE_URL = _FALLBACK_SQLITE
    engine, SessionLocal = _init_engine_and_session(DATABASE_URL)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
