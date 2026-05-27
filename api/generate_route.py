import os
import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, UploadFile

from extraction.pdf_extraction import extract_pdf_text
from generation.engine import generate_quiz_from_text
from schemas.generate_schema import TextInput

router = APIRouter()


@router.post("/generate-quiz/from-pdf")
async def generate_quiz_from_pdf(file: UploadFile = File(...)):
    """Extract text from a PDF and generate a quiz."""
    suffix = Path(file.filename or "upload.pdf").suffix or ".pdf"
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        text_chunks = extract_pdf_text(temp_path)
        return generate_quiz_from_text("\n".join(text_chunks))
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/generate-quiz/from-text")
async def generate_quiz_from_text_endpoint(text_input: TextInput):
    """Generate a quiz from raw lesson text."""
    return generate_quiz_from_text(text_input.raw_text)
