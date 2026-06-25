import os
import qrcode
import io
import base64
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from supabase import create_client
from supabase.client import ClientOptions
from supabase_auth.errors import AuthApiError
from .auth import get_current_user

router = APIRouter(prefix="/mfa", tags=["MFA"])

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")

class VerifyRequest(BaseModel):
    code: str
    factor_id: str

def get_user_client(token: str):
    """Crée un client éphémère agissant uniquement pour cet utilisateur spécifique"""
    return create_client(
        SUPABASE_URL, 
        SUPABASE_ANON_KEY,
        options=ClientOptions(headers={"Authorization": f"Bearer {token}"})
    )

@router.post("/enroll", status_code=status.HTTP_200_OK)
def enroll_mfa(current_user: dict = Depends(get_current_user)):
    try:
        user_client = get_user_client(current_user["token"])
        
        enroll_response = user_client.auth.mfa.enroll(
            factor_type="totp",
            issuer="Broussaud AI"
        )
        
        totp = enroll_response.totp
        
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(totp.uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return {
            "factor_id": enroll_response.id,
            "secret": totp.secret,
            "uri": totp.uri,
            "qr_code": qr_code_base64
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/verify", status_code=status.HTTP_200_OK)
def verify_mfa(request: VerifyRequest, current_user: dict = Depends(get_current_user)):
    try:
        user_client = get_user_client(current_user["token"])
        
        challenge = user_client.auth.mfa.challenge(request.factor_id)
        
        verify_response = user_client.auth.mfa.verify(
            factor_id=request.factor_id,
            challenge_id=challenge.id,
            code=request.code
        )
        
        # Le client met à jour sa session interne après le verify (AAL2)
        session = user_client.auth.get_session()
        
        return {
            "access_token": session.access_token if session else None,
            "refresh_token": session.refresh_token if session else None,
            "token_type": "bearer"
        }
    except AuthApiError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Code TOTP invalide ou expiré"
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/status")
def get_mfa_status(current_user: dict = Depends(get_current_user)):
    try:
        user_client = get_user_client(current_user["token"])
        user_response = user_client.auth.get_user()
        
        factors = user_response.user.factors if user_response.user else []
        totp_factors = [f for f in factors if f.factor_type == 'totp' and f.status == 'verified']
        
        return {
            "has_mfa": len(totp_factors) > 0,
            "is_verified": len(totp_factors) > 0
        }
    except Exception:
        return {"has_mfa": False, "is_verified": False}