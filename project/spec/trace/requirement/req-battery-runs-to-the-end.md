---
id: req-battery-runs-to-the-end
type: "[[requirement]]"
statement: "When the full battery runs, the engine shall run its whole scope and report every failure at the end."
kind: functional
verify_method: test
breaks_if_removed: "The first red hides every later one; each land or sweep fixes one failure per run."
refines:
  - uc-land-work-on-trunk
  - uc-let-the-system-catch-up
source_refs:
  - uc-land-work-on-trunk step 3
  - uc-let-the-system-catch-up step 5
  - ".se/req-mine-v1.md: tests and the battery"
priority: should
---
