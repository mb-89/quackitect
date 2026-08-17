---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-risk-i15-query-latency-unmeasured-at-real-scale
type: "[[raid]]"
kind: risk
statement: el-query-evaluator scored 2/5 (partial, demo-path only) on req-call-answers-in-one-second at evaluate-set; its sole timing evidence is a 4-node/2-query probe self-flagged as unmeasured against the real ~328-file corpus.
owner: the driving agent
trigger: M6 spike, or the first real-corpus measurement of the query verb once built
status: mitigated
breaks_how_badly: corrosive
how_likely: plausible
impact: the query verb could exceed the one-second bound on the real corpus, forcing a redesign (the cache mechanism cand-fast-path-plus-blocking already stands ready with) after the fact rather than before.
source_refs:
  - req-call-answers-in-one-second
  - project/spec/iterations/i15-the-database-our-own-reader-over-obsidia/evidence/evaluate-architecture.md
  - el-query-evaluator
---

## Why this is carried rather than dismissed

evaluate-architecture's ATAM walk ruled req-call-answers-in-one-second
"at risk" against this exact gap rather than "addressed" — ruled, not
waved through, per gate-architecture's own round_2_red_team.

## What would settle it

A timeboxed spike measuring the filter-expression evaluator against the
real trace corpus (~328 files) rather than the 4-node fake the earlier
probe used. If it holds under one second, this closes. If not,
opt-cache-corpus-read-invalidated-by-file-stat is the design already on
record (cand-fast-path-plus-blocking) to reopen the decision with.

## Measured

2026-08-16, exp-i15-query-latency-at-real-corpus-scale: 31 ms wall-clock
for a full walk-read-parse-filter pass over 768 real files in
project/spec/trace (more than double the ~328 the earlier probe used) —
a 32x margin under the 1000 ms bound, comfortably absorbing the
throttled-hardware discount raid-asm-the-target-machine-is-many-throttled-cores
names. The trigger ("M6 spike, or the first real-corpus measurement")
has fired; status moves to mitigated.
