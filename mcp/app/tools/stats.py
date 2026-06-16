from typing import Dict, List, Union, Optional
from core import supabase

def get_user_stats_count() -> int:
    """
    Retourne le nombre total absolu d'enregistrements présents dans la base de données de production (table stats_users). 
    À utiliser uniquement pour vérifier le volume global des données ou s'assurer que la base n'est pas vide avant une analyse.
    """
    result = supabase.table("stats_users").select("utilisateur", count="exact").execute()
    return result.count or 0

def get_user_performance(utilisateur: str, limit_days: int = 7) -> List[Dict]:
    """
    Récupère l'historique détaillé des performances quantitatives d'un utilisateur (opérateur) spécifique sur les X derniers jours. 
    Retourne obligatoirement les données suivantes pour chaque jour travaillé : 
    - date (YYYY-MM-DD)
    - emplacement (le poste occupé)
    - nb_operations (nombre d'actions effectuées)
    - nb_sacs_uniques (nombre de sacs manipulés)
    - qte_totale (nombre total de pièces/chaussettes traitées)
    - nb_deb et nb_fin (compteurs de début et de fin)
    Idéal pour analyser l'évolution de la productivité d'un profil précis.
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
    Récupère le bilan COMPLET et DÉTAILLÉ de la production pour une date précise (Format requis : YYYY-MM-DD).
    ATTENTION : Cet outil ne retourne pas qu'une simple liste de noms. Il fournit toutes les statistiques chiffrées de chaque opérateur pour chaque poste.
    Les données retournées pour chaque ligne incluent : 
    - emplacement (le poste, ex: ETIQUE, TRICO, QUALI)
    - utilisateur (l'identifiant de l'opérateur)
    - qte_totale (la quantité totale de pièces produites)
    - nb_operations (le nombre d'opérations)
    - nb_sacs_uniques (le nombre de sacs)
    Outil OBLIGATOIRE pour toute question demandant les performances ou les résultats d'une journée spécifique.
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
    Outil de recherche avancée et granulaire dans l'ensemble des données de production. 
    À utiliser IMPÉRATIVEMENT dès que la question de l'utilisateur implique des conditions multiples, des seuils ou des recherches spécifiques (ex: chercher tous les utilisateurs ayant produit plus de X pièces).
    Retourne L'INTÉGRALITÉ des colonnes de la table : date, utilisateur, emplacement, nb_operations, nb_sacs_uniques, qte_totale, nb_deb, nb_fin, nb_supp_rebus, nb_supp_regroupement.
    
    Exemples de filtres supportés (Format JSON attendu) :
    - Filtre simple : {"utilisateur": "016"}
    - Supérieur à : {"qte_totale": {"gt": 500}}
    - Combinaison : {"emplacement": "QUALI", "nb_operations": {"gte": 5, "lte": 20}}
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

def get_top_performers(emplacement: str, date: str, limit: int = 5) -> List[Dict]:
    """
    Récupère le classement des meilleurs opérateurs pour un poste (emplacement) à une date précise (Format: YYYY-MM-DD).
    Trie automatiquement les résultats par quantité totale produite (qte_totale) de manière décroissante.
    Outil IDÉAL ET PRIORITAIRE pour répondre aux questions de type : "Qui a produit le plus sur l'étiquetage hier ?" ou "Donne-moi le top 3 du formage".
    Retourne l'utilisateur, la quantité totale, le nombre d'opérations et de sacs uniques.
    """
    result = supabase.table("stats_users") \
        .select("utilisateur, qte_totale, nb_operations, nb_sacs_uniques") \
        .eq("date", date) \
        .eq("emplacement", emplacement) \
        .order("qte_totale", desc=True) \
        .limit(limit) \
        .execute()
    return result.data or []

def get_quality_alerts(limit_days: int = 7) -> List[Dict]:
    """
    Outil dédié à l'analyse de la qualité et des non-conformités.
    Récupère EXCLUSIVEMENT les enregistrements récents présentant des défauts ou rebuts (nb_supp_rebus > 0) sur les derniers jours.
    Retourne la date, l'utilisateur, l'emplacement, la quantité totale et le nombre exact de rebuts (nb_supp_rebus).
    À utiliser IMPÉRATIVEMENT si l'utilisateur pose une question sur la qualité, les pertes, les défauts, ou les problèmes en production.
    """
    result = supabase.table("stats_users") \
        .select("date, utilisateur, emplacement, qte_totale, nb_supp_rebus") \
        .gt("nb_supp_rebus", 0) \
        .order("date", desc=True) \
        .order("nb_supp_rebus", desc=True) \
        .limit(30) \
        .execute()
    return result.data or []

def get_period_summary(start_date: str, end_date: str, emplacement: Optional[str] = None) -> List[Dict]:
    """
    Récupère l'historique de production sur une période stricte (entre start_date et end_date, format YYYY-MM-DD).
    
    RÈGLE DE FILTRAGE (TRÈS IMPORTANT) : Si la question de l'utilisateur mentionne un poste de travail spécifique (ex: "étiquetage" -> "ETIQUE", "tricotage" -> "TRICO"), tu DOIS OBLIGATOIREMENT renseigner le paramètre 'emplacement'. Ne fais jamais une requête globale si un poste est précisé.
    
    Outil OBLIGATOIRE pour répondre aux questions portant sur une plage de dates (ex: "semaine dernière", "entre le 1er et le 15").
    Retourne la date, l'emplacement, l'utilisateur, la quantité totale et le nombre d'opérations.
    """
    query = supabase.table("stats_users") \
        .select("date, emplacement, utilisateur, qte_totale, nb_operations, nb_sacs_uniques") \
        .gte("date", start_date) \
        .lte("date", end_date)
        
    if emplacement:
        query = query.eq("emplacement", emplacement)
        
    result = query.order("date", desc=True).limit(200).execute()
    return result.data or []

# CREATE OR REPLACE FUNCTION get_aggregated_stats_by_emplacement(p_start_date DATE, p_end_date DATE)
# RETURNS TABLE (
#     emplacement VARCHAR,
#     total_qte BIGINT,
#     total_operations BIGINT,
#     total_rebus BIGINT
# ) AS $$
# BEGIN
#     RETURN QUERY
#     SELECT 
#         su.emplacement,
#         SUM(su.qte_totale) AS total_qte,
#         SUM(su.nb_operations) AS total_operations,
#         SUM(su.nb_supp_rebus) AS total_rebus
#     FROM stats_users su
#     WHERE su.date >= p_start_date AND su.date <= p_end_date
#     GROUP BY su.emplacement
#     ORDER BY total_qte DESC;
# END;
# $$ LANGUAGE plpgsql;

# CREATE OR REPLACE FUNCTION get_aggregated_stats_by_user(p_start_date DATE, p_end_date DATE)
# RETURNS TABLE (
#     utilisateur VARCHAR,
#     total_qte BIGINT,
#     total_operations BIGINT,
#     total_rebus BIGINT
# ) AS $$
# BEGIN
#     RETURN QUERY
#     SELECT 
#         su.utilisateur,
#         SUM(su.qte_totale) AS total_qte,
#         SUM(su.nb_operations) AS total_operations,
#         SUM(su.nb_supp_rebus) AS total_rebus
#     FROM stats_users su
#     WHERE su.date >= p_start_date AND su.date <= p_end_date
#     GROUP BY su.utilisateur
#     ORDER BY total_qte DESC;
# END;
# $$ LANGUAGE plpgsql;

def get_aggregated_stats_by_emplacement(start_date: str, end_date: str) -> List[Dict]:
    """
    Calcule et retourne le total cumulé des performances pour chaque poste (emplacement) sur une période donnée.
    Format de date attendu : YYYY-MM-DD. Pour cibler un seul jour, mets la même date dans start_date et end_date.
    Outil OBLIGATOIRE et PRIORITAIRE pour répondre aux questions globales (ex: "Quelle est la production totale du formage cette semaine ?" ou "Combien de chaussettes produites au total entre le 1er et le 10 juin ?").
    Retourne l'emplacement, et les totaux calculés (total_qte, total_operations, total_rebus). Ne demande à l'IA aucun calcul.
    """
    result = supabase.rpc(
        'get_aggregated_stats_by_emplacement', 
        {'p_start_date': start_date, 'p_end_date': end_date}
    ).execute()
    
    return result.data or []

def get_aggregated_stats_by_user(start_date: str, end_date: str) -> List[Dict]:
    """
    Calcule et retourne le bilan total cumulé des performances globales de chaque opérateur (utilisateur) sur une période.
    Format de date attendu : YYYY-MM-DD. Pour cibler un seul jour, mets la même date dans start_date et end_date.
    Idéal pour les classements mensuels/hebdomadaires ou pour savoir qui a produit le plus au total sur une plage de dates.
    Retourne l'utilisateur et ses totaux (total_qte, total_operations, total_rebus).
    """
    result = supabase.rpc(
        'get_aggregated_stats_by_user', 
        {'p_start_date': start_date, 'p_end_date': end_date}
    ).execute()
    
    return result.data or []