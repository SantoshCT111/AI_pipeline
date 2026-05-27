from typing import List

from pydantic import BaseModel


class TopicPerformance(BaseModel):
    topic: str
    accuracy: float
    status: str


class AnalyticsSummary(BaseModel):
    subject: str
    grade: str
    section: str
    avg_score: float
    completion_rate: float
    students_count: int
    topics: List[TopicPerformance]
