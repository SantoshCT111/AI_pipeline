import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.models import Quiz, QuizResult, Subject, Level
from database.session import get_db
from schemas.result_schema import (
    AnswerSubmission,
    QuizResultResponse,
    QuizResultSubmit,
    QuizResultsSummary,
)
from schemas.quiz_schema import QuizTaskSchema

router = APIRouter()


def _grade_quiz(tasks: List[QuizTaskSchema], answers: List[AnswerSubmission]) -> tuple[int, int, list]:
    """Compare student answers against correct answers. Returns (correct_count, total, details)."""
    total = len(tasks)
    correct = 0
    details = []

    # Build a lookup from question index to selected answer
    answer_map = {a.question_index: a.selected_answer for a in answers}

    for i, task in enumerate(tasks):
        selected = answer_map.get(i, "")
        is_correct = selected == task.correct_answer
        if is_correct:
            correct += 1
        details.append({
            "question_index": i,
            "question_text": task.question_text,
            "selected_answer": selected,
            "correct_answer": task.correct_answer,
            "is_correct": is_correct,
        })

    return correct, total, details


@router.post("/quiz-results", response_model=QuizResultResponse)
def submit_quiz_result(payload: QuizResultSubmit, db: Session = Depends(get_db)):
    """Student submits their answers. Backend auto-grades and stores the result."""
    quiz = db.query(Quiz).filter(Quiz.id == payload.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")

    # Parse the stored tasks
    tasks = [QuizTaskSchema(**item) for item in json.loads(quiz.tasks_json)]

    # Grade
    correct, total, details = _grade_quiz(tasks, payload.answers)
    score = (correct / total * 100) if total > 0 else 0.0

    # Save
    result = QuizResult(
        quiz_id=quiz.id,
        student_name=payload.student_name,
        score=round(score, 1),
        total_questions=total,
        correct_answers=correct,
        answers_json=json.dumps(details),
    )
    db.add(result)

    # Auto-progress levels if this quiz is linked to a specific subject level
    if quiz.level_number is not None:
        classroom = quiz.classroom
        subject = db.query(Subject).filter(Subject.name.ilike(classroom.subject)).first()
        if subject:
            level = db.query(Level).filter(Level.subject_id == subject.id, Level.level_number == quiz.level_number).first()
            if level:
                level.is_completed = True
                # Calculate stars based on score
                if score >= 90:
                    level.stars = 3
                elif score >= 70:
                    level.stars = 2
                elif score >= 50:
                    level.stars = 1
                else:
                    level.stars = 0

                # Unlock the next level
                next_level_num = quiz.level_number + 1
                next_level = db.query(Level).filter(Level.subject_id == subject.id, Level.level_number == next_level_num).first()
                if next_level:
                    next_level.is_unlocked = True

                # Progress overall subject target level if applicable
                if next_level_num > subject.level:
                    subject.level = next_level_num

    db.commit()
    db.refresh(result)

    return QuizResultResponse(
        id=result.id,
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        student_name=result.student_name,
        score=result.score,
        total_questions=result.total_questions,
        correct_answers=result.correct_answers,
        completed_at=result.completed_at,
    )


@router.get("/quiz-results/{quiz_id}", response_model=QuizResultsSummary)
def get_quiz_results(quiz_id: int, db: Session = Depends(get_db)):
    """Teacher fetches all student results for a specific quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")

    results = (
        db.query(QuizResult)
        .filter(QuizResult.quiz_id == quiz_id)
        .order_by(QuizResult.completed_at.desc())
        .all()
    )

    result_responses = [
        QuizResultResponse(
            id=r.id,
            quiz_id=r.quiz_id,
            quiz_title=quiz.title,
            student_name=r.student_name,
            score=r.score,
            total_questions=r.total_questions,
            correct_answers=r.correct_answers,
            completed_at=r.completed_at,
        )
        for r in results
    ]

    avg_score = sum(r.score for r in results) / len(results) if results else 0.0

    return QuizResultsSummary(
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        total_attempts=len(results),
        average_score=round(avg_score, 1),
        results=result_responses,
    )
