# Feature: Serveur MCP
## Objectif : Fournir une interface MCP (Model Context Protocol) pour accéder aux statistiques stockées dans Supabase via des outils dédiés
## Composants modifiés : - [x] `mcp/app/server.py` (Point d'entrée FastMCP)
- [x] `mcp/app/core/supabase_client.py` (Client Supabase configuré)
- [x] `mcp/app/tools/hello_world.py` (Tool de test)
- [x] `mcp/app/tools/stats.py` (Tool get_stat_by_name)
- [x] `mcp/app/tools/stats_utils.py` (Tools get_stats_count, get_all_stats, get_stats_by_filter)
- [x] `mcp/Dockerfile` (Image Docker)
- [x] `mcp/requirements.txt` (Dépendances)
## Dépendances (Registry) : - [x] `mcp/app/core/supabase_client.py` (Client Supabase partagé)
## Routes/API : `HTTP GET /mcp/` (FastMCP via Uvicorn:8000)
## Logique technique : FastMCP framework, accès direct à la table `stats` (schema public) via Supabase client. Outils: hello_world (test), get_stat_by_name (select name,value eq name), get_stats_count (count), get_all_stats (select all), get_stats_by_filter (filtres dynamiques: eq, gt, gte, lt, lte)
## État : [x] Terminée
