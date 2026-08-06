---
id: req-gate-evidence-must-be-sound
type: "[[requirement]]"
statement: "If a gate's evidence holds an unfilled field, an unfilled round, or a citation resolving to no artifact, then the engine shall refuse to offer the gate for adjudication."
kind: functional
verify_method: test
breaks_if_removed: "A person is asked to bless a form with holes in it, and their signature covers nothing."
refines:
  - uc-adjudicate-a-gate
  - uc-land-work-on-trunk
source_refs:
  - uc-adjudicate-a-gate precondition
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
  - uc-adjudicate-a-gate ext 4b
  - uc-adjudicate-a-gate step 4
  - uc-adjudicate-a-gate ext 3a
  - uc-land-work-on-trunk step 4
priority: must
---

## Detail

Each way evidence fails to stand, and what it blocks:

- If the gate's evidence form holds an unfilled field, then the engine shall refuse to offer the gate for adjudication.
- If a path cited in gate evidence resolves to no artifact, then the engine shall fail the gate on that finding alone.
- The engine shall link every claim in gate evidence to the artifact that shows it.
- While any land-gate round lacks its evidence, the engine shall refuse the bless and name the unfilled round.
