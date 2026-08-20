---
form: copilot-stop-contract
by: agent
signed_off: 2026-08-19T13:57:02.190Z
authors: agent
files:
---

# Evidence form / copilot-stop-contract

## current_situation

The live Copilot observation found a transport reset while the shared MCP server remained alive. The stop hook itself was not invoked by that event, so the spike separates a connection reset from a hook verdict rather than claiming parity.

## built

- [[exp-copilot-connection-reset-keeps-server-alive]]

## follow_up

Fold the experiment into the stop-hook assumption. Keep the live stop-event proof open for implementation: the next Copilot stop request during active work must capture hook, transport and server lifecycle evidence together.

## anything_else

