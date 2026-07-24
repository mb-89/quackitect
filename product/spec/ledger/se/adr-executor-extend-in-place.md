---
id: se.adr-executor-extend-in-place
kind: adr
statement: "The parallel executor extends the existing instance in place: active[] joins the schema (current stays a first-token alias), advance() generalizes to token ops; no event-sourced rewrite, no scheduler sidecar."
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
---

## Decision
K1 extend-in-place, converged by Pugh over the blessed front {K1, K2}. The instance gains active: string[]; completion fires outbound edges and activates all-fired successors; joins hold; the packet service assigns unclaimed active states to sessions; the offer surface becomes a queue keyed by state.

## Addresses
- [[req-exec-parallel]], [[req-exec-tokens]], [[req-exec-multi-agent]] - the token set and its record
- register R4 (rebuilding the executor that flies this iteration) - the additive field adopts the running instance untouched
- the zero-dep ethos - no IR, no replay module

## Rejected, kept as history
- K2 token-engine rewrite (event-sourced v2, history replay): perfect record purity, but replay would have to reconstruct a nine-times hand-repaired mid-flight instance; NOT foreclosed - K1 keeps the history complete, so K2 stays buyable as its own iteration (RAID tripwire T1 names the re-entry condition).
- K3 scheduler sidecar: a second state store beside the instance - two sources of truth, the defect class this iteration exists to kill.
