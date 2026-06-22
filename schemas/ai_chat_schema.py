from typing import Literal, Optional

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: Literal["user", "ai"]
    content: str


class AnalyticsContext(BaseModel):
    """Summary data currently visible on the analytics page."""
    subject: str = ""
    grade: str = ""
    section: str = ""
    avg_score: float = 0.0
    completion_rate: float = 0.0
    students_count: int = 0
    topics: list[dict] = []          # [{topic, accuracy, status}, …]
    recent_quizzes: list[dict] = []   # [{title, level_number, created_at}, …]


class CommsContext(BaseModel):
    """Announcements currently visible on the comms page."""
    announcements: list[dict] = []   # [{title, body, priority, grade, section, created_at}, …]


class AIChatRequest(BaseModel):
    message: str
    context_type: Literal["analytics", "comms"]
    history: list[ChatMessage] = []
    analytics_context: Optional[AnalyticsContext] = None
    comms_context: Optional[CommsContext] = None


class DraftAction(BaseModel):
    """Optional action the AI can trigger — e.g. auto-fill the compose form."""
    type: Literal["draft"]
    title: str = ""
    body: str = ""
    priority: str = "Normal"


class AIChatResponse(BaseModel):
    reply: str
    action: Optional[DraftAction] = None
