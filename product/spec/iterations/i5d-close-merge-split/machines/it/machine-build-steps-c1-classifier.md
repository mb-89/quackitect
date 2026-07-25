---
id: it.machine-build-steps-c1-classifier
kind: machine_state
statement: "c1 the classifier: isEventPath decides, per path, whether content is an iteration's event or a live claim."
machine: it.machine-build-steps
state: c1_classifier
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. engine/worktree.ts: isEventPath(rel, iteration) returns true only for THAT iteration's evidence/, machines/ and state - never for the ledger, product code, the grant index, the plan, or another iteration's files. Pure function, no git. Greens the classifier check. Carries F4; realizes se.adr-event-classification-by-path.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
