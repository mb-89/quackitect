---
id: req-gate-halts-walk
type: "[[requirement]]"
statement: "When the walk reaches a gate, the engine shall halt the walk until a person's verdict is recorded."
kind: functional
verify_method: test
breaks_if_removed: "An agent walks past an unadjudicated gate and builds on unblessed work."
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate step 1
  - uc-adjudicate-a-gate step 6
priority: must
---

## Detail

## Detail

- The halt is announced to the walker with the gate named.
- A recorded bless releases the walk to the next state.
- Zero channels advance the walk past the gate without a verdict.
