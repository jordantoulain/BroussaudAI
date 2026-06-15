from fastmcp import FastMCP
from tools import (
    get_user_stats_count,
    get_user_performance,
    get_daily_summary,
    get_user_stats_by_filter,
)

mcp = FastMCP("Broussaud MCP")

# Enregistrement des outils dédiés aux statistiques opérateurs
mcp.tool(get_user_stats_count)
mcp.tool(get_user_performance)
mcp.tool(get_daily_summary)
mcp.tool(get_user_stats_by_filter)

app = mcp.http_app()