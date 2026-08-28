---
steps:
  - id: copilot-stop-contract
    statement: probe raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today - observe a Copilot stop request during active work and distinguish hook veto, client reset, transport loss and server exit
    depends_on: []
    realization: probe
---

# The spike drawing

One timeboxed probe was selected at rank-unknowns.

It asks whether the Copilot path delivers the same blocking stop contract as
the Anthropic path.

## What the probe settles

The probe records:

- whether a stop request reaches the hook
- whether active machine work blocks that request
- whether the server process and HTTP listener stay alive
- whether a connection reset is client, transport or engine evidence

The result changes the stop-hook assumption only when the evidence identifies
the layer that ended the call.

## What it is not

This is not the implementation.

It is the smallest live observation that decides whether the Copilot adapter
can safely carry weaker-model work.
