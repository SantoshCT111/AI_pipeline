from pydantic import BaseModel, Field


class TextInput(BaseModel):
    raw_text: str = Field(min_length=1)
