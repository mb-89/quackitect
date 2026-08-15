---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-story-links-its-proving-run
type: "[[requirement]]"
statement: Where a story's evidence side is filled, the engine shall link that story to the recorded run that proved it.
kind: functional
verify_method: inspection
breaks_if_removed: Whether a story was ever proven is answered from memory instead of the recorded run.
breaks_how_badly: abrasive
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin ext 6a
  - ".se/req-mine-v1.md: the mirror — book, report, hand-off"
priority: could
weighs_against:
  - req-test-run-carries-its-question > — proof answered from memory is the weaker of the two memory failures
---
