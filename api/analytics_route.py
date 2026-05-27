from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.models import Classroom, ClassroomMetric, TopicResult
from database.session import get_db
from schemas.analytics_schema import AnalyticsSummary, TopicPerformance

router = APIRouter()


@router.get("/analytics/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    subject: str,
    grade: str,
    section: str,
    db: Session = Depends(get_db),
):
    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.subject == subject,
            Classroom.grade == grade,
            Classroom.section == section,
        )
        .first()
    )

    if not classroom:
        return AnalyticsSummary(
            subject=subject,
            grade=grade,
            section=section,
            avg_score=0.0,
            completion_rate=0.0,
            students_count=0,
            topics=[],
        )

    metrics = db.query(ClassroomMetric).filter(ClassroomMetric.classroom_id == classroom.id).first()
    topics = db.query(TopicResult).filter(TopicResult.classroom_id == classroom.id).all()

    return AnalyticsSummary(
        subject=classroom.subject,
        grade=classroom.grade,
        section=classroom.section,
        avg_score=metrics.avg_score if metrics else 0.0,
        completion_rate=metrics.completion_rate if metrics else 0.0,
        students_count=metrics.students_count if metrics else 0,
        topics=[
            TopicPerformance(topic=t.topic, accuracy=t.accuracy, status=t.status)
            for t in topics
        ],
    )
