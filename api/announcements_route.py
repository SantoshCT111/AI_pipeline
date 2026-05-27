from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.models import Announcement
from database.session import get_db
from schemas.announcement_schema import AnnouncementCreate, AnnouncementResponse

router = APIRouter()


@router.get("/announcements", response_model=List[AnnouncementResponse])
def list_announcements(db: Session = Depends(get_db)):
    rows = db.query(Announcement).order_by(Announcement.created_at.desc()).all()
    return [
        AnnouncementResponse(
            id=row.id,
            title=row.title,
            body=row.body,
            priority=row.priority,
            read_count=row.read_count,
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.post("/announcements", response_model=AnnouncementResponse)
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db)):
    announcement = Announcement(
        title=payload.title,
        body=payload.body,
        priority=payload.priority,
        read_count=0,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        body=announcement.body,
        priority=announcement.priority,
        read_count=announcement.read_count,
        created_at=announcement.created_at,
    )
