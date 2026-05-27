from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.models import Level, Subject
from database.session import get_db
from schemas.subject_schema import SubjectCreate, SubjectResponse, LevelCreate

router = APIRouter()


@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(db: Session = Depends(get_db)):
    subjects = db.query(Subject).all()
    # Sort levels by level_number
    for subject in subjects:
        subject.levels.sort(key=lambda x: x.level_number)
    return subjects


@router.post("/subjects", response_model=SubjectResponse)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db)):
    # Check if subject with this name already exists
    existing = db.query(Subject).filter(Subject.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject with this name already exists.")

    subject = Subject(
        name=payload.name,
        emoji=payload.emoji,
        color=payload.color,
        shadow_color=payload.shadow_color,
        level=payload.level,
    )
    db.add(subject)
    db.flush()  # populate subject.id

    for idx, lvl in enumerate(payload.levels):
        level = Level(
            subject_id=subject.id,
            level_number=idx + 1,
            title=lvl.title,
            is_unlocked=lvl.is_unlocked,
            is_completed=lvl.is_completed,
            stars=lvl.stars,
        )
        db.add(level)

    db.commit()
    db.refresh(subject)
    subject.levels.sort(key=lambda x: x.level_number)
    return subject


@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    db.delete(subject)
    db.commit()
    return {"message": f"Subject '{subject.name}' deleted successfully."}


@router.put("/subjects/{subject_id}/levels", response_model=SubjectResponse)
def update_subject_levels(subject_id: int, levels_payload: List[LevelCreate], db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    # Remove all existing levels
    db.query(Level).filter(Level.subject_id == subject.id).delete()

    # Re-insert the new levels
    for idx, lvl in enumerate(levels_payload):
        level = Level(
            subject_id=subject.id,
            level_number=idx + 1,
            title=lvl.title,
            is_unlocked=lvl.is_unlocked,
            is_completed=lvl.is_completed,
            stars=lvl.stars,
        )
        db.add(level)

    db.commit()
    db.refresh(subject)
    subject.levels.sort(key=lambda x: x.level_number)
    return subject
