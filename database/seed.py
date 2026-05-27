from sqlalchemy.orm import Session

from database.models import Announcement, Classroom, ClassroomMetric, TopicResult, Subject, Level


def seed_database(db: Session) -> None:
    if db.query(Classroom).first():
        return

    classrooms_data = [
        {
            "subject": "Mathe",
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
            "subject": "Natur",
            "grade": "Grade 8",
            "section": "Section A",
            "metrics": {"avg_score": 82.0, "completion_rate": 88.0, "students_count": 26},
            "topics": [
                {"topic": "Cells", "accuracy": 79.0, "status": "Stable"},
                {"topic": "Energy", "accuracy": 68.0, "status": "Improving"},
            ],
        },
        {
            "subject": "Sprache",
            "grade": "Grade 7",
            "section": "Section C",
            "metrics": {"avg_score": 74.0, "completion_rate": 85.0, "students_count": 24},
            "topics": [
                {"topic": "Reading comprehension", "accuracy": 71.0, "status": "Improving"},
                {"topic": "Grammar", "accuracy": 66.0, "status": "Needs review"},
            ],
        },
        {
            "subject": "Kunst",
            "grade": "Grade 8",
            "section": "Section B",
            "metrics": {"avg_score": 85.0, "completion_rate": 90.0, "students_count": 20},
            "topics": [
                {"topic": "Color theory", "accuracy": 88.0, "status": "Stable"},
                {"topic": "Drawing basics", "accuracy": 82.0, "status": "Stable"},
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

    # Seed dynamic subjects & levels
    if not db.query(Subject).first():
        subjects_data = [
            {
                "name": "Sprache",
                "emoji": "📖",
                "color": "#1CB0F6",
                "shadow_color": "#1480B3",
                "level": 1,
                "levels": [
                    "Buchstaben A-E",
                    "Buchstaben F-J",
                    "Buchstaben K-O",
                    "Buchstaben P-T",
                    "Buchstaben U-Z",
                ]
            },
            {
                "name": "Mathe",
                "emoji": "🔢",
                "color": "#FF4B4B",
                "shadow_color": "#C73A3A",
                "level": 7,
                "levels": [
                    "Zahlen 1-10",
                    "Addition",
                    "Subtraktion",
                    "Multiplikation",
                    "Division",
                    "Brüche",
                    "Geometrie",
                    "Algebra",
                ]
            },
            {
                "name": "Natur",
                "emoji": "🌿",
                "color": "#58CC02",
                "shadow_color": "#46A302",
                "level": 3,
                "levels": [
                    "Pflanzen",
                    "Tiere",
                    "Wetter",
                    "Erde & Weltraum",
                    "Ökosysteme",
                ]
            },
            {
                "name": "Kunst",
                "emoji": "🎨",
                "color": "#CE82FF",
                "shadow_color": "#A366CC",
                "level": 5,
                "levels": [
                    "Grundfarben",
                    "Formen zeichnen",
                    "Muster & Texturen",
                    "Landschaften",
                    "Porträts",
                    "Abstrakte Kunst",
                ]
            }
        ]

        for s_item in subjects_data:
            subject = Subject(
                name=s_item["name"],
                emoji=s_item["emoji"],
                color=s_item["color"],
                shadow_color=s_item["shadow_color"],
                level=s_item["level"],
            )
            db.add(subject)
            db.flush()

            for idx, lvl_title in enumerate(s_item["levels"]):
                level = Level(
                    subject_id=subject.id,
                    level_number=idx + 1,
                    title=lvl_title,
                    is_unlocked=(idx + 1 <= s_item["level"]),
                    is_completed=(idx + 1 < s_item["level"]),
                    stars=3 if (idx + 1 < s_item["level"]) else 0
                )
                db.add(level)

    db.commit()
