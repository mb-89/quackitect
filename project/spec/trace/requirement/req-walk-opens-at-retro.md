---
id: req-walk-opens-at-retro
type: "[[requirement]]"
statement: "When an iteration opens, the engine shall place the walk's first state at the retro."
kind: functional
verify_method: test
breaks_if_removed: "Onboarding skips the retro; strays and lessons never reach disposition."
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration step 3
priority: should
---
