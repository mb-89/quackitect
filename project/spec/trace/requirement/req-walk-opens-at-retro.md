---
id: req-walk-opens-at-retro
type: "[[requirement]]"
statement: When an iteration opens, the engine shall place the walk's first state at the retro.
kind: functional
verify_method: test
verified_by:
  - "tests/iterations.test.ts :: a seed stands in the container at once — its machine is M0"
  - "tests/iterations.test.ts :: no gate holds the first start — entering binds, stamps started, and M0 stands"
breaks_if_removed: Onboarding skips the retro; strays and lessons never reach disposition.
breaks_how_badly: corrosive
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration step 3
priority: should
weighs_against:
  - req-gate-shows-the-evidence-form >
---
