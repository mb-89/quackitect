---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: tsp-coupling-rank
type: "[[test-spec]]"
statement: The BM25 sibling returns candidate nodes ranked by relevance for a described change, and returns an explicit empty result below its threshold, verified by test over the ranking half of el-coupling-disposer.
method: "test"
verifies:
  - "req-bm25-returns-ranked-candidates"
  - "req-bm25-below-threshold-returns-empty"
files:
  - "tests/coupling-rank.test.ts"
---

## Scope

Ranking only (fn-run-a-governed-walk.rank-candidate-couplings): a change
description in, ranked candidates or an explicit empty list out. The
disposition half — every ranked candidate carries a recorded disposition
— is tsp-coupling-disposition, verified by inspection because it is a
structural guarantee on the writer, not a scored outcome.

## Approach

Component level, over two minted function-node fixtures — one lexically
close to the probe description, one far. Fault-based for the empty
case: a description sharing no vocabulary with either fixture.

## Steps

Every case in `tests/coupling-rank.test.ts` is one step, and the case
name states its claim. Both are RED today: rankCandidateCouplings
(engine/disposition.ts) throws until build-steps lands it.
