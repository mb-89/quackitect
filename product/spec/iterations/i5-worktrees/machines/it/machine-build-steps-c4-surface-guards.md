---
id: it.machine-build-steps-c4-surface-guards
kind: machine_state
statement: "c4 surfaces and guards (E6-E8): stream entries in the projection, the drain unknown-ref refusal, the board generation guard."
machine: it.machine-build-steps
state: c4_surface_guards
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts + board-html. projectState agents/tab data per open worktree; se_note_drain refuses unknown refs (SE-C-073); the board drops poll responses older than the last local act (actGen). Board fenced to tab data + the guard - nothing more (i9 is not delegated). Greens the remaining three tests.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
