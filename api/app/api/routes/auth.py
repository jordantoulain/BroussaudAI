# api/app/api/routes/auth.py

from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from core.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["Authentification"])

# Ce chemin n'est là que pour la doc OpenAPI/Swagger
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_token_from_request(request: Request) -> str:
    """
    Extrait le token depuis le header Authorization ou depuis les cookies.
    """
    # Vérifier le header Authorization d'abord
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split("Bearer ")[1]
    
    # Sinon, vérifier les cookies
    access_token = request.cookies.get("access_token")
    if access_token:
        return access_token
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token manquant ou invalide",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(request: Request) -> dict:
    """
    Extrait le token (depuis header ou cookies) et valide la session 
    directement auprès de Supabase.
    """
    try:
        token = get_token_from_request(request)
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise Exception("User not found")
        
        meta = user_response.user.user_metadata
        return {
            "id": user_response.user.id,
            "mail": user_response.user.email,
            "nom": meta.get("nom", ""),
            "prenom": meta.get("prenom", ""),
            "role": meta.get("role", "USER")
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré.",
            headers={"WWW-Authenticate": "Bearer"},
        )