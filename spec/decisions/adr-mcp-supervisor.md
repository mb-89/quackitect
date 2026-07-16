---
id: adr-mcp-supervisor
type: adr
decided_in: i0024_hygiene
adjudicated_by: user
statement: The MCP surface runs as a thin parent proxying stdio to a child engine. The parent never exits. When the build stamp moves, the parent drains open replies. Then it respawns the child from the staged binary. Then it emits a list_changed notification. A served refusal returns a JSON-RPC error. It never exits the process. Datum: console-first with reconnect. It loses on the same-session criterion the owner set. Reverse-sensitivity: if the harness ignores list_changed live, the payoff dies. The M5 probe is the tripwire. The fallback is console-first.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal - architecture, shapes mcp_supervisor and engine_child
---
