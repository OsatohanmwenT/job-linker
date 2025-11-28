from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.resume import ResumeParseStatus


class ResumeResponse(BaseModel):
    id: str
    candidate_id: str
    file_url: str
    file_name: str
    file_type: Optional[str] = None
    extracted_text: Optional[str] = None
    parse_status: ResumeParseStatus
    ai_summary: Optional[str] = None
    uploaded_at: datetime
    parsed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
