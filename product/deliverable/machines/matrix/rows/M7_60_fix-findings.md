---
kind: matrix-row
name: fix-findings
statement: "Fix the battery's findings: all of them, in one pass."
state_kind: work
filled_by: agent
depends_on:
  - verification
edge_role: fallback
guard: "verification_attempts < 3"
COMMENT: "state: ok"
---

## Guidance

The battery law's fix half ([[meth-test-first]]). FALLBACK from verification while verification_attempts < 3; the recovery edge re-runs verification ONCE. Collect EVERY finding the run surfaced before fixing anything; fix them all; then the single confirm run. When the guard exhausts, the machine escapes to a human.

## Evidence form

- findings_fixed | every finding and its fix, one pass | required
