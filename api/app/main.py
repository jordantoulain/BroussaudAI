from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.router import api_router
from core.supabase_init import init_db
from contextlib import asynccontextmanager
import os
import logging
import llama_index.core

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    
    llama_index.core.set_global_handler("arize_phoenix", 
        endpoint="http://phoenix:6006/v1/traces")
    
    yield

app = FastAPI(lifespan=lifespan)

# Rate limiting configuration (simple in-memory implementation)
# For production, use Redis with slowapi
from collections import defaultdict
import time
from fastapi import status

# Simple rate limiter storage: {(ip, endpoint): [(timestamp, ...), ...]}
rate_limit_store = defaultdict(list)
RATE_LIMITS = {
    "default": {"limit": 100, "window": 60},  # 100 requests/minute
    "/auth/login": {"limit": 5, "window": 60},  # 5 requests/minute
    "/auth/register": {"limit": 3, "window": 60},  # 3 requests/minute
}

def check_rate_limit(request: Request, endpoint: str = None):
    """Check if request should be rate limited."""
    if endpoint is None:
        endpoint = request.url.path
    
    client_ip = request.client.host if request.client else "unknown"
    key = (client_ip, endpoint)
    
    # Get rate limit config for this endpoint
    config = RATE_LIMITS.get(endpoint, RATE_LIMITS["default"])
    limit = config["limit"]
    window = config["window"]
    
    # Clean old requests
    current_time = time.time()
    rate_limit_store[key] = [
        ts for ts in rate_limit_store[key]
        if current_time - ts < window
    ]
    
    # Check if limit exceeded
    if len(rate_limit_store[key]) >= limit:
        oldest = rate_limit_store[key][0]
        retry_after = int(window - (current_time - oldest))
        return False, retry_after
    
    # Add current request
    rate_limit_store[key].append(current_time)
    return True, 0

# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    endpoint = request.url.path
    
    # Apply rate limiting to sensitive endpoints
    if endpoint in RATE_LIMITS or "/auth" in endpoint:
        allowed, retry_after = check_rate_limit(request, endpoint)
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": f"Trop de requetes. Veuillez reessayer dans {retry_after} secondes."
                },
                headers={"Retry-After": str(retry_after)}
            )
    
    response = await call_next(request)
    return response

# Security middleware - Add security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    # HSTS header (only for HTTPS connections)
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    
    return response

# Configure CORS with environment variable
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    max_age=600,
)

app.include_router(api_router)