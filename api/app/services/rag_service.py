"""
RAG (Retrieval-Augmented Generation) service for agent.
Handles vector store, query engine, and tool creation.
"""
import os
from contextlib import asynccontextmanager
from typing import Optional

from llama_index.core import VectorStoreIndex, PromptTemplate, Settings
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.schema import NodeWithScore
from llama_index.core.tools import QueryEngineTool, ToolMetadata, FunctionTool

from .config import RAGConfig
from .prompts import PromptManager
from .pdf_generator import generate_conversation_pdf_link


class RAGAgentService:
    """
    Service for RAG operations including vector store management,
    query engine creation, and tool provisioning.
    """
    
    def __init__(self, config: Optional[RAGConfig] = None):
        """
        Initialize RAG agent service.
        
        Args:
            config: RAG configuration. Uses environment variables if not provided.
        """
        self.config = config or RAGConfig.from_env()
        self.prompt_manager = PromptManager(self.config.prompts_dir)

        self.qa_prompt = self.prompt_manager.get_prompt_template("qa_prompt")
        self.system_prompt_str = self.prompt_manager.load_prompt("system_prompt")
        
        self.vector_store = SupabaseVectorStore(
            postgres_connection_string=os.environ.get("SUPABASE_CONNECTION_STRING"),
            collection_name=self.config.collection_name,
            dimension=self.config.dimension,
        )
        self.index = VectorStoreIndex.from_vector_store(
            vector_store=self.vector_store,
            embed_model=Settings.embed_model,
        )
    
    @property
    def query_engine(self):
        """
        Get query engine with configured prompts.
        
        Returns:
            Configured query engine instance
        """
        engine = self.index.as_query_engine(
            similarity_top_k=self.config.similarity_top_k,
        )
        engine.update_prompts({
            "response_synthesizer:text_qa_template": self.qa_prompt
        })
        return engine
    
    def get_rag_tool(self) -> QueryEngineTool:
        """
        Get RAG knowledge base tool.
        
        Returns:
            QueryEngineTool configured for internal knowledge base
        """
        return QueryEngineTool(
            query_engine=self.query_engine,
            metadata=ToolMetadata(
                name="rag_knowledge_base",
                description=(
                    "Base documentaire interne de l'usine textile (procédures, RH, machines, qualité, etc.). "
                    "UTILISE CET OUTIL EN PRIORITÉ pour toute question sur le fonctionnement interne. "
                    "Si un autre outil (base de données, MCP) ne renvoie pas l'information demandée, "
                    "tu DOIS OBLIGATOIREMENT interroger cet outil en guise de secours avant de répondre."
                ),
            ),
        )
    
    def get_pdf_tool(self, chat_history: list[dict[str, str]]) -> FunctionTool:
        """
        Create PDF generation tool for the agent.
        
        Args:
            chat_history: Current chat history
            
        Returns:
            FunctionTool for generating conversation PDFs
        """
        async def _generate_pdf(action: str) -> str:
            """
            Args:
                action: L'action à exécuter, doit toujours être 'generate_pdf'
            """
            # On ignore l'argument 'action' puisqu'il ne sert qu'à berner le LLM
            return await generate_conversation_pdf_link(chat_history)
        
        return FunctionTool.from_defaults(
            fn=_generate_pdf,
            name="generate_conversation_pdf",
            description=(
                "Génère un fichier PDF contenant toute la conversation actuelle. "
                "Retourne un JSON avec l'URL et le nom du fichier : {\"url\": \"...\", \"filename\": \"...\"}. "
                "UTILISE CET OUTIL OBLIGATOIREMENT lorsque l'utilisateur demande explicitement un export, "
                "un téléchargement, ou un PDF de la conversation."
            ),
        )


@asynccontextmanager
async def get_rag_service(config: Optional[RAGConfig] = None):
    """
    Context manager for RAG service.
    
    Args:
        config: RAG configuration (optional)
        
    Yields:
        RAGAgentService instance
    """
    yield RAGAgentService(config)
