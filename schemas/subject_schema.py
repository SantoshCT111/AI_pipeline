from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class LevelSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    level_number: int
    title: str
    is_unlocked: bool
    is_completed: bool
    stars: int


class SubjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    emoji: str
    color: str
    shadow_color: str
    level: int
    levels: List[LevelSchema]


class LevelCreate(BaseModel):
    title: str
    is_unlocked: bool = True
    is_completed: bool = False
    stars: int = 0


class SubjectCreate(BaseModel):
    name: str
    emoji: str
    color: str
    shadow_color: str
    level: int = 1
    levels: List[LevelCreate]
