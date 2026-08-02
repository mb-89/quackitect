---
kind: method
statement: "The function DSM: one relation meaning per matrix, coupling reasons classified - the shared functional partitioning that precedes enumeration."
---

## Situation
M4's partition-functions: cluster the function structure BEFORE enumerating candidates - the morphological chart needs the partitioned functions as rows. The matrix is a projection over the function notes' typed edges; nothing is stored separately.

## Procedure
- Pick ONE relation meaning per matrix run: passes_data_to, depends_on, controls, shares_state_with, or must_be_synchronous_with. Never mix meanings in one matrix.
- Classify each coupling by its reason: shared data, sequence, timing, shared failure mode, same actor, same policy, same external interface, same lifecycle.
- Cluster ([[meth-dsm-clustering]]): strongly-coupled functions group, inter-cluster coupling minimized. Sequence/partition ([[meth-dsm-partitioning]]) where ordering matters; band ([[meth-dsm-banding]]) for parallelism.
- Assign qualities to functions (SyA functional partitioning: basic / additional / safety / support).
- The clusters are function groups, NOT elements - the static cut into elements is per candidate and comes later.
