from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.session import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Classroom(Base):
    __tablename__ = "classrooms"
    __table_args__ = (UniqueConstraint("subject", "grade", "section", name="uq_classroom"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    subject: Mapped[str] = mapped_column(String(64), nullable=False)
    grade: Mapped[str] = mapped_column(String(32), nullable=False)
    section: Mapped[str] = mapped_column(String(32), nullable=False)

    metrics: Mapped["ClassroomMetric | None"] = relationship(back_populates="classroom", uselist=False)
    topic_results: Mapped[list["TopicResult"]] = relationship(back_populates="classroom")
    quizzes: Mapped[list["Quiz"]] = relationship(back_populates="classroom")


class ClassroomMetric(Base):
    __tablename__ = "classroom_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    classroom_id: Mapped[int] = mapped_column(ForeignKey("classrooms.id"), unique=True, nullable=False)
    avg_score: Mapped[float] = mapped_column(Float, default=0.0)
    completion_rate: Mapped[float] = mapped_column(Float, default=0.0)
    students_count: Mapped[int] = mapped_column(Integer, default=0)

    classroom: Mapped["Classroom"] = relationship(back_populates="metrics")


class TopicResult(Base):
    __tablename__ = "topic_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    classroom_id: Mapped[int] = mapped_column(ForeignKey("classrooms.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String(128), nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)

    classroom: Mapped["Classroom"] = relationship(back_populates="topic_results")


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    classroom_id: Mapped[int] = mapped_column(ForeignKey("classrooms.id"), nullable=False)
    tasks_json: Mapped[str] = mapped_column(Text, nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    classroom: Mapped["Classroom"] = relationship(back_populates="quizzes")


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(16), nullable=False, default="Normal")
    read_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
