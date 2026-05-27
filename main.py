from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.generate_route import router as generate_router
from api.quizzes_route import router as quizzes_router
from api.analytics_route import router as analytics_router
from api.announcements_route import router as announcements_router
from database import Base, SessionLocal, engine, seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Teacher Hub",
    description="Backend for quiz generation, analytics, and announcements.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router, prefix="/api/v1", tags=["Quiz Generation"])
app.include_router(quizzes_router, prefix="/api/v1", tags=["Quizzes"])
app.include_router(analytics_router, prefix="/api/v1", tags=["Analytics"])
app.include_router(announcements_router, prefix="/api/v1", tags=["Announcements"])
