from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.auth_route import get_current_user_optional
from database.models import Announcement, User
from database.session import get_db
from schemas.announcement_schema import AnnouncementCreate, AnnouncementResponse

router = APIRouter()


@router.get("/announcements", response_model=List[AnnouncementResponse])
def list_announcements(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(Announcement)
    if current_user and current_user.role == "student":
        # Filter for global OR matching grade and section
        query = query.filter(
            (Announcement.grade == None) | (Announcement.grade == "") |
            (
                (Announcement.grade == current_user.grade) &
                ((Announcement.section == None) | (Announcement.section == "") | (Announcement.section == current_user.section))
            )
        )
    rows = query.order_by(Announcement.created_at.desc()).all()
    return [
        AnnouncementResponse(
            id=row.id,
            title=row.title,
            body=row.body,
            priority=row.priority,
            grade=row.grade,
            section=row.section,
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
        grade=payload.grade,
        section=payload.section,
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
        grade=announcement.grade,
        section=announcement.section,
        read_count=announcement.read_count,
        created_at=announcement.created_at,
    )
