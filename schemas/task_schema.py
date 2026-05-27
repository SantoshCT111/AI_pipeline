from typing import List, Literal

from pydantic import BaseModel, Field


class QuizTask(BaseModel):
    question_type: Literal["multiple_choice", "true_false"]
    question_text: str
    options: List[str]
    correct_answer: str
    explanation: str
    xp_reward: int = Field(ge=10, le=100, description="Points awarded between 10 and 100")


class LessonQuiz(BaseModel):
    tasks: List[QuizTask]
