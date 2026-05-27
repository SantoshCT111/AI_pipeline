import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.models import Classroom, Quiz
from database.session import get_db
from schemas.quiz_schema import QuizPublishRequest, QuizResponse, QuizTaskSchema

router = APIRouter()


def _get_or_create_classroom(db: Session, subject: str, grade: str, section: str) -> Classroom:
    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.subject == subject,
            Classroom.grade == grade,
            Classroom.section == section,
        )
        .first()
    )
    if classroom:
        return classroom

    classroom = Classroom(subject=subject, grade=grade, section=section)
    db.add(classroom)
    db.flush()
    return classroom


@router.post("/quizzes", response_model=QuizResponse)
def publish_quiz(payload: QuizPublishRequest, db: Session = Depends(get_db)):
    classroom = _get_or_create_classroom(db, payload.subject, payload.grade, payload.section)

    quiz = Quiz(
        title=payload.title,
        classroom_id=classroom.id,
        tasks_json=json.dumps([task.model_dump() for task in payload.tasks]),
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        subject=classroom.subject,
        grade=classroom.grade,
        section=classroom.section,
        tasks=payload.tasks,
        published_at=quiz.published_at,
    )


@router.get("/quizzes", response_model=List[QuizResponse])
def list_quizzes(
    subject: Optional[str] = None,
    grade: Optional[str] = None,
    section: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Quiz).join(Classroom)

    if subject:
        query = query.filter(Classroom.subject == subject)
    if grade:
        query = query.filter(Classroom.grade == grade)
    if section:
        query = query.filter(Classroom.section == section)

    quizzes = query.order_by(Quiz.published_at.desc()).all()
    results: List[QuizResponse] = []

    for quiz in quizzes:
        classroom = quiz.classroom
        tasks = [QuizTaskSchema(**item) for item in json.loads(quiz.tasks_json)]
        results.append(
            QuizResponse(
                id=quiz.id,
                title=quiz.title,
                subject=classroom.subject,
                grade=classroom.grade,
                section=classroom.section,
                tasks=tasks,
                published_at=quiz.published_at,
            )
        )

    return results
