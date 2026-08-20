---
form: fold-back
by: agent
signed_off: 2026-08-19
authors: agent
files:
---

# Evidence form / fold-back

## current_situation

The i36 tracer isolated one live fact: Copilot can lose its localhost
connection while the shared server process stays up.

That settles the transport branch and leaves the stop-event branch open.

## folded

| experiment | folds_to | promote |
| --- | --- | --- |
| [[exp-copilot-connection-reset-keeps-server-alive]] | raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today remains open; the stop-event half still needs a live Copilot observation | persistent server lifecycle logging and explicit HTTP keep-alive policy entered the build; the live stop contract remains owed |

## follow_up

Keep the stop-hook assumption open.

During implementation, capture one real Copilot stop request during active
work and record whether the hook vetoed it or another layer ended the call.

## anything_else

none
