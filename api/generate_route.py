from fastapi import APIRouter, UploadFile, File
import shutil
import os


from extraction.pdf_extraction import pdf_extraction
from generation.engine import generate_quiz_from_text

router = APIRouter()

# 2. Define the route using @router instead of @app
@router.post("/generate-quiz/")
async def generate_quiz(file: UploadFile = File(...)):
    """
    Receives a PDF, extracts text, generates a quiz, and cleans up.
    """
    temp_file_path = f"temp_{file.filename}"
    
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        text_chunks = pdf_extraction(temp_file_path)
        complete_text = "\n".join(text_chunks)
        final_quiz = generate_quiz_from_text(complete_text)
        return final_quiz
        
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)