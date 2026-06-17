import tempfile
import os
import uuid
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from llama_index.core import Document, Settings
from llama_index.readers.file import PandasCSVReader, PandasExcelReader, PDFReader, MarkdownReader
from llama_index.readers.json import JSONReader
from pydantic import BaseModel
from api.routes.auth import get_current_user
from api.routes.admin import verify_admin
from core.supabase_client import supabase
from services.agent import get_rag_service, chat_with_agent
from datetime import datetime

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
    
    long_history_response = supabase.table("messages") \
        .select("question, response") \
        .eq("conversation_id", conv_id) \
        .order("created_at", desc=False) \
        .execute()
    
    past_interactions = history_response.data
    long_past_interactions = long_history_response.data

    current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    enriched_question = f"Information système : La date et l'heure actuelles sont {current_date}.\n\nRequête de l'utilisateur : {question}"

    async with get_rag_service() as service:
        rag_result = await chat_with_agent(service, enriched_question, past_interactions, long_past_interactions)

    response_str = rag_result["response"]

    print(rag_result)

    label = "RAG"
    sub_label = "GENERAL"
    tags = []
    contexts = []
    file_data = None
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
        file_data = parsed_json.get("file", None)
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
        "response": final_answer,
        "file": file_data
    }

    print(log_data)

    try:
        # Insérer le message et récupérer l'ID
        message_response = supabase.table("messages").insert(log_data).execute()
        # Récupérer l'ID du message fraîchement inséré
        if message_response.data:
            message_id = message_response.data[0].get("id")
            rag_result["message_id"] = message_id
    except Exception as e:
        print(f"Erreur log RAG : {e}")

    rag_result["conversation_id"] = conv_id
    rag_result["contexts"] = contexts
    rag_result["file"] = file_data
    
    return rag_result

@router.post("/embedding")
async def embed(
    text: str | None = Form(None),
    file: UploadFile | None = File(None),
    current_user: dict = Depends(get_current_user)
):
    # Vérifier que l'utilisateur est ADMIN
    verify_admin(current_user)
    
    if file is not None:
        # Extensions autorisées
        ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.json', '.csv', '.xlsx', '.md'}
        filename = file.filename.lower()
        
        # Vérifier l'extension
        if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Extensions autorisées : PDF, TXT, JSON, CSV, XLSX, MD"
            )
        
        # Vérifier si un document avec le même nom existe déjà
        existing_response = supabase.schema("vecs").table("documents_gemini") \
            .select("id, metadata") \
            .execute()
        
        existing_documents = existing_response.data or []
        for doc in existing_documents:
            if doc.get("metadata", {}).get("filename") == file.filename:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Un document avec le nom '{file.filename}' existe déjà"
                )
        
        async with get_rag_service() as service:
            # Déterminer le suffixe et le reader selon l'extension
            reader = None
            if filename.endswith('.pdf'):
                suffix = ".pdf"
                reader = PDFReader()
                use_reader = True
            elif filename.endswith('.md'):
                suffix = ".md"
                reader = MarkdownReader()
                use_reader = True
            elif filename.endswith('.txt'):
                # Pour TXT, on lit directement le contenu
                suffix = ".txt"
                use_reader = False
            elif filename.endswith('.csv'):
                suffix = ".csv"
                reader = PandasCSVReader()
                use_reader = True
            elif filename.endswith('.xlsx'):
                suffix = ".xlsx"
                reader = PandasExcelReader()
                use_reader = True
            elif filename.endswith('.json'):
                suffix = ".json"
                reader = JSONReader()
                use_reader = True
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Format non supporté pour l'extraction : {filename}"
                )
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name

            try:
                if use_reader:
                    documents = reader.load_data(tmp_path)
                else:
                    # Lire le fichier TXT directement
                    with open(tmp_path, 'r', encoding='utf-8') as f:
                        text_content = f.read()
                    documents = [Document(text=text_content)]
                
                for doc in documents:
                    doc.metadata["filename"] = file.filename
                
                nodes = Settings.node_parser.get_nodes_from_documents(documents)
                
                for node in nodes:
                    if "filename" not in node.metadata:
                        node.metadata["filename"] = file.filename
                
                service.index.insert_nodes(nodes)
                
                file_type = file.filename.split('.')[-1].lower()
                
                return {
                    "status": "success",
                    "type": file_type,
                    "filename": file.filename,
                    "chunks": len(nodes)
                }
                    
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

    if text:
        async with get_rag_service() as service:
            doc = Document(text=text, metadata={"filename": "custom_text"})
            service.index.insert(doc)
            
            return {
                "status": "success",
                "type": "text",
                "filename": "custom_text"
            }

    raise HTTPException(
        status_code=400,
        detail="Provide either 'text' or 'file'"
    )