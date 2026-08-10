---
id: req-controls-never-advance-walk
type: "[[requirement]]"
statement: The engine shall advance the walk only on a driver's pull, with zero advances caused by a control movement.
kind: functional
verify_method: test
verified_by:
  - "tests/threshold.test.ts :: the slider takes effect live: raise the autonomy and the agent's next pull passes"
breaks_if_removed: Raising the dial wakes an absent agent, and the person's hand can race the walk.
breaks_how_badly: crippling
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy ext 3a
priority: must
---

## Detail

## Detail

The person's controls — the setting, the target, the checkboxes — AIM the walk. None of them moves it a state forward or back. A raised setting while the agent is stopped changes only how far the next pull is allowed to go.
