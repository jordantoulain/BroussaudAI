from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from core.supabase_init import init_db
from contextlib import asynccontextmanager
import llama_index.core

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    
    llama_index.core.set_global_handler("arize_phoenix", 
        endpoint="http://phoenix:6006/v1/traces")
    
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(api_router)