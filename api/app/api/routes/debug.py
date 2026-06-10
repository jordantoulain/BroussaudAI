from fastapi import APIRouter
from core.supabase_client import supabase
from services.rag import retrieve_context

router = APIRouter(prefix="/debug", tags=["Débogage"])

@router.get("/db")
def read_root():
    return supabase.schema("vecs").table("documents_gemini").select("*").execute()

@router.get("/db/{uuid}")
def read_value(uuid: str):
    return (
        supabase.schema("vecs").table("documents_gemini")
        .select("*")
        .eq("id", uuid)
        .execute()
    )

@router.get("/rag/{query}")
def retrieve(query: str):
    return {
        "query": query,
        "context": retrieve_context(query)
    }