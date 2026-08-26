---
form: draw-context
by: agent
signed_off: 2026-08-12T20:59:34.860Z
authors: agent
files: null
---

# Evidence form / draw-context

## current_situation

M2 draw-context: the delta does not move the system boundary, so this inherits by pointer with no new neighbour nodes.

## boundary

INHERITED, unchanged: the se lane is one MCP server process talking stdio JSON-RPC to the agent host; the boundary this delta sits inside is unchanged — se_help is one more tool dispatched the same way, reading the same project root and .se directory.

## neighbours

- nbr-agent-harness

## intended_use

An agent already inside a booted se session asks se_help in plain words to find a lane tool or guidance page, or to read the ranked demand log.

## excluded_use

- Not a general web or codebase search — se_file_search and se_web_search already cover that, and se_help does not compete with them.
- Not a substitute for reading a tool's full schema — se_help ranks candidates; ToolSearch/the harness still loads the real schema.
- Not authoritative over what tools EXIST — it is a search index over the live catalog, never the source of truth for it.

## follow_up

map-stakeholders next.

## anything_else

