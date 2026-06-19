import os
import jwt
import pyotp
import qrcode
import io
import base64
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from core.supabase_client import supabase
from core.crypto_utils import encrypt_mfa_secret, decrypt_mfa_secret

router = APIRouter(prefix="/mfa", tags=["MFA"])


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.environ.get("JWT_SECRET"), algorithm="HS256")
    return encoded_jwt


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, os.environ.get("JWT_SECRET"), algorithm="HS256")
    return encoded_jwt


class EnrollRequest(BaseModel):
    user_id: str


class VerifyRequest(BaseModel):
    user_id: str
    code: str
    secret: str | None = None


class EnrollResponse(BaseModel):
    secret: str
    uri: str
    qr_code: str


@router.post("/enroll", status_code=status.HTTP_200_OK)
def enroll_mfa(request: EnrollRequest):
    """
    Generate a new TOTP secret for user enrollment.
    Returns secret, URI, and QR code for setup.
    """
    # Generate a random base32 secret
    secret = pyotp.random_base32()
    
    # Create TOTP object
    totp = pyotp.TOTP(secret)
    
    # Generate provisioning URI
    user_email = "user@broussaud.fr"  # Will be fetched from DB
    issuer_name = "Broussaud AI"
    
    # Get user email from database
    user_data = supabase.table("users").select("mail").eq("id", request.user_id).execute()
    if len(user_data.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable"
        )
    
    user_email = user_data.data[0]["mail"]
    uri = totp.provisioning_uri(name=user_email, issuer_name=issuer_name)
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()
    
    # DO NOT store in DB yet - only store after successful verification
    # Just return the secret and QR code for setup
    
    return {
        "secret": secret,
        "uri": uri,
        "qr_code": qr_code_base64
    }


@router.post("/verify", status_code=status.HTTP_200_OK)
def verify_mfa(request: VerifyRequest, auth_request: Request):
    """
    Verify TOTP code and issue access/refresh tokens if valid.
    If secret is provided, store it in DB (first time setup).
    If no secret provided, fetch from DB (subsequent logins).
    """
    secret = request.secret
    
    # If no secret provided, fetch from DB (user already has MFA configured)
    if not secret:
        mfa_data = supabase.table("users").select("mfa_secret").eq("id", request.user_id).execute()
        if len(mfa_data.data) == 0 or not mfa_data.data[0].get("mfa_secret"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aucun secret TOTP configuré pour cet utilisateur"
            )
        # Dechiffrer le secret avant utilisation
        secret = decrypt_mfa_secret(mfa_data.data[0]["mfa_secret"])
    else:
        # First time setup - store the secret in DB (chiffre)
        try:
            supabase.table("users").update({
                "mfa_secret": encrypt_mfa_secret(secret)
            }).eq("id", request.user_id).execute()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de l'enregistrement du MFA: {str(e)}"
            )
    
    # Verify the code
    totp = pyotp.TOTP(secret)
    if not totp.verify(request.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Code TOTP invalide ou expiré"
        )
    
    # Get user data
    user_data = supabase.table("users").select("*").eq("id", request.user_id).execute()
    if len(user_data.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable"
        )
    
    db_user = user_data.data[0]
    user_agent = auth_request.headers.get("user-agent", "Appareil inconnu")
    
    # Create session
    expire_at = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    try:
        session_resp = supabase.table("sessions").insert({
            "user_id": db_user["id"],
            "device_info": user_agent,
            "expires_at": expire_at
        }).execute()
        session_id = session_resp.data[0]["id"]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Impossible d'initialiser la session: {e}")
    
    # Create tokens
    token_data = {"sub": db_user["id"], "mail": db_user["mail"], "nom": db_user["nom"], "prenom": db_user["prenom"], "role": db_user.get("role", "USER")}
    access_token = create_access_token(token_data)
    
    refresh_data = token_data.copy()
    refresh_data.update({"session_id": session_id})
    refresh_token = create_refresh_token(refresh_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.get("/status/{user_id}")
def get_mfa_status(user_id: str):
    """
    Check if user has TOTP configured and verified.
    """
    mfa_data = supabase.table("users").select("mfa_secret").eq("id", user_id).execute()
    
    if len(mfa_data.data) == 0 or not mfa_data.data[0].get("mfa_secret"):
        return {"has_mfa": False, "is_verified": False}
    
    return {
        "has_mfa": True,
        "is_verified": True
    }


@router.post("/skip", status_code=status.HTTP_200_OK)
def skip_mfa_setup(request: EnrollRequest, auth_request: Request):
    mfa_data = supabase.table("users").select("mfa_secret").eq("id", request.user_id).execute()

    if len(mfa_data.data) > 0 and mfa_data.data[0].get("mfa_secret"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Impossible de passer le MFA : vous avez deja un 2FA configure et verifie"
        )

    user_data = supabase.table("users").select("*").eq("id", request.user_id).execute()
    if len(user_data.data) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")

    db_user = user_data.data[0]
    user_agent = auth_request.headers.get("user-agent", "Appareil inconnu")

    expire_at = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    try:
        session_resp = supabase.table("sessions").insert({
            "user_id": db_user["id"],
            "device_info": user_agent,
            "expires_at": expire_at
        }).execute()
        session_id = session_resp.data[0]["id"]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Impossible d'initialiser la session: {e}")

    token_data = {"sub": db_user["id"], "mail": db_user["mail"], "nom": db_user["nom"], "prenom": db_user["prenom"], "role": db_user.get("role", "USER")}
    access_token = create_access_token(token_data)

    refresh_data = token_data.copy()
    refresh_data.update({"session_id": session_id})
    refresh_token = create_refresh_token(refresh_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }