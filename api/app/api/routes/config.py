from fastapi import APIRouter, HTTPException, Depends, status
from supabase import create_client
from core.supabase_client import supabase
from core.crypto_utils import encrypt_api_key, decrypt_api_key
from core.llm import reload_llm_config
from api.routes.auth import get_current_user
import os

router = APIRouter(prefix="/config", tags=["Configuration"])

# Initialisation du client admin (Service Role) pour lire la config
supabase_admin = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_KEY", "")
)


def verify_admin(current_user: dict):
    """
    Vérifie que l'utilisateur a le rôle ADMIN.
    """
    user_id = current_user.get("id")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non identifié."
        )
        
    try:
        response = supabase.table("users").select("role").eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profil utilisateur introuvable en base."
            )
            
        db_role = response.data[0].get("role")
        
        if db_role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès interdit. Rôle ADMIN requis."
            )
            
        current_user["role"] = db_role
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la vérification des droits : {str(e)}"
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


# LLM Model Configuration Endpoints

@router.get("/llm", response_model=dict)
def get_llm_config(current_user: dict = Depends(get_current_user)):
    """Récupère la configuration LLM actuelle - Requiert rôle ADMIN"""
    verify_admin(current_user)
    
    try:
        config_keys = ["llm_provider", "llm_model", "llm_api_key", "llm_base_url", "llm_embed_model"]
        config_data = {}
        
        for key in config_keys:
            response = supabase.table("config") \
                .select("value") \
                .eq("key", key) \
                .maybe_single() \
                .execute()
            
            if response and hasattr(response, 'data') and response.data and response.data.get("value"):
                config_data[key] = response.data["value"]
            else:
                config_data[key] = None
        
        # Décrypter la clé API si elle existe
        encrypted_api_key = config_data.get("llm_api_key")
        if encrypted_api_key:
            try:
                config_data["llm_api_key"] = decrypt_api_key(encrypted_api_key)
            except Exception as e:
                # Si le décryptage échoue, retourner la clé chiffrée (pour compatibilité)
                # ou None si c'est incohérent
                config_data["llm_api_key"] = None
        
        return {
            "provider": config_data.get("llm_provider"),
            "model": config_data.get("llm_model"),
            "api_key": config_data.get("llm_api_key"),
            "base_url": config_data.get("llm_base_url"),
            "embed_model": config_data.get("llm_embed_model")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de la configuration LLM: {str(e)}"
        )


@router.post("/llm", status_code=status.HTTP_200_OK)
def update_llm_config(llm_config: dict, current_user: dict = Depends(get_current_user)):
    """Met à jour la configuration LLM - Requiert rôle ADMIN"""
    verify_admin(current_user)
    
    try:
        provider = llm_config.get("provider")
        model = llm_config.get("model")
        api_key = llm_config.get("api_key")
        base_url = llm_config.get("base_url")
        embed_model = llm_config.get("embed_model")
        
        # Encrypter la clé API avant stockage
        encrypted_api_key = None
        if api_key:
            try:
                encrypted_api_key = encrypt_api_key(api_key)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erreur lors du chiffrement de la clé API: {str(e)}"
                )
        
        # Mettre à jour chaque clé de configuration
        config_updates = {
            "llm_provider": provider,
            "llm_model": model,
            "llm_api_key": encrypted_api_key,
            "llm_base_url": base_url,
            "llm_embed_model": embed_model
        }
        
        for key, value in config_updates.items():
            if value is not None:
                existing_response = supabase.table("config") \
                    .select("id") \
                    .eq("key", key) \
                    .maybe_single() \
                    .execute()
                
                if existing_response and hasattr(existing_response, 'data') and existing_response.data:
                    supabase.table("config") \
                        .update({"value": value}) \
                        .eq("key", key) \
                        .execute()
                else:
                    supabase.table("config") \
                        .insert({"key": key, "value": value}) \
                        .execute()
        
        # Recharger la configuration LLM pour appliquer les changements immédiatement
        try:
            reload_result = reload_llm_config()
        except Exception as reload_err:
            # Même si le rechargement échoue, la config est sauvegardée en DB
            # Le changement sera effectif au prochain démarrage
            pass
        
        return {
            "message": "Configuration LLM mise à jour avec succès",
            **llm_config
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour de la configuration LLM: {str(e)}"
        )
