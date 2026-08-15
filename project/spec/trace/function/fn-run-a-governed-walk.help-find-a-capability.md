---
minted_in: i8-se-help-a-logged-keyword-search-over-the
id: fn-run-a-governed-walk.help-find-a-capability
type: "[[function]]"
cluster: self-description
statement: point an agent at the lane tool or guidance page a plain-words query describes, and record it when none fits
satisfies:
  - req-help-searches-tools-and-guidance
  - req-help-miss-is-logged
  - req-help-demand-ranked
  - req-help-query-logged-with-result
inputs:
  - flow-help-query
outputs:
  - flow-help-result
  - flow-call-log
controls:
  - the live tool catalog and guidance corpus, read fresh per call
source_refs:
  - uc-find-the-right-lane-tool
---

## Rationale

A SEPARATE FUNCTION FROM ROUTE-THE-WORK, even though both turn plain words
into a pointer. route-the-work picks a VEHICLE for new work (an expedition,
an iteration, a note); this function picks a VERB or a GUIDANCE PAGE for work
already underway. Different inputs, different outputs, no shared flow.

SEARCH AND THE MISS LOG ARE ONE FUNCTION, not two, for the same reason
capture-and-drain is one function elsewhere in this tree: the point is the
round trip. A search that never records its misses gives the retro nothing;
a miss log with no search behind it has nothing to be a miss OF.
