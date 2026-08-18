---
kind: method
statement: Tearing breaks a cycle in a partitioned DSM. It proposes which feedback edge to assume, so the loop can be ordered.
source: ref-structural-complexity-management
---

## Situation

Reach for it after [DSM partitioning](meth-dsm-partitioning), when residual
cycles remain.

Some of those cycles need prioritising for redesign. The others need explicit,
recorded acceptance, rather than staying silent unresolved loops.

## Effect

Ranks backward dependencies by reach-back distance. That distance is the
rework length a cycle costs.

Tearing the furthest-reaching edges first shortens rework loops the most.

Tearing only prioritises WHICH edges are structurally most disruptive to keep.
Whether removing or redesigning one is feasible stays a domain-expert judgment
call, never an automatic edit.

## Procedure

Tearing is derivative of partitioning. Its candidate list depends entirely on
which valid ordering was computed.

The source gives a worked counter-example. The same 7-node structure with two
backward edges yields either one or two tear candidates, purely from
reordering.

Fix one canonical partitioning first. Otherwise re-run tearing per candidate
ordering, and compare before committing to a tear list.
