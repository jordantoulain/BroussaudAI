import os
from llama_index.core import Settings
# from llama_index.llms.ollama import Ollama
# from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
# from llama_index.llms.mistralai import MistralAI
# from llama_index.embeddings.mistralai import MistralAIEmbedding

# OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL")

# Settings.llm = Ollama(
#     model="qwen3:0.6b", 
#     base_url=OLLAMA_BASE_URL,
#     request_timeout=120.0
# )

# Settings.embed_model = OllamaEmbedding(
#     model_name="nomic-embed-text", 
#     base_url=OLLAMA_BASE_URL
# )

Settings.llm = GoogleGenAI(
    model="gemini-3.1-flash-lite",
    api_key=os.environ.get("GOOGLE_API_KEY")
)

Settings.embed_model = GoogleGenAIEmbedding(
    model_name="gemini-embedding-2",
    api_key=os.environ.get("GOOGLE_API_KEY")
)

# Settings.llm = MistralAI(
#     model="mistral-small-latest",
#     api_key=os.environ.get("MISTRAL_API_KEY"),
#     additional_kwargs={"response_format": {"type": "json_object"}}
# )

# Settings.embed_model = MistralAIEmbedding(
#     model_name="mistral-embed-2312",
#     api_key=os.environ.get("MISTRAL_API_KEY")
# )