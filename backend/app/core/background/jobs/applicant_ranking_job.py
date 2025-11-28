# app/core/background/jobs/applicant_ranking_job.py
import json
from typing import Optional

import google.generativeai as genai
import inngest
from app.config import settings
from app.core.background.inngest_client import inngest_client
from app.db.database import SessionLocal
from app.models.application import JobListingApplication
from app.models.job_listing import JobListings
from app.models.resume import Resume


def calculate_match_score_with_gemini(
    job_title: str,
    job_description: str,
    experience_level: str,
    job_type: str,
    resume_summary: str,
    cover_letter: str,
    required_skills: Optional[str] = None,
    preferred_skills: Optional[str] = None,
    min_years_experience: Optional[int] = None,
    required_education: Optional[str] = None,
) -> dict:
    """Calculate match score using Gemini with JSON mode"""
    if not settings.GEMINI_API_KEY:
        return {
            "rating": None,
            "reasoning": "No API key configured",
            "breakdown": None,
            "recommendation": "INSUFFICIENT_DATA",
        }

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Define the exact schema Gemini should return
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "overall_score": {"type": "integer"},
                        "breakdown": {
                            "type": "object",
                            "properties": {
                                "technical_skills": {"type": "integer"},
                                "experience": {"type": "integer"},
                                "education": {"type": "integer"},
                                "application_quality": {"type": "integer"},
                            },
                            "required": [
                                "technical_skills",
                                "experience",
                                "education",
                                "application_quality",
                            ],
                        },
                        "reasoning": {"type": "string"},
                        "key_strengths": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "concerns": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "recommendation": {"type": "string"},
                    },
                    "required": [
                        "overall_score",
                        "breakdown",
                        "reasoning",
                        "key_strengths",
                        "concerns",
                        "recommendation",
                    ],
                },
            },
        )

        # Build prompt with actual data
        prompt = f"""You are an expert recruiter conducting initial candidate screening.

**Job Requirements:**
Title: {job_title}
Experience Level: {experience_level}
Type: {job_type}
Description: {job_description}

Required Skills: {required_skills if required_skills else "Not specified - infer from job description"}
Preferred Skills: {preferred_skills if preferred_skills else "Not specified"}
Minimum Years of Experience: {min_years_experience if min_years_experience else "Not specified - infer from experience level"}
Required Education: {required_education if required_education else "Not specified"}

**Candidate Materials:**
Resume Summary: {resume_summary if resume_summary else "Not provided"}
Cover Letter: {cover_letter if cover_letter else "Not provided"}

**Evaluation Framework:**

1. **Technical Skills Match (40 points)**
   - If required skills are specified, award points proportionally for each skill demonstrated
   - If not specified, extract key skills from job description and evaluate match
   - Half credit for related/transferable skills
   - If no resume provided at all, score 0

2. **Experience Relevance (30 points)**
   - Years of experience: 0-10 points (compare to minimum or typical for experience level)
   - Industry relevance: 0-10 points
   - Role/responsibility match: 0-10 points

3. **Education & Credentials (15 points)**
   - Meets minimum education: 10 points
   - Relevant certifications: 5 points
   - If education requirements not specified, score based on role appropriateness

4. **Application Quality & Motivation (15 points)**
   - Clear career trajectory: 0-5 points
   - Tailored application: 0-5 points
   - Communication quality: 0-5 points

**Scoring Guidelines:**
- **80-100**: Exceptional fit, strong hire signal
- **65-79**: Good fit, worth interviewing
- **50-64**: Moderate fit, consider if candidate pool is limited
- **30-49**: Weak fit, significant gaps
- **0-29**: Poor fit or insufficient information

**Output Requirements:**
Return valid JSON with:
- overall_score: integer 0-100
- breakdown: object with technical_skills (0-40), experience (0-30), education (0-15), application_quality (0-15)
- reasoning: 2-4 sentences explaining the score
- key_strengths: array of 2-3 main strengths
- concerns: array of 2-3 main concerns or gaps
- recommendation: one of "STRONG_YES", "YES", "MAYBE", "NO", or "INSUFFICIENT_DATA"

**Important:**
- Be objective and evidence-based
- Don't penalize for missing non-essential materials
- If information is insufficient, score conservatively and note in reasoning
- Focus on job-relevant qualifications"""

        response = model.generate_content(prompt)
        result = json.loads(response.text)

        # Validate and return
        return {
            "rating": min(100, max(0, result.get("overall_score", 0))),
            "reasoning": result.get("reasoning", ""),
            "breakdown": result.get("breakdown", {}),
            "key_strengths": result.get("key_strengths", []),
            "concerns": result.get("concerns", []),
            "recommendation": result.get("recommendation", "INSUFFICIENT_DATA"),
        }

    except Exception as e:
        print(f"Error calculating match score with Gemini: {e}")
        return {
            "rating": None,
            "reasoning": f"Error: {str(e)}",
            "breakdown": None,
            "recommendation": "INSUFFICIENT_DATA",
        }


@inngest_client.create_function(
    fn_id="rank-applicant",
    trigger=inngest.TriggerEvent(event="app/application.created"),
)
async def rank_applicant_job(ctx, step):
    event_data = ctx.event.data
    job_listing_id = event_data["job_listing_id"]
    candidate_id = event_data["candidate_id"]

    db = SessionLocal()
    try:
        # Get application with related data
        application = (
            db.query(JobListingApplication)
            .filter(
                JobListingApplication.job_listing_id == job_listing_id,
                JobListingApplication.user_id == candidate_id,
            )
            .first()
        )

        if not application:
            return {"error": "Application not found"}

        # Get job listing
        job = db.query(JobListings).filter(JobListings.id == job_listing_id).first()

        # Get resume
        resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()

        if not job:
            return {"error": "Job listing not found"}

        # Extract job details (with safe fallbacks)
        required_skills = getattr(job, "required_skills", None)
        preferred_skills = getattr(job, "preferred_skills", None)
        min_years = getattr(job, "min_years_experience", None)
        required_education = getattr(job, "required_education", None)

        # Calculate match score using Gemini
        result = await step.run(
            "calculate-match-score",
            lambda: calculate_match_score_with_gemini(
                job_title=job.title,
                job_description=job.description or "",
                experience_level=job.experience_level.value if hasattr(job.experience_level, 'value') else str(job.experience_level),
                job_type=job.type.value if hasattr(job.type, 'value') else str(job.type),
                resume_summary=resume.ai_summary if resume and resume.ai_summary else "No resume provided",
                cover_letter=application.cover_letter or "",
                required_skills=required_skills,
                preferred_skills=preferred_skills,
                min_years_experience=min_years,
                required_education=required_education,
            ),
        )

        if result.get("rating") is not None:
            application.rating = result["rating"]
            application.ai_analysis = result["reasoning"]
            
            # Store additional data if your model supports it
            if hasattr(application, "match_breakdown"):
                application.match_breakdown = json.dumps(result.get("breakdown", {}))
            if hasattr(application, "recommendation"):
                application.recommendation = result.get("recommendation")
            
            db.commit()
            
            return {
                "success": True,
                "rating": result["rating"],
                "reasoning": result["reasoning"],
                "breakdown": result.get("breakdown"),
                "recommendation": result.get("recommendation"),
            }
        else:
            return {"error": "Failed to calculate match score", "details": result.get("reasoning")}

    except Exception as e:
        print(f"Error in rank_applicant_job: {e}")
        return {"error": str(e)}
    finally:
        db.close()