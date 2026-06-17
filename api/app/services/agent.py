"""
Main agent module - imports all services from modular components.

This file now serves as a clean entry point that imports everything from
the separated modules. This maintains backward compatibility while
enabling a clean, modular architecture.

Structure:
- config.py: Configuration (RAGConfig)
- prompts.py: Prompt management (PromptManager)
- utils.py: Utilities (extract_json_from_response, gemini patch)
- pdf_generator.py: PDF generation (PDFGenerator, generate_conversation_pdf_link)
- rag_service.py: RAG operations (RAGAgentService, get_rag_service)
- agent_orchestrator.py: Agent execution (chat_with_agent)
"""

# ============================================================================
# IMPORTS FROM MODULAR COMPONENTS
# ============================================================================

# Ensure all submodules are loaded (for patching to take effect)
import core.llm
from core.supabase_client import supabase

# Load the Gemini patch first (important for it to take effect before other imports)
from . import utils  # noqa: F401 - This triggers the gemini patch

# Now import everything else
from .config import RAGConfig
from .prompts import PromptManager
from .pdf_generator import PDFGenerator, generate_conversation_pdf_link
from .rag_service import RAGAgentService, get_rag_service
from .agent_orchestrator import chat_with_agent
from .utils import extract_json_from_response


# ============================================================================
# BACKWARD COMPATIBILITY
# ============================================================================

# Re-export everything that was previously in this file
__all__ = [
    # Configuration
    'RAGConfig',
    # Prompt management
    'PromptManager',
    # Utilities
    'extract_json_from_response',
    # PDF Generation
    'PDFGenerator',
    'generate_conversation_pdf_link',
    # RAG Service
    'RAGAgentService',
    'get_rag_service',
    # Agent execution
    'chat_with_agent',
]
