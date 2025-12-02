# app/core/background/jobs/resume_job.py
import base64
import io
import traceback

import google.generativeai as genai
import PyPDF2
from docx import Document
import inngest

from app.config import settings
from app.core.background.inngest_client import inngest_client
from app.db.database import SessionLocal
from app.models.resume import Resume, ResumeParseStatus


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
        print(f"[PDF Extract] Error: {e}")
        return ""


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc_file = io.BytesIO(file_content)
        doc = Document(doc_file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"[DOCX Extract] Error: {e}")
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
{extracted_text[:5000]}

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
        print(f"[Gemini] Error: {e}")
        return f"AI summary generation failed: {str(e)}"


@inngest_client.create_function(
    fn_id="parse-resume",
    trigger=inngest.TriggerEvent(event="app/resume.uploaded"),
)
async def parse_resume_job(ctx, step=None):
    """Background job to parse resume and generate AI summary"""
    
    print(f"\n{'='*60}")
    print(f"[Inngest Job] Starting resume parsing job")
    print(f"[Inngest Job] Event ID: {ctx.event.id if hasattr(ctx.event, 'id') else 'unknown'}")
    print(f"{'='*60}\n")
    
    db = None
    resume = None
    
    try:
        # Get event data with safety checks
        print(f"[Event Data] Raw event: {ctx.event}")
        event_data = ctx.event.data if hasattr(ctx.event, 'data') else {}
        print(f"[Event Data] Parsed data: {event_data}")
        
        candidate_id = event_data.get("candidate_id")
        file_content_b64 = event_data.get("file_content")
        file_type = event_data.get("file_type")

        print(f"[Job Data] Candidate ID: {candidate_id}")
        print(f"[Job Data] File Type: {file_type}")
        print(f"[Job Data] Base64 Content Length: {len(file_content_b64) if file_content_b64 else 0}")

        # Validate required data
        if not candidate_id:
            print("[Validation] ERROR: Missing candidate_id")
            return {"error": "Missing candidate_id"}
        
        if not file_content_b64:
            print("[Validation] ERROR: Missing file_content")
            return {"error": "Missing file_content"}
        
        if not file_type:
            print("[Validation] ERROR: Missing file_type")
            return {"error": "Missing file_type"}

        # Decode base64 file content
        print(f"[Decode] Decoding base64 content...")
        try:
            file_content = base64.b64decode(file_content_b64)
            print(f"[Decode] SUCCESS - Decoded {len(file_content)} bytes")
        except Exception as e:
            print(f"[Decode] ERROR: {e}")
            traceback.print_exc()
            return {"error": f"Failed to decode file content: {str(e)}"}

        # Get resume from database
        print(f"[Database] Connecting to database...")
        db = SessionLocal()
        
        print(f"[Database] Querying resume for candidate_id: {candidate_id}")
        resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()

        if not resume:
            print(f"[Database] ERROR: Resume not found for candidate_id: {candidate_id}")
            return {"error": "Resume not found"}

        print(f"[Database] Found resume ID: {resume.id}")

        # Update status to processing
        print(f"[Status] Updating status to PROCESSING...")
        resume.parse_status = ResumeParseStatus.PROCESSING
        db.commit()
        print(f"[Status] Status updated successfully")

        # Extract text from file
        print(f"[Extract] Extracting text from {file_type} file...")
        if file_type == "pdf":
            extracted_text = extract_text_from_pdf(file_content)
        else:
            extracted_text = extract_text_from_docx(file_content)
        
        text_length = len(extracted_text) if extracted_text else 0
        print(f"[Extract] Extracted {text_length} characters")

        if not extracted_text or len(extracted_text.strip()) < 50:
            print(f"[Extract] ERROR: Insufficient text extracted")
            resume.extracted_text = extracted_text
            resume.parse_status = ResumeParseStatus.FAILED
            db.commit()
            return {"error": "Could not extract sufficient text from resume"}

        # Save extracted text (preview for debugging)
        print(f"[Extract] Text preview: {extracted_text[:200]}...")

        # Generate AI summary using Gemini
        print(f"[AI Summary] Generating summary with Gemini...")
        ai_summary = generate_resume_summary(extracted_text)
        print(f"[AI Summary] Generated {len(ai_summary)} characters")
        print(f"[AI Summary] Preview: {ai_summary[:200]}...")

        # Update resume with results
        print(f"[Database] Saving results to database...")
        resume.extracted_text = extracted_text
        resume.ai_summary = ai_summary
        resume.parse_status = ResumeParseStatus.COMPLETED
        db.commit()

        print(f"\n{'='*60}")
        print(f"[SUCCESS] Resume parsing completed for candidate_id: {candidate_id}")
        print(f"{'='*60}\n")
        
        return {
            "success": True, 
            "candidate_id": candidate_id,
            "text_length": len(extracted_text),
            "summary_length": len(ai_summary)
        }

    except Exception as e:
        print(f"\n{'='*60}")
        print(f"[ERROR] Exception in parse_resume_job: {e}")
        print(f"{'='*60}")
        traceback.print_exc()
        
        # Try to mark resume as failed
        try:
            if db and resume:
                resume.parse_status = ResumeParseStatus.FAILED
                db.commit()
                print(f"[Status] Marked resume as FAILED")
        except Exception as commit_error:
            print(f"[Status] ERROR: Could not mark resume as failed: {commit_error}")
        
        # Re-raise so Inngest can retry
        raise
        
    finally:
        if db:
            db.close()
            print(f"[Database] Connection closed")