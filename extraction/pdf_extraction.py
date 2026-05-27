import fitz


def extract_pdf_text(file_path: str) -> list[str]:
    """Extract text from each page of a PDF."""
    document = fitz.open(file_path)
    try:
        return [page.get_text() for page in document]
    finally:
        document.close()
