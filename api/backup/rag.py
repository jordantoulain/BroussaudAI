import os
from pathlib import Path
from typing import Any, Optional
from dataclasses import dataclass
from contextlib import asynccontextmanager

import core.llm

from llama_index.core import VectorStoreIndex, PromptTemplate, Settings
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.schema import NodeWithScore


# ============================================================================
# CONFIGURATION
# ============================================================================

@dataclass
class RAGConfig:
    collection_name: str = "documents_gemini"
    dimension: int = 3072
    similarity_top_k: int = 10
    
    prompts_dir: Path = Path(__file__).parent / "prompts"
    
    @classmethod
    def from_env(cls) -> "RAGConfig":
        return cls(
            collection_name=os.environ.get("RAG_COLLECTION_NAME", "documents_gemini"),
            dimension=int(os.environ.get("RAG_EMBEDDING_DIM", "3072")),
            similarity_top_k=int(os.environ.get("RAG_SIMILARITY_TOP_K", "10")),
        )


# ============================================================================
# GESTION DES PROMPTS
# ============================================================================

class PromptManager:    
    def __init__(self, prompts_dir: Optional[Path] = None):
        self.prompts_dir = prompts_dir or (Path(__file__).parent / "prompts")
        self._prompts: dict[str, str] = {}
    
    def load_prompt(self, name: str) -> str:
        if name in self._prompts:
            return self._prompts[name]
        
        txt_path = self.prompts_dir / f"{name}.txt"
        if txt_path.exists():
            with open(txt_path, "r", encoding="utf-8") as f:
                self._prompts[name] = f.read()
            return self._prompts[name]
        
        raise FileNotFoundError(
            f"Prompt file not found: tried {txt_path}"
        )
    
    def get_prompt_template(self, name: str = "qa_prompt") -> PromptTemplate:
        template = self.load_prompt(name)
        return PromptTemplate(template)


# ============================================================================
# SERVICE RAG
# ============================================================================

class RAGService:
    def __init__(self, config: Optional[RAGConfig] = None):
        self.config = config or RAGConfig.from_env()
        self.prompt_manager = PromptManager(self.config.prompts_dir)
        self.qa_prompt = self.prompt_manager.get_prompt_template("qa_prompt")
        self._initialize_vector_store()
        self._initialize_index()
        
    def _initialize_vector_store(self) -> None:
        self.vector_store = SupabaseVectorStore(
            postgres_connection_string=os.environ.get("SUPABASE_CONNECTION_STRING"),
            collection_name=self.config.collection_name,
            dimension=self.config.dimension,
        )
    
    def _initialize_index(self) -> None:
        self.index = VectorStoreIndex.from_vector_store(
            vector_store=self.vector_store,
            embed_model=Settings.embed_model,
        )
    
    @property
    def retriever(self):
        return self.index.as_retriever(
            similarity_top_k=self.config.similarity_top_k
        )
    
    @property
    def query_engine(self):
        engine = self.index.as_query_engine(
            similarity_top_k=self.config.similarity_top_k,
        )
        engine.update_prompts({
            "response_synthesizer:text_qa_template": self.qa_prompt
        })
        return engine
    
    @property
    def chat_query_engine(self):
        return self.index.as_chat_engine(
            chat_mode="condense_question",
            query_engine_kwargs={"similarity_top_k": self.config.similarity_top_k}
        )


# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def format_node_to_dict(node: NodeWithScore) -> dict[str, Any]:
    return {
        "id": node.node.node_id,
        "score": round(node.score, 4) if node.score else None,
        "content": node.text,
        "metadata": node.metadata,
    }


def format_source_nodes(source_nodes: list[NodeWithScore]) -> list[dict[str, Any]]:
    return [
        {
            "content": node.text,
            "score": round(node.score, 4) if node.score else None
        }
        for node in source_nodes
    ]


# ============================================================================
# FONCTIONS PRINCIPALES
# ============================================================================

@asynccontextmanager
async def get_rag_service(config: Optional[RAGConfig] = None):
    service = RAGService(config)
    try:
        yield service
    finally:
        pass


def retrieve_context(service: RAGService, query: str) -> list[dict[str, Any]]:
    retriever = service.retriever
    nodes = retriever.retrieve(query)
    return [format_node_to_dict(node) for node in nodes]


async def chat_rag(
    service: RAGService,
    query: str,
    chat_history: Optional[list[dict[str, str]]] = None
) -> dict[str, Any]:
    
    history = chat_history or []
    chat_messages = []
    
    for interaction in history:
        chat_messages.append(
            ChatMessage(
                role=MessageRole.USER,
                content=interaction.get("question", "")
            )
        )
        chat_messages.append(
            ChatMessage(
                role=MessageRole.ASSISTANT,
                content=interaction.get("response", "")
            )
        )
    
    memory = ChatMemoryBuffer.from_defaults(chat_history=chat_messages)
    
    chat_engine = service.index.as_chat_engine(
        chat_mode="condense_question",
        memory=memory,
        query_engine_kwargs={"similarity_top_k": service.config.similarity_top_k}
    )
    
    chat_engine._query_engine.update_prompts({
        "response_synthesizer:text_qa_template": service.qa_prompt
    })
    
    response = await chat_engine.achat(query)
    
    return {
        "context": format_source_nodes(response.source_nodes),
        "response": str(response),
    }