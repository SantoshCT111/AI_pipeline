from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "student"
    grade: Optional[str] = None
    section: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    grade: Optional[str] = None
    section: Optional[str] = None
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    user: UserResponse
