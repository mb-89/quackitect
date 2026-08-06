---
id: req-battery-verdict-is-a-field
type: "[[requirement]]"
statement: "The land-gate form shall present the battery verdict as a field filled from the recorded run result, never from an agent's claim."
kind: functional
verify_method: test
breaks_if_removed: "The agent attests its own verdict; the founding self-attestation failure returns at the gate."
refines:
  - uc-land-work-on-trunk
  - uc-answer-a-question-with-tests
  - uc-adjudicate-a-gate
source_refs:
  - uc-land-work-on-trunk step 3
  - ".se/req-mine-sebots.md: verification — trust nothing self-attested"
  - uc-answer-a-question-with-tests ext 6b
  - uc-adjudicate-a-gate step 3
  - ".se/req-mine-v1.md: tests and the battery"
priority: must
---
