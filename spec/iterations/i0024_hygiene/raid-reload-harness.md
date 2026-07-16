---
id: raid-reload-harness
type: raid
statement: A stdio MCP server that exits is never restarted by the client. A supervisor crash orphans the session's tool surface.
kind: risk
probability: 0.3
impact: 0.6
mitigation: The parent process never exits and never swaps itself. Only the child engine swaps. The M5 probe verifies list_changed adoption live before the build relies on it.
owner: the driving agent
status: open
killer: false
decided_via: A
provenance:
  mitigation: user-ruling via handoff
---
## Options
A) The parent supervisor never exits. Only the child engine swaps. M5 probes list_changed live.

B) No supervisor. Ship console-first; MCP refreshes on reconnect.

C) An external watchdog restarts the server.
