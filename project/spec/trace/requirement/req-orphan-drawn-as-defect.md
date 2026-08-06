---
id: req-orphan-drawn-as-defect
type: "[[requirement]]"
statement: "If a trace node has no parent, then the engine shall draw it as an orphan defect rather than omit it."
kind: functional
verify_method: demonstration
breaks_if_removed: "The view hides exactly the hole the coverage check missed."
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin ext 3a
  - ".se/req-mine-v1.md: the mirror — book, report, hand-off"
priority: could
---
