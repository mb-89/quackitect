---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: if-walk-engine-to-coupling-disposer
type: "[[interface]]"
statement: se_couplings, the lane door, hands a plain-words change description to the coupling disposer and gets back every BM25-ranked candidate paired with a disposition row, stamped pending.
source: el-walk-engine
destination: el-coupling-disposer
carries:
  - flow-change-description
  - flow-candidate-list
  - flow-coupling-disposition
form: direct function call, in-process
bound: 1 second
source_refs:
  - if-agent-harness-to-entrypoint
  - dsp-coupling-disposer
  - dsp-lane-door
  - req-bm25-candidates-need-disposition
---

THE SEAM MADE REAL. el-coupling-disposer existed as an island since M5, reachable by nothing outside its own tests (tests/coupling-rank.test.ts exercises rankCandidateCouplings directly; nothing called recordCouplingDisposition through any tool). engine/tools-query.ts's se_couplings is the first and only caller.

## What crosses

- the request: a plain-words description of the change under consideration (flow-change-description)
- the ranked candidates, highest relevance first (flow-candidate-list)
- one disposition row per candidate, stamped pending — never a filtered or truncated subset (flow-coupling-disposition)

## Why nothing is dropped between the two halves

recordCouplingDisposition takes the ranker's full output as its only value-bearing parameter, with no filter, slice or threshold of its own between the ranked list and the write loop (tsp-coupling-disposition's own checklist). This interface is where that guarantee is exercised end to end, not only inspected in isolation.
