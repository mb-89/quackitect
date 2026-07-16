---
id: cand-supervisor-child
type: candidate
statement: The MCP server is a thin parent that proxies stdio to a swappable child engine.
---

The parent never exits. On a stamp move, in order:

- it waits for open replies
- it respawns the child from the staged binary
- it emits list_changed

Prior art: mcpmon and reloaderoo. Payoff: same-session tool refresh on Claude Code.
