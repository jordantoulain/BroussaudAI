"""
Configuration for RAG and agent services.
"""
import os
from pathlib import Path
from dataclasses import dataclass


@dataclass
class RAGConfig:
    """Configuration for RAG (Retrieval-Augmented Generation) service."""
    collection_name: str = "documents_gemini"
    dimension: int = 3072
    similarity_top_k: int = 10
    
    mcp_server_url: str = "http://host.docker.internal:8010/mcp"
    
    prompts_dir: Path = Path(__file__).parent / "prompts"
    
    @classmethod
    def from_env(cls) -> "RAGConfig":
        """Create configuration from environment variables."""
        return cls(
            collection_name=os.environ.get("RAG_COLLECTION_NAME", "documents_gemini"),
            dimension=int(os.environ.get("RAG_EMBEDDING_DIM", "3072")),
            similarity_top_k=int(os.environ.get("RAG_SIMILARITY_TOP_K", "10")),
            mcp_server_url=os.environ.get("MCP_SERVER_URL", "http://host.docker.internal:8010/mcp"),
        )
