---
id: se.adr-install-over-zerodep
kind: adr
statement: The engine's packaging law is ONE-CLICK INSTALLABLE - the zero-dependency rule is retired; hand-rolling stays preferred for small code (~200 lines), and dependencies (vendored or declared) are legal whenever install stays one click.
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
  decided_via: owner ruling in chat
---

## Decision
One-click installability replaces zero-dependency as the binding criterion in every evaluation (criterion C5 redefined from this iteration's convergence on). Hand-rolled code keeps its preference where it stays small; a vendored, checked-in library costs installability nothing and is judged on its merits.

## Addresses
- the evaluation criteria lineage (C5) and every future candidate round
- [[req-json-tree]] - the first decision converged under the corrected criterion

## Rejected, kept as history
The zero-dep rule: a v1-era decision (the Go rewrite, the B2 hand-rolled transport) that outlived its context by being repeated instead of re-derived. Past eliminations citing it (the vendored renderer J3; parts of the i3 K2 scoring) stand as blessed records; their reasoning no longer binds future rounds.
