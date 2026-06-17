"""
Agent services package.

This package contains modular services for the chatbot agent:
- config: Configuration management (RAGConfig)
- prompts: Prompt loading and management (PromptManager)
- utils: Utility functions and patches (extract_json_from_response, gemini patch)
- pdf_generator: PDF generation and Supabase upload (PDFGenerator)
- rag_service: RAG operations and tool creation (RAGAgentService)
- agent_orchestrator: Agent creation and chat execution (chat_with_agent)
"""

# Import and re-export main components for convenience
from .config import RAGConfig
from .prompts import PromptManager
from .utils import extract_json_from_response
from .pdf_generator import PDFGenerator, generate_conversation_pdf_link
from .rag_service import RAGAgentService, get_rag_service
from .agent_orchestrator import chat_with_agent

__all__ = [
    # Configuration
    'RAGConfig',
    # Prompts
    'PromptManager',
    # Utilities
    'extract_json_from_response',
    # PDF Generation
    'PDFGenerator',
    'generate_conversation_pdf_link',
    # RAG Service
    'RAGAgentService',
    'get_rag_service',
    # Agent Orchestrator
    'chat_with_agent',
]
