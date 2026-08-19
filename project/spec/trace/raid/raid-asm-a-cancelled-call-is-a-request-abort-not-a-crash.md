---
minted_in: i36
id: raid-asm-a-cancelled-call-is-a-request-abort-not-a-crash
type: "[[raid]]"
kind: assumption
statement: When a tool call is cancelled from the host side, the MCP server treats it as an aborted in-flight request and keeps running, rather than exiting or restarting the underlying process.
owner: the driving agent
trigger: any report that the mirror stopped answering after a cancelled call, and every MCP server restart observed during an iteration
status: open
probe: "Cheapest real check ran this session: the mirror's process (pid 20652) stayed listed on Get-NetTCPConnection -LocalPort 7333 and answered HTTP 200 on / immediately after a se_pull tool call was cancelled mid-flight, and the next se_pull succeeded normally with no restart. HOLDS for a host-cancelled call on this session's harness (VS Code / Copilot chat over HTTP). Other harnesses' cancellation behaviour is unprobed."
probed: "2026-08-19"
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - raid-mcp-stop-is-not-diagnosable
  - req-interrupted-call-names-the-stopping-layer
weighs_with: none
weighs_against: none
---

## Probe

Cancel an in-flight lane call deliberately, then check the mirror's own
process (still running, same pid, same listening socket) and its next
response, in the same session and across a fresh one.

- Same pid, socket still listening, next call answers normally: the
  assumption holds — the loss was the request, not the server.
- A new pid or a gap where nothing answered: the assumption is false, and
  `name-the-stopping-layer` must be able to tell that apart from a plain
  cancellation.
