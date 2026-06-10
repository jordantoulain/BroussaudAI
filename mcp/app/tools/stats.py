from typing import Dict, List, Union
from core import supabase

def get_stat_by_name(name: str) -> dict:
    """Get stat by name from stats table"""
    result = supabase.table("stats").select("name, value, role").eq("name", name).execute()
    return result.data[0] if result.data else {}

def get_stats_count() -> int:
    """Get total count of records in stats table"""
    result = supabase.table("stats").select("name", count="exact").execute()
    return result.count or 0

def get_all_stats() -> List[Dict]:
    """Get all stats from stats table"""
    result = supabase.table("stats").select("name, value, role").execute()
    return result.data or []

def get_stats_by_filter(filters: Dict[str, Union[str, int, float, Dict[str, Union[str, int, float]]]]) -> List[Dict]:
    """Get stats filtered by conditions with operators
    Exemples:
    - {"name": "active_users"}
    - {"value": {"gt": 10}}
    - {"name": "test", "value": {"gte": 5, "lte": 20}}
    """
    query = supabase.table("stats").select("name, value, role")
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
    result = query.execute()
    return result.data or []
