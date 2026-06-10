import tempfile
import os
import uuid
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from llama_index.core import Document, Settings
from llama_index.readers.file import PDFReader
from pydantic import BaseModel
from api.routes.auth import get_current_user
from core.supabase_client import supabase
from services.agent import get_rag_service, chat_with_agent

router = APIRouter(prefix="/ai", tags=["Intelligence Artificielle"])

class UserPrompt(BaseModel):
    text: str
    conversation_id: str | None = None

@router.post("/chat")
async def rag_route(data: UserPrompt, current_user: dict = Depends(get_current_user)):
    question = data.text
    conv_id = data.conversation_id
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Le champ 'text' est obligatoire."
        )
    
    if not conv_id:
        conv_id = str(uuid.uuid4())
        supabase.table("conversations").insert({
            "id": conv_id,
            "user_id": current_user["id"],
            "title": ""
        }).execute()

    history_response = supabase.table("messages") \
        .select("question, response") \
        .eq("conversation_id", conv_id) \
        .order("created_at", desc=False) \
        .limit(5) \
        .execute()
    
    past_interactions = history_response.data

    async with get_rag_service() as service:
        rag_result = await chat_with_agent(service, question, past_interactions)

    response_str = rag_result["response"]

    print(rag_result)

    label = "RAG"
    sub_label = "GENERAL"
    tags = []
    contexts = []
    final_answer = response_str

    try:
        cleaned = response_str.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned.split("```json")[1].split("```")[0].strip()
        
        parsed_json = json.loads(cleaned)
        label = parsed_json.get("label", label)
        sub_label = parsed_json.get("sub_label", sub_label)
        tags = parsed_json.get("tags", tags)
        title = parsed_json.get("title", tags)
        contexts = parsed_json.get("contexts", contexts)
        final_answer = parsed_json.get("answer", response_str)
    except json.JSONDecodeError:
        pass

    conv_response = supabase.table("conversations").select("title").eq("id", conv_id).execute()
    if not conv_response.data or not conv_response.data[0].get("title"):
        title_to_set = title or (question[:50] if question else "Nouvelle conversation")
        supabase.table("conversations").update({"title": title_to_set}).eq("id", conv_id).execute()

    log_data = {
        "conversation_id": conv_id,
        "question": question,
        "label": label,
        "sub_label": sub_label,
        "tags": tags,
        "contexts": contexts,
        "response": final_answer
    }

    print(log_data)

    try:
        supabase.table("messages").insert(log_data).execute()
    except Exception as e:
        print(f"Erreur log RAG : {e}")

    rag_result["conversation_id"] = conv_id
    rag_result["contexts"] = contexts
    
    return rag_result

@router.post("/embedding")
async def embed(
    text: str | None = Form(None),
    file: UploadFile | None = File(None),
    current_user: dict = Depends(get_current_user)
):
    if file is not None:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            reader = PDFReader()
            documents = reader.load_data(tmp_path)
            
            for doc in documents:
                doc.metadata["filename"] = file.filename
            
            nodes = Settings.node_parser.get_nodes_from_documents(documents)
            
            for node in nodes:
                if "filename" not in node.metadata:
                    node.metadata["filename"] = file.filename
            
            index.insert_nodes(nodes)
                
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        return {
            "status": "success",
            "type": "pdf",
            "filename": file.filename,
            "chunks": len(nodes)
        }

    if text:
        doc = Document(text=text, metadata={"filename": "custom_text"})
        index.insert(doc)

        return {
            "status": "success",
            "type": "text",
            "filename": "custom_text"
        }

    raise HTTPException(
        status_code=400,
        detail="Provide either 'text' or 'file'"
    )