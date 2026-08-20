---
form: rank-unknowns
by: agent
signed_off: 2026-08-19T13:46:58.576Z
authors: agent
files:
---

# Evidence form / rank-unknowns

## current_situation

The architecture gate leaves one immediately spikeable unknown: whether the Copilot path enforces the same blocking stop contract as the Anthropic path and can distinguish a stop action from a transport interruption. The assumption is currently ungraded, but its live proof is the explicit architecture override.

## seeded

- [[raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today]]

## follow_up

Run one focused Copilot spike: trigger or observe a stop request during active machine work, capture the hook decision, server lifecycle and transport evidence, and show that the session yields only at a machine-recognized stop. Fold the result back into the stop-hook requirement and ADR.

## anything_else

