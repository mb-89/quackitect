---
kind: matrix-row
name: enumerate-space
statement: "Enumerate the design space: the morphological chart over the partitioned functions; the shortlist seeds the parallel candidates."
state_kind: work
filled_by: agent
depends_on:
  - partition-functions
seeds: candidates
evidence:
  - name: chart
    description: "the morphological chart: rows, options, pruned cells with reasons"
  - name: shortlist
    description: "the seeded combinations, one line each"
---

## Guidance

Per [[meth-morphological-analysis]], options fed by [[meth-frame-tactics]] R (catalogs, patterns, reference architectures, TRIZ, benchmarking - the state-of-the-art scan for architectures lives here). This state SEEDS the iteration's candidate machine: one parallel compose state per shortlisted combination. Each candidate elaborates its static partitioning, allocation DMM, element DSM, interfaces (= inter-cluster edges), structure metrics, rough feasibility ([[meth-feasibility-checks]]) and rationale.
