import json
import base64
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from api.routes.auth import get_current_user
from core.supabase_client import supabase
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/sessions", tags=["Sessions"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class SessionCreate(BaseModel):
    device_info: str

@router.get("/")
def get_active_sessions(current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("sessions") \
            .select("*") \
            .eq("user_id", current_user["id"]) \
            .order("created_at", desc=True) \
            .execute()
        
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/", status_code=status.HTTP_201_CREATED)
def register_session(
    session_data: SessionCreate, 
    current_user: dict = Depends(get_current_user),
    token: str = Depends(oauth2_scheme) # <-- FastAPI nous donne le vrai token brut ici
):
    try:
        # Décodage manuel et natif du JWT (séparation par les points)
        payload_b64 = token.split(".")[1]
        
        # Ajout du padding Base64 manquant (obligatoire en Python)
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        
        # Transformation en dictionnaire Python
        payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode("utf-8"))
        
        session_id = payload.get("session_id")
        
        if not session_id:
            raise Exception("Session ID introuvable dans le token")

        expires = datetime.now(timezone.utc) + timedelta(days=30)
        
        new_session = {
            "id": session_id,
            "user_id": current_user["id"],
            "device_info": session_data.device_info,
            "expires_at": expires.isoformat()
        }
        
        # Upsert pour éviter les doublons si l'utilisateur rafraîchit
        response = supabase.table("sessions").upsert(new_session).execute()
        return response.data[0] if response.data else {}
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{session_id}")
def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.rpc(
            "revoke_user_session", 
            {"p_session_id": session_id, "p_user_id": current_user["id"]}
        ).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Session introuvable ou non autorisée"
            )
            
        return {"message": "Session révoquée avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))