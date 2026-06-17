from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from api.routes.auth import get_current_user
from core.supabase_client import supabase
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/reviews", tags=["Reviews"])


class ReviewRequest(BaseModel):
    message_id: int
    rating: bool
    description: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    user_id: str
    message_id: int
    rating: bool
    description: Optional[str] = None
    created_at: str


def verify_message_exists(message_id: int):
    """Vérifie qu'un message existe."""
    response = supabase.table("messages") \
        .select("id") \
        .eq("id", message_id) \
        .execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message non trouvé"
        )
    return response.data[0]


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(review_data: ReviewRequest, current_user: dict = Depends(get_current_user)):
    """
    Crée un nouvel avis pour un message.
    
    Body:
    - message_id: int (requis) - ID du message
    - rating: bool (requis) - true pour positif, false pour négatif
    - description: str (optionnel) - Description de l'avis
    """
    try:
        # Vérifier que le message existe
        verify_message_exists(review_data.message_id)
        
        # Créer l'avis
        review_response = supabase.table("reviews") \
            .insert({
                "user_id": current_user["id"],
                "message_id": review_data.message_id,
                "rating": review_data.rating,
                "description": review_data.description
            }) \
            .execute()
        
        if not review_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Échec de la création de l'avis"
            )
        
        return review_response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'avis: {str(e)}"
        )
