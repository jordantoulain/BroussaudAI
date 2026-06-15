from typing import Dict, List, Union, Optional
from core import supabase

def get_user_stats_count() -> int:
    """Récupère le nombre total d'enregistrements dans la table stats_users."""
    result = supabase.table("stats_users").select("utilisateur", count="exact").execute()
    return result.count or 0

def get_user_performance(utilisateur: str, limit_days: int = 7) -> List[Dict]:
    """
    Récupère les statistiques récentes d'un opérateur spécifique.
    Idéal pour analyser l'activité d'un profil sur les derniers jours.
    """
    result = supabase.table("stats_users") \
        .select("date, emplacement, nb_operations, nb_sacs_uniques, qte_totale, nb_deb, nb_fin") \
        .eq("utilisateur", utilisateur) \
        .order("date", desc=True) \
        .limit(limit_days) \
        .execute()
    return result.data or []

def get_daily_summary(date: str) -> List[Dict]:
    """
    Récupère le résumé de production pour une journée donnée (Format: YYYY-MM-DD).
    Permet de voir qui a travaillé sur quel poste.
    """
    result = supabase.table("stats_users") \
        .select("emplacement, utilisateur, qte_totale, nb_operations, nb_sacs_uniques") \
        .eq("date", date) \
        .order("emplacement") \
        .execute()
    return result.data or []

def get_user_stats_by_filter(
    filters: Dict[str, Union[str, int, float, Dict[str, Union[str, int, float]]]], 
    limit: int = 20
) -> List[Dict]:
    """
    Recherche avancée dans stats_users avec des opérateurs.
    Exemples de filtres:
    - {"utilisateur": "jean"}
    - {"qte_totale": {"gt": 500}}
    - {"emplacement": "QUALI", "nb_operations": {"gte": 5, "lte": 20}}
    """
    query = supabase.table("stats_users").select("*")
    
    for key, condition in filters.items():
        if isinstance(condition, dict):
            for op, val in condition.items():
                if op == "eq":
                    query = query.eq(key, val)
                elif op == "gt":
                    query = query.gt(key, val)
                elif op == "gte":
                    query = query.gte(key, val)
                elif op == "lt":
                    query = query.lt(key, val)
                elif op == "lte":
                    query = query.lte(key, val)
        else:
            query = query.eq(key, condition)
            
    # On force une limite pour éviter de saturer le contexte du LLM
    result = query.order("date", desc=True).limit(limit).execute()
    return result.data or []