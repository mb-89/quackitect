---
id: it.machine-build-steps-c1-serving
kind: machine_state
statement: "c1 loop serving: next/submit speak the token set - every unclaimed active state served, claims per session, joins hold."
machine: it.machine-build-steps
state: c1_serving
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. Wire next()/submit() onto activeStates + completeState + claims; single-active flow stays byte-identical (the green suite is the fence). Greens the serving tests.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
