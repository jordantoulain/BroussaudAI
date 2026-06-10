from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from api.routes.auth import get_current_user
from core.supabase_client import supabase
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/conversations", tags=["Conversations"])


def verify_conversation_owner(conversation_id: str, user_id: str, check_active: bool = False, select_fields: str = "id"):
    """Vérifie qu'une conversation existe, appartient à l'utilisateur et retourne ses données."""
    query = supabase.table("conversations").select(select_fields).eq("id", conversation_id).eq("user_id", user_id)
    if check_active:
        query = query.eq("is_active", True)
    
    conv_response = query.execute()
    
    if not conv_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation non trouvée"
        )
    return conv_response.data[0]


class ConversationResponse(BaseModel):
    id: str
    title: Optional[str] = None
    is_active: bool
    created_at: str


# Routes pour les archives (doivent être avant /{conversation_id} pour éviter le conflit)
@router.get("/archives")
def get_archived_conversations(current_user: dict = Depends(get_current_user)):
    """
    Liste toutes les conversations archivées (soft deleted) de l'utilisateur.
    """
    try:
        response = supabase.table("conversations") \
            .select("id, title, user_id, created_at") \
            .eq("user_id", current_user["id"]) \
            .eq("is_active", False) \
            .order("created_at", desc=True) \
            .execute()
        
        return {"conversations": response.data or []}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des archives: {str(e)}"
        )


@router.get("/archives/{conversation_id}")
def get_archived_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """
    Récupère une conversation archivée spécifique avec ses messages.
    """
    try:
        # Vérifier que la conversation appartient à l'utilisateur et est archivée
        conversation = verify_conversation_owner(
            conversation_id,
            current_user["id"],
            check_active=False,
            select_fields="id, title, user_id, created_at"
        )
        
        # Récupérer les messages
        messages_response = supabase.table("messages") \
            .select("*") \
            .eq("conversation_id", conversation_id) \
            .order("created_at", desc=False) \
            .execute()
        
        messages = messages_response.data or []
        
        return {
            "conversation": conversation,
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de la conversation archivée: {str(e)}"
        )


# Routes principales
@router.get("/", response_model=list[ConversationResponse])
def list_conversations(current_user: dict = Depends(get_current_user)):
    """
    Liste toutes les conversations actives de l'utilisateur.
    """
    try:
        response = supabase.table("conversations") \
            .select("id, title, is_active, created_at") \
            .eq("user_id", current_user["id"]) \
            .eq("is_active", True) \
            .order("created_at", desc=True) \
            .execute()
        
        conversations = response.data or []
        
        # Pour chaque conversation sans titre, récupérer le premier message utilisateur
        enriched_conversations = []
        for conv in conversations:
            if conv.get("title"):
                enriched_conversations.append(conv)
            else:
                # Récupérer le premier message de l'utilisateur
                messages_response = supabase.table("messages") \
                    .select("question") \
                    .eq("conversation_id", conv["id"]) \
                    .order("created_at", desc=False) \
                    .limit(1) \
                    .execute()
                
                first_message = messages_response.data[0] if messages_response.data else None
                conv["title"] = first_message["question"][:50] if first_message else "Nouvelle conversation"
                enriched_conversations.append(conv)
        
        return enriched_conversations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des conversations: {str(e)}"
        )


@router.get("/{conversation_id}", response_model=dict)
def get_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """
    Charge une conversation spécifique avec ses messages.
    """
    try:
        # Vérifier que la conversation appartient à l'utilisateur
        conversation = verify_conversation_owner(
            conversation_id, 
            current_user["id"], 
            check_active=True,
            select_fields="id, title, is_active, created_at"
        )
        
        # Récupérer les messages
        messages_response = supabase.table("messages") \
            .select("*") \
            .eq("conversation_id", conversation_id) \
            .order("created_at", desc=False) \
            .execute()
        
        messages = messages_response.data or []
        
        return {
            "conversation": conversation,
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du chargement de la conversation: {str(e)}"
        )


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def soft_delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """
    Soft delete une conversation (désactive uniquement, pas de suppression physique).
    """
    try:
        # Vérifier que la conversation appartient à l'utilisateur
        verify_conversation_owner(conversation_id, current_user["id"])
        
        # Soft delete
        supabase.table("conversations") \
            .update({"is_active": False}) \
            .eq("id", conversation_id) \
            .execute()
        
        return
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de la conversation: {str(e)}"
        )
