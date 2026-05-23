
from typing import List
import fitz



def pdf_extraction(file_path: str) -> List[str]:
    """
        Extracts the text from pdf 
        return the text a strings in a list 
    """

    #open the file
    document = fitz.open(file_path)

    #List to return
    text_list :List[str] = []
    for page in document:
        text_list.append(page.get_text())
    "[page.get_text() for page in document] this is list comphrension"

    return text_list

