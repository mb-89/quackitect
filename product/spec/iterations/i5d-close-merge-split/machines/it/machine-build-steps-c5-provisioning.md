---
id: it.machine-build-steps-c5-provisioning
kind: machine_state
statement: "c5 the working place: a provisioned worktree can run its own checks, and says so when it would fork from a stale state."
machine: it.machine-build-steps
state: c5_provisioning
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. engine/worktree.ts provisionWorktree: make the verify toolchain resolvable from inside the new worktree (link the existing install rather than re-installing), and warn when trunk carries uncommitted engine changes at open, because the fork would then not match the running engine. Closes se.raid-worktree-provisioning-incomplete. Carries F11, F12. Independent of c1-c4.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
