from fastmcp import FastMCP
from tools import (
    get_user_stats_count,
    get_user_performance,
    get_daily_summary,
    get_user_stats_by_filter,
    get_top_performers,
    get_quality_alerts,
    get_period_summary,
    get_aggregated_stats_by_user,
    get_aggregated_stats_by_emplacement
)

mcp = FastMCP("Broussaud MCP")

# Enregistrement des outils dédiés aux statistiques opérateurs
mcp.tool(get_user_stats_count)
mcp.tool(get_user_performance)
mcp.tool(get_daily_summary)
mcp.tool(get_user_stats_by_filter)
mcp.tool(get_top_performers)
mcp.tool(get_quality_alerts)
mcp.tool(get_period_summary)
mcp.tool(get_aggregated_stats_by_user)
mcp.tool(get_aggregated_stats_by_emplacement)

app = mcp.http_app()