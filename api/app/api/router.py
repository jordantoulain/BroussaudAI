from fastapi import APIRouter
from api.routes import ia, auth, conversations, admin

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(ia.router)
api_router.include_router(conversations.router)
api_router.include_router(admin.router)