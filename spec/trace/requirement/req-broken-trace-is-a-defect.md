---
minted_in: i1
id: req-broken-trace-is-a-defect
type: "[[requirement]]"
statement: The engine shall count every broken trace link as a defect and shall fail the gate reviewing it.
kind: functional
verify_method: test
breaks_if_removed: The trace renders whole while pointing at nothing, which is worse than rendering a hole.
breaks_how_badly: corrosive
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin step 5
  - uc-trace-a-decision-to-its-origin ext 3a
  - ".se/req-mine-v2.md: spec discipline"
  - uc-trace-a-decision-to-its-origin ext 4a
  - uc-trace-a-decision-to-its-origin ext 3a
  - ".se/req-mine-v1.md: the mirror — book, report, hand-off"
priority: should
weighs_against:
  - req-acts-carry-role-and-channel >
---

## Detail

Each way a link breaks:

- The engine shall count every node lacking an unbroken upward chain to a proposition as a coverage defect, with zero orphans passing the check.
- If a node's link points at a file that does not exist, then the engine shall count the node defective and fail the gate reviewing it.
- If a trace node has no parent, then the engine shall draw it as an orphan defect rather than omit it.
