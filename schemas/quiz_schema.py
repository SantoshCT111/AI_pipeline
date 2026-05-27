from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel, ConfigDict, Field


class QuizTaskSchema(BaseModel):
    question_type: Literal["multiple_choice", "true_false"]
    question_text: str
    options: List[str]
    correct_answer: str
    explanation: str
    xp_reward: int = Field(ge=10, le=100)


class QuizPublishRequest(BaseModel):
    title: str = Field(min_length=1, max_length=256)
    subject: str
    grade: str
    section: str
    level_number: int | None = None
    tasks: List[QuizTaskSchema]


class QuizResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    subject: str
    grade: str
    section: str
    level_number: int | None = None
    tasks: List[QuizTaskSchema]
    published_at: datetime
