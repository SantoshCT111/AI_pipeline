import os

from dotenv import load_dotenv
from openai import OpenAI

from generation.prompts import SYSTEM_PROMPT
from schemas.task_schema import LessonQuiz

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY is not set. Add it to a .env file or set the environment variable."
    )

client = OpenAI(api_key=OPENAI_API_KEY)


def generate_quiz_from_text(text_chunk: str) -> LessonQuiz:
    """Generate a structured quiz from lesson text using the OpenAI API."""
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Create a quiz based on this text:\n\n{text_chunk}"},
        ],
        response_format=LessonQuiz,
    )
    quiz = completion.choices[0].message.parsed
    if quiz is None:
        raise RuntimeError("The model did not return a valid quiz.")
    return quiz
