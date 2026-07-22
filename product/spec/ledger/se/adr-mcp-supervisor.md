---
id: se.adr-mcp-supervisor
kind: decision
statement: "The MCP surface runs as a thin parent proxying stdio to a child engine. The parent never exits. When the build stamp moves, the parent drains open replies. Then it respawns the child from the staged binary. Then it emits a list_changed notification. A served refusal returns a JSON-RPC error. It never exits the process. Datum: console-first with reconnect. It loses on the same-session criterion the owner set. Reverse-sensitivity: if the harness ignores list_changed live, the payoff dies. The M5 probe is the tripwire. The fallback is console-first."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0024_hygiene
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v1_kind: architecture
v1_provenance_class: schema-default (review)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: agent-proposal - architecture, shapes mcp_supervisor and engine_child
v2_amendment: = v2's shim (design §3); reimplemented TS
---

## v2 amendment (applied at mint)

= v2's shim (design §3); reimplemented TS
