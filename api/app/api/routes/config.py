from fastapi import APIRouter, HTTPException, Depends, status
from supabase import create_client
from core.supabase_client import supabase
import os

router = APIRouter(prefix="/config", tags=["Configuration"])

# Initialisation du client admin (Service Role) pour lire la config
supabase_admin = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_KEY", "")
)


@router.get("/maintenance", response_model=dict)
def get_public_maintenance_status():
    """
    Récupère l'état public du mode maintenance.
    Accessible sans authentification pour permettre l'affichage de la page de maintenance.
    """
    try:
        mode_response = supabase.table("config") \
            .select("value") \
            .eq("key", "maintenance_mode") \
            .maybe_single() \
            .execute()
        
        reason_response = supabase.table("config") \
            .select("value") \
            .eq("key", "maintenance_reason") \
            .maybe_single() \
            .execute()
        
        mode_value = "false"
        if mode_response and hasattr(mode_response, 'data') and mode_response.data:
            mode_value = mode_response.data.get("value", "false")
        
        reason_value = ""
        if reason_response and hasattr(reason_response, 'data') and reason_response.data:
            reason_value = reason_response.data.get("value", "")
        
        return {
            "maintenance_mode": mode_value.lower() == "true",
            "maintenance_reason": reason_value
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération du mode maintenance: {str(e)}"
        )
