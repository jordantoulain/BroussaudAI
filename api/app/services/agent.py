import os, json, uuid
from pathlib import Path
from typing import Any, Optional
from dataclasses import dataclass
from contextlib import asynccontextmanager
from datetime import datetime

import core.llm
from core.supabase_client import supabase

from llama_index.core import VectorStoreIndex, PromptTemplate, Settings
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.schema import NodeWithScore

from llama_index.core.tools import QueryEngineTool, ToolMetadata, FunctionTool
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
    
    def get_pdf_tool(self, chat_history: list[dict[str, str]]) -> FunctionTool:
        """Crée un outil de génération de PDF pour l'agent."""
        async def _generate_pdf() -> str:
            return await generate_conversation_pdf_link(chat_history)
        
        return FunctionTool.from_defaults(
            fn=_generate_pdf,
            name="generate_conversation_pdf",
            description=(
                "Génère un fichier PDF contenant toute la conversation actuelle. "
                "Retourne un JSON avec l'URL et le nom du fichier : {\"url\": \"...\", \"filename\": \"...\"}. "
                "UTILISE CET OUTIL lorsque l'utilisateur demande explicitement un export, "
                "un téléchargement, ou un PDF de la conversation."
            ),
        )


# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def extract_json_from_response(text: str) -> str:
    start, end = text.find('{'), text.rfind('}')
    return text[start:end+1] if start != -1 and end != -1 else text


# ============================================================================
# GÉNÉRATION DE PDF ET STOCKAGE SUPABASE
# ============================================================================

class PDFGenerator:
    """Générateur de PDF pour les conversations."""
    
    @staticmethod
    def _sanitize_text_for_pdf(text: str) -> str:
        """
        Nettoie le texte pour éviter les caractères non supportés par les polices PDF de base (Helvetica).
        Remplace les caractères Unicode (accents, symboles) et les balises de formatage par des équivalents ASCII.
        """
        if not text:
            return text
        
        # Mapping des caractères accentués vers ASCII
        accent_map = {
            'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
            'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
            'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
            'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
            'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
            'Ñ': 'N', 'Ç': 'C',
            'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
            'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
            'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
            'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
            'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
            'ñ': 'n', 'ç': 'c',
            'œ': 'oe', 'æ': 'ae', 'Ø': 'O', 'ø': 'o',
            '«': '"', '»': '"', '‘': "'", '’': "'",
            '…': '...', '–': '-', '—': '--',
            '\xa0': ' ', '\u200b': ' ', '\u2009': ' ',
        }
        
        # Remplacer les caractères accentués
        for accented, plain in accent_map.items():
            text = text.replace(accented, plain)
        
        # Liste des affichettes à supprimer (from system_prompt.txt)
        show_patterns = [
            "%SHOW_TERMINE%", "%SHOW_EN_COURS%", "%SHOW_ERREUR%",
            "%SHOW_A_FAIRE%", "%SHOW_VALIDE%", "%SHOW_ECHEC%",
            "%SHOW_ATTENTE%", "%SHOW_URGENT%"
        ]
        
        # Remplacements des balises et caractères spéciaux
        replacements = {
            "▪": "• ",  # Puce -> puce ASCII + espace
            "%NL%": "\n",  # Saut de ligne
            "%BOLD%": "",  # Suppression des balises de gras
            "%ENDBOLD%": "",
        }
        
        # Appliquer les remplacements de base
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        # Supprimer toutes les affichettes
        for pattern in show_patterns:
            text = text.replace(pattern, "")
        
        # Supprimer d'autres patterns de formatage potentiels
        text = text.replace("%SHOW_", "")  # Nettoyage générique
        
        # Filtrer les caractères non-ASCII imprimables restants
        sanitized = []
        for char in text:
            # Conserver ASCII imprimable (32-126), saut de ligne (10), tabulation (9)
            if 32 <= ord(char) <= 126 or char in '\n\t':
                sanitized.append(char)
            else:
                sanitized.append(' ')  # Remplacer par espace pour éviter les sauts
        
        return ''.join(sanitized).strip()
    
    @staticmethod
    def generate_conversation_pdf(chat_history: list[dict[str, str]]) -> tuple[bytes, str]:
        """
        Génère un PDF de la conversation.
        Retourne (contenu_binaire, nom_fichier).
        """
        try:
            from fpdf import FPDF
        except ImportError:
            raise ImportError(
                "Le package 'fpdf2' est requis pour générer des PDF. "
                "Installez-le avec: pip install fpdf2"
            )
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=14, style="B")
        
        # Titre
        pdf.cell(0, 10, "Broussaud AI", ln=True, align='C')
        pdf.set_font("Arial", size=10, style="I")
        pdf.cell(0, 10, f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}", ln=True, align='C')
        pdf.ln(10)
        
        # Contenu de la conversation
        pdf.set_font("Arial", size=11)
        
        for i, interaction in enumerate(chat_history, 1):
            question = interaction.get("question", "")
            response = interaction.get("response", "")
            
            # Nettoyage des réponses JSON si nécessaire
            try:
                resp_data = json.loads(response)
                response = resp_data.get("answer", response)
            except (json.JSONDecodeError, TypeError):
                pass
            
            # Nettoyage pour compatibilité PDF (caractères Unicode non supportés)
            question = PDFGenerator._sanitize_text_for_pdf(question)
            response = PDFGenerator._sanitize_text_for_pdf(response)
            
            # Question
            pdf.set_font("Arial", 'B', 11)
            pdf.cell(0, 7, f"Question {i}:", ln=True)
            pdf.set_font("Arial", size=11)
            pdf.multi_cell(0, 5, question)
            pdf.ln(3)
            
            # Réponse
            pdf.set_font("Arial", 'B', 11)
            pdf.cell(0, 7, "Réponse:", ln=True)
            pdf.set_font("Arial", size=10)
            pdf.multi_cell(0, 5, response)
            pdf.ln(8)
        
        # Pied de page
        pdf.set_font("Arial", size=8, style="I")
        pdf.cell(0, 10, f"Total: {len(chat_history)} échanges", ln=True, align='R')
        
        # Génération du nom de fichier unique
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"conversation_{timestamp}_{uuid.uuid4().hex[:8]}.pdf"
        
        # Export en bytes
        pdf_bytes = pdf.output(dest='S')
        
        return pdf_bytes, filename
    
    @staticmethod
    async def upload_to_supabase_storage(pdf_bytes: bytes, filename: str) -> str:
        """
        Upload le PDF vers Supabase Storage.
        Retourne l'URL publique du fichier.
        """
        import os
        import tempfile
        
        storage_path = f"conversations/{filename}"
        
        # S'assurer que pdf_bytes est bien de type bytes
        if isinstance(pdf_bytes, bytearray):
            pdf_bytes = bytes(pdf_bytes)
            
        # SOLUTION ROBUSTE : Écrire dans un fichier temporaire physique
        # Cela contourne les bugs d'upload de bytes en mémoire et satisfait 
        # les vérifications de type strictes du SDK Supabase.
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(pdf_bytes)
            tmp_file_path = tmp_file.name
            
        try:
            # Upload du fichier depuis son chemin sur le disque
            response = supabase.storage.from_("conversations").upload(
                path=storage_path,
                file=tmp_file_path,  # On passe un chemin de fichier (str)
                file_options={"content-type": "application/pdf", "cache-control": "3600"}
            )
            
            # Gestion robuste des erreurs
            if hasattr(response, 'status_code') and response.status_code >= 400:
                error_msg = response.text or "Réponse HTTP vide de la part du serveur."
                raise Exception(f"Échec de l'upload vers Supabase (HTTP {response.status_code}) : {error_msg}")
            
            if hasattr(response, 'error') and response.error:
                error_msg = str(response.error)
                raise Exception(f"Échec de l'upload vers Supabase Storage : {error_msg}")
                
        finally:
            # Nettoyage indispensable : supprimer le fichier temporaire
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)
        
        # Récupération de l'URL publique
        url_response = supabase.storage.from_("conversations").get_public_url(storage_path)
        
        # Extraire l'URL selon le format de la réponse
        if hasattr(url_response, 'data') and url_response.data:
            public_url = url_response.data.get('publicUrl') or url_response.data.get('url')
        elif hasattr(url_response, 'publicUrl'):
            public_url = url_response.publicUrl
        elif isinstance(url_response, str):
            public_url = url_response
        else:
            public_url = str(url_response) if url_response else None
        
        if not public_url:
            raise Exception("Impossible de récupérer l'URL publique du fichier")
        
        return public_url


async def generate_conversation_pdf_link(chat_history: list[dict[str, str]]) -> str:
    """
    Fonction principale pour générer un PDF et retourner ses informations.
    Utilisée comme outil par l'agent.
    Retourne un JSON avec url et filename.
    """
    if not chat_history:
        return json.dumps({"error": "Aucune conversation à exporter en PDF", "name": null, "url": null})
    
    try:
        # Génération du PDF
        pdf_bytes, filename = PDFGenerator.generate_conversation_pdf(chat_history)
        
        # Upload vers Supabase Storage
        public_url = await PDFGenerator.upload_to_supabase_storage(pdf_bytes, filename)
        
        return json.dumps({
            "url": public_url,
            "name": filename
        })
    except Exception as e:
        return json.dumps({
            "error": f"Erreur lors de la génération du PDF: {str(e)}"
        })

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
    
    # Ajout de l'outil PDF si historique disponible
    history = chat_history or []
    if history:
        local_tools.append(service.get_pdf_tool(history))
    
    try:
        mcp_client = BasicMCPClient(service.config.mcp_server_url)
        mcp_tool_spec = McpToolSpec(client=mcp_client)
        external_mcp_tools = await mcp_tool_spec.to_tool_list_async()
    except Exception as e:
        print(f"Attention: Impossible de récupérer les outils du serveur MCP distant ({e})")
        external_mcp_tools = []
    
    all_tools = local_tools + external_mcp_tools
    
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