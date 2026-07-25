---
id: it.machine-build-steps-c4-bless-wiring
kind: machine_state
statement: "c4 the bless wiring: a blessed gate commits its milestone and the grant carries the tag its evidence will live under."
machine: it.machine-build-steps
state: c4_bless_wiring
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. engine/gate.ts bless(): after the grant is recorded, call commitMilestone for a worktree-resident iteration, and stamp the deterministic tag (iter/<id>) onto the grant record so the pointer still resolves once evidence leaves trunk. Best-effort on the commit half - a failed commit must not void a legitimate bless. Carries F8; realizes R7. Depends on c2.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
