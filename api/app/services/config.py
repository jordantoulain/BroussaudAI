"""
Configuration for RAG and agent services.
"""
import os
from pathlib import Path
from dataclasses import dataclass
from supabase import create_client

# Initialisation du client Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_KEY", "")
)


@dataclass
class RAGConfig:
    """Configuration for RAG (Retrieval-Augmented Generation) service."""
    collection_name: str = "documents_gemini"
    dimension: int = 3072
    similarity_top_k: int = 10
    
    mcp_server_url: str = "http://host.docker.internal:8010/mcp"
    
    prompts_dir: Path = Path(__file__).parent / "prompts"
    
    @classmethod
    def from_db(cls) -> "RAGConfig":
        """Create configuration from database config table."""
        collection_name = os.environ.get("RAG_COLLECTION_NAME", "documents_gemini")
        dimension = 3072
        
        try:
            # Récupérer le nom de collection depuis la DB
            collection_response = supabase.table("config") \
                .select("value") \
                .eq("key", "llm_collection_name") \
                .maybe_single() \
                .execute()
            
            if collection_response and hasattr(collection_response, 'data') and collection_response.data and collection_response.data.get("value"):
                collection_name = collection_response.data["value"]
        except Exception:
            pass
        
        try:
            # Récupérer la dimension depuis la DB
            response = supabase.table("config") \
                .select("value") \
                .eq("key", "llm_embed_dimension") \
                .maybe_single() \
                .execute()
            
            if response and hasattr(response, 'data') and response.data and response.data.get("value"):
                dimension = int(response.data["value"])
        except Exception:
            pass
        
        return cls(
            collection_name=collection_name,
            dimension=dimension,
            similarity_top_k=int(os.environ.get("RAG_SIMILARITY_TOP_K", "10")),
            mcp_server_url=os.environ.get("MCP_SERVER_URL", "http://host.docker.internal:8010/mcp"),
        )
    
    @classmethod
    def from_env(cls) -> "RAGConfig":
        """Create configuration from environment variables."""
        return cls(
            collection_name=os.environ.get("RAG_COLLECTION_NAME", "documents_gemini"),
            dimension=int(os.environ.get("RAG_EMBEDDING_DIM", "3072")),
            similarity_top_k=int(os.environ.get("RAG_SIMILARITY_TOP_K", "10")),
            mcp_server_url=os.environ.get("MCP_SERVER_URL", "http://host.docker.internal:8010/mcp"),
        )
