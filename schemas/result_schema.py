from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class AnswerSubmission(BaseModel):
    """One answer from the student for one question."""
    question_index: int
    selected_answer: str


class QuizResultSubmit(BaseModel):
    """What the mobile app sends after the student finishes a quiz."""
    quiz_id: int
    student_name: str = Field(min_length=1, max_length=128)
    answers: List[AnswerSubmission]


class QuizResultResponse(BaseModel):
    """What the teacher sees per student attempt."""
    id: int
    quiz_id: int
    quiz_title: str
    student_name: str
    score: float
    total_questions: int
    correct_answers: int
    completed_at: datetime


class QuizResultsSummary(BaseModel):
    """Aggregate results for a single quiz."""
    quiz_id: int
    quiz_title: str
    total_attempts: int
    average_score: float
    results: List[QuizResultResponse]
