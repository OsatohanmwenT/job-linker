# app/core/background/jobs/resume_job.py
import base64
import io

import google.generativeai as genai
import inngest
import PyPDF2
from app.config import settings
from app.core.background.inngest_client import inngest_client
from app.db.database import SessionLocal
from app.models.resume import Resume, ResumeParseStatus
from docx import Document


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc_file = io.BytesIO(file_content)
        doc = Document(doc_file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return ""


def generate_resume_summary(extracted_text: str) -> str:
    """Generate AI summary using Gemini"""
    if not settings.GEMINI_API_KEY:
        return "AI summary unavailable - no API key configured"

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""Analyze this resume and create a comprehensive summary for a hiring manager.

Resume Text:
{extracted_text}

Provide a structured summary that includes:
1. Professional Summary (2-3 sentences)
2. Key Skills (bulleted list)
3. Work Experience Highlights (key roles and achievements)
4. Education and Certifications
5. Notable Projects or Accomplishments

Format your response in markdown. Be concise but thorough."""

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"Error generating AI summary with Gemini: {e}")
        return f"AI summary generation failed: {str(e)}"


@inngest_client.create_function(
    fn_id="parse-resume", trigger=inngest.TriggerEvent(event="app/resume.uploaded")
)
async def parse_resume_job(ctx, step):
    event_data = ctx.event.data
    candidate_id = event_data["candidate_id"]
    file_content_b64 = event_data.get("file_content")
    file_type = event_data.get("file_type")

    # Decode base64 file content
    file_content = base64.b64decode(file_content_b64)

    # Get resume from database
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()

        if not resume:
            return {"error": "Resume not found"}

        # Update status to processing
        resume.parse_status = ResumeParseStatus.PROCESSING
        db.commit()

        # Extract text from file
        extracted_text = await step.run(
            "extract-text",
            lambda: (
                extract_text_from_pdf(file_content)
                if file_type == "pdf"
                else extract_text_from_docx(file_content)
            ),
        )

        if not extracted_text or len(extracted_text.strip()) < 50:
            resume.extracted_text = extracted_text
            resume.parse_status = ResumeParseStatus.FAILED
            db.commit()
            return {"error": "Could not extract text from resume"}

        # Generate AI summary using Gemini
        ai_summary = await step.run(
            "generate-ai-summary", lambda: generate_resume_summary(extracted_text)
        )

        resume.extracted_text = extracted_text
        resume.ai_summary = ai_summary
        resume.parse_status = ResumeParseStatus.COMPLETED
        db.commit()

        return {"success": True, "candidate_id": candidate_id}

    except Exception as e:
        if resume:
            resume.parse_status = ResumeParseStatus.FAILED
            db.commit()
        print(f"Error in parse_resume_job: {e}")
        return {"error": str(e)}
    finally:
        db.close()
