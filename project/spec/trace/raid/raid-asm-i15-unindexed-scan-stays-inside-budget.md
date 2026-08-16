---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-asm-i15-unindexed-scan-stays-inside-budget
type: "[[raid]]"
kind: assumption
statement: the corpus stays small enough that the query verb answers a request with a plain scan over the markdown files, inside the lane's one-second budget, without needing an index.
owner: the driving agent
trigger: the corpus grows past the point where a scan measurably misses req-call-answers-in-one-second's bound
status: open
probed: "2026-08-16"
impact: a query call starts missing the one-second budget, and the toil this iteration removes from hand-searching returns as toil spent waiting on the replacement.
breaks_how_badly: abrasive
how_likely: conceivable
probe: "scheduled. Its own Probe section needs the query verb built, then call latency measured against req-call-answers-in-one-second at the current corpus size (roughly 300 trace files) and again after growth. Not yet built this iteration."
source_refs:
  - req-query-returns-named-fields
  - req-call-answers-in-one-second
---

## Probe

Once the query verb exists, measure its call latency against the current
corpus (roughly 300 trace files at this walk's own count) and again after
the corpus has grown by a measured amount. Compare both against
req-call-answers-in-one-second's bound. A miss that grows with corpus size
rather than staying flat is the signal an index is needed.
