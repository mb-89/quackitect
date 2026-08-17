---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: req-bm25-candidates-need-disposition
type: "[[requirement]]"
statement: When the BM25 sibling proposes one or more candidates for a change, each candidate shall carry a recorded disposition before that change is considered reviewed.
kind: functional
verify_method: inspection
breaks_if_removed: A proposed candidate can be silently ignored, and the exact coupling miss this sibling exists to catch reappears undetected.
breaks_how_badly: crippling
refines:
  - uc-dispose-of-a-candidate-coupling
source_refs:
  - uc-dispose-of-a-candidate-coupling step 4
  - scope-non-goals.md scope item 6 ("forcing a disposition on every candidate it proposes")
priority: must
---
