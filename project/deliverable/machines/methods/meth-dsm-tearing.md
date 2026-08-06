---
kind: method
statement: DSM tearing - on an already-partitioned DSM, propose the minimal set of feedback (backward) edges to break so the remaining structure reads as a clean layering; the residual cycles are the tears.
source: ref-structural-complexity-management
---

## Situation
Reach for it after [DSM partitioning](meth-dsm-partitioning), when residual cycles remain and some of them need prioritizing for redesign, or explicit, recorded acceptance rather than a silent unresolved loop.

## Effect
Ranks backward dependencies by reach-back distance - the iteration/rework length a cycle costs. Tearing the furthest-reaching edges first shortens rework loops the most. Tearing only prioritizes WHICH edges are structurally most disruptive to keep; whether removing or redesigning one is actually feasible stays a domain-expert judgment call, not an automatic edit.

## Procedure
Tearing is derivative of partitioning: its candidate list depends entirely on which valid ordering was computed - the source gives a worked counter-example where the SAME 7-node, 2-backward-edge structure yields either 1 or 2 tear candidates depending purely on reordering. Fix one canonical partitioning first, or re-run tearing per candidate ordering and compare before committing to a tear list.
