from sqlalchemy.orm import Session

from database.models import Announcement, Classroom, ClassroomMetric, TopicResult


def seed_database(db: Session) -> None:
    if db.query(Classroom).first():
        return

    classrooms_data = [
        {
            "subject": "Mathematics",
            "grade": "Grade 8",
            "section": "Section B",
            "metrics": {"avg_score": 78.0, "completion_rate": 92.0, "students_count": 28},
            "topics": [
                {"topic": "Fractions", "accuracy": 61.0, "status": "Needs review"},
                {"topic": "Geometry", "accuracy": 84.0, "status": "Stable"},
                {"topic": "Word problems", "accuracy": 73.0, "status": "Improving"},
            ],
        },
        {
            "subject": "Science",
            "grade": "Grade 8",
            "section": "Section A",
            "metrics": {"avg_score": 82.0, "completion_rate": 88.0, "students_count": 26},
            "topics": [
                {"topic": "Cells", "accuracy": 79.0, "status": "Stable"},
                {"topic": "Energy", "accuracy": 68.0, "status": "Improving"},
            ],
        },
        {
            "subject": "English",
            "grade": "Grade 7",
            "section": "Section C",
            "metrics": {"avg_score": 74.0, "completion_rate": 85.0, "students_count": 24},
            "topics": [
                {"topic": "Reading comprehension", "accuracy": 71.0, "status": "Improving"},
                {"topic": "Grammar", "accuracy": 66.0, "status": "Needs review"},
            ],
        },
    ]

    for item in classrooms_data:
        classroom = Classroom(
            subject=item["subject"],
            grade=item["grade"],
            section=item["section"],
        )
        db.add(classroom)
        db.flush()

        db.add(
            ClassroomMetric(
                classroom_id=classroom.id,
                **item["metrics"],
            )
        )

        for topic in item["topics"]:
            db.add(TopicResult(classroom_id=classroom.id, **topic))

    announcements = [
        {
            "title": "Field Trip Permission Slips",
            "body": "Please ensure all permission slips for the science museum trip on Friday are signed and returned by Wednesday.",
            "priority": "Normal",
            "read_count": 42,
        },
        {
            "title": "Parent-Teacher Conference Schedule",
            "body": "The spring parent-teacher conferences will be held next week. Please book your preferred time slot through the school portal.",
            "priority": "Important",
            "read_count": 67,
        },
        {
            "title": "School Closure - Weather Alert",
            "body": "Due to the severe weather forecast, school will be closed tomorrow. All classes will move to online learning.",
            "priority": "Urgent",
            "read_count": 89,
        },
    ]

    for item in announcements:
        db.add(Announcement(**item))

    db.commit()
