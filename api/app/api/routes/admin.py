import os
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import UUID4
from supabase import create_client
from api.routes.auth import get_current_user
from core.supabase_client import supabase
from core.sanitize import sanitize_text, sanitize_dict

router = APIRouter(prefix="/admin", tags=["Administration"])

# Initialisation du client admin (Service Role) pour gérer l'authentification
# Ce client contourne les règles RLS, à n'utiliser QUE dans les routes sécurisées
supabase_admin = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_KEY", "")
)

def verify_admin(current_user: dict):
    """
    Vérifie que l'utilisateur a le rôle ADMIN en interrogeant directement 
    la base de données (Source de vérité absolue).
    """
    user_id = current_user.get("id")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non identifié."
        )
        
    try:
        response = supabase.table("users").select("role").eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profil utilisateur introuvable en base."
            )
            
        db_role = response.data[0].get("role")
        
        if db_role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès interdit. Rôle ADMIN requis."
            )
            
        current_user["role"] = db_role
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la vérification des droits : {str(e)}"
        )


def get_timeline_data():
    """Récupère les données de timeline pour les 10 derniers jours"""
    from datetime import datetime, timezone, timedelta
    
    try:
        today = datetime.now(timezone.utc).date()
        last_10_days = [(today - timedelta(days=i)).isoformat() for i in range(9, -1, -1)]
        
        conv_resp = supabase.table("conversations") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(1000) \
            .execute()
        
        msg_resp = supabase.table("messages") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(1000) \
            .execute()
        
        conversations = conv_resp.data or []
        messages = msg_resp.data or []
        
        def get_date_str(item):
            for field in ["created_at", "date", "createdDate", "created"]:
                if item.get(field):
                    val = item[field]
                    if isinstance(val, str):
                        if "T" in val:
                            return val.split("T")[0]
                        return val
            return None
        
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
        users_count = supabase.table("users").select("id").execute()
        conversations_count = supabase.table("conversations").select("id").execute()
        messages_count = supabase.table("messages").select("id").execute()
        vectors_count = supabase.schema("vecs").table("documents_gemini").select("id").execute()
        
        from datetime import datetime, timezone, timedelta
        today = datetime.now(timezone.utc).date()
        
        def safe_execute(query_builder):
            result = query_builder.execute()
            if result is None or not hasattr(result, 'data'):
                return type('obj', (object,), {'data': []})()
            return result
        
        today_stats = safe_execute(supabase.table("stats_ia") \
            .select("*") \
            .eq("date", today.isoformat()) \
            .maybe_single())
        
        week_ago = today - timedelta(days=6)
        week_stats = safe_execute(supabase.table("stats_ia") \
            .select("*") \
            .gte("date", week_ago.isoformat()) \
            .order("date"))
        
        all_stats = safe_execute(supabase.table("stats_ia").select("*"))
        
        def calculate_avg(stats_data, field):
            if not stats_data or not getattr(stats_data, 'data', None):
                return 0
            values = [s[field] for s in stats_data.data if s and s.get(field) is not None]
            return sum(values) / len(values) if values else 0
        
        def calculate_sum(stats_data, field):
            if not stats_data or not getattr(stats_data, 'data', None):
                return 0
            return sum(s.get(field, 0) for s in stats_data.data if s)
        
        today_data = getattr(today_stats, 'data', {}) or {}
        avg_response_time_today = today_data.get("avg_response_time_ms", 0)
        avg_response_time_week = calculate_avg(week_stats, "avg_response_time_ms")
        avg_response_time_all = calculate_avg(all_stats, "avg_response_time_ms")
        
        total_tokens_today = today_data.get("total_tokens", 0)
        total_tokens_week = calculate_sum(week_stats, "total_tokens")
        total_tokens_all = calculate_sum(all_stats, "total_tokens")
        
        total_conversations_today = today_data.get("total_conversations", 0)
        total_conversations_week = calculate_sum(week_stats, "total_conversations")
        total_conversations_all = calculate_sum(all_stats, "total_conversations")
        
        total_messages_today = today_data.get("total_messages", 0)
        total_messages_week = calculate_sum(week_stats, "total_messages")
        total_messages_all = calculate_sum(all_stats, "total_messages")
        
        positive_today = today_data.get("positive_reviews", 0)
        negative_today = today_data.get("negative_reviews", 0)
        positive_week = calculate_sum(week_stats, "positive_reviews")
        negative_week = calculate_sum(week_stats, "negative_reviews")
        positive_all = calculate_sum(all_stats, "positive_reviews")
        negative_all = calculate_sum(all_stats, "negative_reviews")
        
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
        
        all_stats_data = getattr(all_stats, 'data', []) or []
        if not all_stats_data or len(all_stats_data) == 0:
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
    """Endpoint du panneau d'administration - retourne les stats et données de timeline"""
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
    """Liste tous les messages avec métadonnées"""
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
    verify_admin(current_user)
    
    try:
        # 1. Récupération des profils publics
        response = supabase.table("users") \
            .select("id, nom, prenom, mail, role, created_at, last_login_at, is_active, deleted_at") \
            .execute()
        
        users = response.data or []
        
        # 2. Enrichissement avec l'état réel du 2FA
        for user in users:
            try:
                mfa_response = supabase_admin.auth.admin.mfa.list_factors({"user_id": user["id"]})
                
                # Testons si mfa_response est directement la liste
                # Si c'est un objet du SDK qui contient 'factors', on le prend
                if hasattr(mfa_response, 'factors'):
                    factors = mfa_response.factors
                # Si mfa_response est une liste (ou ressemble à une liste)
                elif isinstance(mfa_response, list):
                    factors = mfa_response
                # Si c'est un dict
                elif isinstance(mfa_response, dict):
                    factors = mfa_response.get('factors', [])
                else:
                    factors = []

                print(f"DEBUG - Factors finaux: {factors}")
                
                has_2fa = False
                for f in factors:
                    # Ici f est soit un objet Factor, soit un dict
                    f_type = getattr(f, 'factor_type', None) if not isinstance(f, dict) else f.get('factor_type')
                    f_status = getattr(f, 'status', None) if not isinstance(f, dict) else f.get('status')
                    
                    print(f)
                    print(f_type, f_status)

                    if f_type == 'totp' and f_status == 'verified':
                        has_2fa = True
                        break
                
                user["has_mfa"] = has_2fa
            except Exception as e:
                print(f"Erreur MFA {user['id']}: {str(e)}")
                user["has_mfa"] = False
        
        return {"users": users, "count": len(users)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des utilisateurs: {str(e)}"
        )


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user_data: dict, current_user: dict = Depends(get_current_user)):
    """Crée un nouvel utilisateur (Via Supabase Admin)"""
    verify_admin(current_user)
    
    try:
        existing_user = supabase.table("users").select("id").eq("mail", user_data.get("mail")).execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé."
            )
        
        sanitized_data = sanitize_dict(user_data)
        
        # 1. Créer l'utilisateur avec les droits Admin
        auth_res = supabase_admin.auth.admin.create_user({
            "email": sanitized_data.get("mail"),
            "password": user_data.get("mdp", "ChangeMe123!"),
            "email_confirm": True,
            "user_metadata": {
                "nom": sanitized_data.get("nom"),
                "prenom": sanitized_data.get("prenom")
            }
        })
        
        # 2. L'insertion dans public.users sera probablement gérée par ton Trigger SQL.
        # Si tu n'as pas de trigger, décommente la ligne ci-dessous :
        # supabase.table("users").insert({...}).execute()
        
        return {
            "message": "Utilisateur créé avec succès",
            "user_id": auth_res.user.id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'utilisateur: {str(e)}"
        )


@router.put("/users/{user_id}", response_model=dict)
def update_user(user_id: str, user_data: dict, current_user: dict = Depends(get_current_user)):
    """Met à jour un utilisateur"""
    verify_admin(current_user)
    
    try:
        sanitized_data = sanitize_dict(user_data)
        update_data = {}
        auth_update_data = {}
        
        if "nom" in sanitized_data:
            update_data["nom"] = sanitized_data["nom"]
        if "prenom" in sanitized_data:
            update_data["prenom"] = sanitized_data["prenom"]
        if "mail" in sanitized_data:
            update_data["mail"] = sanitized_data["mail"]
            auth_update_data["email"] = sanitized_data["mail"]
        if "role" in sanitized_data:
            update_data["role"] = sanitized_data["role"]
            
        if "mdp" in user_data and user_data["mdp"]:
            auth_update_data["password"] = user_data["mdp"]
        
        # Mise à jour des identifiants (Mot de passe / Email) via Admin API
        if auth_update_data:
            supabase_admin.auth.admin.update_user_by_id(user_id, auth_update_data)
        
        # Mise à jour du profil public
        if update_data:
            response = supabase.table("users").update(update_data).eq("id", user_id).execute()
            updated_user = response.data[0] if response.data else None
        else:
            updated_user = None
        
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
def delete_user(user_id: UUID4, current_user: dict = Depends(get_current_user)):
    """
    Désactive un utilisateur (Soft Delete) - accessible uniquement aux ADMIN.
    L'utilisateur est suspendu de l'authentification mais ses données sont conservées.
    """
    verify_admin(current_user)
    
    try:
        user_id_str = str(user_id)
        from datetime import datetime, timezone
        
        # 1. On suspend l'accès Auth au lieu de le détruire (Banni pour 100 ans)
        supabase_admin.auth.admin.update_user_by_id(
            user_id_str, 
            {"ban_duration": "876000h"}
        )
        
        # 2. On flagge le profil public comme désactivé
        supabase.table("users") \
            .update({
                "is_active": False,
                "deleted_at": datetime.now(timezone.utc).isoformat(),
                "deleted_by": current_user["id"]
            }) \
            .eq("id", user_id_str) \
            .execute()
        
        return {"message": "Compte utilisateur suspendu avec succès"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suspension de l'utilisateur: {str(e)}"
        )


@router.post("/users/{user_id}/restore", status_code=status.HTTP_200_OK)
def restore_user(user_id: UUID4, current_user: dict = Depends(get_current_user)):
    """
    Restaure un utilisateur soft-deleted - accessible uniquement aux ADMIN.
    """
    verify_admin(current_user)
    
    try:
        user_id_str = str(user_id)
        
        # 1. On retire la suspension dans Supabase Auth
        supabase_admin.auth.admin.update_user_by_id(
            user_id_str, 
            {"ban_duration": "none"}
        )
        
        # 2. On réactive le profil public
        supabase.table("users") \
            .update({
                "is_active": True,
                "deleted_at": None,
                "deleted_by": None
            }) \
            .eq("id", user_id_str) \
            .execute()
        
        return {"message": "Utilisateur restauré et accès réactivé avec succès"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la restauration de l'utilisateur: {str(e)}"
        )


@router.post("/users/{user_id}/reset-mfa", status_code=status.HTTP_200_OK)
@router.delete("/membres/{user_id}/mfa", status_code=status.HTTP_200_OK) # Support de l'ancienne et nouvelle URL
def reset_user_mfa(user_id: UUID4, current_user: dict = Depends(get_current_user)):
    """
    Détruit physiquement tous les facteurs TOTP (2FA) configurés pour cet utilisateur.
    """
    verify_admin(current_user)
    
    try:
        user_id_str = str(user_id)
        
        # 1. Récupération des facteurs d'authentification
        # Utilisons une approche qui accepte l'objet, la liste, ou le dictionnaire
        mfa_response = supabase_admin.auth.admin.mfa.list_factors({"user_id": user_id_str})
        
        # Log pour debug si besoin, mais surtout pour normaliser 'factors'
        factors = []
        if hasattr(mfa_response, 'factors'):
            factors = mfa_response.factors
        elif isinstance(mfa_response, list):
            factors = mfa_response
        elif isinstance(mfa_response, dict):
            factors = mfa_response.get('factors', [])
            
        deleted = False
        
        # 2. Suppression de tout facteur de type TOTP
        for f in factors:
            # Extraction polyvalente (Objet ou Dictionnaire)
            f_type = getattr(f, 'factor_type', None) if not isinstance(f, dict) else f.get('factor_type')
            f_id = getattr(f, 'id', None) if not isinstance(f, dict) else f.get('id')
            
            if f_type == "totp":
                supabase_admin.auth.admin.mfa.delete_factor({
                    "user_id": user_id_str,
                    "id": f_id
                })
                deleted = True
                
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Aucun facteur TOTP trouvé pour ce membre."
            )
            
        return {"message": "2FA désactivé avec succès."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur lors du reset 2FA: {str(e)}"
        )


@router.get("/conversations", response_model=dict)
def list_all_conversations(current_user: dict = Depends(get_current_user)):
    verify_admin(current_user)
    
    try:
        response = supabase.table("conversations") \
            .select("id, user_id, title, is_active, created_at, users:user_id(mail)") \
            .order("created_at", desc=True) \
            .execute()
        
        conversations = response.data or []
        for conv in conversations:
            if conv.get("users"):
                conv["user_mail"] = conv["users"].get("mail")
            del conv["users"]
        
        return {
            "conversations": conversations,
            "count": len(conversations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}", response_model=dict)
def get_conversation_admin(conversation_id: UUID4, current_user: dict = Depends(get_current_user)):
    verify_admin(current_user)
    
    try:
        conv_response = supabase.table("conversations") \
            .select("id, user_id, title, is_active, created_at, users:user_id(mail)") \
            .eq("id", str(conversation_id)) \
            .execute()
        
        if not conv_response.data:
            raise HTTPException(status_code=404, detail="Conversation non trouvée")
        
        conversation = conv_response.data[0]
        if conversation.get("users"):
            conversation["user_mail"] = conversation["users"].get("mail")
        del conversation["users"]
        
        messages_response = supabase.table("messages") \
            .select("*") \
            .eq("conversation_id", str(conversation_id)) \
            .order("created_at", desc=False) \
            .execute()
        
        return {
            "conversation": conversation,
            "messages": messages_response.data or []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents", response_model=dict)
def list_documents(current_user: dict = Depends(get_current_user)):
    verify_admin(current_user)
    
    try:
        response = supabase.schema("vecs").table("documents_gemini") \
            .select("id, vec, metadata") \
            .execute()
        
        documents = response.data or []
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
        
        documents_list = list(grouped_docs.values())
        
        return {
            "documents": documents_list,
            "count": len(documents_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/documents/{filename}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(filename: str, current_user: dict = Depends(get_current_user)):
    verify_admin(current_user)
    
    try:
        result = supabase.schema("vecs").table("documents_gemini") \
            .delete() \
            .eq("metadata->>filename", filename) \
            .execute()
        
        if not result.data and result.count == 0:
            raise HTTPException(status_code=404, detail="Aucun document trouvé")
        
        return {"message": "Document supprimé avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reviews")
def get_all_reviews(current_user: dict = Depends(get_current_user)):
    verify_admin(current_user)
    
    try:
        response = supabase.table("reviews") \
            .select("id, user_id, message_id, rating, description, created_at") \
            .order("created_at", desc=True) \
            .execute()
        
        reviews = response.data or []
        message_ids = [review["message_id"] for review in reviews]
        
        messages_response = supabase.table("messages") \
            .select("id, conversation_id, question, response") \
            .in_("id", message_ids) \
            .execute()
        messages_map = {msg["id"]: msg for msg in (messages_response.data or [])}
        
        user_ids = [review["user_id"] for review in reviews]
        users_response = supabase.table("users") \
            .select("id, nom, prenom, mail, role") \
            .in_("id", user_ids) \
            .execute()
        users_map = {user["id"]: user for user in (users_response.data or [])}
        
        enriched_reviews = []
        for review in reviews:
            user_info = users_map.get(review["user_id"])
            message_info = messages_map.get(review["message_id"])
            
            message_content = message_info["response"] if message_info and message_info.get("response") else (
                message_info["question"] if message_info and message_info.get("question") else "Contenu non disponible"
            )
            
            enriched_reviews.append({
                **review,
                "user_nom": user_info["nom"] if user_info else None,
                "user_prenom": user_info["prenom"] if user_info else None,
                "user_mail": user_info["mail"] if user_info else None,
                "user_role": user_info["role"] if user_info else None,
                "conversation_id": message_info["conversation_id"] if message_info else None,
                "message_content": message_content
            })
        
        return {"reviews": enriched_reviews, "count": len(enriched_reviews)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# System Prompt Configuration Endpoints

@router.get("/config/system-prompt")
def get_system_prompt(current_user: dict = Depends(get_current_user)):
    """Récupère le system prompt actuel depuis la base de données"""
    verify_admin(current_user)
    
    try:
        response = supabase.table("config") \
            .select("value") \
            .eq("key", "system_prompt") \
            .maybe_single() \
            .execute()
        
        # Gestion sécurisée de la réponse
        if response and hasattr(response, 'data') and response.data and response.data.get("value"):
            return {"system_prompt": response.data["value"]}
        else:
            # Retourner le prompt par défaut si non configuré en DB
            return {"system_prompt": ""}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération du system prompt: {str(e)}"
        )


@router.post("/config/system-prompt", status_code=status.HTTP_200_OK)
def update_system_prompt(system_prompt: dict, current_user: dict = Depends(get_current_user)):
    """Met à jour le system prompt dans la base de données"""
    verify_admin(current_user)
    
    try:
        prompt_value = system_prompt.get("system_prompt", "")
        
        # Vérifier si une entrée existe déjà
        existing_response = supabase.table("config") \
            .select("id") \
            .eq("key", "system_prompt") \
            .maybe_single() \
            .execute()
        
        # Gestion sécurisée : vérifier que response existe et a un attribut data
        if existing_response and hasattr(existing_response, 'data') and existing_response.data:
            # Mettre à jour l'entrée existante (sans updated_at pour éviter les problèmes SQL)
            # updated_at sera géré par un trigger ou gardera sa valeur précédente
            supabase.table("config") \
                .update({"value": prompt_value}) \
                .eq("key", "system_prompt") \
                .execute()
            
            return {"message": "System prompt mis à jour avec succès", "system_prompt": prompt_value}
        else:
            # Créer une nouvelle entrée
            insert_response = supabase.table("config") \
                .insert({
                    "key": "system_prompt",
                    "value": prompt_value
                }) \
                .execute()
            
            # Retourner le succès même si insert_response.data est None
            return {"message": "System prompt créé avec succès", "system_prompt": prompt_value}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour du system prompt: {str(e)}"
        )