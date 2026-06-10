from fastmcp import FastMCP
from tools import (
    hello_world,
    get_stat_by_name,
    get_stats_count,
    get_all_stats,
    get_stats_by_filter,
)

mcp = FastMCP("Broussaud MCP")

mcp.tool(hello_world)
mcp.tool(get_stat_by_name)
mcp.tool(get_stats_count)
mcp.tool(get_all_stats)
mcp.tool(get_stats_by_filter)

app = mcp.http_app()
