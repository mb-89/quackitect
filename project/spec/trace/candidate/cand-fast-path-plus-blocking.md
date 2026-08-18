---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: cand-fast-path-plus-blocking
type: "[[candidate]]"
name: "Fast path plus blocking"
statement: "optimise for scale on both rows: a stat-invalidated cache for reads, grouped review for a wide candidate pool"
picks:
  - "[[opt-cache-corpus-read-invalidated-by-file-stat]]"
  - "[[opt-block-candidates-before-individual-review]]"
---

## Why this one

Both rows optimise for scale rather than for cheapest build. It exists to
test the shape at the opposite end from cand-continue-v1s-shape: what does
it cost to build for a corpus and a candidate pool that outgrow the naive
approach on both axes at once, rather than on just one.

## How it works

answer-a-structured-query keeps a corpus map in memory, keyed by root, and
only rebuilds when a cheap file-stat check (corpusStamp, the same mechanism
this session found already running the engine's own trace loader) shows a
write actually happened — most calls hit the cache and skip the walk
entirely. rank-candidate-couplings is unchanged. record-a-coupling-disposition
groups near-duplicate or clearly-related candidates into blocks before a
person ever sees them, so review scales with block count rather than raw
candidate count. The unchanged baseline stays as-is; both mechanisms sit
strictly inside the two new functions.

## What it costs

Two real subsystems instead of one: a stat-based cache-invalidation layer
(state to track, a correctness argument resting on every write going
through the lane) and a blocking key or similarity threshold for grouping
(itself needing tuning). Worst case: a wrong blocking boundary hides a real
coupling inside a block disposed of as a whole — the failure mode that
decides whether this candidate is safe to ship. Cache correctness fails
quietly if anything ever writes to the corpus outside the lane.

## What it leans on

That every corpus-changing write really does go through the lane, with no
exception — unverified as a system-wide guarantee, only observed to hold in
this session's own calls. That a workable blocking key exists for candidate
couplings at all; no such key has been designed or tested yet.
