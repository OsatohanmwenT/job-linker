import inngest.fast_api
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables first
load_dotenv()

# Import other modules
from app.api.routes import (
    applications_router,
    auth_router,
    candidates_router,
    dashboard_router,
    job_listing_router,
    organization_router,
    resumes_router,
    saved_jobs_router,
    skills_router,
)

# Import inngest_client
from app.core.background.inngest_client import inngest_client
from app.core.background.jobs.applicant_ranking_job import rank_applicant_job
from app.core.background.jobs.resume_job import parse_resume_job
from app.db import init_db


async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown (cleanup if needed)


app = FastAPI(title="JobLinker API", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(applications_router)
app.include_router(dashboard_router)
app.include_router(job_listing_router)
app.include_router(organization_router)
app.include_router(candidates_router)
app.include_router(skills_router)
app.include_router(resumes_router)
app.include_router(saved_jobs_router)


# Inngest endpoint for background jobs
inngest.fast_api.serve(
    app,
    inngest_client,
    [parse_resume_job, rank_applicant_job],
    serve_origin="http://localhost:8000",
)


@app.get("/")
async def root():
    return {"message": "AI Job Seeker API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
    return {"status": "healthy"}
