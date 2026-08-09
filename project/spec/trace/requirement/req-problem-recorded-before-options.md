---
id: req-problem-recorded-before-options
type: "[[requirement]]"
statement: While ideation holds no recorded problem statement, the engine shall refuse option entries.
kind: functional
verify_method: test
breaks_if_removed: Options generate against an unstated problem, so the answer smuggles in as the frame and divergence ratifies it.
breaks_how_badly: corrosive
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding step 2
  - uc-diverge-before-deciding ext 1a
priority: should
---
