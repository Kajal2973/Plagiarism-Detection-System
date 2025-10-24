from difflib import SequenceMatcher

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def read_file(filepath):
    ext = filepath.rsplit('.', 1)[1].lower()
    
    if ext == 'txt':
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    elif ext == 'pdf':
        try:
            import PyPDF2
            with open(filepath, 'rb') as f:
                pdf = PyPDF2.PdfReader(f)
                text = ''
                for page in pdf.pages:
                    text += page.extract_text()
                return text
        except Exception as e:
            return f"Error reading PDF file: {str(e)}"
    elif ext in ['doc', 'docx']:
        try:
            import docx
            doc = docx.Document(filepath)
            return '\n'.join([para.text for para in doc.paragraphs])
        except Exception as e:
            return f"Error reading Word file: {str(e)}"
    return ""

def calculate_similarity(text1, text2):
    text1 = text1.lower().strip()
    text2 = text2.lower().strip()
    
    if not text1 or not text2:
        return 0
    
    similarity = SequenceMatcher(None, text1, text2).ratio()
    return round(similarity * 100, 2)
