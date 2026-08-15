---
minted_in: i1
id: req-decision-graph-reads-as-branches
type: "[[requirement]]"
statement: When the decision trail renders, the engine shall draw each point's updates as branches that never merge back, with briefs cut at word boundaries and marks distinguishing landed from abandoned.
kind: functional
verify_method: test
breaks_if_removed: The trail renders as an unreadable straight line, and what was abandoned reads like what landed.
breaks_how_badly: abrasive
refines:
  - uc-watch-the-walk-live
source_refs:
  - reverse-engineered from tests/gitgraph.test.ts
priority: could
weighs_against:
  - req-story-links-its-proving-run > — abandoned reading like landed misleads on every look; an unlinked run is one lookup
---

## Detail

- A point's updates branch off it and never merge back; nesting rides the same branch, never a staircase.
- A point that did not land is marked, never ticked.
- A quote in a brief cannot break the diagram; every branch name is one token.
- An empty graph renders rather than throwing.
