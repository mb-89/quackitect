---
id: req-verdict-is-a-persons-act
type: "[[requirement]]"
statement: "The engine shall record a gate verdict only from a channel a person holds."
kind: functional
verify_method: test
breaks_if_removed: "An agent blesses its own work and the gate guarantee is void."
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate step 5
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
  - ".se/req-mine-v2.md: gates, offers and grants"
priority: must
---

## Detail

## Detail

- Every channel yields one guarantee: a verdict arriving by chat passes the same validation as one arriving by any other surface.
- An agent-channel bless attempt is refused.
- A standing grant, recorded by a person, admits the blesses inside its scope; everything outside refuses.
