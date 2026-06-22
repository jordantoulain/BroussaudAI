from fastapi import APIRouter
from api.routes import ia, auth, conversations, admin, mfa, data, reviews, sessions

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(ia.router)
api_router.include_router(conversations.router)
api_router.include_router(admin.router)
api_router.include_router(mfa.router)
api_router.include_router(data.router)
api_router.include_router(reviews.router)
api_router.include_router(sessions.router)