import os
from llama_index.core import Settings
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from llama_index.llms.mistralai import MistralAI
from llama_index.embeddings.mistralai import MistralAIEmbedding
from core.supabase_client import supabase
from core.crypto_utils import decrypt_api_key

def get_llm_config_from_db():
    """
    Récupère la configuration LLM depuis la base de données.
    Retourne un dictionnaire avec les clés : provider, model, api_key, base_url, embed_model
    La clé API est décryptée automatiquement si elle est stockée chiffrée.
    """
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
        except Exception:
            # Si le décryptage échoue, on retourne None pour forcer l'utilisation des env vars
            config_data["llm_api_key"] = None
    
    return {
        "provider": config_data.get("llm_provider"),
        "model": config_data.get("llm_model"),
        "api_key": config_data.get("llm_api_key"),
        "base_url": config_data.get("llm_base_url"),
        "embed_model": config_data.get("llm_embed_model")
    }


def configure_llm(config: dict = None):
    """
    Configure le LLM et l'embed_model en fonction de la configuration.
    Si aucune configuration n'est fournie, charge depuis la base de données.
    Si aucune configuration n'est trouvée, utilise les valeurs par défaut depuis les variables d'environnement.
    
    Args:
        config: Dictionnaire de configuration avec clés provider, model, api_key, base_url, embed_model.
                Si None, la configuration est chargée depuis la DB.
    """
    if config is None:
        config = get_llm_config_from_db()
    
    provider = config.get("provider")
    
    if provider == "ollama":
        model = config.get("model") or os.environ.get("OLLAMA_MODEL", "qwen3:0.6b")
        base_url = config.get("base_url") or os.environ.get("OLLAMA_BASE_URL")
        
        Settings.llm = Ollama(
            model=model,
            base_url=base_url,
            request_timeout=120.0
        )
        
        embed_model = config.get("embed_model") or os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text")
        Settings.embed_model = OllamaEmbedding(
            model_name=embed_model,
            base_url=base_url
        )
        
    elif provider == "mistral":
        model = config.get("model") or os.environ.get("MISTRAL_MODEL", "mistral-small-latest")
        api_key = config.get("api_key") or os.environ.get("MISTRAL_API_KEY")
        
        Settings.llm = MistralAI(
            model=model,
            api_key=api_key,
            additional_kwargs={"response_format": {"type": "json_object"}}
        )
        
        embed_model = config.get("embed_model") or os.environ.get("MISTRAL_EMBED_MODEL", "mistral-embed-2312")
        Settings.embed_model = MistralAIEmbedding(
            model_name=embed_model,
            api_key=api_key
        )
        
    else:  # Default to Google GenAI
        model = config.get("model") or os.environ.get("GOOGLE_MODEL", "gemini-3.1-flash-lite")
        api_key = config.get("api_key") or os.environ.get("GOOGLE_API_KEY")
        
        Settings.llm = GoogleGenAI(
            model=model,
            api_key=api_key
        )
        
        embed_model = config.get("embed_model") or os.environ.get("GOOGLE_EMBED_MODEL", "gemini-embedding-2")
        Settings.embed_model = GoogleGenAIEmbedding(
            model_name=embed_model,
            api_key=api_key
        )


def reload_llm_config():
    """
    Recharge la configuration LLM depuis la base de données.
    À appeler après une mise à jour de la configuration via l'interface admin.
    """
    config = get_llm_config_from_db()
    configure_llm(config)
    return {"message": "Configuration LLM rechargée avec succès", "config": config}


# Configurer le LLM au chargement du module
configure_llm()