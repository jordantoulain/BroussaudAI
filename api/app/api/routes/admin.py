from fastapi import APIRouter, HTTPException, Depends, status
from api.routes.auth import get_current_user, get_password_hash
from core.supabase_client import supabase

router = APIRouter(prefix="/admin", tags=["Administration"])


def verify_admin(current_user: dict):
    """Vérifie que l'utilisateur a le rôle ADMIN."""
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit. Rôle ADMIN requis."
        )


def get_timeline_data():
    """Récupère les données de timeline pour les 10 derniers jours"""
    from datetime import datetime, timezone, timedelta
    
    try:
        today = datetime.now(timezone.utc).date()
        last_10_days = [(today - timedelta(days=i)).isoformat() for i in range(9, -1, -1)]
        
        # Récupérer TOUTES les conversations
        conv_resp = supabase.table("conversations") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(1000) \
            .execute()
        
        # Récupérer TOUS les messages
        msg_resp = supabase.table("messages") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(1000) \
            .execute()
        
        conversations = conv_resp.data or []
        messages = msg_resp.data or []
        
        # Fonction pour extraire la date
        def get_date_str(item):
            for field in ["created_at", "date", "createdDate", "created"]:
                if item.get(field):
                    val = item[field]
                    if isinstance(val, str):
                        if "T" in val:
                            return val.split("T")[0]
                        return val
            return None
        
        # Compter par jour pour les 10 derniers jours
        conv_timeline = []
        msg_timeline = []
        
        for date_str in last_10_days:
            conv_count = sum(1 for c in conversations if get_date_str(c) == date_str)
            msg_count = sum(1 for m in messages if get_date_str(m) == date_str)
            conv_timeline.append(conv_count)
            msg_timeline.append(msg_count)
        
        return {
            "conversations_timeline": conv_timeline,
            "messages_timeline": msg_timeline
        }
    except Exception as e:
        print(f"Error in get_timeline_data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des données de timeline: {str(e)}"
        )


def get_stats():
    """Récupère les statistiques pour le dashboard admin"""
    try:
        # Nombre d'utilisateurs
        users_count = supabase.table("users").select("id").execute()
        
        # Nombre de conversations
        conversations_count = supabase.table("conversations").select("id").execute()
        
        # Nombre de messages
        messages_count = supabase.table("messages").select("id").execute()
        
        # Nombre de vecteurs (documents dans vecs.documents_gemini)
        vectors_count = supabase.schema("vecs").table("documents_gemini").select("id").execute()
        
        return {
            "users_count": len(users_count.data) if users_count.data else 0,
            "conversations_count": len(conversations_count.data) if conversations_count.data else 0,
            "messages_count": len(messages_count.data) if messages_count.data else 0,
            "vectors_count": len(vectors_count.data) if vectors_count.data else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des statistiques: {str(e)}"
        )


@router.get("/", response_model=dict)
def admin_dashboard(current_user: dict = Depends(get_current_user)):
    """
    Endpoint du panneau d'administration - retourne les stats et données de timeline
    Accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    stats = get_stats()
    timeline = get_timeline_data()
    
    return {
        "stats": stats,
        "timeline": timeline
    }


@router.get("/messages", response_model=dict)
def list_all_messages(current_user: dict = Depends(get_current_user)):
    """
    Liste tous les messages avec métadonnées - accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    try:
        response = supabase.table("messages") \
            .select("id, conversation_id, label, sub_label, tags") \
            .execute()
        
        messages = response.data or []
        
        return {
            "messages": messages,
            "count": len(messages)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des messages: {str(e)}"
        )


@router.get("/users", response_model=dict)
def list_users(current_user: dict = Depends(get_current_user)):
    """
    Liste tous les utilisateurs - accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    try:
        response = supabase.table("users") \
            .select("id, nom, prenom, mail, role, mfa_secret") \
            .execute()
        
        users = response.data or []
        
        return {
            "users": users,
            "count": len(users)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des utilisateurs: {str(e)}"
        )


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user_data: dict, current_user: dict = Depends(get_current_user)):
    """
    Crée un nouvel utilisateur - accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    try:
        # Vérifier si l'email existe déjà
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("mail", user_data.get("mail")) \
            .execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé."
            )
        
        # Hash du mot de passe
        hashed_password = get_password_hash(user_data.get("mdp", ""))
        
        # Créer le nouvel utilisateur
        new_user = {
            "nom": user_data.get("nom"),
            "prenom": user_data.get("prenom"),
            "mail": user_data.get("mail"),
            "mdp": hashed_password,
            "role": user_data.get("role", "USER")
        }
        
        response = supabase.table("users") \
            .insert(new_user) \
            .execute()
        
        created_user = response.data[0] if response.data else None
        
        # Ne pas retourner le mot de passe hashé
        if created_user:
            created_user.pop("mdp", None)
        
        return {
            "message": "Utilisateur créé avec succès",
            "user": created_user
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'utilisateur: {str(e)}"
        )


@router.put("/users/{user_id}", response_model=dict)
def update_user(user_id: str, user_data: dict, current_user: dict = Depends(get_current_user)):
    """
    Met à jour un utilisateur - accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    try:
        # Vérifier que l'utilisateur existe
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("id", user_id) \
            .execute()
        
        if not existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        # Préparer les données de mise à jour
        update_data = {}
        
        if "nom" in user_data:
            update_data["nom"] = user_data["nom"]
        if "prenom" in user_data:
            update_data["prenom"] = user_data["prenom"]
        if "mail" in user_data:
            update_data["mail"] = user_data["mail"]
        if "role" in user_data:
            update_data["role"] = user_data["role"]
        if "mdp" in user_data and user_data["mdp"]:
            update_data["mdp"] = get_password_hash(user_data["mdp"])
        
        # Mettre à jour l'utilisateur
        response = supabase.table("users") \
            .update(update_data) \
            .eq("id", user_id) \
            .execute()
        
        updated_user = response.data[0] if response.data else None
        
        # Ne pas retourner le mot de passe hashé
        if updated_user:
            updated_user.pop("mdp", None)
        
        return {
            "message": "Utilisateur mis à jour avec succès",
            "user": updated_user
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour de l'utilisateur: {str(e)}"
        )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Supprime un utilisateur - accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    try:
        # Vérifier que l'utilisateur existe
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("id", user_id) \
            .execute()
        
        if not existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        # Supprimer l'utilisateur
        supabase.table("users") \
            .delete() \
            .eq("id", user_id) \
            .execute()
        
        return {"message": "Utilisateur supprimé avec succès"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de l'utilisateur: {str(e)}"
        )


@router.post("/users/{user_id}/reset-mfa", status_code=status.HTTP_200_OK)
def reset_user_mfa(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Réinitialise le 2FA d'un utilisateur - accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    try:
        # Vérifier que l'utilisateur existe
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("id", user_id) \
            .execute()
        
        if not existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        # Réinitialiser le secret 2FA
        supabase.table("users") \
            .update({"mfa_secret": None}) \
            .eq("id", user_id) \
            .execute()
        
        return {"message": "2FA réinitialisé avec succès"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la réinitialisation du 2FA: {str(e)}"
        )


@router.get("/conversations", response_model=dict)
def list_all_conversations(current_user: dict = Depends(get_current_user)):
    """
    Liste TOUTES les conversations (tous utilisateurs) - accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    try:
        # Récupérer toutes les conversations (y compris inactives) avec le mail de l'utilisateur
        response = supabase.table("conversations") \
            .select("id, user_id, title, is_active, created_at, users:user_id(mail)") \
            .order("created_at", desc=True) \
            .execute()
        
        conversations = response.data or []
        # Extraire le mail de l'objet users
        for conv in conversations:
            if conv.get("users"):
                conv["user_mail"] = conv["users"].get("mail")
            del conv["users"]
        
        return {
            "conversations": conversations,
            "count": len(conversations)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des conversations: {str(e)}"
        )


@router.get("/conversations/{conversation_id}", response_model=dict)
def get_conversation_admin(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """
    Récupère une conversation spécifique avec ses messages - accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    try:
        # Vérifier que la conversation existe
        conv_response = supabase.table("conversations") \
            .select("id, user_id, title, is_active, created_at, users:user_id(mail)") \
            .eq("id", conversation_id) \
            .execute()
        
        if not conv_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation non trouvée"
            )
        
        conversation = conv_response.data[0]
        # Extraire le mail de l'objet users
        if conversation.get("users"):
            conversation["user_mail"] = conversation["users"].get("mail")
        del conversation["users"]
        
        # Récupérer les messages
        messages_response = supabase.table("messages") \
            .select("*") \
            .eq("conversation_id", conversation_id) \
            .order("created_at", desc=False) \
            .execute()
        
        messages = messages_response.data or []
        
        return {
            "conversation": conversation,
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du chargement de la conversation: {str(e)}"
        )


@router.get("/documents", response_model=dict)
def list_documents(current_user: dict = Depends(get_current_user)):
    """
    Liste tous les documents (vecs.documents_gemini) - accessible uniquement aux ADMIN
    Regroupe par filename car un PDF peut avoir plusieurs lignes (chunks)
    """
    verify_admin(current_user)
    
    try:
        response = supabase.schema("vecs").table("documents_gemini") \
            .select("id, vec, metadata") \
            .execute()
        
        documents = response.data or []
        
        # Regrouper par filename
        grouped_docs = {}
        for doc in documents:
            metadata = doc.get("metadata", {})
            filename = metadata.get("filename", "inconnu")
            mimetype = metadata.get("mimetype", "inconnu")
            
            if filename not in grouped_docs:
                grouped_docs[filename] = {
                    "filename": filename,
                    "mimetype": mimetype,
                    "chunk_count": 1,
                    "ids": [doc["id"]]
                }
            else:
                grouped_docs[filename]["chunk_count"] += 1
                grouped_docs[filename]["ids"].append(doc["id"])
        
        # Convertir en liste
        documents_list = [
            {
                "filename": data["filename"],
                "mimetype": data["mimetype"],
                "chunk_count": data["chunk_count"],
                "ids": data["ids"]
            }
            for data in grouped_docs.values()
        ]
        
        return {
            "documents": documents_list,
            "count": len(documents_list)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des documents: {str(e)}"
        )


@router.delete("/documents/{filename}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(filename: str, current_user: dict = Depends(get_current_user)):
    """
    Supprime TOUTES les lignes correspondant à un fichier (par filename dans metadata) - accessible uniquement aux ADMIN
    Un PDF peut avoir plusieurs chunks, donc on supprime tout ce qui a ce filename
    """
    verify_admin(current_user)
    
    try:
        # Supprimer toutes les lignes avec ce filename dans metadata
        result = supabase.schema("vecs").table("documents_gemini") \
            .delete() \
            .eq("metadata->>filename", filename) \
            .execute()
        
        if not result.data and result.count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Aucun document trouvé avec le nom '{filename}'"
            )
        
        return {"message": f"Document '{filename}' et ses chunks supprimés avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression du document: {str(e)}"
        )
