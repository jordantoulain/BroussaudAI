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
        config_keys = ["llm_provider", "llm_model", "llm_api_key", "llm_base_url", "llm_embed_model", "llm_embed_dimension", "llm_collection_name"]
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
                # Si le décryptage échoue, retourner None
                config_data["llm_api_key"] = None
        
        # Calculer la dimension et le nom de collection si non stockés en DB
        provider = config_data.get("llm_provider")
        embed_model = config_data.get("llm_embed_model")
        model = config_data.get("llm_model")
        
        if config_data.get("llm_embed_dimension") is None:
            dimension = get_embed_dimension(provider, embed_model)
            config_data["llm_embed_dimension"] = str(dimension)
        else:
            dimension = int(config_data.get("llm_embed_dimension") or 3072)
        
        if config_data.get("llm_collection_name") is None:
            collection_name = get_collection_name(provider, model)
            config_data["llm_collection_name"] = collection_name
        else:
            collection_name = config_data.get("llm_collection_name")
        
        return {
            "provider": config_data.get("llm_provider"),
            "model": config_data.get("llm_model"),
            "api_key": config_data.get("llm_api_key"),
            "base_url": config_data.get("llm_base_url"),
            "embed_model": config_data.get("llm_embed_model"),
            "collection_name": collection_name,
            "dimension": dimension
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de la configuration LLM: {str(e)}"
        )


def get_embed_dimension(provider: str, embed_model: str = None) -> int:
    """
    Retourne la dimension de l'embedding selon le fournisseur et le modèle.
    """
    # Mapping des dimensions par fournisseur et modèle
    dimension_map = {
        "gemini": {
            "gemini-embedding-2": 3072,
            "gemini-embedding-1": 768,
            # Default pour Gemini
            None: 3072
        },
        "mistral": {
            "mistral-embed-2312": 1024,
            "mistral-embed-2311": 1024,
            # Default pour Mistral
            None: 1024
        },
        "ollama": {
            "nomic-embed-text": 768,
            "all-minilm": 384,
            "bge-base-en": 768,
            "bge-small-en": 384,
            # Default pour Ollama
            None: 768
        }
    }
    
    # Obtenir le mapping pour le fournisseur
    provider_dimensions = dimension_map.get(provider, {})
    
    # Retourner la dimension pour le modèle spécifique ou le default
    return provider_dimensions.get(embed_model, provider_dimensions.get(None, 3072))


def get_collection_name(provider: str, model: str = None) -> str:
    """
    Retourne le nom de la collection Supabase Vector Store selon le fournisseur.
    Chaque fournisseur a sa propre collection pour éviter les conflits de dimension.
    """
    # Mapping des noms de collection par fournisseur
    collection_map = {
        "gemini": "documents_gemini",
        "mistral": "documents_mistral",
        "ollama": "documents_ollama"
    }
    
    return collection_map.get(provider, "documents_gemini")


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
        
        # Calculer la dimension et le nom de collection
        dimension = get_embed_dimension(provider, embed_model)
        collection_name = get_collection_name(provider, model)
        
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
            "llm_embed_model": embed_model,
            "llm_embed_dimension": str(dimension),
            "llm_collection_name": collection_name
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
            "collection_name": collection_name,
            "dimension": dimension,
            **llm_config
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour de la configuration LLM: {str(e)}"
        )
