import os
import jwt
import bcrypt
import time
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from core.supabase_client import supabase
from httpx import RemoteProtocolError

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.environ.get("JWT_SECRET"), algorithm="HS256")
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, os.environ.get("JWT_SECRET"), algorithm="HS256")
    return encoded_jwt

class UserRegister(BaseModel):
    nom: str
    prenom: str
    mail: EmailStr
    mdp: str
    role: str = "USER"

class UserLogin(BaseModel):
    mail: EmailStr
    mdp: str

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister):
    existing_user = supabase.table("users").select("id").eq("mail", user.mail).execute()
    if len(existing_user.data) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé."
        )
    
    hashed_password = get_password_hash(user.mdp)
    
    new_user = {
        "nom": user.nom,
        "prenom": user.prenom,
        "mail": user.mail,
        "mdp": hashed_password,
        "role": "USER"
    }
    
    try:
        response = supabase.table("users").insert(new_user).execute()
        return {
            "message": "Compte créé avec succès",
            "user_id": response.data[0]["id"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création du compte : {str(e)}"
        )

@router.post("/login")
def login(user: UserLogin, request: Request):
    response = supabase.table("users").select("*").eq("mail", user.mail).execute()
    
    if len(response.data) == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou mot de passe incorrect.")
    
    db_user = response.data[0]
    if not verify_password(user.mdp, db_user["mdp"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou mot de passe incorrect.")
    
    # Update last login timestamp
    supabase.table("users").update({"last_login_at": datetime.now(timezone.utc).isoformat()}).eq("id", db_user["id"]).execute()
    
    # Check if user has MFA configured
    has_mfa = db_user.get("mfa_secret") is not None
    
    # If user has MFA configured, ALWAYS require code verification
    if has_mfa:
        return {
            "requires_mfa": True,
            "user_id": db_user["id"],
            "has_mfa": True
        }
    
    # No MFA configured yet - offer setup
    return {
        "requires_mfa": True,
        "user_id": db_user["id"],
        "has_mfa": False
    }

class TokenRefresh(BaseModel):
    refresh_token: str

@router.post("/logout")
def logout(token_request: TokenRefresh):
    try:
        payload = jwt.decode(token_request.refresh_token, os.environ.get("JWT_SECRET"), algorithms=["HS256"])
        session_id = payload.get("session_id")
        if session_id:
            supabase.table("sessions").delete().eq("id", session_id).execute()
        return {"message": "Déconnexion réussie sur cet appareil."}
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session introuvable ou jeton invalide.")

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((RemoteProtocolError, Exception))
)
def _execute_supabase_with_retry(query):
    return query.execute()


@router.post("/refresh")
def refresh_token(token_request: TokenRefresh):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token invalide, expiré ou révoqué",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token_request.refresh_token, os.environ.get("JWT_SECRET"), algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise credentials_exception
            
        user_id: str = payload.get("sub")
        mail: str = payload.get("mail")
        session_id: str = payload.get("session_id")
        
        if not user_id or not session_id:
            raise credentials_exception
            
        session_check = _execute_supabase_with_retry(
            supabase.table("sessions").select("id").eq("id", session_id)
        )
        if len(session_check.data) == 0:
            raise credentials_exception
        
        user_data = _execute_supabase_with_retry(
            supabase.table("users").select("nom, prenom, role").eq("id", user_id).single()
        )
        nom: str = user_data.data.get("nom", "")
        prenom: str = user_data.data.get("prenom", "")
        role: str = user_data.data.get("role", "USER")
        
        new_token_data = {"sub": user_id, "mail": mail, "nom": nom, "prenom": prenom, "role": role}
        new_access_token = create_access_token(new_token_data)
        
        return {"access_token": new_access_token, "token_type": "bearer"}
        
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise credentials_exception

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, os.environ.get("JWT_SECRET"), algorithms="HS256")
        user_id: str = payload.get("sub")
        mail: str = payload.get("mail")
        nom: str = payload.get("nom", "")
        prenom: str = payload.get("prenom", "")
        role: str = payload.get("role", "USER")
        
        if user_id is None:
            raise credentials_exception
            
        return {"id": user_id, "mail": mail, "nom": nom, "prenom": prenom, "role": role}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Le token a expiré. Veuillez vous reconnecter.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise credentials_exception