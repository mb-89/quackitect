---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: req-bm25-below-threshold-returns-empty
type: "[[requirement]]"
statement: When no candidate scores above the sibling's relevance threshold, the BM25 sibling shall return an explicit empty result.
kind: functional
verify_method: test
breaks_if_removed: A change with no real candidate coupling gets a false-positive top hit instead of an honest empty result, defeating the forced-disposition guarantee.
breaks_how_badly: abrasive
refines:
  - uc-dispose-of-a-candidate-coupling
source_refs:
  - uc-dispose-of-a-candidate-coupling extension 3a
priority: should
weighs_against:
  - req-a-slowness-signal-never-shortens-the-wait > — noise in a candidate list is paid by every reader of it; a slowness signal that costs time is paid only while something is already slow
---
