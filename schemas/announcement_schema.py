from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

AnnouncementPriority = Literal["Normal", "Important", "Urgent"]


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=256)
    body: str = Field(min_length=1)
    priority: AnnouncementPriority = "Normal"
    grade: Optional[str] = None
    section: Optional[str] = None


class AnnouncementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    body: str
    priority: str
    grade: Optional[str] = None
    section: Optional[str] = None
    read_count: int
    created_at: datetime
