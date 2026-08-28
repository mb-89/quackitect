---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-workload-is-a-fixed-published-set-nobody-regenerates
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how a run decides which iteration to walk
found_by: prior-art
statement: The set of things a benchmark may run is written down, versioned, and never regenerated, so two results are comparable because the work did not move between them.
source: ref-agent-benchmark-harnesses-2026 — SWE-bench, 2,294 problems across 12 repositories, fetched 2026-08-19
---

## What it buys

Comparability by construction. Nothing about the workload can drift between two
readings.

## What it costs here

The archive grows, so the set moves whether or not anybody regenerates it. This
option survives only in the weakened form the owner already ruled: the POOL may
grow, and comparison is per-iteration so growth adds pairs rather than moving
them.

## Mechanism

A named set of work items is stored, versioned and published. A run selects from that set and never generates. Comparability comes from the set being byte-identical between two readings.
