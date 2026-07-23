---
id: se.machine-systematic-fix-findings
kind: machine_state
statement: "Fix the battery's findings: all of them, in one pass."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: fix_findings
state_kind: work
filled_by: agent
---

## Guidance
The battery law's fix half ([[meth-test-first]]): collect EVERY finding the run surfaced before fixing anything; fix them all; then the recovery edge re-runs verification ONCE. When the guard exhausts, the machine escapes to a human.

## Evidence form
- findings_fixed | every finding and its fix, one pass | required
