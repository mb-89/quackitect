---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: req-bm25-returns-ranked-candidates
type: "[[requirement]]"
statement: When an agent submits a plain-words description of a change, the BM25 sibling shall return candidate nodes ranked by relevance score.
kind: functional
verify_method: test
breaks_if_removed: An agent gets a single guess instead of a ranked list, and can no longer be forced to dispose of every plausible candidate before the change ships.
breaks_how_badly: crippling
refines:
  - uc-dispose-of-a-candidate-coupling
source_refs:
  - uc-dispose-of-a-candidate-coupling step 2
  - uc-dispose-of-a-candidate-coupling step 3
priority: must
---
