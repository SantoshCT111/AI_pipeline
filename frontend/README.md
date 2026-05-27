# Teacher Hub — Frontend

React + Vite + Tailwind CSS + shadcn/ui.

## Development

1. Start the API from the repo root:

```bash
uvicorn main:app --reload --port 8000
```

2. Start the frontend:

```bash
npm install
npm run dev
```

The dev server proxies `/api` to `http://127.0.0.1:8000`.

Optional: set `VITE_API_URL` in `.env` for a custom API base (e.g. production).

## Build

```bash
npm run build
npm run preview
```

## Pages

- **AI Forge** — Generate quizzes from PDF or text, edit, publish to a class
- **Analytics** — Classroom performance and topic breakdown
- **Messages** — Parent announcements with live preview
