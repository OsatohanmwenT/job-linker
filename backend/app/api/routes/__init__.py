# API routes package
from app.api.routes.applications import router as applications_router
from app.api.routes.auth import router as auth_router
from app.api.routes.candidates import router as candidates_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.job_listing import router as job_listing_router
from app.api.routes.organization import router as organization_router
from app.api.routes.resumes import router as resumes_router
from app.api.routes.saved_jobs import router as saved_jobs_router
from app.api.routes.skills import router as skills_router

__all__ = [
    "auth_router",
    "applications_router",
    "dashboard_router",
    "job_listing_router",
    "organization_router",
    "candidates_router",
    "skills_router",
    "resumes_router",
    "saved_jobs_router",
]
