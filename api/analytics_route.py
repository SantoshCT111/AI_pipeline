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
        raise HTTPException(status_code=404, detail="No data found for this classroom.")

    metrics = db.query(ClassroomMetric).filter(ClassroomMetric.classroom_id == classroom.id).first()
    topics = db.query(TopicResult).filter(TopicResult.classroom_id == classroom.id).all()

    if not metrics:
        raise HTTPException(status_code=404, detail="Metrics not available for this classroom.")

    return AnalyticsSummary(
        subject=classroom.subject,
        grade=classroom.grade,
        section=classroom.section,
        avg_score=metrics.avg_score,
        completion_rate=metrics.completion_rate,
        students_count=metrics.students_count,
        topics=[
            TopicPerformance(topic=t.topic, accuracy=t.accuracy, status=t.status)
            for t in topics
        ],
    )
