"""AI Chat endpoint – replaces dummy chat on Analytics & Comms pages."""

import json
import re
import logging

from fastapi import APIRouter, HTTPException

from generation.engine import client  # reuse existing OpenAI client
from generation.ai_chat_prompts import (
    ANALYTICS_CHAT_SYSTEM_PROMPT,
    COMMS_CHAT_SYSTEM_PROMPT,
)
from schemas.ai_chat_schema import (
    AIChatRequest,
    AIChatResponse,
    DraftAction,
)

router = APIRouter()
logger = logging.getLogger(__name__)


def _build_analytics_context_text(req: AIChatRequest) -> str:
    """Serialize analytics data into a readable text block for the system prompt."""
    ctx = req.analytics_context
    if not ctx:
        return "Keine Klassendaten geladen."

    lines = [
        f"Fach: {ctx.subject}",
        f"Klasse: {ctx.grade}, Gruppe: {ctx.section}",
        f"Durchschnittsnote: {ctx.avg_score:.1f}%",
        f"Abschlussquote: {ctx.completion_rate:.1f}%",
        f"Anzahl Schüler: {ctx.students_count}",
    ]

    if ctx.topics:
        lines.append("\nThemen:")
        for t in ctx.topics:
            lines.append(f"  - {t.get('topic', '?')}: Genauigkeit {t.get('accuracy', 0):.0f}%, Status: {t.get('status', '?')}")

    if ctx.recent_quizzes:
        lines.append("\nKürzlich durchgeführte Quizze:")
        for q in ctx.recent_quizzes:
            lines.append(f"  - {q.get('title', '?')} (Stufe {q.get('level_number', '—')}, erstellt am {q.get('created_at', '?')})")

    return "\n".join(lines)


def _build_comms_context_text(req: AIChatRequest) -> str:
    """Serialize announcements into a readable text block for the system prompt."""
    ctx = req.comms_context
    if not ctx or not ctx.announcements:
        return "Keine Ankündigungen vorhanden."

    lines = ["Aktuelle Ankündigungen:"]
    for a in ctx.announcements:
        lines.append(
            f"  - [{a.get('priority', 'Normal')}] \"{a.get('title', '?')}\" "
            f"(Stufe: {a.get('grade', 'Alle')}, Klasse: {a.get('section', 'Alle')}, "
            f"erstellt: {a.get('created_at', '?')})\n"
            f"    Inhalt: {(a.get('body', '') or '')[:200]}"
        )
    return "\n".join(lines)


def _parse_draft_block(text: str) -> tuple[str, DraftAction | None]:
    """Extract a ---DRAFT--- block from the AI response if present."""
    pattern = r"---DRAFT---\s*\n(.*?)\n---END_DRAFT---"
    match = re.search(pattern, text, re.DOTALL)
    if not match:
        return text.strip(), None

    # Remove the draft block from the visible reply
    clean_reply = text[: match.start()].strip()

    block = match.group(1)
    title = ""
    body = ""
    priority = "Normal"

    title_match = re.search(r"TITLE:\s*(.+?)(?:\n|$)", block)
    if title_match:
        title = title_match.group(1).strip()

    # BODY can be multi-line — capture everything between BODY: and PRIORITY:
    body_match = re.search(r"BODY:\s*(.*?)(?=\nPRIORITY:|\Z)", block, re.DOTALL)
    if body_match:
        body = body_match.group(1).strip()

    priority_match = re.search(r"PRIORITY:\s*(.+?)(?:\n|$)", block)
    if priority_match:
        priority = priority_match.group(1).strip()

    return clean_reply, DraftAction(type="draft", title=title, body=body, priority=priority)


@router.post("/ai/chat", response_model=AIChatResponse)
def ai_chat(req: AIChatRequest):
    """Handle an AI chat message using OpenAI GPT-4o with injected context."""

    # 1. Choose system prompt and build context
    if req.context_type == "analytics":
        system_prompt = ANALYTICS_CHAT_SYSTEM_PROMPT
        context_text = _build_analytics_context_text(req)
    else:
        system_prompt = COMMS_CHAT_SYSTEM_PROMPT
        context_text = _build_comms_context_text(req)

    # 2. Build messages array
    messages = [
        {"role": "system", "content": f"{system_prompt}\n\nAKTUELLE DATEN:\n{context_text}"},
    ]

    # Add conversation history (map 'ai' → 'assistant')
    for msg in req.history:
        role = "assistant" if msg.role == "ai" else "user"
        messages.append({"role": role, "content": msg.content})

    # Add current user message
    messages.append({"role": "user", "content": req.message})

    # 3. Call OpenAI
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=messages,
            max_tokens=600,
            temperature=0.7,
        )
        raw_reply = completion.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"OpenAI chat error: {e}")
        raise HTTPException(
            status_code=502,
            detail="KI-Dienst ist gerade nicht erreichbar. Bitte versuche es später erneut.",
        )

    # 4. Parse optional draft action from comms responses
    if req.context_type == "comms":
        reply, action = _parse_draft_block(raw_reply)
    else:
        reply = raw_reply.strip()
        action = None

    return AIChatResponse(reply=reply, action=action)
