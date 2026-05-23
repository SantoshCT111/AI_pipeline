from openai import OpenAI
from schemas.task_schema import LessonQuiz
from generation.prompts import SYSTEM_PROMPT
import os
from dotenv import load_dotenv


# Load environment variables from .env (if present)
load_dotenv()

# Read OpenAI API key from environment
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY is not set. Add it to a .env file or set the environment variable."
    )

# Initialize OpenAI client using the key from the environment
client = OpenAI(api_key=OPENAI_API_KEY)


def generate_quiz_from_text(text_chunk: str) -> LessonQuiz:
    """
        it will get use the text chunk and pass it to the model and it will return the quiztask in 
        a format that have defined as a qiuztask
    """

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages = [
            {"role":"system","content":SYSTEM_PROMPT},
            {"role":"user","content":f"create a quiz based on this text: \n\n{text_chunk}"}
        ],
        response_format=LessonQuiz
    )
    validated_quiz = completion.choices[0].message.parsed

    return validated_quiz
