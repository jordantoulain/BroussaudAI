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
        
        # Statistiques IA depuis stats_ia
        from datetime import datetime, timezone, timedelta
        today = datetime.now(timezone.utc).date()
        
        # Fonction pour exécuter une requête et retourner des données sûres
        def safe_execute(query_builder):
            result = query_builder.execute()
            if result is None:
                return type('obj', (object,), {'data': []})()
            if not hasattr(result, 'data'):
                return type('obj', (object,), {'data': []})()
            return result
        
        # Stats pour aujourd'hui
        today_stats = safe_execute(supabase.table("stats_ia") \
            .select("*") \
            .eq("date", today.isoformat()) \
            .maybe_single())
        
        # Stats pour la semaine (7 derniers jours)
        week_ago = today - timedelta(days=6)
        week_stats = safe_execute(supabase.table("stats_ia") \
            .select("*") \
            .gte("date", week_ago.isoformat()) \
            .order("date"))
        
        # Stats pour tout le temps
        all_stats = safe_execute(supabase.table("stats_ia").select("*"))
        
        # Calculer les moyennes et totaux
        def calculate_avg(stats_data, field):
            if not stats_data or not getattr(stats_data, 'data', None):
                return 0
            values = [s[field] for s in stats_data.data if s and s.get(field) is not None]
            return sum(values) / len(values) if values else 0
        
        def calculate_sum(stats_data, field):
            if not stats_data or not getattr(stats_data, 'data', None):
                return 0
            return sum(s.get(field, 0) for s in stats_data.data if s)
        
        # Temps moyen de réponse (en ms)
        today_data = getattr(today_stats, 'data', {}) or {}
        avg_response_time_today = today_data.get("avg_response_time_ms", 0)
        avg_response_time_week = calculate_avg(week_stats, "avg_response_time_ms")
        avg_response_time_all = calculate_avg(all_stats, "avg_response_time_ms")
        
        # Tokens
        total_tokens_today = today_data.get("total_tokens", 0)
        total_tokens_week = calculate_sum(week_stats, "total_tokens")
        total_tokens_all = calculate_sum(all_stats, "total_tokens")
        
        # Conversations depuis stats_ia
        total_conversations_today = today_data.get("total_conversations", 0)
        total_conversations_week = calculate_sum(week_stats, "total_conversations")
        total_conversations_all = calculate_sum(all_stats, "total_conversations")
        
        # Messages depuis stats_ia
        total_messages_today = today_data.get("total_messages", 0)
        total_messages_week = calculate_sum(week_stats, "total_messages")
        total_messages_all = calculate_sum(all_stats, "total_messages")
        
        # Avis
        positive_today = today_data.get("positive_reviews", 0)
        negative_today = today_data.get("negative_reviews", 0)
        positive_week = calculate_sum(week_stats, "positive_reviews")
        negative_week = calculate_sum(week_stats, "negative_reviews")
        positive_all = calculate_sum(all_stats, "positive_reviews")
        negative_all = calculate_sum(all_stats, "negative_reviews")
        
        # Timeline stats_ia pour la semaine (pour les charts)
        # Extraire les données par jour pour la semaine
        ia_timeline_data = []
        if week_stats and week_stats.data:
            for stat in week_stats.data:
                ia_timeline_data.append({
                    "date": stat.get("date", ""),
                    "total_conversations": stat.get("total_conversations", 0),
                    "total_messages": stat.get("total_messages", 0),
                    "total_tokens": stat.get("total_tokens", 0),
                    "avg_response_time_ms": stat.get("avg_response_time_ms", 0),
                    "positive_reviews": stat.get("positive_reviews", 0),
                    "negative_reviews": stat.get("negative_reviews", 0)
                })
        
        # Si stats_ia est vide, calculer depuis les données existantes
        all_stats_data = getattr(all_stats, 'data', []) or []
        if not all_stats_data or len(all_stats_data) == 0:
            # Compter les avis positifs/négatifs depuis la table reviews
            reviews_resp = safe_execute(supabase.table("reviews").select("rating"))
            reviews_data = getattr(reviews_resp, 'data', []) or []
            positive_all = sum(1 for r in reviews_data if r and r.get("rating") == True)
            negative_all = sum(1 for r in reviews_data if r and r.get("rating") == False)
        
        return {
            "users_count": len(users_count.data) if users_count.data else 0,
            "conversations_count": total_conversations_all or len(conversations_count.data) if conversations_count.data else 0,
            "messages_count": total_messages_all or len(messages_count.data) if messages_count.data else 0,
            "vectors_count": len(vectors_count.data) if vectors_count.data else 0,
            "stats_ia": {
                "today": {
                    "total_conversations": total_conversations_today,
                    "total_messages": total_messages_today,
                    "total_tokens": total_tokens_today,
                    "avg_response_time_ms": avg_response_time_today,
                    "positive_reviews": positive_today,
                    "negative_reviews": negative_today
                },
                "week": {
                    "total_conversations": total_conversations_week,
                    "total_messages": total_messages_week,
                    "total_tokens": total_tokens_week,
                    "avg_response_time_ms": round(avg_response_time_week),
                    "positive_reviews": positive_week,
                    "negative_reviews": negative_week
                },
                "all_time": {
                    "total_conversations": total_conversations_all,
                    "total_messages": total_messages_all,
                    "total_tokens": total_tokens_all,
                    "avg_response_time_ms": round(avg_response_time_all),
                    "positive_reviews": positive_all,
                    "negative_reviews": negative_all
                }
            },
            "ia_timeline": ia_timeline_data
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
    
    stats_data = get_stats()
    timeline = get_timeline_data()
    
    return {
        "stats": stats_data,
        "timeline": timeline,
        "ia_timeline": stats_data.get("ia_timeline", [])
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


# ==================== Reviews (Avis) ====================

@router.get("/reviews")
def get_all_reviews(current_user: dict = Depends(get_current_user)):
    """
    Récupère tous les avis - accessible uniquement aux ADMIN
    """
    verify_admin(current_user)
    
    try:
        # Récupérer tous les avis avec les informations utilisateur et message
        response = supabase.table("reviews") \
            .select("id, user_id, message_id, rating, description, created_at") \
            .order("created_at", desc=True) \
            .execute()
        
        reviews = response.data or []
        
        # Récupérer les messages correspondants pour obtenir le contenu et conversation_id
        message_ids = [review["message_id"] for review in reviews]
        messages_response = supabase.table("messages") \
            .select("id, conversation_id, question, response") \
            .in_("id", message_ids) \
            .execute()
        
        messages_map = {msg["id"]: msg for msg in (messages_response.data or [])}
        
        # Récupérer les informations des utilisateurs pour chaque avis
        user_ids = [review["user_id"] for review in reviews]
        users_response = supabase.table("users") \
            .select("id, nom, prenom, mail, role") \
            .in_("id", user_ids) \
            .execute()
        
        users_map = {user["id"]: user for user in (users_response.data or [])}
        
        # Ajouter les infos utilisateur et message à chaque avis
        enriched_reviews = []
        for review in reviews:
            user_info = users_map.get(review["user_id"])
            message_info = messages_map.get(review["message_id"])
            
            # Extraire le contenu du message (question pour user, response pour IA)
            message_content = message_info["response"] if message_info and message_info.get("response") else (
                message_info["question"] if message_info and message_info.get("question") else "Contenu non disponible"
            )
            
            enriched_review = {
                **review,
                "user_nom": user_info["nom"] if user_info else None,
                "user_prenom": user_info["prenom"] if user_info else None,
                "user_mail": user_info["mail"] if user_info else None,
                "user_role": user_info["role"] if user_info else None,
                "conversation_id": message_info["conversation_id"] if message_info else None,
                "message_content": message_content  # Message complet sans limite
            }
            enriched_reviews.append(enriched_review)
        
        return {"reviews": enriched_reviews, "count": len(enriched_reviews)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des avis: {str(e)}"
        )
