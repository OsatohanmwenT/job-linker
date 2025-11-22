from fastapi import APIRouter
from api.v1 import auth, users
# from api.v1 import jobs, profiles, matching

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
# api_router.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])
# api_router.include_router(matching.router, prefix="/matching", tags=["Matching"])
