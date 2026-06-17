"""
Agent orchestrator for multi-tool chat interactions.
Handles agent creation, tool integration, and chat execution.
"""
import json
from contextlib import asynccontextmanager
from typing import Any, Optional

from llama_index.core import Settings
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.tools.mcp import BasicMCPClient, McpToolSpec

from .config import RAGConfig
from .rag_service import RAGAgentService
from .utils import extract_json_from_response


async def chat_with_agent(
    service: RAGAgentService,
    query: str,
    chat_history: Optional[list[dict[str, str]]] = None
) -> dict[str, Any]:
    """
    Execute a chat query with the agent.
    
    Args:
        service: RAG agent service instance
        query: User query string
        chat_history: Optional previous chat history
        
    Returns:
        Dictionary with response and context
    """
    local_tools = [service.get_rag_tool()]
    
    # Add PDF tool if history is available
    history = chat_history or []
    if history:
        local_tools.append(service.get_pdf_tool(history))
    
    # Load MCP tools if available
    try:
        mcp_client = BasicMCPClient(service.config.mcp_server_url)
        mcp_tool_spec = McpToolSpec(client=mcp_client)
        external_mcp_tools = await mcp_tool_spec.to_tool_list_async()
    except Exception as e:
        print(f"Attention: Impossible de récupérer les outils du serveur MCP distant ({e})")
        external_mcp_tools = []
    
    all_tools = local_tools + external_mcp_tools
    
    # Convert chat history to memory buffer
    chat_messages = []
    
    for interaction in history:
        if "question" in interaction:
            chat_messages.append(ChatMessage(role=MessageRole.USER, content=interaction["question"]))
            
        if "response" in interaction:
            raw_resp = interaction["response"]
            try:
                parsed_resp = json.loads(raw_resp)
                clean_content = parsed_resp.get("answer", raw_resp)
            except json.JSONDecodeError:
                clean_content = raw_resp
            
            chat_messages.append(ChatMessage(role=MessageRole.ASSISTANT, content=clean_content))

    memory = ChatMemoryBuffer.from_defaults(chat_history=chat_messages)
    
    # Create and configure agent
    agent = FunctionAgent(
        name="AssistantGlobal",
        description="Un assistant intelligent capable d'interroger une base documentaire et une base de donnée externe.",
        system_prompt=service.system_prompt_str,
        tools=all_tools,
        llm=Settings.llm,
    )
    
    # Execute query
    response = await agent.run(query, memory=memory)
    
    # Process response
    raw_output = str(response.response if hasattr(response, 'response') else response)
    clean_json = extract_json_from_response(raw_output)
    
    return {
        "response": clean_json,
        "context": []
    }


@asynccontextmanager
async def get_rag_service(config: Optional[RAGConfig] = None):
    """
    Context manager for RAG service (re-exported for convenience).
    
    Args:
        config: RAG configuration (optional)
        
    Yields:
        RAGAgentService instance
    """
    from .rag_service import get_rag_service as _get_rag_service
    async with _get_rag_service(config) as service:
        yield service
