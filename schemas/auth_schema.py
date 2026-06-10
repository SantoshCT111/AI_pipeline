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


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    user: UserResponse
