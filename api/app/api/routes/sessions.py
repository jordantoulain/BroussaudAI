from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from core.supabase_client import supabase

router = APIRouter(prefix="/sessions", tags=["Sessions"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class SessionInfo(BaseModel):
    """Informations sur une session utilisateur"""
    id: str
    user_id: str
    device_info: Optional[str] = None
    created_at: str
    expires_at: str


class SessionResponse(BaseModel):
    """Réponse avec la liste des sessions"""
    sessions: List[SessionInfo]


class SessionDeleteRequest(BaseModel):
    """Requête pour supprimer une session"""
    session_id: str


def get_current_user_from_token(token: str = Depends(oauth2_scheme)):
    """Récupère l'utilisateur courant depuis le token JWT"""
    try:
        import jwt
        import os
        payload = jwt.decode(token, os.environ.get("JWT_SECRET"), algorithms=["HS256"])
        user_id: str = payload.get("sub")
        mail: str = payload.get("mail")
        nom: str = payload.get("nom", "")
        prenom: str = payload.get("prenom", "")
        role: str = payload.get("role", "USER")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Impossible de valider les identifiants",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {"id": user_id, "mail": mail, "nom": nom, "prenom": prenom, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Le token a expiré. Veuillez vous reconnecter.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Impossible de valider les identifiants",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/", response_model=List[SessionInfo], status_code=status.HTTP_200_OK)
def get_user_sessions(current_user: dict = Depends(get_current_user_from_token)):
    """
    Récupère toutes les sessions de l'utilisateur connecté.
    
    Args:
        current_user: Utilisateur authentifié (extrait du JWT)
    
    Returns:
        Liste des sessions avec id, user_id, device_info, created_at, expires_at
    """
    user_id = current_user["id"]
    
    try:
        # Récupérer les sessions de l'utilisateur
        sessions_data = supabase \
            .table("sessions") \
            .select("id, user_id, device_info, created_at, expires_at") \
            .eq("user_id", user_id) \
            .execute()
        
        if not sessions_data.data:
            return []
        
        # Formater les sessions
        sessions = []
        for session in sessions_data.data:
            sessions.append(SessionInfo(
                id=session["id"],
                user_id=session["user_id"],
                device_info=session.get("device_info"),
                created_at=session["created_at"],
                expires_at=session["expires_at"]
            ))
        
        return sessions
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des sessions: {str(e)}"
        )


@router.delete("/{session_id}", status_code=status.HTTP_200_OK)
def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user_from_token)
):
    """
    Force la déconnexion d'une session spécifique.
    Vérifie que la session appartient bien à l'utilisateur avant suppression.
    
    Args:
        session_id: ID de la session à supprimer
        current_user: Utilisateur authentifié
    
    Returns:
        Message de succès
    """
    user_id = current_user["id"]
    
    try:
        # Vérifier que la session existe et appartient à l'utilisateur
        session_check = supabase \
            .table("sessions") \
            .select("id, user_id") \
            .eq("id", session_id) \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        if not session_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session introuvable ou ne vous appartient pas"
            )
        
        # Supprimer la session
        supabase \
            .table("sessions") \
            .delete() \
            .eq("id", session_id) \
            .execute()
        
        return {
            "success": True,
            "message": "Session supprimée avec succès"
        }
        
    except Exception as e:
        if "404" in str(e) or "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session introuvable ou ne vous appartient pas"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de la session: {str(e)}"
        )
