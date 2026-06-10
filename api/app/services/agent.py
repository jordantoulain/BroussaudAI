import os, json
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

from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.agent.workflow import FunctionAgent

from llama_index.tools.mcp import BasicMCPClient, McpToolSpec

# ============================================================================
# INTERCEPTEUR GEMINI [LOCAL UNIQUEMENT]
# ============================================================================

import copy
import google.genai._transformers as transformers

original_t_schema = transformers.t_schema

def clean_gemini_schema(data):
    if isinstance(data, dict):
        data.pop("additionalProperties", None)
        data.pop("additional_properties", None)
        for value in data.values():
            clean_gemini_schema(value)
    elif isinstance(data, list):
        for item in data:
            clean_gemini_schema(item)
    return data

def patched_t_schema(client, schema):
    if hasattr(schema, "model_json_schema"):
        schema_dict = schema.model_json_schema()
    elif hasattr(schema, "schema"):
        schema_dict = schema.schema()
    elif isinstance(schema, dict):
        schema_dict = copy.deepcopy(schema)
    else:
        return original_t_schema(client, schema)
        
    cleaned_schema = clean_gemini_schema(schema_dict)
    return original_t_schema(client, cleaned_schema)

transformers.t_schema = patched_t_schema

# ============================================================================
# CONFIGURATION
# ============================================================================

@dataclass
class RAGConfig:
    collection_name: str = "documents_gemini"
    dimension: int = 3072
    similarity_top_k: int = 10
    
    mcp_server_url: str = "http://host.docker.internal:8010/mcp"
    
    prompts_dir: Path = Path(__file__).parent / "prompts"
    
    @classmethod
    def from_env(cls) -> "RAGConfig":
        return cls(
            collection_name=os.environ.get("RAG_COLLECTION_NAME", "documents_gemini"),
            dimension=int(os.environ.get("RAG_EMBEDDING_DIM", "3072")),
            similarity_top_k=int(os.environ.get("RAG_SIMILARITY_TOP_K", "10")),
            mcp_server_url=os.environ.get("MCP_SERVER_URL", "http://host.docker.internal:8010/mcp"),
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
        
        raise FileNotFoundError(f"Prompt file not found: tried {txt_path}")
    
    def get_prompt_template(self, name: str = "qa_prompt") -> PromptTemplate:
        return PromptTemplate(self.load_prompt(name))


# ============================================================================
# SERVICE RAG (OUTIL LOCAL)
# ============================================================================

class RAGAgentService:
    def __init__(self, config: Optional[RAGConfig] = None):
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
        engine = self.index.as_query_engine(
            similarity_top_k=self.config.similarity_top_k,
        )
        engine.update_prompts({
            "response_synthesizer:text_qa_template": self.qa_prompt
        })
        return engine

    def get_rag_tool(self) -> QueryEngineTool:
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


# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def format_source_nodes(source_nodes: list[NodeWithScore]) -> list[dict[str, Any]]:
    return [
        {
            "id": node.node.node_id,
            "content": node.text,
            "score": round(node.score, 4) if node.score else None,
            "metadata": node.metadata,
        }
        for node in source_nodes
    ]

def extract_json_from_response(text: str) -> str:
    start, end = text.find('{'), text.rfind('}')
    return text[start:end+1] if start != -1 and end != -1 else text

# ============================================================================
# EXÉCUTION PRINCIPALE (AGENT MULTI-OUTILS)
# ============================================================================

@asynccontextmanager
async def get_rag_service(config: Optional[RAGConfig] = None):
    yield RAGAgentService(config)


async def chat_with_agent(
    service: RAGAgentService,
    query: str,
    chat_history: Optional[list[dict[str, str]]] = None
) -> dict[str, Any]:

    local_tools = [service.get_rag_tool()]
    
    try:
        mcp_client = BasicMCPClient(service.config.mcp_server_url)
        mcp_tool_spec = McpToolSpec(client=mcp_client)
        external_mcp_tools = await mcp_tool_spec.to_tool_list_async()
    except Exception as e:
        print(f"Attention: Impossible de récupérer les outils du serveur MCP distant ({e})")
        external_mcp_tools = []
    
    all_tools = local_tools + external_mcp_tools
    
    history = chat_history or []
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
    
    agent = FunctionAgent(
        name="AssistantGlobal",
        description="Un assistant intelligent capable d'interroger une base documentaire et une base de donnée externe.",
        system_prompt=service.system_prompt_str,
        tools=all_tools,
        llm=Settings.llm,
    )
    
    response = await agent.run(query, memory=memory)

    raw_output = str(response.response if hasattr(response, 'response') else response)
    clean_json = extract_json_from_response(raw_output)
    
    return {
        "response": clean_json,
        "context": [] 
    }