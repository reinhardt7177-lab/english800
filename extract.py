import json
import re

def extract_words():
    # We will try to parse using PyMuPDF if installed, else fallback
    try:
        import fitz
    except ImportError:
        print("Please install PyMuPDF (pip install pymupdf)")
        return
        
    doc = fitz.open("교육부지정 초등영단어 800원본.pdf")
    text = ""
    for page in doc:
        text += page.get_text()
        
    # Example minimal parsing: assuming words and meanings are somehow paired.
    # We will just dump text first to see the format before making the final words.json
    with open('extracted_text.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    
    print("Parsed raw text to extracted_text.txt. Please verify the format before generating JSON.")

if __name__ == "__main__":
    extract_words()
