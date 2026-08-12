---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: nbr-agent-harness
type: "[[neighbour]]"
statement: The AI agent harness that drives the walk — Claude Code or the Copilot CLI, whichever is installed.
direction: in
---

## Interface

The `se` MCP server. The harness speaks one verb, `se_pull`, plus the lane's
file, search, run, git and note tools. Every call is logged raw.

The harness's OWN tools are caged off by an explicit list, which each host
reads from its own place: Claude Code from `.claude/settings.json`, the
Copilot CLI from its command line. The cage is the interface as much as the
tools are — what the harness may NOT do is the load-bearing half.
