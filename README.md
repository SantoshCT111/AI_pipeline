# Teacher Hub

AI workspace for teachers: generate quizzes from lessons, review class analytics, and send parent announcements.

## Stack

- **Backend:** FastAPI, SQLAlchemy, SQLite, OpenAI
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui

## Setup

### 1. Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```
OPENAI_API_KEY=your_key_here
```

Start the API:

```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the dev server proxies `/api` to the backend.

## API overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/generate-quiz/from-text` | Generate quiz from text |
| `POST /api/v1/generate-quiz/from-pdf` | Generate quiz from PDF |
| `POST /api/v1/quizzes` | Publish quiz to a class |
| `GET /api/v1/analytics/summary` | Classroom metrics |
| `GET /api/v1/announcements` | List announcements |
| `POST /api/v1/announcements` | Create announcement |

SQLite database `teacher_hub.db` is created automatically with seed data on first run.
