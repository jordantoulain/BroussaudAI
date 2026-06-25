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
            config: RAG configuration. Uses database config if not provided.
        """
        from core.supabase_client import supabase
        
        self.config = config or RAGConfig.from_db()
        self.prompt_manager = PromptManager(self.config.prompts_dir)

        self.qa_prompt = self.prompt_manager.get_prompt_template("qa_prompt")
        
        # Récupérer le system prompt depuis la base de données
        try:
            response = supabase.table("config") \
                .select("value") \
                .eq("key", "system_prompt") \
                .maybe_single() \
                .execute()
            
            # Gestion sécurisée de la réponse
            if response and hasattr(response, 'data') and response.data and response.data.get("value"):
                self.system_prompt_str = response.data["value"]
            else:
                # Fallback vers le fichier si non configuré en DB
                self.system_prompt_str = self.prompt_manager.load_prompt("system_prompt")
        except Exception as e:
            # En cas d'erreur, utiliser le fichier comme fallback
            print(f"Attention: Impossible de récupérer le system prompt depuis la DB: {e}")
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
    
    def get_summary_tool(self, chat_history: list[dict[str, str]]) -> FunctionTool:
        """
        Create conversation summary tool for the agent.
        
        Args:
            chat_history: Current chat history
            
        Returns:
            FunctionTool for generating conversation summaries
        """
        async def _generate_summary(action: str) -> str:
            """
            Generate a comprehensive summary of the entire conversation.
            
            Args:
                action: L'action à exécuter, doit toujours être 'generate_summary'
            """
            if not chat_history:
                return "Aucune conversation à résumer."
            
            # Formatter l'historique pour le prompt
            conversation_text = ""
            for i, interaction in enumerate(chat_history, 1):
                question = interaction.get("question", "")
                response = interaction.get("response", "")
                
                if question:
                    conversation_text += f"\n=== Échange {i} ===\n"
                    conversation_text += f"Q: {question}\n"
                    conversation_text += f"R: {response}\n"
            
            summary_prompt = (
                "Tu es un assistant qui doit résumer une conversation complète de manière claire et structurée. "
                "Analyse la conversation suivante et génère un résumé complet qui inclut :\n"
                "1. Le sujet principal de la conversation\n"
                "2. Les points clés abordés\n"
                "3. Les décisions ou conclusions importantes\n"
                "4. Les actions à entreprendre (si applicable)\n"
                "5. Un résumé général en 3-5 phrases\n\n"
                f"Conversation:\n{conversation_text}\n\n"
                "Réponds UNIQUEMENT avec le résumé au format markdown, sans introduction ni conclusion."
            )
            
            # Utiliser le LLM pour générer le résumé
            llm = Settings.llm
            response = await llm.acomplete(summary_prompt)
            
            return str(response)
        
        return FunctionTool.from_defaults(
            fn=_generate_summary,
            name="generate_conversation_summary",
            description=(
                "Génère un résumé complet et structuré de toute la conversation actuelle. "
                "Le résumé inclut : le sujet principal, les points clés, les décisions, "
                "les actions à entreprendre, et un résumé général. "
                "UTILISE CET OUTIL OBLIGATOIREMENT lorsque l'utilisateur demande un résumé, "
                "un récapitulatif, ou de résumer la conversation."
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
