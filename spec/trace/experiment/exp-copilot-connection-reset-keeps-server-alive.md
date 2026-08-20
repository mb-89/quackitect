---
minted_in: i36-the-harness-is-not-claude-measure-what-e
id: exp-copilot-connection-reset-keeps-server-alive
type: "[[experiment]]"
statement: Can the Copilot localhost transport reset while the shared MCP server remains alive, measured by the server PID, port listener and durable lifecycle log?
probes:
  - raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today
timebox: one active VS Code session
form: tracer
faked: none
fallback: keep the stop-hook assumption open and add persistent transport evidence before relying on weaker-model routing
verdict: unsettled
measured: "2026-08-19: VS Code logged ECONNRESET for http://localhost:7333/mcp. PID 20652 remained listening on port 7333, and engine.log recorded no start or exit at the error time."
folds_to: raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today remains open; the stop-event half still needs a live Copilot observation
promote: persistent server lifecycle logging and explicit HTTP keep-alive policy entered the build; the live stop contract remains owed
chunk: server-lifecycle-logging
source_refs:
  - rank-unknowns
  - raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today
---

## Setup

Observed the VS Code Copilot local-process MCP connection during the reported
ECONNRESET event. Inspected the listener on port 7333, its Node process and
the durable engine lifecycle log before restarting anything.

## Result

The Copilot request connection reset at 14:53:42. The shared server process
remained PID 20652 and continued listening on port 7333. The lifecycle log
contained no matching process exit or restart.

This distinguishes an HTTP connection reset from a server exit. It does not
show whether a Copilot stop request reached or was blocked by the stop hook.
