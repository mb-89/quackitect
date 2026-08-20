---
minted_in: i36
id: raid-dec-copilot-uses-the-blocking-stop-contract
type: "[[raid]]"
kind: decision
statement: Copilot uses the existing blocking stop contract and proves it on the live Copilot path before any weaker-model routing relies on it.
owner: the driving agent
trigger: a Copilot stop request occurs during active machine work
status: decided
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - req-stop-hook-yields-only-at-a-machine-stop
  - req-interrupted-call-names-the-stopping-layer
  - req-repeated-failure-shape-becomes-durable-work
---

## Rejected options

- A heartbeat as the only liveness control is rejected.

A host can lack a heartbeat channel.

A hard stop still needs a hook-side veto.

- A fixed global payload bound with periodic retro mining is rejected.

It drops harness identity and immediate failure-shape routing.

## Consequences

- The Copilot adapter must block a stop request while the machine has active work.

- It must allow the stop only at a machine-recognized wait or idle state.

- It must record the stopping layer for interrupted calls.

- It must classify repeated failures by error or refusal shape.

- A heartbeat may later corroborate liveness.

It must never replace the blocking stop contract.
